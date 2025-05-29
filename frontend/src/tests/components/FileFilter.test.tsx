import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileFilter } from '@/components/FileFilter';

describe('FileFilter Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all filter inputs', () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    expect(screen.getByRole('combobox', { name: /file type/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /min size/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /max size/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/uploaded after/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/uploaded before/i)).toBeInTheDocument();
  });

  it('calls onChange with default empty filters on initial render', () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      file_type: '',
      size_min: '',
      size_max: '',
      uploaded_after: '',
      uploaded_before: ''
    });
  });

  it('updates filters when file type is selected', async () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    const fileTypeSelect = screen.getByRole('combobox', { name: /file type/i });
    await userEvent.selectOptions(fileTypeSelect, 'image/jpeg');
    
    expect(mockOnChange).toHaveBeenLastCalledWith(expect.objectContaining({
      file_type: 'image/jpeg'
    }));
  });

  it('updates filters when size range is entered', async () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    const minSizeInput = screen.getByRole('spinbutton', { name: /min size/i });
    const maxSizeInput = screen.getByRole('spinbutton', { name: /max size/i });
    
    await userEvent.type(minSizeInput, '100');
    await userEvent.type(maxSizeInput, '1000');
    
    expect(mockOnChange).toHaveBeenLastCalledWith(expect.objectContaining({
      size_min: '100',
      size_max: '1000'
    }));
  });

  it('updates filters with formatted dates when date inputs change', async () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    const uploadedAfterInput = screen.getByLabelText(/uploaded after/i);
    const uploadedBeforeInput = screen.getByLabelText(/uploaded before/i);
    
    await userEvent.type(uploadedAfterInput, '2023-01-01');
    await userEvent.type(uploadedBeforeInput, '2023-12-31');
    
    expect(mockOnChange).toHaveBeenLastCalledWith(expect.objectContaining({
      uploaded_after: '2023-01-01T00:00:00Z',
      uploaded_before: '2023-12-31T00:00:00Z'
    }));
  });

  it('handles clearing filters', async () => {
    render(<FileFilter onChange={mockOnChange} />);
    
    const fileTypeSelect = screen.getByRole('combobox', { name: /file type/i });
    const minSizeInput = screen.getByRole('spinbutton', { name: /min size/i });
    const uploadedAfterInput = screen.getByLabelText(/uploaded after/i);
    
    await userEvent.selectOptions(fileTypeSelect, 'application/pdf');
    await userEvent.type(minSizeInput, '100');
    await userEvent.type(uploadedAfterInput, '2023-01-01');
    
    await userEvent.selectOptions(fileTypeSelect, '');
    await userEvent.clear(minSizeInput);
    await userEvent.clear(uploadedAfterInput);
    
    expect(mockOnChange).toHaveBeenLastCalledWith(expect.objectContaining({
      file_type: '',
      size_min: '',
      uploaded_after: ''
    }));
  });
});