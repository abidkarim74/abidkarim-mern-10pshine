import { useAuth } from "../context/authContext";
import { postRequest } from "../api/requests";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Sparkles, Type, Zap } from "lucide-react";


const CreateNote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [noteData, setNoteData] = useState({
    title: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteData.title.trim()) {
      setError("Title cannot be empty!");
      return;
    }

    if (!noteData.content.trim()) {
      setError("Note content cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await postRequest("/notes/create-note", {
        title: noteData.title.trim(),
        content: noteData.content.trim()
      });

      setSuccess("Your note has been created successfully!");
      
      setNoteData({
        title: "",
        content: ""
      });

      setTimeout(() => {
        navigate("/my-notes");
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create note. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const characterCount = noteData.content.length;
  const maxCharacters = 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
            Create EPIC Note
          </h1>
          <p className="text-cyan-200 text-lg">
            Share your amazing thoughts with the world! 
          </p>
        </div>

        <div className="bg-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.firstname?.[0]}{user?.lastname?.[0]}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">
                {user?.firstname} {user?.lastname}
              </h3>
              <p className="text-cyan-200 text-sm">Creating new note...</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-cyan-500/30 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-400 mr-3" />
                  <p className="text-green-200 text-lg text-center">{success}</p>
                </div>
                <p className="text-green-300/70 text-sm text-center mt-2">
                  Redirecting to your notes...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 backdrop-blur-sm animate-shake">
                <p className="text-red-200 text-center text-lg"> {error}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center text-cyan-200 text-lg font-semibold">
                <Zap className="w-5 h-5 mr-3" />
                Note Title
              </label>
              
              <input
                type="text"
                name="title"
                value={noteData.title}
                onChange={handleChange}
                placeholder="Give your note an amazing title... "
                className="w-full bg-black/20 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl px-6 py-4 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-lg"
                disabled={loading || !!success}
                maxLength={100}
              />
              
              <div className="flex justify-end">
                <span className="text-cyan-300/70 text-sm">
                  {noteData.title.length}/100
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center text-cyan-200 text-lg font-semibold">
                <Type className="w-5 h-5 mr-3" />
                Your EPIC Note
              </label>
              
              <div className="relative">
                <textarea
                  name="content"
                  value={noteData.content}
                  onChange={handleChange}
                  placeholder="What's on your mind? Share something amazing... "
                  className="w-full h-64 bg-black/20 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl px-6 py-5 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none text-lg"
                  maxLength={maxCharacters}
                  disabled={loading || !!success}
                />
                
                <div className="absolute bottom-4 right-4">
                  <span className={`text-sm ${
                    characterCount > maxCharacters * 0.8 
                      ? 'text-red-400' 
                      : 'text-cyan-300/70'
                  }`}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>

                {characterCount > 0 && characterCount < 50 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-1">
                      <p className="text-yellow-200 text-xs">Add more details!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="flex-1 flex items-center justify-center text-cyan-200 hover:text-cyan-300 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !!success || !noteData.content.trim() || !noteData.title.trim()}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-cyan-500/25 border border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Create EPIC Note
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Clear Title</h4>
            <p className="text-cyan-200/70 text-sm">Give your note a descriptive title</p>
          </div>
          
          <div className="bg-purple-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Rich Content</h4>
            <p className="text-purple-200/70 text-sm">Add detailed content to your note</p>
          </div>
          
          <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Type className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Be Expressive</h4>
            <p className="text-blue-200/70 text-sm">Write from the heart, be authentic</p>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default CreateNote;