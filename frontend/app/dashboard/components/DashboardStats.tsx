import React from 'react';
import { Presentation } from '../types';

interface DashboardStatsProps {
  presentations: Presentation[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ presentations }) => {
  const stats = React.useMemo(() => {
    const total = presentations.length;
    const uploadthingCount = presentations.filter(p => p.storage_type === 'uploadthing').length;
    const localCount = presentations.filter(p => p.storage_type === 'local').length;
    const totalSize = presentations.reduce((sum, p) => sum + (p.file_size || 0), 0);
    
    return {
      total,
      uploadthingCount,
      localCount,
      totalSize: formatFileSize(totalSize),
      uploadthingPercentage: total > 0 ? Math.round((uploadthingCount / total) * 100) : 0,
      localPercentage: total > 0 ? Math.round((localCount / total) * 100) : 0,
    };
  }, [presentations]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Presentations</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.uploadthingCount}</div>
          <div className="text-sm text-gray-500">☁️ Cloud Storage</div>
          <div className="text-xs text-green-600">{stats.uploadthingPercentage}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.localCount}</div>
          <div className="text-sm text-gray-500">📁 Local Storage</div>
          <div className="text-xs text-blue-600">{stats.localPercentage}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalSize}</div>
          <div className="text-sm text-gray-500">Total Size</div>
        </div>
      </div>
      
      {/* Storage type distribution bar */}
      <div className="mt-4">
        <div className="flex text-sm text-gray-600 mb-2">
          <span>Storage Distribution</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
          {stats.uploadthingPercentage > 0 && (
            <div 
              className="bg-green-500 h-2" 
              style={{ width: `${stats.uploadthingPercentage}%` }}
              title={`${stats.uploadthingPercentage}% Cloud Storage`}
            />
          )}
          {stats.localPercentage > 0 && (
            <div 
              className="bg-blue-500 h-2" 
              style={{ width: `${stats.localPercentage}%` }}
              title={`${stats.localPercentage}% Local Storage`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
