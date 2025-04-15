// src/components/ui/popover.js
import React, { useState, useRef } from 'react';

export const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  const togglePopover = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          ref={buttonRef}
          onClick={togglePopover}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {children[0]}
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex="-1"
        >
          <div className="py-1" role="none">
            {children.slice(1)} {/* This expects the rest of the children to be the popover content. */}
          </div>
        </div>
      )}
    </div>
  );
};

export const PopoverTrigger = ({ children }) => {
  return <>{children}</>;
};

export const PopoverContent = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};