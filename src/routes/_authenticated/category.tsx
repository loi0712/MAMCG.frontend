import { createFileRoute } from '@tanstack/react-router';
import { CategoryPage } from '@/features/category';

export const Route = createFileRoute('/_authenticated/category')({
  component: CategoryPage,
});
