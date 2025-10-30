// EmptyAreaContextMenu.tsx
import React from 'react';
import { FolderPlus } from 'lucide-react';

type EmptyAreaContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onAddParentFolder: () => void;
};

const EmptyAreaContextMenu: React.FC<EmptyAreaContextMenuProps> = ({
  x,
  y,
  onClose,
  onAddParentFolder,
}) => {
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
        onClick={onAddParentFolder}
      >
        <FolderPlus size={16} />
        <span>Thêm thư mục</span>
      </div>
    </div>
  );
};

export default EmptyAreaContextMenu;
