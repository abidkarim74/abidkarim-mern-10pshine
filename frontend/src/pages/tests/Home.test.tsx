import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';


describe('Home', () => {
  vi.mock('../../api/requests', () => ({
    getRequest: vi.fn(() => Promise.resolve([])),
    postRequest: vi.fn(),
  }));

  vi.mock('../../context/searchContext', () => ({
    useSearch: () => ({
      search_param: '',
      setSearchParam: vi.fn(),
    }),
  }));

  vi.mock('../../context/authContext', () => ({
    useAuth: () => ({
      accessToken: 'mock-token',
      setAccessToken: vi.fn(),
      mainLoading: false,
      user: {
        _id: 'user123',
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        profile_pic: null,
        email: 'john@example.com',
      },
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    }),
  }));

  vi.mock('../../components/OnlineUsers', () => ({
    default: () => <div>Online Users</div>,
  }));

  vi.mock('socket.io-client', () => ({
    io: () => ({
      emit: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    }),
  }));

  it('renders home page', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading EPIC Notes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No Notes Yet')).toBeInTheDocument();
    });
  });
});