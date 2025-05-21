import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TimeframeSelectorProps } from '@/types/dashboard';

const timeframeOptions = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last quarter' },
  { value: 'year', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ value, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const selectedOption = timeframeOptions.find(option => option.value === value) || timeframeOptions[1];
  
  const handleChange = (newValue: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    onChange(newValue);
    setDropdownOpen(false);
  };
  
  return (
    <div className="dropdown dropdown-end">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn m-1"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedOption.label}
        <ChevronDown className="ml-2 h-4 w-4" />
      </div>
      {dropdownOpen && (
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          {timeframeOptions.map((option) => (
            <li key={option.value}>
              <a 
                onClick={() => handleChange(option.value as any)}
                className={value === option.value ? 'active' : ''}
              >
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimeframeSelector;