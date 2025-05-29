import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FileList } from '@/components/FileList';
import { fileService } from '@/services/fileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/services/fileService', () => ({
  __esModule: true,
  fileService: {
    getFiles: jest.fn(),
    deleteFile: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockFiles = [
  { 
    id: '1', 
    original_filename: 'test.jpg', 
    file: 'http://test.com/file1',
    file_type: 'image/jpeg',
    size: 1024,
    uploaded_at: '2023-01-01T00:00:00Z'
  },
];

describe('FileList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('renders files successfully', async () => {
    (fileService.getFiles as jest.Mock).mockResolvedValue(mockFiles);
    render(<FileList />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByText(/image\/jpeg.*1.00 KB/)).toBeInTheDocument();
      
      const uploadedText = screen.getAllByText(/uploaded/i);
      expect(uploadedText.length).toBeGreaterThan(0);
      
      expect(screen.getByText(/uploaded.*2023/i)).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    (fileService.getFiles as jest.Mock).mockResolvedValue([]);
    render(<FileList />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/no files found/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    (fileService.getFiles as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<FileList />, { wrapper: Wrapper });
    
    await waitFor(() => {
      const errorElement = screen.getByText(/error loading files/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('API Error');
    });
  });
});