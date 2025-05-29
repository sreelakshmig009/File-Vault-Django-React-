import React from 'react';

interface FileFilterProps {
  onChange: (filters: Record<string, any>) => void;
}

export const FileFilter: React.FC<FileFilterProps> = ({ onChange }) => {
  const [localFilters, setLocalFilters] = React.useState<Record<string, any>>({
    file_type: '',
    size_min: '',
    size_max: '',
    uploaded_after: '',
    uploaded_before: ''
  });

  React.useEffect(() => {
    onChange(localFilters);
  }, [localFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value ? `${value}T00:00:00Z` : ''
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
        <select
          id="file_type"
          name="file_type"
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="application/pdf">PDF</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="text/plain">Text</option>
        </select>
      </div>

      <div>
        <label htmlFor="size_min" className="block text-sm font-medium text-gray-700 mb-1">Min Size (KB)</label>
        <input
          id="size_min"
          type="number"
          name="size_min"
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Min size"
        />
      </div>

      <div>
        <label htmlFor="size_max" className="block text-sm font-medium text-gray-700 mb-1">Max Size (KB)</label>
        <input
          id="size_max"
          type="number"
          name="size_max"
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Max size"
        />
      </div>

      <div>
        <label htmlFor="uploaded_after" className="block text-sm font-medium text-gray-700 mb-1">Uploaded After</label>
        <input
          id="uploaded_after"
          type="date"
          name="uploaded_after"
          onChange={handleDateChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="uploaded_before" className="block text-sm font-medium text-gray-700 mb-1">Uploaded Before</label>
        <input
          id="uploaded_before"
          type="date"
          name="uploaded_before"
          onChange={handleDateChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
};
