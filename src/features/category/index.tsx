import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CategoryCreateNewDialog } from './components/category-create-new';
import { Main } from '@/components/layout/Main';

export function CategoryPage() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <Main>
      <div className="p-4">
        <Button onClick={() => setCreateModalOpen(true)}>Tạo danh mục mới</Button>
        <CategoryCreateNewDialog
          open={isCreateModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    </Main>
  );
}
