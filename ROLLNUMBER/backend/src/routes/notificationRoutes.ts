import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationValidator } from '../validators/NotificationValidator';
import { asyncHandler } from '../utils/asyncHandler';
import { createLogger } from 'logging-middleware';

const logger = createLogger('backend', 'route');
const router = Router();
const controller = new NotificationController();

logger.info('Registering application notification endpoints');

/* GET all notifications (supports pagination and filters) */
router.get('/', asyncHandler(controller.getNotifications));

/* GET top priority notifications via optimized algorithm */
router.get('/priority', asyncHandler(controller.getTopPriorityNotifications));

/* POST single notification */
router.post('/', NotificationValidator.validateCreate, asyncHandler(controller.createNotification));

/* POST bulk notifications through worker dispatch */
router.post('/bulk', NotificationValidator.validateBulkCreate, asyncHandler(controller.createBulkNotifications));

/* PATCH update mark read status */
router.patch('/:id/read', asyncHandler(controller.markRead));

export default router;
