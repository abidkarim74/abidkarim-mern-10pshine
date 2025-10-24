import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { Bell, Menu, X, LogOut, Home, FileText, Plus } from "lucide-react";
import MainLoading from "./MainLoading";


const Header = () => {
  const { logout, accessToken, user } = useAuth();

  if (!accessToken) {
    return <MainLoading />;
  }

  const userData = {
    name: user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "User",
    avatar: user?.profile_pic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format",
    notifications: 3
  };

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-lg border-b border-cyan-500/30 shadow-2xl relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse"
                onClick={closeMobileMenu}
              >
                EPIC Notes
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-cyan-200 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-cyan-500/10 hover:scale-105 border border-transparent hover:border-cyan-500/30"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </Link>
              <Link 
                to="/my-notes" 
                className="text-cyan-200 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-cyan-500/10 hover:scale-105 border border-transparent hover:border-cyan-500/30"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                My Notes
              </Link>
              <Link 
                to="/create-note" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-cyan-500/25 flex items-center border border-cyan-400/50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button className="p-2.5 text-cyan-200 hover:text-cyan-400 transition-all duration-300 hover:bg-cyan-500/10 rounded-lg hover:scale-110 border border-transparent hover:border-cyan-500/30">
                  <Bell className="w-5 h-5" />
                  {userData.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-cyan-200">
                      {userData.notifications}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-3 bg-cyan-500/10 rounded-lg px-3 py-2 border border-cyan-500/30">
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/50"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-cyan-200">{userData.name}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center justify-center text-cyan-200 hover:text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-cyan-500/30 hover:border-red-400/50 hover:bg-red-500/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
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

            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 text-cyan-200 hover:text-cyan-400 transition-all duration-300 hover:bg-cyan-500/10 rounded-lg border border-transparent hover:border-cyan-500/30"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-b from-gray-900/95 to-blue-900/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl z-50">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              {/* Error Message */}
              {error && (
                <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              {/* User Info */}
              <div className="flex items-center mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/50 mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-cyan-200">{userData.name}</p>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-cyan-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                >
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </Link>
                <Link 
                  to="/notes" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-cyan-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  My Notes
                </Link>
                <Link 
                  to="/create" 
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg transition-all duration-300 hover:scale-105 border border-cyan-400/50"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Note
                </Link>

                {/* Mobile Notifications */}
                <div className="flex items-center justify-between px-3 py-3 text-base font-medium text-cyan-200 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-3" />
                    Notifications
                  </div>
                  {userData.notifications > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-cyan-200">
                      {userData.notifications}
                    </span>
                  )}
                </div>

                {/* Mobile Logout */}
                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center justify-between w-full text-left px-3 py-3 text-base font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3" />
                    {loading ? "Logging out..." : "Logout"}
                  </div>
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-900/95 to-blue-900/95 backdrop-blur-lg border border-cyan-500/30 p-6 rounded-2xl shadow-2xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <span className="text-cyan-200 text-lg">Logging out...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;