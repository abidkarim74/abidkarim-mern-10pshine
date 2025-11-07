import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';


vi.mock('../../context/authContext', () => ({
  useAuth: () => ({
    setAccessToken: vi.fn(),
  }),
}));

vi.mock('../../api/requests', () => ({
  postRequest: vi.fn(),
}));


import { postRequest } from '../../api/requests';

const mockPostRequest = vi.mocked(postRequest);


import Signup from '../Signup';

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
  };


    it('renders signup form heading', () => {
    renderComponent();
    
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Join us today! Fill in your details')).toBeInTheDocument();
  });

  it('has all form fields', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane123')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  it('updates form fields when typing', () => {
    renderComponent();
    
    const firstName = screen.getByPlaceholderText('John');
    const lastName = screen.getByPlaceholderText('Doe');
    
    fireEvent.change(firstName, { target: { value: 'John' } });
    fireEvent.change(lastName, { target: { value: 'Doe' } });
    
    expect(firstName).toHaveValue('John');
    expect(lastName).toHaveValue('Doe');
  });

  it('shows validation errors for empty fields on submit', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockPostRequest.mockResolvedValue({ accessToken: 'mock-token' });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('jane123'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith('/auth/signup', {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'Password123',
      });
    });
  });
});