import { getRequest } from "../api/requests";
import { useEffect, useState } from "react";
import type { Note } from "../interfaces/NotesInterface";


const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const endpoint = "/notes/general-notes";

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getRequest(endpoint);
      setNotes(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch notes. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!notes || notes.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [notes]);

  const formatDate = (dateString: string) => {
    try {
      const datePart = dateString.substring(0, 10);
      const timePart = dateString.substring(10);
      const fixedTimePart = timePart.substring(1);
      const properDateString = `${datePart}T${fixedTimePart}`;
      const date = new Date(properDateString);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString.replace(/(\d{4}-\d{2}-\d{2})(\d{3}:\d{2}:\d{2}\.\d+)/, '$1 $2');
    }
  };

  const handleNext = () => {
    if (!notes || isAnimating) return;
    setIsAnimating(true);
    setCurrentNoteIndex((prev) => (prev + 1) % notes.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrevious = () => {
    if (!notes || isAnimating) return;
    setIsAnimating(true);
    setCurrentNoteIndex((prev) => (prev - 1 + notes.length) % notes.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNote = (index: number) => {
    if (!notes || isAnimating) return;
    setIsAnimating(true);
    setCurrentNoteIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-white text-xl font-light animate-pulse">Loading EPIC Notes...</p>
          <div className="mt-4 flex space-x-2 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3 animate-pulse">
              EPIC NOTES
            </h1>
            <p className="text-gray-300 text-sm md:text-base">Your thoughts, amplified with power!</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm animate-shake max-w-2xl mx-auto">
              <p className="text-red-200 text-center text-sm md:text-base">🚨 {error}</p>
            </div>
          )}

          {notes && notes.length > 0 ? (
            <div className="relative">
              
              <div className="flex justify-center space-x-2 mb-6">
                {notes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToNote(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      index === currentNoteIndex 
                        ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="relative flex items-center justify-center min-h-[280px] md:min-h-[320px]">
                <div className="w-full max-w-2xl mx-auto">
                  <div
                    className={`bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8 transform transition-all duration-700 ${
                      isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
                    } hover:scale-105 hover:shadow-cyan-500/25`}
                  >
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <span className="text-white font-bold text-lg md:text-xl">
                            {notes[currentNoteIndex].creator.firstname[0]}{notes[currentNoteIndex].creator.lastname[0]}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-relaxed line-clamp-3">
                        "{notes[currentNoteIndex].content}"
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center text-cyan-200 mb-3 space-y-1 sm:space-y-0">
                        <span className="font-semibold text-base md:text-lg">
                          {notes[currentNoteIndex].creator.firstname} {notes[currentNoteIndex].creator.lastname}
                        </span>
                        <span className="hidden sm:block mx-3 text-white/50">•</span>
                        <span className="text-white/70 text-sm md:text-base">{formatDate(notes[currentNoteIndex].createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-center text-xs md:text-sm text-white/50">
                        <span className="bg-black/30 px-2 py-1 rounded-full">
                          @{notes[currentNoteIndex].creator.username}
                        </span>
                      </div>
                    </div>

                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 md:w-4 md:h-4 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-4 md:space-x-6 mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={isAnimating}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-sm md:text-base"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center">
                  <span className="text-white/70 text-xs md:text-sm mx-2 md:mx-4">
                    {currentNoteIndex + 1} / {notes.length}
                  </span>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-5 py-2 md:px-8 md:py-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-sm md:text-base"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-3xl md:text-4xl">📝</span>
                </div>
                <p className="text-gray-400 text-xl md:text-2xl mb-3">No epic notes found.</p>
                <p className="text-gray-500 text-sm md:text-base">Create your first note to start the journey! 🚀</p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="py-4">
        <div className="text-center">
          <p className="text-gray-400 text-xs">
          Made with love<span className="text-red-500 animate-pulse"></span> and epic energy
          </p>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}

export default Home;