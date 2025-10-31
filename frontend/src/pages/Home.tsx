import { getRequest } from "../api/requests";
import { useEffect, useState } from "react";
import type { Note } from "../interfaces/NotesInterface";
import {
  Calendar,
  User,
  MessageCircle,
  Heart,
  Share2,
  Clock,
} from "lucide-react";


const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const endpoint = "/notes/general-notes";

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getRequest(endpoint);
      setNotes(response);
      if (response && response.length > 0) {
        setSelectedNote(response[0]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-16 h-16 border-4 border-[#DC143C]/20 border-t-[#DC143C] rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-blue-900 text-xl font-medium animate-pulse">
            Loading EPIC Notes...
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

        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Notes List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-[#DC143C]" />
                  Latest Notes
                </h2>

                <div className="space-y-4">
                  {notes.map((note, index) => (
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
                                src={
                                  `http://localhost:8080` +
                                  note.creator.profile_pic
                                }
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

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {note.creator.firstname} {note.creator.lastname}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              @{note.creator.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-gray-500 text-sm mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(note.createdAt)}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(note.createdAt)}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-800 text-lg leading-relaxed mb-4 line-clamp-3">
                        {note.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-[#DC143C] transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">24</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-400">
                          #{index + 1} in feed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Note Preview */}
            <div className="space-y-6">
              {selectedNote && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Currently Viewing
                    </h3>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full mx-auto"></div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-[#DC143C] rounded-xl p-8 text-white text-center mb-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                      {selectedNote.creator.profile_pic ? (
                        <img
                          src={`http://localhost:8080` + selectedNote.creator.profile_pic}
                          alt={`${selectedNote.creator.firstname} ${selectedNote.creator.lastname}`}
                          className="w-10 h-10 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {selectedNote.creator.firstname[0]}
                          {selectedNote.creator.lastname[0]}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold mb-2">
                      {selectedNote.creator.firstname}{" "}
                      {selectedNote.creator.lastname}
                    </h4>
                    <p className="text-white/80 text-sm">
                      @{selectedNote.creator.username}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        Note Content
                      </h5>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-800 text-lg leading-relaxed italic">
                          "{selectedNote.content}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Calendar className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                        <div className="text-blue-900 font-medium">
                          {formatDate(selectedNote.createdAt)}
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-[#DC143C]" />
                        <div className="text-[#DC143C] font-medium">
                          {formatTime(selectedNote.createdAt)}
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
                <span className="text-4xl text-white">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Notes Yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Be the first to create an epic note and inspire the community!
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-[#DC143C] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                Create First Note
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
