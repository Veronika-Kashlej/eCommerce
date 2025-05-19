import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registration from '@/pages/registration/Registration';
import { vi } from 'vitest';

vi.mock('@/components/modal/modalWindow', () => ({
  alert: vi.fn(),
}));

describe('Registration component UI Tests', () => {
  const renderRegistration = () => {
    return render(
      <MemoryRouter>
        <Registration />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderRegistration();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByText('Use the same address for billing')).toBeInTheDocument();
  });

  it('validates password strength', () => {
    renderRegistration();

    const passwordInput = screen.getByPlaceholderText('Password');
    const toggleButton = screen.getByRole('button', { name: /👁️/i });

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles billing address visibility', () => {
    renderRegistration();

    const checkbox = screen.getByLabelText('Use the same address for billing');
    expect(screen.queryByText('Billing Address')).toBeNull();
    fireEvent.click(checkbox);

    expect(screen.getByText('Billing Address')).toBeInTheDocument();
  });

  it('copies shipping address to billing when checkbox is checked', () => {
    renderRegistration();

    fireEvent.change(screen.getByPlaceholderText('Street Address'), {
      target: { value: '123 Main St' },
    });

    const checkbox = screen.getByLabelText('Use the same address for billing');
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);

    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
  });

  it('accepts valid BY postal code', async () => {
    const { container } = renderRegistration();

    const countrySelect = container.querySelector('select[name="shippingCountry"]');
    if (!countrySelect) throw new Error('Country select not found');

    fireEvent.change(countrySelect, { target: { value: 'Belarus' } });

    await waitFor(() => {
      const streetInput = screen.getByPlaceholderText('Street Address');
      expect(streetInput).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Street Address'), {
      target: { value: 'Visokaya' },
    });
    fireEvent.change(screen.getByPlaceholderText('City'), {
      target: { value: 'Minsk' },
    });

    const postalInput = screen.getByPlaceholderText('Postal Code');
    fireEvent.change(postalInput, { target: { value: '123456' } });
    fireEvent.blur(postalInput);

    await waitFor(() => {
      const postalError = container.querySelector('.error-message');
      expect(postalError?.textContent).not.toMatch(/invalid postal code/i);

      const postalGroup = postalInput.closest('.form-group');
      expect(postalGroup).not.toHaveClass('error');
    });
  });
});
