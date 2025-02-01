import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileHeader from '../ProfileHeader';
import { User } from '../../../types/user';

const mockUser: User = {
  id: 1,
  login: 'testuser',
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  role_id: 1,
  status_id: 1,
  avatar_url: 'https://example.com/avatar.jpg',
  created_on: '2024-01-01',
  updated_on: null,
  last_login: null,
  role_name: 'Developer',
  status_name: 'Active',
  status_color: '#00ff00'};

describe('ProfileHeader', () => {
  test('renders user information correctly', () => {
    const { container } = render(<ProfileHeader user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  test('renders avatar with fallback when no avatar_url', () => {
    const userWithoutAvatar = {
      ...mockUser,
      avatar_url: null
    };
    render(<ProfileHeader user={userWithoutAvatar} />);
    
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
  });

  test('renders with correct layout', () => {
    const { container } = render(<ProfileHeader user={mockUser} />);
    
    expect(container.querySelector('h4')).toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  test('renders avatar with correct size', () => {
    render(<ProfileHeader user={mockUser} />);
    
    const avatar = screen.getByAltText('John Doe').parentElement;
    expect(avatar).toHaveStyle({
      width: '80px',
      height: '80px'
    });
  });
});