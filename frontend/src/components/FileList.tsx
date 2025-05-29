import { ArrowDownTrayIcon, DocumentIcon, TrashIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileFilter } from './FileFilter';
import { fileService } from '../services/fileService';
import { File as FileType, PaginatedResponse } from '../types/file';


type FilesData = FileType[] | PaginatedResponse<FileType> | undefined;

export const FileList: React.FC = () => {
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // For fetching files using filters
  const { data: files, isLoading, error } = useQuery<FilesData>({
    queryKey: ['files', filters],
    queryFn: () => fileService.getFiles(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete file');
    }
  });

  const downloadMutation = useMutation({
    mutationFn: ({ fileUrl, filename }: { fileUrl: string; filename: string }) => 
      fileService.downloadFile(fileUrl, filename),
    onError: () => {
      toast.error('Failed to download file');
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      await downloadMutation.mutateAsync({ fileUrl, filename });
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  let fileArray: FileType[] = [];
  if (Array.isArray(files)) {
    fileArray = files;
  } else if (files && Array.isArray((files as PaginatedResponse<FileType>).results)) {
    fileArray = (files as PaginatedResponse<FileType>).results;
  }

  if (isLoading) {
    return <div className="p-6">Loading files...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading files: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg border hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <FileFilter 
            onChange={(newFilters) => {
              setFilters(prev => ({
                ...prev,
                ...newFilters,
                search: searchQuery
              }));
            }} 
          />
        </div>
      )}

      {fileArray.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || Object.values(filters).some(Boolean) 
              ? 'Try adjusting your search/filters' 
              : 'Get started by uploading a file'
            }
          </p>
        </div>
      ) : (
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {fileArray.map((file: FileType) => (
              <li key={file.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <DocumentIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.original_filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.file_type} • {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(file.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(file.file, file.original_filename)}
                      disabled={downloadMutation.isPending}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
