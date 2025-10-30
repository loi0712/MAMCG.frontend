// ContextMenu.tsx
import React from 'react';
import { Plus, Edit, Shield, Trash2 } from 'lucide-react';

type ContextMenuProps = {
    x: number;
    y: number;
    onClose: () => void;
    onAddSubItem: () => void;
    onEdit: () => void;
    onPermissions: () => void;
    onDelete: () => void;
};

const ContextMenu: React.FC<ContextMenuProps & { nodeType?: 'folder' | 'file' }> = ({
    onClose,
    onAddSubItem,
    onEdit,
    onPermissions,
    onDelete,
}) => {
    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    return (
        <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1"
            style={{ top: 25, left: 100 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                onClick={onAddSubItem}
            >
                <Plus size={16} />
                <span>Thêm thư mục</span>
            </div>
            <div
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                onClick={onEdit}
            >
                <Edit size={16} />
                <span>Chỉnh sửa</span>
            </div>
            <div
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                onClick={onPermissions}
            >
                <Shield size={16} />
                <span>Phân quyền</span>
            </div>
            <hr className="my-1 border-gray-100" />
            <div
                className="px-4 py-2 hover:bg-red-50 cursor-pointer flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                onClick={onDelete}
            >
                <Trash2 size={16} />
                <span>Xóa</span>
            </div>
        </div>
    );
};

export default ContextMenu;
