import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../UserProfile';
import { vi } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';


vi.mock('../../context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api/requests', () => ({
  uploadFileRequest: vi.fn(),
}));

import { useAuth } from '../../context/authContext';
import { uploadFileRequest } from '../../api/requests';

const mockUseAuth = vi.mocked(useAuth);
const mockUploadFileRequest = vi.mocked(uploadFileRequest);

describe('UserProfile', () => {
  const mockUser = {
    _id: 'user123',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    profile_pic: null,
    email: 'john@example.com',
  };

  const setup = () => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      accessToken: 'token',
      setAccessToken: vi.fn(),
      mainLoading: false,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    });
    
    return render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
  };

  it('renders user profile page', () => {
    setup();
    
    expect(screen.getByRole('heading', { name: 'My Profile' })).toBeInTheDocument();
    expect(screen.getByText('Manage your profile picture and account information')).toBeInTheDocument();
  });

  it('shows user information correctly', () => {
    setup();
    
    const headings = screen.getAllByText('John Doe');
    expect(headings.length).toBeGreaterThan(0);
    
    const usernames = screen.getAllByText('@johndoe');
    expect(usernames.length).toBeGreaterThan(0);
  });

  it('shows profile picture with initials when no image', () => {
    setup();
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows profile picture when user has profile_pic', () => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        ...mockUser,
        profile_pic: '/profile.jpg'
      },
      accessToken: 'token',
      setAccessToken: vi.fn(),
      mainLoading: false,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    });
    
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
    
    const profileImage = screen.getByAltText('Profile');
    expect(profileImage).toHaveAttribute('src', 'http://localhost:8080/profile.jpg');
  });

  it('enters edit mode when change photo button is clicked', () => {
    setup();
    
    const changePhotoButton = screen.getByText('Change Photo');
    fireEvent.click(changePhotoButton);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('exits edit mode when cancel button is clicked', () => {
    setup();
    
    const changePhotoButton = screen.getByText('Change Photo');
    fireEvent.click(changePhotoButton);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.getByText('Change Photo')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('handles file selection through profile picture click', async () => {
    setup();
    
    const changePhotoButton = screen.getByText('Change Photo');
    fireEvent.click(changePhotoButton);
    
    const profilePicture = screen.getByText('JD').closest('div');
    fireEvent.click(profilePicture!);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
  });

  it('submits profile picture successfully', async () => {
    mockUploadFileRequest.mockResolvedValue({});
    setup();
    
    const changePhotoButton = screen.getByText('Change Photo');
    fireEvent.click(changePhotoButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: true,
    });
    
    fireEvent.change(fileInput);
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUploadFileRequest).toHaveBeenCalledWith(
        '/auth/update-profile-picture',
        expect.any(FormData)
      );
    });
  });

  it('shows loading state during upload', async () => {
    mockUploadFileRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    setup();
    
    const changePhotoButton = screen.getByText('Change Photo');
    fireEvent.click(changePhotoButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: true,
    });
    
    fireEvent.change(fileInput);
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(await screen.findByText('Saving...')).toBeInTheDocument();
  });

  it('has quick action buttons', () => {
    setup();
    
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    expect(screen.getByText('View My Notes')).toBeInTheDocument();
    expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
  });

  it('shows login message when user is not authenticated', () => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      setAccessToken: vi.fn(),
      mainLoading: false,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    });
    
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
  });
});