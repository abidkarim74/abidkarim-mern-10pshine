// controllers/notificationController.ts
import { Response } from 'express';
import Notification from '../models/notification_models.js';
import { AuthenticatedRequest } from '../interfaces/auth_interface.js';


export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'firstname lastname username profile_pic')
      .populate('note', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments({ recipient: userId });

    res.status(200).json({
      success: true,
      notifications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    });
  }
};


export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get unread count' 
    });
  }
};

export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
     if (!req.user) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }

    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipient: userId 
      },
      { 
        read: true 
      },
      { 
        new: true 
      }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark notification as read' 
    });
  }
};


export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "You are not authenticated!" });
      return;
    }
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { 
        recipient: userId, 
        read: false 
      },
      { 
        read: true 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark all notifications as read' 
    });
  }
};