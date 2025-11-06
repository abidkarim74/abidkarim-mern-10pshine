import { getRequest, postRequest } from "../api/requests";
import { useEffect, useState } from "react";
import type { Note } from "../interfaces/NotesInterface";
import { Calendar, MessageCircle, Heart, Clock, Eye } from "lucide-react";
import { useSearch } from "../context/searchContext";
import { useAuth } from "../context/authContext";
import { io } from "socket.io-client";
import OnlineUsersCounter from "../components/OnlineUsers";

const Home = () => {
  const { search_param } = useSearch();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[] | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const endpoint = "/notes/general-notes";

  // Function to truncate content to 30 characters
  const truncateContent = (content: string, maxLength: number = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const fetchNotes = async (searchQuery?: string) => {
    try {
      setLoading(true);
      let url = endpoint;

      if (searchQuery && searchQuery.trim() !== "") {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await getRequest(url);
      setNotes(response);

      if (response && response.length > 0) {
        setSelectedNote(response[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch notes. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const toggle_like = async (note_id: string) => {
    if (!user) {
      setError("Please login to like notes");
      return;
    }

    try {
      setLiking(note_id);

      const response = await postRequest("/notes/toogle-like", { note_id });

      setNotes(
        (prevNotes) =>
          prevNotes?.map((note) => {
            if (note._id === note_id) {
              return {
                ...note,
                likers: response.liked
                  ? [...note.likers, user._id]
                  : note.likers.filter((id) => id !== user._id),
              };
            }
            return note;
          }) || null
      );

      if (selectedNote && selectedNote._id === note_id) {
        setSelectedNote((prev) =>
          prev
            ? {
                ...prev,
                likers: response.liked
                  ? [...prev.likers, user._id]
                  : prev.likers.filter((id) => id !== user._id),
              }
            : null
        );
      }

      if (response.liked) {
        const likedNote = notes?.find((note) => note._id === note_id);

        if (likedNote && likedNote.creator._id !== user._id) {
          const socket = io("http://localhost:8080");

          socket.emit("send_like_notification", {
            recipientId: likedNote.creator._id,
            senderId: user._id,
            senderName: `${user.firstname} ${user.lastname}`,
            noteId: note_id,
            noteTitle: likedNote.title,
            message: `${user.firstname} ${user.lastname} liked your note: "${likedNote.title}"`,
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to like note";
      setError(errorMessage);
    } finally {
      setLiking(null);
    }
  };

  const isNoteLiked = (note: Note) => {
    if (!user) return false;
    return note.likers.includes(user._id);
  };

  const getLikesCount = (note: Note) => {
    return note.likers.length;
  };

  useEffect(() => {
    if (search_param !== undefined) {
      const timeoutId = setTimeout(() => {
        fetchNotes(search_param);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [search_param]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setShowMobilePreview(true);
  };

  const closeMobilePreview = () => {
    setShowMobilePreview(false);
  };

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
      });
    } catch {
      return dateString.replace(
        /(\d{4}-\d{2}-\d{2})(\d{3}:\d{2}:\d{2}\.\d+)/,
        "$1 $2"
      );
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const datePart = dateString.substring(0, 10);
      const timePart = dateString.substring(10);
      const fixedTimePart = timePart.substring(1);
      const properDateString = `${datePart}T${fixedTimePart}`;
      const date = new Date(properDateString);

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const filteredNotes =
    notes?.filter((note) => {
      if (!search_param || search_param.trim() === "") return true;

      const searchTerm = search_param.toLowerCase();

      return (
        note.content.toLowerCase().includes(searchTerm) ||
        (note.title && note.title.toLowerCase().includes(searchTerm))
      );
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-16 h-16 border-4 border-[#DC143C]/20 border-t-[#DC143C] rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-blue-900 text-xl font-medium animate-pulse">
            {search_param ? "Searching notes..." : "Loading EPIC Notes..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
            <p className="text-red-700 text-center font-medium">🚨 {error}</p>
          </div>
        )}

        <OnlineUsersCounter></OnlineUsersCounter>

        {search_param && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-4xl mx-auto">
            <p className="text-blue-700 text-center font-medium">
              Showing results for: "{search_param}"
              {filteredNotes.length > 0 &&
                ` (${filteredNotes.length} notes found)`}
            </p>
          </div>
        )}

        {filteredNotes && filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-[#DC143C]" />
                  {search_param ? "Search Results" : "Latest Notes"}
                </h2>

                <div className="space-y-4">
                  {filteredNotes.map((note, index) => {
                    const isLiked = isNoteLiked(note);
                    const likesCount = getLikesCount(note);

                    return (
                      <div
                        key={note._id}
                        onClick={() => setSelectedNote(note)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                          selectedNote?._id === note._id
                            ? "border-[#DC143C] bg-gradient-to-r from-blue-50 to-red-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-[#DC143C]">
                              {note.creator.profile_pic ? (
                                <img
                                  src={`http://localhost:8080${note.creator.profile_pic}`}
                                  alt={`${note.creator.firstname} ${note.creator.lastname}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {note.creator.firstname[0]}
                                  {note.creator.lastname[0]}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {note.creator.firstname} {note.creator.lastname}
                              </h3>
                              <p className="text-gray-500 text-sm truncate">
                                @{note.creator.username}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="flex items-center text-gray-500 text-sm mb-1 justify-end">
                              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{formatDate(note.createdAt)}</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm justify-end">
                              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{formatTime(note.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Note Title with proper text wrapping */}
                        <div className="mb-3">
                          <p className="text-gray-800 text-lg font-semibold leading-relaxed break-words">
                            {note.title}
                          </p>
                        </div>

                        {/* Note Content - Show only first 30 characters in list view */}
                        <div className="mb-4">
                          <p className="text-gray-600 leading-relaxed break-words">
                            "{truncateContent(note.content)}"
                          </p>
                          {note.content.length > 30 && (
                            <p className="text-gray-400 text-xs mt-1">
                              Click to read full note
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-gray-500">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle_like(note._id);
                              }}
                              disabled={liking === note._id || !user}
                              className={`flex items-center space-x-1 transition-colors ${
                                isLiked
                                  ? "text-[#DC143C]"
                                  : "hover:text-[#DC143C]"
                              } ${
                                liking === note._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isLiked ? "fill-current" : ""
                                }`}
                              />
                              <span className="text-sm">{likesCount}</span>
                            </button>
                            <button
                              className="lg:hidden flex items-center space-x-1 hover:text-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNoteClick(note);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                          </div>
                          <div className="text-xs text-gray-400">
                            #{index + 1} in {search_param ? "results" : "feed"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="hidden lg:block space-y-6">
              {selectedNote && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sticky top-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Currently Viewing
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full mx-auto"></div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-[#DC143C] rounded-xl p-4 text-white text-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/30">
                      {selectedNote.creator.profile_pic ? (
                        <img
                          src={`http://localhost:8080${selectedNote.creator.profile_pic}`}
                          alt={`${selectedNote.creator.firstname} ${selectedNote.creator.lastname}`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {selectedNote.creator.firstname[0]}
                          {selectedNote.creator.lastname[0]}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold mb-1 truncate px-2">
                      {selectedNote.creator.firstname}{" "}
                      {selectedNote.creator.lastname}
                    </h4>
                    <p className="text-white/80 text-xs truncate px-2">
                      @{selectedNote.creator.username}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">
                        Note Title
                      </h5>
                      <div className="bg-gray-50 rounded p-3 border border-gray-200 mb-3">
                        <p className="text-gray-900 text-base font-bold break-words">
                          {selectedNote.title}
                        </p>
                      </div>

                      <h5 className="text-xs font-semibold text-gray-700 mb-1">
                        Note Content
                      </h5>
                      <div className="bg-gray-50 rounded p-3 border border-gray-200 max-h-40 overflow-y-auto">
                        <p className="text-gray-800 text-sm leading-relaxed break-words">
                          "{selectedNote.content}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggle_like(selectedNote._id)}
                        disabled={liking === selectedNote._id || !user}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          isNoteLiked(selectedNote)
                            ? "bg-[#DC143C] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${
                          liking === selectedNote._id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isNoteLiked(selectedNote) ? "fill-current" : ""
                          }`}
                        />
                        <span className="whitespace-nowrap">
                          {isNoteLiked(selectedNote) ? "Liked" : "Like"} •{" "}
                          {getLikesCount(selectedNote)}
                        </span>
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-blue-50 rounded p-2 text-center min-w-0">
                          <Calendar className="w-3 h-3 mx-auto mb-1 text-blue-600" />
                          <div className="text-blue-900 font-medium truncate text-xs">
                            {formatDate(selectedNote.createdAt)}
                          </div>
                        </div>
                        <div className="bg-red-50 rounded p-2 text-center min-w-0">
                          <Clock className="w-3 h-3 mx-auto mb-1 text-[#DC143C]" />
                          <div className="text-[#DC143C] font-medium truncate text-xs">
                            {formatTime(selectedNote.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl text-white">
                  {search_param ? "" : ""}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {search_param ? "No Notes Found" : "No Notes Yet"}
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {search_param
                  ? `No notes found matching "${search_param}". Try different keywords.`
                  : "Be the first to create an epic note and inspire the community!"}
              </p>
              {!search_param && (
                <button className="bg-gradient-to-r from-blue-600 to-[#DC143C] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                  Create First Note
                </button>
              )}
            </div>
          )
        )}
      </div>

      {showMobilePreview && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 lg:hidden">
          <div className="fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Note Preview
                </h3>
                <button
                  onClick={closeMobilePreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-[#DC143C] rounded-xl p-4 text-white text-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/30">
                  {selectedNote.creator.profile_pic ? (
                    <img
                      src={`http://localhost:8080${selectedNote.creator.profile_pic}`}
                      alt={`${selectedNote.creator.firstname} ${selectedNote.creator.lastname}`}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {selectedNote.creator.firstname[0]}
                      {selectedNote.creator.lastname[0]}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold mb-1 truncate px-2">
                  {selectedNote.creator.firstname}{" "}
                  {selectedNote.creator.lastname}
                </h4>
                <p className="text-white/80 text-xs truncate px-2">
                  @{selectedNote.creator.username}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-1">
                    Note Title
                  </h5>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200 mb-3">
                    <p className="text-gray-900 text-base font-bold break-words">
                      {selectedNote.title}
                    </p>
                  </div>

                  <h5 className="text-xs font-semibold text-gray-700 mb-1">
                    Note Content
                  </h5>
                  <div className="bg-gray-50 rounded p-3 border border-gray-200 max-h-32 overflow-y-auto">
                    <p className="text-gray-800 text-sm leading-relaxed break-words">
                      "{selectedNote.content}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggle_like(selectedNote._id)}
                    disabled={liking === selectedNote._id || !user}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isNoteLiked(selectedNote)
                        ? "bg-[#DC143C] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${
                      liking === selectedNote._id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isNoteLiked(selectedNote) ? "fill-current" : ""
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {isNoteLiked(selectedNote) ? "Liked" : "Like"} •{" "}
                      {getLikesCount(selectedNote)}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 rounded p-2 text-center min-w-0">
                      <Calendar className="w-3 h-3 mx-auto mb-1 text-blue-600" />
                      <div className="text-blue-900 font-medium truncate text-xs">
                        {formatDate(selectedNote.createdAt)}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded p-2 text-center min-w-0">
                      <Clock className="w-3 h-3 mx-auto mb-1 text-[#DC143C]" />
                      <div className="text-[#DC143C] font-medium truncate text-xs">
                        {formatTime(selectedNote.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;