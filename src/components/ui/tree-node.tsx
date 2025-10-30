import { memo, useCallback, useMemo, useState } from "react";
import { NodeRendererProps } from "react-arborist";
import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import ContextMenu from "@/components/ui/context-menu";
import { useFoldersAction } from "@/components/layout/Folder-provider";
import { TreeNodeData } from "@/components/layout/Types";

const MENU_DIMENSIONS = {
  width: 160,
  height: 60,
  nodeMenuHeight: 140,
  spacing: 5,
  bottomSpacing: 10,
} as const;

type ContextMenuType = "node" | "empty";

export type CMState = {
  show: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  menuType: ContextMenuType;
};

const calculateMenuPosition = (
  clientX: number,
  clientY: number,
  menuWidth: number,
  menuHeight: number,
  offset = MENU_DIMENSIONS.spacing
) => {
  let x = clientX;
  let y = clientY;

  if (x + menuWidth > window.innerWidth) {
    x = clientX - menuWidth - offset;
  }
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - MENU_DIMENSIONS.bottomSpacing;
  }

  return { x, y };
};

export const TreeNode = memo<
  NodeRendererProps<TreeNodeData> & {
    cmState: CMState;
    setCmState: React.Dispatch<React.SetStateAction<CMState>>;
    onClick: (nodeId: string, nodeName: string) => void;
  }
>(({ node, style, dragHandle, cmState, setCmState, onClick }) => {
  const { setOpen, fetchFolderById } = useFoldersAction();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  let currentFolderId = '0'

  const handleClick = useCallback(() => {
    if (node.isClosed || node.isLeaf) {
      // Handle folder clicks (toggle open/close)
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      onClick(node.id, node.data.name);
      currentFolderId = node.id;

    }
    node.toggle();
  }, [node, onClick]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (node.id == "0") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();
      const { x, y } = calculateMenuPosition(
        rect.right + MENU_DIMENSIONS.spacing,
        rect.top,
        MENU_DIMENSIONS.width,
        MENU_DIMENSIONS.nodeMenuHeight
      );

      setCmState({
        show: true,
        x,
        y,
        nodeId: node.id,
        menuType: "node",
      });
    },
    [node.id, setCmState]
  );

  const closeMenu = useCallback(() => {
    setCmState({
      show: false,
      x: 0,
      y: 0,
      nodeId: null,
      menuType: "node",
    });
  }, [setCmState]);

  const handleAddSub = useCallback(async () => {
    fetchFolderById(node.data.id);

    // Then open the dialog
    setOpen("addChildFolder");
    closeMenu();
  }, [node.data.id, fetchFolderById, setOpen, closeMenu]);

  const handleEdit = useCallback(async () => {
    try {
      // Call API to fetch full folder data by ID
      await fetchFolderById(node.data.id);
      // Open edit dialog after successful API call
      setOpen("edit");
    } catch (error) {
      console.error("Failed to fetch folder for editing:", error);
      // Optionally show error message to user
    }

    closeMenu();
  }, [node.data.id, fetchFolderById, setOpen, closeMenu]);

  const handlePermissions = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  const handleDelete = useCallback(async () => {
    try {
      // Call API to fetch full folder data by ID
      await fetchFolderById(node.data.id);
      // Open edit dialog after successful API call
      setOpen("delete");
    } catch (error) {
      console.error("Failed to fetch folder for editing:", error);
      // Optionally show error message to user
    }
    closeMenu();
  }, [node.data.id, fetchFolderById, setOpen, closeMenu]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const showMenu = useMemo(
    () =>
      cmState.show && cmState.nodeId === node.id && cmState.menuType === "node",
    [cmState.show, cmState.nodeId, cmState.menuType, node.id]
  );

  const nodeClasses = useMemo(
    () =>
      cn(
        "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
        "transition-all duration-200 ease-in-out",
        "select-none cursor-pointer outline-none",
        "ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
        isHovered && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "active:bg-sidebar-accent/80 active:scale-[0.98]",
        isPressed && "bg-sidebar-accent/80 scale-[0.98]",
        isFocused && "bg-sidebar-accent/50 text-sidebar-accent-foreground",
        node.isLeaf && "text-sidebar-foreground/60 hover:text-sidebar-foreground/80",
        !node.isLeaf && node.isOpen && "bg-sidebar-accent/30 text-sidebar-accent-foreground"
      ),
    [isHovered, isPressed, isFocused, node.isLeaf, node.isOpen]
  );

  const chevronClasses = useMemo(
    () =>
      cn(
        "transition-transform duration-200 ease-in-out",
        "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
        node.isOpen && "rotate-90"
      ),
    [node.isOpen]
  );

  return (
    <div className="flex items-center px-1" style={style} ref={dragHandle}>
      <div
        className={nodeClasses}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-expanded={node.isInternal ? node.isOpen : undefined}
      >
        {/* Chevron Icon */}
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          {node.isInternal && <ChevronRight className={chevronClasses} size={14} />}
        </div>

        {/* Folder Icon */}
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          {node.id == currentFolderId ? 
           (
            <Folder className="transition-colors duration-200 text-blue-500 group-hover:text-blue-600" size={16} />
          ) :
          (
            <Folder className="transition-colors duration-200 text-amber-500 group-hover:text-amber-600" size={16} />
          )
        }
          
        </div>

        {/* Node Name */}
        <span className="flex-1 truncate text-left font-normal transition-colors duration-200">
          {node.data.name}
        </span>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <ContextMenu
          x={cmState.x}
          y={cmState.y}
          onClose={closeMenu}
          onAddSubItem={handleAddSub}
          onEdit={handleEdit}
          onPermissions={handlePermissions}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
});

TreeNode.displayName = "TreeNode";
