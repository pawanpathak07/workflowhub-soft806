
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import ItemModal from './ItemModal.jsx';

describe('ItemModal component', () => {
  it('displays the new item form', () => {
    render(
      <ItemModal onSave={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.getByText('New workflow item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('shows an error when the title is empty', () => {
    render(
      <ItemModal onSave={vi.fn()} onClose={vi.fn()} />
    );

    fireEvent.click(screen.getByText('Add item'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please give the item a title.'
    );
  });

  it('saves an item with a trimmed title', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ItemModal onSave={onSave} onClose={vi.fn()} />
    );

    fireEvent.change(
      screen.getByPlaceholderText('What needs to be done?'),
      { target: { value: '  Complete assignment  ' } }
    );

    fireEvent.click(screen.getByText('Add item'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete assignment',
          due_date: null,
        })
      );
    });
  });

  it('displays existing item details when editing', () => {
    const item = {
      title: 'Test task',
      description: 'Test description',
      status: 'pending',
      priority: 'high',
      due_date: '2026-12-01',
    };

    render(
      <ItemModal
        item={item}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Edit workflow item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });
});
