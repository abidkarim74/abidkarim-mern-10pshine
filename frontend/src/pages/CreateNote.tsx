import { useAuth } from "../context/authContext";
import { postRequest } from "../api/requests";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Sparkles, Type, Zap, Bold, Italic, List, Link, Smile } from "lucide-react";

const CreateNote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    contentHtml: "" // Add this to store HTML content
  });

  const editorRef = useRef<HTMLDivElement>(null);

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

      // Send both plain text and HTML content to the backend
      await postRequest("/notes/create-note", {
        title: noteData.title.trim(),
        content: noteData.content.trim(),
        contentHtml: noteData.contentHtml // Send the formatted HTML
      });

      setSuccess("Your note has been created successfully!");
      
      setNoteData({
        title: "",
        content: "",
        contentHtml: ""
      });

      // Clear the editor
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setNoteData(prev => ({
        ...prev,
        content: editorRef.current?.innerText || "", // Plain text for character count
        contentHtml: editorRef.current?.innerHTML || "" // HTML for formatting
      }));
    }
  };

  const handleTextFormat = (format: string) => {
    if (!editorRef.current) return;

    // Focus the editor first
    editorRef.current.focus();
    
    // Use document.execCommand for rich text formatting
    try {
      switch (format) {
        case 'bold':
          document.execCommand('bold', false);
          break;
        case 'italic':
          document.execCommand('italic', false);
          break;
        case 'insertUnorderedList':
          document.execCommand('insertUnorderedList', false);
          break;
        case 'createLink':
          const url = prompt('Enter URL:', 'https://');
          if (url) {
            document.execCommand('createLink', false, url);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Formatting error:', err);
    }

    // Update the content state
    handleEditorChange();
  };

  const insertEmoji = (emoji: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    
    try {
      document.execCommand('insertText', false, emoji);
    } catch (err) {
      // Fallback for browsers that don't support insertText
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(emoji));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    handleEditorChange();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert text at cursor position
    if (editorRef.current) {
      document.execCommand('insertText', false, text);
      handleEditorChange();
    }
  };

  // Function to ensure the editor has proper styling when empty
  const ensureEditorStyle = () => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<div><br></div>';
    }
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
                <p className="text-red-700 text-center text-lg">🚨 {error}</p>
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
                onChange={handleChange}
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
                
                {/* Text Editor Toolbar */}
                <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleTextFormat('bold')}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleTextFormat('italic')}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleTextFormat('insertUnorderedList')}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleTextFormat('createLink')}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Add Link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  
                  <div className="relative group">
                    <button
                      type="button"
                      className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Add Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 grid grid-cols-4 gap-1">
                      {['😊', '😂', '❤️', '🔥', '⭐', '🎉', '💡', '🚀'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                {/* Rich Text Editor */}
                <div
                  ref={editorRef}
                  contentEditable={!loading && !success}
                  onInput={handleEditorChange}
                  onPaste={handlePaste}
                  onFocus={ensureEditorStyle}
                  className="w-full h-64 bg-white border-2 border-gray-300 rounded-xl px-6 py-5 text-gray-800 transition-all duration-300 resize-none text-lg font-normal leading-relaxed overflow-y-auto prose prose-lg max-w-none"
                  style={{ 
                    minHeight: '256px',
                    outline: 'none'
                  }}
                  data-placeholder="What's on your mind? Share something amazing..."
                />
                
                {/* Placeholder text */}
                {!noteData.content && (
                  <div className="absolute top-5 left-6 text-gray-400 pointer-events-none">
                    What's on your mind? Share something amazing...
                    <div className="text-sm mt-2 text-gray-500">
                      Use the toolbar above to format your text with <strong>bold</strong>, <em>italic</em>, lists, and links!
                    </div>
                  </div>
                )}
                
                {/* Character Counter */}
                <div className="absolute bottom-4 right-4">
                  <span className={`text-sm ${
                    characterCount > maxCharacters * 0.9 
                      ? 'text-[#DC143C]' 
                      : characterCount > maxCharacters * 0.8
                      ? 'text-orange-500'
                      : 'text-gray-500'
                  }`}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>

                {characterCount > 0 && characterCount < 100 && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                      <p className="text-yellow-700 text-xs">Add more details!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Formatting Help */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 text-sm font-medium mb-2">How to use the text editor:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                  <div>1. <strong>Select text</strong> → Click <strong>Bold/Italic</strong> to see actual formatting</div>
                  <div>2. Click <strong>List</strong> to create bullet points</div>
                  <div>3. Click <strong>Link</strong> to add clickable links</div>
                  <div>4. Use the <strong>smiley</strong> to add emojis</div>
                </div>
                <p className="text-blue-600 text-xs mt-2 font-medium">
                  ✅ Your formatting (bold, italic, lists, links) will be saved and displayed!
                </p>
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
            <h4 className="text-blue-900 font-semibold mb-2">Rich Formatting</h4>
            <p className="text-gray-600 text-sm">Bold, italic, lists and links are preserved</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-[#DC143C]" />
            </div>
            <h4 className="text-blue-900 font-semibold mb-2">Real-time Preview</h4>
            <p className="text-gray-600 text-sm">See formatting as you type</p>
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