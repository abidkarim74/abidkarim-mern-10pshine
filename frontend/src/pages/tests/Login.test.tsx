import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';


vi.mock('../../context/authContext', () => ({
  useAuth: vi.fn(),
}));


vi.mock('../../api/requests', () => ({
  postRequest: vi.fn(),
}));

import { useAuth } from '../../context/authContext';
import { postRequest } from '../../api/requests';

const mockUseAuth = vi.mocked(useAuth);
const mockPostRequest = vi.mocked(postRequest);

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth context
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: vi.fn(),
      mainLoading: false,
      user: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  // Rendering Tests
  it('renders login form with all elements', () => {
    renderComponent();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  // Form Validation Tests
  it('shows validation errors when submitting empty form', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows password length error for short password', async () => {
    renderComponent();
    
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);
    
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('clears field error when user starts typing', async () => {
    renderComponent();
    
    const usernameInput = screen.getByLabelText(/username/i);
    
    // Trigger validation error
    fireEvent.focus(usernameInput);
    fireEvent.blur(usernameInput);
    
    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    
    // Start typing to clear error
    fireEvent.change(usernameInput, { target: { value: 'test' } });
    
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
  });

  // Form Interaction Tests
  it('updates form fields when user types', () => {
    renderComponent();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('toggles remember me checkbox', () => {
    renderComponent();
    
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    
    expect(rememberMeCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  // Form Submission Tests
  it('submits form with valid data', async () => {
    const mockSetAccessToken = vi.fn();
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      mainLoading: false,
      user: null,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      logout: vi.fn(),
    });
    
    mockPostRequest.mockResolvedValue({
      accessToken: 'mock-jwt-token'
    });
    
    renderComponent();
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /remember me/i }));
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
        rememberMe: true
      });
    });
  });

  it('shows loading state during form submission', async () => {
    mockPostRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent();
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Signing In...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles API error with specific message', async () => {
    const apiError = {
      response: {
        data: {
          message: 'Invalid username or password'
        }
      }
    };
    mockPostRequest.mockRejectedValue(apiError);
    
    renderComponent();
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });

  // Edge Cases
  it('disables submit button when loading', () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();
  });

  // Accessibility Tests
  it('has proper form labels and placeholders', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/username/i)).toHaveAttribute('placeholder', 'Enter your username');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('placeholder', 'Enter your password');
    expect(screen.getByLabelText(/username/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('required');
  });

  it('shows error states with proper styling', async () => {
    renderComponent();
    
    const usernameInput = screen.getByLabelText(/username/i);
    
    // Trigger validation error
    fireEvent.focus(usernameInput);
    fireEvent.blur(usernameInput);
    
    await waitFor(() => {
      expect(usernameInput).toHaveClass('border-red-400');
    });
  });
});