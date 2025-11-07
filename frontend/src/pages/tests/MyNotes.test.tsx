import { it } from 'vitest';

import { vi } from 'vitest';

import { expect } from 'vitest';


import { describe } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyNotes from '../MyNotes';

vi.mock('../../context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api/requests', () => ({
  getRequest: vi.fn(),
  putRequest: vi.fn(),
  deleteRequest: vi.fn(),
}));

import { useAuth } from '../../context/authContext';
import { getRequest } from '../../api/requests';

const mockUseAuth = vi.mocked(useAuth);
const mockGetRequest = vi.mocked(getRequest);

describe('MyNotes', () => {
  const mockUser = {
    _id: 'user123',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    profile_pic: null,
  };

  const mockNotes = [
    {
      _id: '1',
      title: 'Test Note 1',
      content: 'This is test note content 1',
      creator: mockUser,
      likers: [],
      createdAt: '2024-01-01T10:00:00.000Z',
    },
    {
      _id: '2',
      title: 'Test Note 2',
      content: 'This is test note content 2',
      creator: mockUser,
      likers: [],
      createdAt: '2024-01-02T11:00:00.000Z',
    },
  ];

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
    mockGetRequest.mockResolvedValue(mockNotes);
    
    return render(
      <BrowserRouter>
        <MyNotes />
      </BrowserRouter>
    );
  };

  it('renders my notes page', async () => {
    setup();
    
    await waitFor(() => {
      expect(screen.getByText('My EPIC Notes')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockGetRequest.mockImplementation(() => new Promise(() => {}));
    
    render(
      <BrowserRouter>
        <MyNotes />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading Your EPIC Notes...')).toBeInTheDocument();
  });

  it('displays notes after loading', async () => {
    setup();
    
    await waitFor(() => {
      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });

  it('shows note count', async () => {
    setup();
    
    await waitFor(() => {
      expect(screen.getByText('2 notes created')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notes', async () => {
    mockGetRequest.mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <MyNotes />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No Notes Found')).toBeInTheDocument();
    });
  });

  it('shows create note button', async () => {
    setup();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Note')).toBeInTheDocument();
    });
  });
});