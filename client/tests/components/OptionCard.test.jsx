import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptionCard from '../../src/components/student/OptionCard';

describe('OptionCard', () => {
  test('renders option text', () => {
    render(<OptionCard index={0} text="אי-זוגי" isSelected={false} onSelect={() => {}} />);
    expect(screen.getByText('אי-זוגי')).toBeInTheDocument();
  });

  test('calls onSelect with correct index on click', async () => {
    const onSelect = vi.fn();
    render(<OptionCard index={2} text="Test" isSelected={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  test('applies selected styles when isSelected is true', () => {
    render(<OptionCard index={0} text="Test" isSelected={true} onSelect={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.className).toContain('ring-2');
  });

  test('is not selected when isSelected is false', () => {
    render(<OptionCard index={0} text="Test" isSelected={false} onSelect={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('keyboard: Enter key triggers selection', async () => {
    const onSelect = vi.fn();
    render(<OptionCard index={1} text="Option B" isSelected={false} onSelect={onSelect} />);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.click(button); // buttons fire click on Enter natively
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
