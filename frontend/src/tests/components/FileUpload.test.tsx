import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import { FileUpload } from '@/components/FileUpload';
import { fileService } from '@/services/fileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/services/fileService', () => ({
  __esModule: true,
  fileService: {  
    uploadFile: jest.fn(),
    getFiles: jest.fn(),
    deleteFile: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
      error: jest.fn(),
      success: jest.fn(),
    },
  }));

const queryClient = new QueryClient();
const mockOnUploadSuccess = jest.fn();
const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('handles file selection', async () => {
    render(<FileUpload onUploadSuccess={mockOnUploadSuccess} />, { wrapper: Wrapper });
    
    const input = screen.getByLabelText(/upload a file/i);
    await userEvent.upload(input, mockFile);
    
    await waitFor(() => {
      const selectedDiv = screen.getByTestId('selected-file');
      expect(selectedDiv).toHaveTextContent('Selected: test.jpg');
    });
  });

  it('submits files successfully', async () => {
    (fileService.uploadFile as jest.Mock).mockResolvedValue({ status: 'success' });
    render(
      <Wrapper>
        <FileUpload onUploadSuccess={mockOnUploadSuccess} />
      </Wrapper>
    );
    
    const input = screen.getByLabelText(/upload a file/i);
    await userEvent.upload(input, mockFile);
    
    const submitButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalled();
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });
  });

  it('shows error on failure', async () => {
    const errorMessage = 'Upload failed';
    (fileService.uploadFile as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(
      <Wrapper>
        <FileUpload onUploadSuccess={mockOnUploadSuccess} />
      </Wrapper>
    );
    
    const input = screen.getByLabelText(/upload a file/i);
    await userEvent.upload(input, mockFile);
    
    const submitButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        errorMessage,
        expect.objectContaining({
          duration: 6000,
          style: expect.objectContaining({
            background: '#FFEBEE',
            color: '#C62828',
          })
        })
      );
    });
  });

});