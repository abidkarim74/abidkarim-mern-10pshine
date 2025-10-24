const MainLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse' }}></div>
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin absolute top-4 left-1/2 transform -translate-x-1/2" style={{ animationDuration: '1.5s' }}></div>
        </div>

        {/* Loading Text */}
        <p className="text-cyan-200 text-xl font-light mb-4 animate-pulse">
          Loading EPIC Experience...
        </p>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="mt-8">
          <div className="text-cyan-400/30 text-sm">
            ✨ Preparing something amazing...
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};

export default MainLoading;