import { useCallback, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AssetsCreateNewDialog } from '@/features/asset/components/asset-create-new';
import { CategoryCreateNewDialog } from '@/features/category/components/category-create-new';

export function CreateNewDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateAssetDialogOpen, setCreateAssetDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCreateAsset = useCallback(() => {
    setCreateAssetDialogOpen(true);
    closeMenu();
  }, [closeMenu]);

  const handleCreateCategory = useCallback(() => {
    setCreateCategoryDialogOpen(true);
    closeMenu();
  }, [closeMenu]);

  return (
    <>
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            Tạo mới
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleCreateCategory}>
              Tạo chuyên mục
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCreateAsset}>
              Tạo thiết kế
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">
                Tạo CG
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AssetsCreateNewDialog
        open={isCreateAssetDialogOpen}
        onOpenChange={setCreateAssetDialogOpen}
      />
      <CategoryCreateNewDialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={setCreateCategoryDialogOpen}
      />
    </>
  );
}
