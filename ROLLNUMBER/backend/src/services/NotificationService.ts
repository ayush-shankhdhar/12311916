import { NotificationRepository } from '../repositories/NotificationRepository';
import { INotification, NotificationType } from '../models/Notification';
import { MinHeap } from '../utils/MinHeap';
import { createLogger } from 'logging-middleware';
import { getSocketInstance } from '../realtime/socket';
import { addToNotificationQueue } from '../queue/notificationQueue';

const logger = createLogger('backend', 'service');

export class NotificationService {
  private repository: NotificationRepository;

  /* Weights for calculating Priority Score */
  private readonly TYPE_WEIGHTS: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Calculate Priority Score based on Type Weight and Recency.
   * Recency uses milliseconds divided by a factor to keep numbers stable.
   * The heavier types yield high scores, and within same type, newer items are higher.
   */
  public calculatePriorityScore(type: NotificationType, date: Date): number {
    const weight = this.TYPE_WEIGHTS[type] || 0;
    /* Base factor is weight scaled highly + timestamp in seconds */
    const baseScore = weight * 1e10; 
    const timeScore = Math.floor(date.getTime() / 1000);
    const finalScore = baseScore + timeScore;
    
    logger.debug(`Priority calculation: Type=${type}, Date=${date.toISOString()} => Score=${finalScore}`);
    return finalScore;
  }

  public async createNotification(data: {
    studentId: string;
    type: NotificationType;
    message: string;
  }): Promise<INotification> {
    logger.info(`Creating new notification of type ${data.type}`);
    
    const now = new Date();
    const priorityScore = this.calculatePriorityScore(data.type, now);

    const notification = await this.repository.create({
      ...data,
      priorityScore,
      isRead: false,
    });

    /* Real-time broadcast via socket.io */
    const io = getSocketInstance();
    if (io) {
      /* Send to the specific student room, and an update-all channel */
      io.to(`student_${data.studentId}`).emit('notification:new', notification);
      io.emit('notification:global', notification);
      logger.debug('Emitted socket events for new notification');
    }

    return notification;
  }

  public async createBulkNotifications(notifications: Array<{
    studentId: string;
    type: NotificationType;
    message: string;
  }>): Promise<void> {
    logger.info(`Dispatching ${notifications.length} bulk notifications to background queue`);
    
    /* Queue-based architecture design for scalability instead of instant blocking DB insert */
    /* In a real scenario, we offload to BullMQ worker */
    await addToNotificationQueue({
      type: 'BULK_CREATE',
      data: notifications,
    });
  }

  public async getNotifications(
    filters: {
      studentId?: string;
      type?: NotificationType;
      isRead?: boolean;
    },
    page = 1,
    limit = 10
  ): Promise<{
    notifications: INotification[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    logger.info('Fetching paginated notifications');
    const skip = (page - 1) * limit;

    const { data, total } = await this.repository.findWithFilters(filters, {
      skip,
      limit,
    });

    return {
      notifications: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Highly optimized Top N notification retrieval using MinHeap / Priority Queue
   * Complexity target: O(n log k) where k is the requested limit.
   */
  public async getTopPriorityNotifications(k = 10): Promise<INotification[]> {
    logger.info(`Optimized retrieval of Top ${k} priority notifications using MinHeap`);
    
    /* 1. Fetch recent/available set of notifications to process in memory */
    const allCandidates = await this.repository.findAllForPriorityCalculation(1000);

    /* 
      2. Define comparator for MinHeap. 
      The smallest element (lowest priority score) rises to the top.
      When the heap size exceeds K, we pop the minimum to keep the TOP items.
    */
    const minHeap = new MinHeap<INotification>((a, b) => a.priorityScore - b.priorityScore);

    /* 
      3. Insert nodes. Time complexity of this loop: O(n log k). 
      N is candidates, log k is inserting in heap of max size k. 
    */
    for (const notification of allCandidates) {
      minHeap.push(notification);
      if (minHeap.size() > k) {
        minHeap.pop(); /* Discard the smallest element in the top-K tracker */
      }
    }

    /* 
      4. Convert MinHeap to sorted array (ascending).
      Reverse it to return top-down highest priority.
    */
    const result = minHeap.toSortedArray();
    return result.reverse();
  }

  public async markAsRead(id: string): Promise<INotification | null> {
    logger.info(`Marking notification ${id} as read`);
    return await this.repository.updateReadStatus(id, true);
  }
}
