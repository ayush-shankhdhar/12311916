import { Notification, INotification, NotificationType } from '../models/Notification';
import { createLogger } from 'logging-middleware';

const logger = createLogger('backend', 'repository');

export class NotificationRepository {
  public async create(data: Partial<INotification>): Promise<INotification> {
    logger.debug(`Creating notification: ${JSON.stringify(data)}`);
    const notification = new Notification(data);
    return await notification.save();
  }

  public async createMany(data: Array<Partial<INotification>>): Promise<INotification[]> {
    logger.debug(`Bulk creating ${data.length} notifications`);
    return await Notification.insertMany(data) as unknown as INotification[];
  }

  public async findById(id: string): Promise<INotification | null> {
    logger.debug(`Finding notification by ID: ${id}`);
    return await Notification.findById(id);
  }

  public async findWithFilters(
    filters: {
      studentId?: string;
      type?: NotificationType;
      isRead?: boolean;
    },
    pagination: {
      skip: number;
      limit: number;
    }
  ): Promise<{ data: INotification[]; total: number }> {
    logger.debug(`Finding notifications with filters: ${JSON.stringify(filters)}`);

    const query: any = {};
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.type) query.type = filters.type;
    if (filters.isRead !== undefined) query.isRead = filters.isRead;

    const [data, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Notification.countDocuments(query),
    ]);

    return { data, total };
  }

  /**
   * Finds all unread notifications or recent notifications to feed into the Top N MinHeap optimizer
   */
  public async findAllForPriorityCalculation(limit = 1000): Promise<INotification[]> {
    logger.debug('Fetching recent records for priority MinHeap calculation');
    /* Fetch latest 1000 to run top N algorithm on application layer efficiently */
    return await Notification.find().sort({ createdAt: -1 }).limit(limit);
  }

  public async updateReadStatus(id: string, isRead: boolean): Promise<INotification | null> {
    logger.debug(`Updating read status for ID ${id} to ${isRead}`);
    return await Notification.findByIdAndUpdate(
      id,
      { isRead },
      { new: true, runValidators: true }
    );
  }
}
