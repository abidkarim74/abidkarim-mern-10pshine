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
    content: "",
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
        content: noteData.content.trim(),
      });

      setSuccess("Your note has been created successfully!");
      
      setNoteData({
        title: "",
        content: "",
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteData(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const characterCount = noteData.content.length;
  const maxCharacters = 2000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-900 hover:text-[#DC143C] mb-6 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-[#DC143C] bg-clip-text text-transparent mb-4">
            Create EPIC Note
          </h1>
          <p className="text-gray-600 text-lg">
            Share your amazing thoughts with the world! 
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.firstname?.[0]}{user?.lastname?.[0]}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-blue-900">
                {user?.firstname} {user?.lastname}
              </h3>
              <p className="text-gray-500 text-sm">Creating new note...</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600 mr-3" />
                  <p className="text-green-700 text-lg text-center">{success}</p>
                </div>
                <p className="text-green-600 text-sm text-center mt-2">
                  Redirecting to your notes...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-700 text-center text-lg">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center text-blue-900 text-lg font-semibold">
                <Zap className="w-5 h-5 mr-3 text-[#DC143C]" />
                Note Title
              </label>
              
              <input
                type="text"
                name="title"
                value={noteData.title}
                onChange={handleTitleChange}
                placeholder="Give your note an amazing title... "
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-400 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300 text-lg"
                disabled={loading || !!success}
                maxLength={100}
              />
              
              <div className="flex justify-end">
                <span className="text-gray-500 text-sm">
                  {noteData.title.length}/100
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-blue-900 text-lg font-semibold">
                  <Type className="w-5 h-5 mr-3 text-[#DC143C]" />
                  Your EPIC Note
                </label>
                
                <div className="text-sm text-gray-500">
                  {characterCount}/{maxCharacters} characters
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={noteData.content}
                  onChange={handleContentChange}
                  placeholder="Write your amazing thoughts here... "
                  className="w-full min-h-64 bg-white border-2 border-gray-300 rounded-lg px-6 py-4 text-gray-800 placeholder-gray-400 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300 resize-none text-lg font-normal leading-relaxed"
                  disabled={loading || !!success}
                  maxLength={maxCharacters}
                />
                
                {characterCount > 0 && characterCount < 100 && (
                  <div className="absolute -top-2 right-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                      <p className="text-yellow-700 text-xs">Add more details!</p>
                    </div>
                  </div>
                )}
              </div>

              
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="flex-1 flex items-center justify-center text-gray-700 hover:text-[#DC143C] px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 border-2 border-gray-300 hover:border-[#DC143C] hover:bg-[#DC143C]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !!success || !noteData.content.trim() || !noteData.title.trim()}
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-[#DC143C] hover:from-blue-700 hover:to-[#DC143C]/90 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-blue-500/25 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-blue-900 font-semibold mb-2">Simple & Clean</h4>
            <p className="text-gray-600 text-sm">Focus on your content without distractions</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-[#DC143C]" />
            </div>
            <h4 className="text-blue-900 font-semibold mb-2">Fast Writing</h4>
            <p className="text-gray-600 text-sm">Quick and efficient note creation</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Type className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-blue-900 font-semibold mb-2">Be Expressive</h4>
            <p className="text-gray-600 text-sm">Write from the heart, be authentic</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNote;