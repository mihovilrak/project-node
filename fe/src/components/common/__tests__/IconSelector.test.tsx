import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IconSelector from '../IconSelector';
import { getAvailableIcons } from '../../../api/activityTypes';

jest.mock('../../../api/activityTypes');

describe('IconSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAvailableIcons as jest.Mock).mockResolvedValue(['Label', 'Work']);
  });

  it('loads the icons once and selects one', async () => {
    const onChange = jest.fn();
    render(<IconSelector value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select icon' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select icon Work' }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Work');
    expect(getAvailableIcons).toHaveBeenCalledTimes(1);
  });

  it('renders the current icon in the trigger', () => {
    render(<IconSelector value="Label" onChange={jest.fn()} />);

    const trigger = screen.getByRole('button', {
      name: 'Icon: Label. Change icon',
    });
    expect(trigger.querySelector('svg')).toBeInTheDocument();
  });

  it('falls back to the name for unknown icons', () => {
    render(<IconSelector value="Missing" onChange={jest.fn()} />);

    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  it('shows the load error in the dialog', async () => {
    (getAvailableIcons as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    render(<IconSelector value={undefined} onChange={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select icon' }));

    expect(
      await screen.findByText(
        'You do not have permission to perform this action',
      ),
    ).toBeInTheDocument();
  });
});
