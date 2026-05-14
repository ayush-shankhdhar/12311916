import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { ApiResponse, ApiError } from '../utils/ApiResponse';
import { NotificationType } from '../models/Notification';
import { createLogger } from 'logging-middleware';

const logger = createLogger('backend', 'controller');

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  public getNotifications = async (req: Request, res: Response) => {
    logger.info('Controller processing GET /api/notifications');

    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const type = req.query.notification_type as NotificationType;
    const studentId = req.query.studentId as string;
    const isReadString = req.query.isRead as string;

    let isRead: boolean | undefined;
    if (isReadString === 'true') isRead = true;
    if (isReadString === 'false') isRead = false;

    const filters = {
      ...(type && { type }),
      ...(studentId && { studentId }),
      ...(isRead !== undefined && { isRead }),
    };

    const result = await this.service.getNotifications(filters, page, limit);
    
    logger.info('Sent notification paginated responses');
    res.status(200).json(
      ApiResponse.success('Notifications retrieved successfully', result.notifications, result.pagination)
    );
  };

  public getTopPriorityNotifications = async (req: Request, res: Response) => {
    logger.info('Controller processing GET /api/notifications/priority');

    const limit = parseInt(req.query.limit as string || '10', 10);
    const notifications = await this.service.getTopPriorityNotifications(limit);

    logger.info('Sent top priority response using heap optimization');
    res.status(200).json(
      ApiResponse.success('Top priority notifications retrieved', notifications)
    );
  };

  public createNotification = async (req: Request, res: Response) => {
    logger.info('Controller processing POST /api/notifications');

    const { studentId, type, message } = req.body;
    const notification = await this.service.createNotification({ studentId, type, message });

    res.status(201).json(
      ApiResponse.success('Notification created successfully', notification)
    );
  };

  public createBulkNotifications = async (req: Request, res: Response) => {
    logger.info('Controller processing POST /api/notifications/bulk');

    await this.service.createBulkNotifications(req.body);

    res.status(202).json(
      ApiResponse.success('Bulk notification request accepted into scalable worker processing', null)
    );
  };

  public markRead = async (req: Request, res: Response) => {
    logger.info(`Controller processing PATCH /api/notifications/${req.params.id}/read`);

    const notification = await this.service.markAsRead(req.params.id);
    if (!notification) {
      logger.warn(`Notification with ID ${req.params.id} not found for update`);
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json(
      ApiResponse.success('Notification updated to read', notification)
    );
  };
}
