import React from 'react';
import { PlatformFilterProps } from '@/types/dashboard';

const PlatformFilter: React.FC<PlatformFilterProps> = ({ platforms, onChange }) => {
  return (
    <div className="flex flex-wrap text-black justify-center gap-4 mb-8 mt-2">
      {Object.entries(platforms).map(([platform, isSelected]) => (
        <div className="form-control" key={platform}>
          <label className="label cursor-pointer gap-2">
            <input 
              type="checkbox" 
              className="checkbox checkbox-primary" 
              checked={isSelected}
              onChange={() => onChange(platform)}
            />
            <span className="label-text capitalize">
              {platform === 'mojo' ? 'Mojo-Liked' : platform}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default PlatformFilter;