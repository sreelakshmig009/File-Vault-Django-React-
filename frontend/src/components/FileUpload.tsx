import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { fileService } from '../services/fileService';
import { FileUploadResponse } from '../types/file';

export const FileUpload = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<FileUploadResponse> => {
      try {
        const response = await fileService.uploadFile(file);
        return response;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Upload failed'
        );
      }
    },
    onSuccess: (response: FileUploadResponse) => {
      // console.log('Upload response:', response);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setSelectedFile(null);

      if (response.status === 'duplicate') {
        toast.error(
          `File(${response?.file?.original_filename}) already exists. Saved ${(
            response.saved_bytes! / 1024 / 1024
          ).toFixed(2)} MB of storage.`,
          {
            duration: 5000,
            icon: '⚠️',
            style: {
              background: '#FFF3E0',
              color: '#E65100',
              borderLeft: '4px solid #FB8C00',
            },
          }
        );
      } else {
        toast.success(response.message, {
          duration: 4000,
          icon: '✅'
        });
        onUploadSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        duration: 6000,
        style: {
          background: '#FFEBEE',
          color: '#C62828',
          borderLeft: '4px solid #EF5350'
        }
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit', { id: 'file-too-large' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file first', { id: 'no-file' });
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <CloudArrowUpIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Any file up to 10MB</p>
          </div>
        </div>
        {selectedFile && (
          <div className="text-sm text-gray-600" data-testid="selected-file">
            Selected: {selectedFile.name}
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !selectedFile || uploadMutation.isPending
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }`}
        >
          {uploadMutation.isPending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </button>
      </div>
    </div>
  );
}; 