import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './authContext';
import { getRequest, putRequest } from '../api/requests';


interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    firstname: string;
    lastname: string;
    username: string;
    profile_pic?: string;
  };
  note: {
    _id: string;
    title: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  socket: Socket | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getRequest('/notifications');

      setNotifications(response.notifications || response || []);

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);

    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await putRequest(`/notifications/mark-read/${notificationId}`, {});

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );

    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await putRequest('/notifications/mark-all-read', {});

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const newSocket = io('http://localhost:8080', {
        query: {
          userId: user._id
        }
      });

      setSocket(newSocket);

      newSocket.on('new_like_notification', (data) => {
        const newNotification: Notification = {
          _id: data._id || data.notificationId,
          recipient: user._id,
          sender: data.sender,
          note: data.note,
          message: data.message,
          read: data.read || false,
          createdAt: data.createdAt || data.timestamp
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification server');
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      socket,
      markAsRead,
      markAllAsRead,
      fetchNotifications,
      loading
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};