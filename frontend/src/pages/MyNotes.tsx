import { useAuth } from "../context/authContext";
import { getRequest, deleteRequest, putRequest } from "../api/requests";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Calendar, User, Trash2, Edit, X, Save } from "lucide-react";
import type { Note } from "../interfaces/NotesInterface";


const MyNotes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; noteId: string | null; noteContent: string }>({
    show: false,
    noteId: null,
    noteContent: ""
  });
  
  const endpoint = "/notes/auth-notes";

  const fetchMyNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRequest(endpoint);
      setNotes(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch your notes. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyNotes();
  }, []);

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

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) {
      setError("Note content cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      await putRequest(`/notes/update-note/${noteId}`, {
        content: editContent.trim()
      });
      
      setEditingNoteId(null);
      setEditContent("");
      fetchMyNotes(); 

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update note. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  const handleDeleteClick = (noteId: string, noteContent: string) => {
    setDeleteConfirm({
      show: true,
      noteId,
      noteContent: noteContent.length > 50 ? noteContent.substring(0, 50) + "..." : noteContent
    });
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm.noteId) return;
    
    try {
      setLoading(true);
      await deleteRequest(`/notes/delete-note/${deleteConfirm.noteId}`);
      setDeleteConfirm({ show: false, noteId: null, noteContent: "" });
      fetchMyNotes();
    } catch (err) {
      setError("Failed to delete note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteConfirm({ show: false, noteId: null, noteContent: "" });
  };

  if (loading && !deleteConfirm.show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-cyan-200 text-xl font-light mb-4 animate-pulse">
            Loading Your EPIC Notes...
          </p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
            My EPIC Notes
          </h1>
          <p className="text-cyan-200 text-lg mb-6">
            Your personal collection of amazing thoughts! 
          </p>
          
          <div className="bg-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {user?.firstname?.[0]}{user?.lastname?.[0]}
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">
                  {user?.firstname} {user?.lastname}
                </h3>
                <p className="text-cyan-200 text-sm">@{user?.username}</p>
                <p className="text-cyan-300/70 text-xs">{notes?.length || 0} notes created</p>
              </div>
            </div>
          </div>

          <Link 
            to="/create-note" 
            className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-cyan-500/25 border border-cyan-400/50"
          >
            <Plus className="w-6 h-6 mr-3" />
            Create New Note
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 mb-8 backdrop-blur-sm animate-shake max-w-2xl mx-auto">
            <p className="text-red-200 text-center text-lg">🚨 {error}</p>
          </div>
        )}

        {notes && notes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/25 group relative">
                
                {editingNoteId === note._id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FileText className="w-6 h-6 text-cyan-400" />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSaveEdit(note._id)}
                          disabled={loading}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-32 bg-black/20 backdrop-blur-sm border-2 border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none text-sm"
                      placeholder="Edit your note..."
                      disabled={loading}
                    />
                    
                    <div className="flex justify-between items-center text-xs text-cyan-300/70">
                      <span>{editContent.length}/1000 characters</span>
                      <span>Editing...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => handleEditNote(note)}
                            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(note._id, note.content)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-3 leading-relaxed line-clamp-3">
                        "{note.content}"
                      </h3>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                      <div className="flex items-center text-sm text-cyan-200">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-cyan-300/70">
                        <User className="w-3 h-3 mr-2" />
                        <span>Created by you</span>
                      </div>
                    </div>

                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-4">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <FileText className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-200 mb-4">No Notes Yet</h3>
              <p className="text-cyan-300/70 text-lg mb-8">
                Start your EPIC journey by creating your first note! 
              </p>
              
            </div>
          )
        )}

        {notes && notes.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-cyan-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 inline-block">
              <p className="text-cyan-200 text-lg">
                You have <span className="text-cyan-400 font-bold">{notes.length}</span> EPIC notes!
              </p>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Delete Note?</h3>
              
              <p className="text-cyan-200 mb-2">Are you sure you want to delete this note?</p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-200 text-sm italic">
                  "{deleteConfirm.noteContent}"
                </p>
              </div>
              
              <p className="text-cyan-300/70 text-sm mb-6">
                This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center text-cyan-200 hover:text-cyan-300 px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteNote}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-red-500/25 border border-red-400/50 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default MyNotes;