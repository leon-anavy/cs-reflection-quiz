import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfidenceSlider from '../../src/components/student/ConfidenceSlider';

describe('ConfidenceSlider', () => {
  test('renders 5 buttons', () => {
    render(<ConfidenceSlider value={null} onChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  test('calls onChange with correct level when clicked', async () => {
    const onChange = vi.fn();
    render(<ConfidenceSlider value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText('3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  test('selected level has aria-pressed true', () => {
    render(<ConfidenceSlider value={3} onChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
  });
});
