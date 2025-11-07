import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useNotifications } from "../context/notificationContext";
import { useAuth } from "../context/authContext";


const OnlineUsersCounter = () => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { socket } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (userIds: string[]) => {
      setOnlineUsers(userIds.length);
      setIsConnected(true);
    };

    socket.on("getOnlineUsers", handleOnlineUsers);

    socket.emit("requestOnlineUsers");

    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [socket]);


  useEffect(() => {
    console.log("Socket status:", {
      hasSocket: !!socket,
      connected: socket?.connected,
      userId: user?._id,
      onlineUsers,
    });
  }, [socket, user, onlineUsers]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className={`relative ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <div
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
            </div>

            <div className="text-center">
              <span className="text-sm font-bold text-gray-800">
                {isConnected ? onlineUsers : "0"}
              </span>
              <span className="text-xs text-gray-500 block">online</span>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <span className="text-xs font-bold">×</span>
          </button>
        </div>

        {!isConnected && (
          <div className="mt-2 text-xs text-red-500 text-center">
            Disconnected
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineUsersCounter;
