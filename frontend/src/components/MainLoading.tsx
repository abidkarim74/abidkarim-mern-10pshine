const MainLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="w-16 h-16 border-4 border-[#DC143C]/30 border-t-[#DC143C] rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse' }}></div>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin absolute top-4 left-1/2 transform -translate-x-1/2" style={{ animationDuration: '1.5s' }}></div>
        </div>

        <p className="text-blue-900 text-xl font-medium mb-4 animate-pulse">
          Loading EPIC Experience...
        </p>

        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full animate-bounce"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>

        <div className="mt-8">
          <div className="text-gray-600 text-sm">
            ✨ Preparing something amazing...
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DC143C]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};

export default MainLoading;