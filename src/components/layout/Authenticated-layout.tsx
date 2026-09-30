import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { getCookie } from "@/shared/lib/cookies";
import { cn } from "@/shared/lib/utils";
import { LayoutProvider } from "@/context/Layout-provider";
import { SearchProvider } from "@/context/Search-provider";
import {
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/App-sidebar";
import { SkipToMain } from "@/components/skip-to-main";
import {
  sidebarData,
} from "@/components/layout/data/sidebar-data";
import { NavGroup } from "@/components/layout/Nav-group";
import MamcgLogo from "@/assets/images/mamcg.png";
import NavigationMenuWithActiveItem from "@/components/customized/navigation-menu/navigation-menu-05";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import { type TreeNodeData } from "@/components/layout/Types";
import { Header } from "@/components/layout/Header";
import { useFolders } from "@/components/layout/api/get-folders";
import {
  type TFolder,
  type TFoldersResponse,
  type TQueryKeys,
} from "@/components/layout/types/folders";
import EmptyAreaContextMenu from "../ui/emptyAreaContextMenu";
import { FoldersDialogs } from "./Folder-dialogs";
import {
  useFoldersAction,
  FoldersProvider,
} from "@/components/layout/Folder-provider";
import { useMenuStore } from "@/stores/menu-store";
import { TreeNode } from "../ui/tree-node";

const DEFAULT_MENU = "Đồ hoạ";
const CG_MENU = "CG";
const WORK_MENU = "Công việc";
const CG_SEARCH_TERM = JSON.stringify([
  { FieldId: 4, Operator: "EQUALS", Value: "6", LogicalGroup: "AND" },
]);

type ContextMenuType = "node" | "empty";

type CMState = {
  show: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  menuType: ContextMenuType;
};

const FOLDERS_QUERY_PARAMS: TQueryKeys = {
  parentId: "",
  isGetAll: true,
};

const MENU_DIMENSIONS = {
  width: 160,
  height: 60,
  nodeMenuHeight: 140,
  spacing: 5,
  bottomSpacing: 10,
} as const;

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

interface MenuContextType {
  menu: string;

  changeMenu: (newMenu: string) => void;
}

type AuthenticatedLayoutProps = {
  children?: React.ReactNode;
};

const MenuContext = createContext<MenuContextType>({
  menu: DEFAULT_MENU,

  changeMenu: () => {},
});

const mapFoldersToTreeData = (folders: TFoldersResponse): TreeNodeData[] => {
  return folders.map((folder: TFolder) => ({
    id: folder.id.toString(),

    name: folder.name,

    isOpen: false,

    level: folder.level,

    children: folder.hasChilds
      ? mapFoldersToTreeData(folder.childs)
      : undefined,
  }));
};

const useWindowHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return height;
};

const SidebarContentWrapper = memo<{
  menu: string;

  treeFolder: TreeNodeData[];

  cmState: CMState;

  setCmState: React.Dispatch<React.SetStateAction<CMState>>;

  onEmptyAreaContextMenu: (e: React.MouseEvent) => void;

  onAddParentFolder: () => void;

  onCloseMenu: () => void;

  onClick: (nodeId: string, nodeName: string) => void;
}>(
  ({
    menu,

    treeFolder,

    cmState,

    setCmState,

    onEmptyAreaContextMenu,

    onAddParentFolder,

    onCloseMenu,

    onClick,
  }) => {
    
    const treeRenderer = useCallback(
      (props: NodeRendererProps<TreeNodeData>) => (
        <TreeNode
          {...props}
          cmState={cmState}
          setCmState={setCmState}
          onClick={onClick}
        />
      ),
      [cmState, setCmState, onClick]
    );

    const windowHeight = useWindowHeight();

    if (menu === WORK_MENU) {
      return (
        <>
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </>
      );
    }

    return (
      <div className="w-full h-full" onContextMenu={onEmptyAreaContextMenu}>
        <Tree
          data={treeFolder}
          openByDefault={false}
          indent={24}
          rowHeight={32}
          height={windowHeight}
        >
          {treeRenderer}
        </Tree>

        {cmState.show && cmState.menuType === "empty" && (
          <EmptyAreaContextMenu
            x={cmState.x}
            y={cmState.y}
            onClose={onCloseMenu}
            onAddParentFolder={onAddParentFolder}
          />
        )}
      </div>
    );
  }
);

SidebarContentWrapper.displayName = "SidebarContentWrapper";

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = useMemo(() => getCookie("sidebar_state") !== "false", []);

  return (
    <div className="">
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <LayoutProvider>
            <FoldersProvider>
              <AuthenticatedLayoutContent>
                {children}
              </AuthenticatedLayoutContent>
            </FoldersProvider>
          </LayoutProvider>
        </SidebarProvider>
      </SearchProvider>
    </div>
  );
}

function AuthenticatedLayoutContent({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { setOpen } = useFoldersAction();
  const { data } = useFolders(FOLDERS_QUERY_PARAMS);

  // Add navigation hook for routing to assets page
  const navigate = useNavigate();

  const { menu, setMenu } = useMenuStore();
  const [treeFolder, setTreeFolder] = useState<TreeNodeData[]>([]);
  const [cmState, setCmState] = useState<CMState>({
    show: false,
    x: 0,
    y: 0,
    nodeId: null,
    menuType: "node",
  });

  useEffect(() => {
    setTreeFolder(data ? mapFoldersToTreeData(data) : []);
  }, [data]);

  // Đồng bộ menu theo URL (mở link trực tiếp/F5) — không tự điều hướng khi mount
  const location = useRouterState({ select: (st) => st.location });
  useEffect(() => {
    if (location.pathname !== "/assets") return;
    const term = String((location.search as { searchTerm?: unknown }).searchTerm ?? "");
    const isCg = term === CG_SEARCH_TERM;
    const current = useMenuStore.getState().menu;
    if (isCg && current !== CG_MENU) setMenu(CG_MENU);
    else if (!isCg && current === CG_MENU) setMenu(DEFAULT_MENU);
  }, [location, setMenu]);

  const handleEmptyAreaContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { x, y } = calculateMenuPosition(
      e.clientX,
      e.clientY,
      MENU_DIMENSIONS.width,
      MENU_DIMENSIONS.height
    );

    setCmState({
      show: true,
      x,
      y,
      nodeId: null,
      menuType: "empty",
    });
  }, []);

  const closeMenu = useCallback(() => {
    setCmState({
      show: false,
      x: 0,
      y: 0,
      nodeId: null,
      menuType: "node",
    });
  }, []);

  const handleAddParentFolder = useCallback(() => {
    setOpen("addParent");
    closeMenu();
  }, [setOpen, closeMenu]);

  // Handle leaf node clicks - navigate to assets page with folderId
  const handleClick = useCallback(
    (nodeId: string) => {
      const search: {
        folderId: string;
        page: number;
        pageSize: number;
        searchTerm?: string;
      } = {
        folderId: nodeId,
        page: 1,
        pageSize: 10,
      };

      if (menu === CG_MENU) {
        search.searchTerm = CG_SEARCH_TERM;
      }

      navigate({
        to: "/assets",
        search: search,
      });
    },
    [navigate, menu]
  );

  // Chỉ điều hướng khi người dùng đổi menu
  const changeMenu = useCallback(
    (newMenu: string) => {
      setMenu(newMenu);
      if (newMenu === CG_MENU || newMenu === DEFAULT_MENU) {
        navigate({
          to: "/assets",
          search: {
            folderId: "0",
            page: 1,
            pageSize: 10,
            ...(newMenu === CG_MENU ? { searchTerm: CG_SEARCH_TERM } : {}),
          },
        });
      }
    },
    [setMenu, navigate]
  );

  const menuContextValue = useMemo(
    () => ({
      menu,
      changeMenu,
    }),
    [menu, changeMenu]
  );

  const sidebarInsetClasses = useMemo(
    () =>
      cn(
        "has-[[data-layout=fixed]]:h-svh",
        "peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]",
        "@container/content"
      ),
    []
  );

  return (
    <>
      <SkipToMain />
      <AppSidebar>
        <SidebarHeader>
          <div>
            <img src={MamcgLogo} alt="MAM CG Logo" />
          </div>
        </SidebarHeader>

        <MenuContext.Provider value={menuContextValue}>
          <div className="border-b-2 m-2">
            <NavigationMenuWithActiveItem />
          </div>

          <SidebarContent>
            <SidebarContentWrapper
              menu={menu}
              treeFolder={treeFolder}
              cmState={cmState}
              setCmState={setCmState}
              onEmptyAreaContextMenu={handleEmptyAreaContextMenu}
              onAddParentFolder={handleAddParentFolder}
              onCloseMenu={closeMenu}
              onClick={handleClick}
            />
          </SidebarContent>
        </MenuContext.Provider>
        <SidebarRail />
      </AppSidebar>

      <div className="w-full h-screen flex flex-col">
        <Header className="basis-[10%] shrink-0 max-h-14"></Header>
        <SidebarInset
          className={cn(sidebarInsetClasses, "basis-[90%] shrink-0")}
        >
          {children ?? <Outlet />}
        </SidebarInset>
        <FoldersDialogs />
      </div>
    </>
  );
}

export const useMenu = () => useContext(MenuContext);
