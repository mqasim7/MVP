import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { PersonaSelectorProps, Persona } from '@/types/dashboard';
import { personaApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
 
const PersonaSelector: React.FC<PersonaSelectorProps> = ({ value, onChange, className = '', personas, personaLoading }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = personas.find(p => p.id === value) || personas[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };
  
  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <div className="text-sm uppercase font-medium mb-2">
        Select Persona
      </div>
      {personaLoading ? "Loading..." : (
        <div ref={dropdownRef} className="relative w-full">
        {/* Dropdown trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center px-4 py-3 bg-black text-white border border-white/20 rounded focus:outline-none"
        >
         <span>{selected?.name || 'Select...'}</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
            <div className="absolute top-1 left-0 z-40 w-full mt-1 bg-black text-white border border-white/20 rounded shadow-lg max-h-[300px] overflow-y-auto">
            <ul className="py-1">
              {personas.map((persona) => (
                <li key={persona.id}>
                  <button
                    onClick={() => handleSelect(persona.id)}
                    className={`w-full text-left px-4 py-2 hover:bg-white/10 ${value === persona.id ? 'bg-white/20' : ''}`}
                  >
                    <div className="font-medium">{persona.name}</div>
                    <div className="text-xs text-white/70">{persona.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default PersonaSelector;