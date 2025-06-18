import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Page404 from '@/pages/page404/Page404';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: vi.fn(),
  };
});

describe('Page404 Component', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Page404 />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    expect(
      screen.getByText('It seems you are lost in the space of the Internet...')
    ).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('👨‍🚀')).toBeInTheDocument();
  });

  it('navigates to home when Back button is clicked', () => {
    const mockNavigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Page404 />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
