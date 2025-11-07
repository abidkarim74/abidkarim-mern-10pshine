import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useEffect, useState, useRef } from "react";
import { Bell, Menu, X, LogOut, Home, FileText, Plus, User, Search, Heart} from "lucide-react";
import MainLoading from "./MainLoading";
import { useSearch } from "../context/searchContext";
import { useNotifications } from "../context/notificationContext";
import NotificationBarSimple from "./Notifications";

const Header = () => {
  const { logout, accessToken, user } = useAuth();
  const { setSearchParam } = useSearch();

  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!accessToken) {
    return <MainLoading />;
  }

  const userData = {
    name: user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "User",
    avatar: user?.profile_pic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format",
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logout();
      
    } catch (err) {
      setError("Failed to log out. Please try again.");
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
    if (window.innerWidth < 768) {
      setIsSearchOpen(false);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // Don't close the notification dropdown when clicking on a notification
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = now.getTime() - notificationTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    setSearchParam(searchQuery);
  }, [searchQuery]);

  return (
    <>
      <header className="bg-white backdrop-blur-lg border-b border-gray-200 shadow-sm relative z-40 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#DC143C] bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
                onClick={closeMobileMenu}
              >
                EPIC Notes
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300 outline-none text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#DC143C] transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-blue-900 hover:text-[#DC143C] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#DC143C]/5 hover:scale-105 border border-transparent hover:border-[#DC143C]/20 flex items-center"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </Link>
            
              <Link 
                to="/create-note" 
                className="bg-gradient-to-r from-blue-600 to-[#DC143C] text-white hover:from-blue-700 hover:to-[#DC143C]/90 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-blue-500/25 flex items-center border border-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="p-2.5 text-blue-900 hover:text-[#DC143C] transition-all duration-300 hover:bg-[#DC143C]/5 rounded-lg hover:scale-110 border border-transparent hover:border-[#DC143C]/20 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#DC143C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-64">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <Heart className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                {notification.note?.title && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    "{notification.note.title}"
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={closeNotifications}
                          className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link 
                to={`/${user?.username}`} 
                className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-[#DC143C]/5 hover:border-[#DC143C]/30 transition-all duration-300"
              >
                {user?.profile_pic ? (
                  <img 
                    src={`http://localhost:8080${user.profile_pic}`} 
                    alt={user?.firstname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#DC143C]/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-[#DC143C] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-900">{userData.name}</p>
                </div>
              </Link>

              <button 
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center justify-center text-blue-900 hover:text-white hover:bg-[#DC143C] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200 hover:border-[#DC143C] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </button>
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="p-2.5 text-blue-900 hover:text-[#DC143C] transition-all duration-300 hover:bg-[#DC143C]/5 rounded-lg border border-transparent hover:border-[#DC143C]/20"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#DC143C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="fixed top-16 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-56">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <Heart className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                {notification.note?.title && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    "{notification.note.title}"
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={closeNotifications}
                          className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={toggleSearch}
                className="p-2.5 text-blue-900 hover:text-[#DC143C] transition-all duration-300 hover:bg-[#DC143C]/5 rounded-lg border border-transparent hover:border-[#DC143C]/20"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={toggleMobileMenu}
                className="p-2.5 text-blue-900 hover:text-[#DC143C] transition-all duration-300 hover:bg-[#DC143C]/5 rounded-lg border border-transparent hover:border-[#DC143C]/20"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="md:hidden absolute top-0 left-0 right-0 bottom-0 bg-white/95 backdrop-blur-md z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg bg-white focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300 outline-none text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#DC143C] transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-900 hover:text-[#DC143C] transition-colors duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-500 text-center">
                Type to search your notes...
              </p>
            </div>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 animate-in slide-in-from-top-5 duration-300">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {user?.profile_pic ? (
                  <img 
                    src={`http://localhost:8080${user.profile_pic}`} 
                    alt={userData.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#DC143C]/30 mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-[#DC143C] flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-blue-900">{userData.name}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Link 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-blue-900 hover:text-[#DC143C] hover:bg-[#DC143C]/5 rounded-lg transition-all duration-300 border border-transparent hover:border-[#DC143C]/20"
                >
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </Link>
                
                <Link 
                  to="/notes" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-blue-900 hover:text-[#DC143C] hover:bg-[#DC143C]/5 rounded-lg transition-all duration-300 border border-transparent hover:border-[#DC143C]/20"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  My Notes
                </Link>
                
                <Link 
                  to="/create-note" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-lg transition-all duration-300 hover:scale-105 border border-transparent"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Note
                </Link>

                <button 
                  onClick={() => {
                    closeMobileMenu();
                    toggleSearch();
                  }}
                  className="flex items-center justify-between w-full text-left px-3 py-3 text-base font-medium text-blue-900 hover:text-[#DC143C] hover:bg-[#DC143C]/5 rounded-lg transition-all duration-300 border border-transparent hover:border-[#DC143C]/20"
                >
                  <div className="flex items-center">
                    <Search className="w-5 h-5 mr-3" />
                    Search
                  </div>
                </button>

                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center justify-between w-full text-left px-3 py-3 text-base font-medium text-blue-900 hover:text-white hover:bg-[#DC143C] rounded-lg transition-all duration-300 border border-transparent hover:border-[#DC143C] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3" />
                    {loading ? "Logging out..." : "Logout"}
                  </div>
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <NotificationBarSimple />

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC143C]"></div>
            <span className="text-blue-900 text-lg">Logging out...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;