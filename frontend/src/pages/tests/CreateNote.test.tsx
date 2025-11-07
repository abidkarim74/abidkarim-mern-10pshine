import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateNote from '../CreateNote';

// Simple mocks
vi.mock('../../context/authContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'user123',
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
    },
  }),
}));

vi.mock('../../api/requests', () => ({
  postRequest: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('CreateNote', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CreateNote />
      </BrowserRouter>
    );
  };

  it('renders basic elements', () => {
    renderComponent();
    
    // Use more specific queries to avoid duplicate text issues
    expect(screen.getByRole('heading', { name: 'Create EPIC Note' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Give your note an amazing title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your amazing thoughts here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create EPIC Note' })).toBeInTheDocument();
  });

  it('handles user input', () => {
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Give your note an amazing title...');
    fireEvent.change(titleInput, { target: { value: 'My Note' } });
    
    expect(titleInput).toHaveValue('My Note');
  });

  it('has working form elements', () => {
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText('Give your note an amazing title...');
    const contentTextarea = screen.getByPlaceholderText('Write your amazing thoughts here...');
    
    expect(titleInput).toBeEnabled();
    expect(contentTextarea).toBeEnabled();
  });

  it('displays user information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Creating new note...')).toBeInTheDocument();
  });

  it('shows character count', () => {
    renderComponent();
    
    const contentTextarea = screen.getByPlaceholderText('Write your amazing thoughts here...');
    fireEvent.change(contentTextarea, { target: { value: 'Hello' } });
    
    expect(screen.getByText('5/2000 characters')).toBeInTheDocument();
  });
});