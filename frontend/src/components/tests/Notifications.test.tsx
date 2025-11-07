import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotifications } from '../../context/notificationContext'
import NotificationBarSimple from '../Notifications';


vi.mock('../../context/notificationContext');


const mockUseNotifications = vi.mocked(useNotifications);

describe('NotificationBarSimple', () => {
  const mockMarkAsRead = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification with complete data', () => {
    // Mock the context return value directly
    mockUseNotifications.mockReturnValue({
      notifications: [{
        _id: '1',
        recipient: 'user123',
        sender: {
          _id: 'sender123',
          firstname: 'John',
          lastname: 'Doe',
          username: 'johndoe',
          profile_pic: 'profile.jpg'
        },
        note: {
          _id: 'note123',
          title: 'My Note'
        },
        message: 'liked your note',
        read: false,
        createdAt: new Date().toISOString(),
      }],
      unreadCount: 1,
      socket: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      fetchNotifications: vi.fn(),
      loading: false,
    });

    render(<NotificationBarSimple />);
    
    expect(screen.getByText('liked your note')).toBeInTheDocument();
    expect(screen.getByText('"My Note"')).toBeInTheDocument();
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('does not render when there are no unread notifications', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      socket: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      fetchNotifications: vi.fn(),
      loading: false,
    });

    const { container } = render(<NotificationBarSimple />);
    expect(container.firstChild).toBeNull();
  });

  it('handles close button click', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [{
        _id: '1',
        recipient: 'user123',
        sender: {
          _id: 'sender123',
          firstname: 'John',
          lastname: 'Doe',
          username: 'johndoe'
        },
        note: {
          _id: 'note123',
          title: 'My Note'
        },
        message: 'test message',
        read: false,
        createdAt: new Date().toISOString(),
      }],
      unreadCount: 1,
      socket: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      fetchNotifications: vi.fn(),
      loading: false,
    });

    render(<NotificationBarSimple />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('shows multiple notification count', () => {
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          _id: '1',
          recipient: 'user123',
          sender: {
            _id: 'sender123',
            firstname: 'John',
            lastname: 'Doe',
            username: 'johndoe'
          },
          note: {
            _id: 'note123',
            title: 'My Note'
          },
          message: 'first message',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          recipient: 'user123',
          sender: {
            _id: 'sender456',
            firstname: 'Jane',
            lastname: 'Smith',
            username: 'janesmith'
          },
          note: {
            _id: 'note456',
            title: 'Another Note'
          },
          message: 'second message',
          read: false,
          createdAt: new Date().toISOString(),
        }
      ],
      unreadCount: 2,
      socket: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      fetchNotifications: vi.fn(),
      loading: false,
    });

    render(<NotificationBarSimple />);
    
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });
});