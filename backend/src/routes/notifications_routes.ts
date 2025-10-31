import express from 'express';
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
}  from "../controllers/notifications_controllers.js"
import { verify_authentication } from '../middleware/auth_middleware.js';


const notification_router = express.Router();

notification_router.get('/', verify_authentication, getNotifications);

notification_router.get('/unread-count', verify_authentication, getUnreadCount);

notification_router.put('/mark-read/:notificationId', verify_authentication, markNotificationAsRead);

notification_router.put('/mark-all-read', verify_authentication, markAllNotificationsAsRead);


export default notification_router;