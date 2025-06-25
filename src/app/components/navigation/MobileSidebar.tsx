// components/navigation/MobileSidebar.tsx
import { IoCloseOutline } from "react-icons/io5";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="lg:hidden fixed inset-0 z-[55] bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" 
        onClick={onClose}
      ></div>
      <div
        className="lg:hidden fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-white shadow-xl z-[60] p-4 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};