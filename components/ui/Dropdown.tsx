'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  group?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, placeholder, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Group options by group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, DropdownOption[]>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm bg-card border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <span className="truncate">{selectedOption?.label || placeholder || 'Select...'}</span>
        <ChevronDown className={cn('w-4 h-4 ml-2 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto scrollbar-thin">
          {Object.entries(groupedOptions).map(([group, groupOptions]) => (
            <div key={group}>
              {group !== 'default' && (
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                  {group}
                </div>
              )}
              {groupOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors',
                    option.value === value && 'bg-accent'
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
