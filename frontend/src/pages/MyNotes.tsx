import { useAuth } from "../context/authContext";
import { getRequest, deleteRequest, putRequest } from "../api/requests";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Calendar,
  User,
  Trash2,
  Edit,
  X,
  Save,
  Search,
} from "lucide-react";
import type { Note } from "../interfaces/NotesInterface";

const MyNotes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    noteId: string | null;
    noteContent: string;
  }>({
    show: false,
    noteId: null,
    noteContent: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const endpoint = "/notes/auth-notes";

  const fetchMyNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRequest(endpoint);
      setNotes(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch your notes. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error("Invalid date");
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString.replace(
        /(\d{4}-\d{2}-\d{2})(\d{3}:\d{2}:\d{2}\.\d+)/,
        "$1 $2"
      );
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
        content: editContent.trim(),
      });

      setEditingNoteId(null);
      setEditContent("");
      fetchMyNotes();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update note. Please try again.";
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
      noteContent:
        noteContent.length > 50
          ? noteContent.substring(0, 50) + "..."
          : noteContent,
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

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    ?.filter((note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  if (loading && !deleteConfirm.show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-20 h-20 border-4 border-[#DC143C]/20 border-t-[#DC143C] rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-blue-900 text-xl font-medium animate-pulse">
            Loading Your EPIC Notes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-[#DC143C] bg-clip-text text-transparent mb-4">
            My EPIC Notes
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Your personal collection of amazing thoughts and ideas! ✨
          </p>

          {/* User Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full flex items-center justify-center shadow-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-600 to-[#DC143C] shadow-md">
                  {user?.profile_pic ? (
                    <img
                      src={`http://localhost:8080` + user.profile_pic}
                      alt={`${user.firstname} ${user.lastname}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user?.firstname?.[0]}
                      {user?.lastname?.[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-blue-900">
                  {user?.firstname} {user?.lastname}
                </h3>
                <p className="text-gray-500 text-sm">@{user?.username}</p>
                <p className="text-[#DC143C] text-sm font-semibold">
                  {notes?.length || 0} {notes?.length === 1 ? "note" : "notes"}{" "}
                  created
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/create-note"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-[#DC143C] hover:from-blue-700 hover:to-[#DC143C]/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Note
            </Link>

            {notes && notes.length > 0 && (
              <div className="bg-white rounded-xl shadow border border-gray-200 px-4 py-2">
                <p className="text-blue-900 text-sm">
                  <span className="font-bold">{notes.length}</span> EPIC notes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        {notes && notes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "oldest")
                  }
                  className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-red-700 text-center">🚨 {error}</p>
          </div>
        )}

        {/* Notes Grid */}
        {filteredAndSortedNotes && filteredAndSortedNotes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAndSortedNotes.map((note, index) => (
              <div
                key={note._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {editingNoteId === note._id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(note._id)}
                          disabled={loading}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-32 bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 transition-all duration-300 resize-none text-sm"
                      placeholder="Edit your note..."
                      disabled={loading}
                      autoFocus
                    />

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{editContent.length}/1000 characters</span>
                      <span>Editing...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(note._id, note.content)
                            }
                            className="p-2 text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-gray-800 text-lg leading-relaxed font-medium">
                          "{note.content}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-2" />
                        <span>Created by you</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                No Notes Found
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {searchQuery
                  ? "No notes match your search. Try different keywords!"
                  : "Start your EPIC journey by creating your first note! 🚀"}
              </p>

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center text-[#DC143C] hover:text-[#DC143C]/80 transition-colors duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear search
                </button>
              ) : (
                <Link
                  to="/create-note"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-[#DC143C] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Note
                </Link>
              )}
            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#DC143C]" />
              </div>

              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Delete Note?
              </h3>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this note?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-red-700 text-sm italic leading-relaxed">
                  "{deleteConfirm.noteContent}"
                </p>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center text-gray-700 hover:text-[#DC143C] px-4 py-3 rounded-xl font-medium transition-all duration-300 border-2 border-gray-300 hover:border-[#DC143C] hover:bg-[#DC143C]/5 disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>

                <button
                  onClick={handleDeleteNote}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#DC143C] to-red-600 hover:from-[#DC143C]/90 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotes;
