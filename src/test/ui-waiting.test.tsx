import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WaitingModal from '@/components/waiting/Waiting';

describe('WaitingModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(<WaitingModal isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(<WaitingModal isOpen={true} />);

    const backdrop = screen.getByTestId('waiting-backdrop');
    const modal = screen.getByTestId('waiting-modal');
    const icon = screen.getByText('⏳');

    expect(backdrop).toBeInTheDocument();
    expect(modal).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-live', 'polite');
    expect(modal).toHaveAttribute('aria-busy', 'true');
    expect(modal).toHaveAttribute('role', 'status');
  });

  it('should match snapshot when open', () => {
    const { asFragment } = render(<WaitingModal isOpen={true} />);
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="waiting-backdrop"
          data-testid="waiting-backdrop"
        >
          <div
            aria-busy="true"
            aria-live="polite"
            class="waiting-modal"
            data-testid="waiting-modal"
            role="status"
          >
            ⏳
          </div>
        </div>
      </DocumentFragment>
    `);
  });

  it('should match snapshot when closed', () => {
    const { asFragment } = render(<WaitingModal isOpen={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
