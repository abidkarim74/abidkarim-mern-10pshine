import { useAuth } from "../context/authContext";
import { uploadFileRequest } from "../api/requests";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { User,X, Edit, FileText, Camera, Upload, Check, RotateCcw } from "lucide-react";


const UserProfile = () => {
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditImage = () => {
    setIsEditingImage(true);
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const handleSaveImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first!");
      return;
    }

    try {
      setImageLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      await uploadFileRequest("/auth/update-profile-picture", formData);

      setSuccess("Profile picture updated successfully!");
      setIsEditingImage(false);
      setSelectedImage(null);
      setSelectedFile(null);
      
      setTimeout(() => setSuccess(null), 3000);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      window.location.assign(`/${user?.username}`);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile picture. Please try again.';
      setError(errorMessage);
    } finally {
      setImageLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingImage(false);
    setSelectedImage(null);
    setSelectedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfilePictureClick = () => {
    if (!isEditingImage) {
      handleEditImage();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB!");
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.[0] || ''}${lastname?.[0] || ''}`.toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-900 text-xl">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-[#DC143C] bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your profile picture and account information
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-center">✅ {success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center">🚨 {error}</p>
          </div>
        )}

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-blue-900">Profile Information</h2>
                {!isEditingImage ? (
                  <button 
                    onClick={handleEditImage}
                    className="flex items-center justify-center text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-[#DC143C]/5 px-4 py-2 rounded-lg transition-all duration-200 border border-[#DC143C]/30 w-full sm:w-auto"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </button>
                ) : (
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button 
                      onClick={handleSaveImage}
                      disabled={imageLoading || !selectedFile}
                      className="flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200 border border-green-300 disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      {imageLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#DC143C] rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {imageLoading ? "Saving..." : "Save"}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={imageLoading}
                      className="flex items-center justify-center text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-300 disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="relative group">
                    <div 
                      className={`w-20 h-20 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-full flex items-center justify-center shadow-lg overflow-hidden transition-all duration-300 ${
                        isEditingImage ? 'cursor-pointer hover:scale-105' : ''
                      }`}
                      onClick={isEditingImage ? handleProfilePictureClick : undefined}
                    >
                      {selectedImage ? (
                        <img 
                          src={selectedImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : user.profile_pic ? (
                        <img 
                          src={`http://localhost:8080` + user.profile_pic} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {getInitials(user.firstname, user.lastname)}
                        </span>
                      )}
                      
                      {isEditingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {!isEditingImage && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#DC143C] rounded-full flex items-center justify-center border-2 border-white">
                        <Edit className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-gray-600 text-sm">@{user.username}</p>
                    
                    {isEditingImage && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={handleProfilePictureClick}
                          disabled={imageLoading}
                          className="flex items-center justify-center text-[#DC143C] hover:text-[#DC143C]/80 text-sm transition-colors duration-200 disabled:opacity-50 mx-auto sm:mx-0"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          {selectedFile ? "Change Image" : "Select Image"}
                        </button>
                        
                        {selectedFile && (
                          <button
                            onClick={handleCancelEdit}
                            disabled={imageLoading}
                            className="flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 disabled:opacity-50 mx-auto sm:mx-0"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {isEditingImage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-700 text-sm text-center">
                      {selectedFile 
                        ? `Selected: ${selectedFile.name}`
                        : "Click on the profile picture or 'Select Image' to choose a new photo"
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <label className="text-blue-900 text-sm font-medium">Username</label>
                      <p className="text-gray-800 mt-1">@{user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <label className="text-blue-900 text-sm font-medium">Account Status</label>
                      <p className="text-gray-800 mt-1">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Username</span>
                  <span className="text-blue-900 font-bold">@{user.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Status</span>
                  <span className="text-green-600 font-bold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Complete</span>
                  <span className="text-[#DC143C] font-bold">
                    {user.profile_pic ? '100%' : '80%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/create-note" 
                  className="flex items-center justify-center w-full text-white bg-gradient-to-r from-blue-600 to-[#DC143C] hover:from-blue-700 hover:to-[#DC143C]/90 px-4 py-3 rounded-lg transition-all duration-200 border border-transparent"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Create New Note
                </Link>
                
                <Link 
                  to="/my-notes" 
                  className="flex items-center justify-center w-full text-blue-900 hover:text-[#DC143C] hover:bg-[#DC143C]/5 px-4 py-3 rounded-lg transition-all duration-200 border border-gray-300 hover:border-[#DC143C]/30"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  View My Notes
                </Link>
                
                <button 
                  onClick={handleEditImage}
                  disabled={imageLoading || isEditingImage}
                  className="flex items-center justify-center w-full text-[#DC143C] hover:text-[#DC143C]/80 hover:bg-[#DC143C]/5 px-4 py-3 rounded-lg transition-all duration-200 border border-[#DC143C]/30 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 mr-3" />
                  Change Profile Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;