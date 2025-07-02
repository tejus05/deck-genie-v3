import React, { useState } from 'react';
import { MagnifyingGlassIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Presentation, PresentationFilter } from '../types';

interface PresentationFiltersProps {
  presentations: Presentation[];
  onFilteredPresentations: (filtered: Presentation[]) => void;
}

export const PresentationFilters: React.FC<PresentationFiltersProps> = ({
  presentations,
  onFilteredPresentations,
}) => {
  const [search, setSearch] = useState('');
  const [storageFilter, setStorageFilter] = useState<'all' | 'uploadthing' | 'local'>('all');
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    let filtered = presentations;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply storage type filter
    if (storageFilter !== 'all') {
      filtered = filtered.filter(p => p.storage_type === storageFilter);
    }

    onFilteredPresentations(filtered);
  }, [search, storageFilter, presentations, onFilteredPresentations]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search presentations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <MixerHorizontalIcon className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Type
              </label>
              <select
                value={storageFilter}
                onChange={(e) => setStorageFilter(e.target.value as 'all' | 'uploadthing' | 'local')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Storage Types</option>
                <option value="uploadthing">☁️ Cloud Storage</option>
                <option value="local">📁 Local Storage</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
