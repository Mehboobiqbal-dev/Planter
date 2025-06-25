// components/navigation/DesktopDropdownContainer.tsx
import { IoCloseOutline } from "react-icons/io5";
import React from 'react';

interface DesktopDropdownContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const DesktopDropdownContainer: React.FC<DesktopDropdownContainerProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-20 max-h-96 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <IoCloseOutline className="h-5 w-5" />
        </button>
      </div>
      <div className="overflow-y-auto">
        {children}
      </div>
    </div>
  );
};