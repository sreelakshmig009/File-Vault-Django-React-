import axios from 'axios';
import { fileService } from '@/services/fileService';

const mockAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      delete: jest.fn(),
      get: jest.fn(),
      post: jest.fn()
    }))
  },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

beforeAll(() => {
  process.env.REACT_APP_API_URL = 'http://localhost:8000/api';
  
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  global.URL.revokeObjectURL = jest.fn();
  document.body.appendChild = jest.fn();
  document.body.removeChild = jest.fn();
});

describe('fileService', () => {
  const mockFileId = '00000000-0000-0000-0000-000000000001';
  const mockFile = new File(['test'], 'test.jpg');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFile', () => {
    it('deletes successfully', async () => {
      mockAxios.delete.mockResolvedValue({ status: 204 });
      await expect(fileService.deleteFile(mockFileId)).resolves.not.toThrow();
      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/files/${mockFileId}/`
      );
    });
  });

  describe('downloadFile', () => {
    it('downloads successfully', async () => {
      const mockBlob = new Blob(['test']);
      mockAxios.get.mockResolvedValue({ data: mockBlob });
      
      await expect(fileService.downloadFile(mockFileId, 'test.jpg'))
        .resolves.not.toThrow();
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('throws specific error on failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(fileService.downloadFile(mockFileId, 'test.jpg'))
        .rejects.toThrow('Network Error');
    });
  });

  describe('uploadFile', () => {
    it('uploads successfully', async () => {
      const mockResponse = { id: mockFileId };
      mockAxios.post.mockResolvedValue({ data: mockResponse });
      const result = await fileService.uploadFile(mockFile);
      expect(result).toEqual(mockResponse);
    });
  });
});
