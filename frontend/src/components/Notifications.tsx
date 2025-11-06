import { useEffect, useState } from 'react';
import { X, Heart, Clock } from 'lucide-react';
import { useNotifications } from '../context/notificationContext';


const NotificationBarSimple = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const unreadNotifications = notifications.filter(notif => !notif.read);

  useEffect(() => {
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0];

      if (currentNotification?._id !== latestNotification._id) {
        setCurrentNotification(latestNotification);
        setIsVisible(true);
        
        const timer = setTimeout(() => {
          setIsVisible(false);
          markAsRead(latestNotification._id);
        }, 5000);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setCurrentNotification(null);
    }
  }, [unreadNotifications, currentNotification, markAsRead]);

  const handleClose = () => {
    if (currentNotification && !currentNotification.read) {
      markAsRead(currentNotification._id);
    }
    setIsVisible(false);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);

    const diff = now.getTime() - notificationTime.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (!isVisible || !currentNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">
              {currentNotification.message}
            </p>
            
            {currentNotification.note?.title && (
              <p className="text-xs text-gray-600 mt-1">
                "{currentNotification.note.title}"
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(currentNotification.createdAt)}</span>
              </div>
              
              {unreadCount > 1 && (
                <span className="text-xs text-blue-600 font-medium">
                  +{unreadCount - 1} more
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBarSimple;
