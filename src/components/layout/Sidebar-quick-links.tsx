import { Link } from "@tanstack/react-router";
import { ListVideo, Plus, Tags, Trash2 } from "lucide-react";
import { useMyAccess } from "@/features/admin/api/permissions";

const linkClass =
  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:font-medium";

// Lối tắt đầu sidebar theo menu: Đồ hoạ → chuyên mục, thùng rác (quản trị); CG → danh sách/tạo CG scene
export function SidebarQuickLinks({ menu }: { menu: string }) {
  const { data: access } = useMyAccess();

  if (menu === "CG") {
    return (
      <nav className="space-y-0.5 border-b px-2 pb-2" aria-label="CG scene">
        <Link to="/cg-scenes" className={linkClass} activeOptions={{ exact: true }}>
          <ListVideo className="h-4 w-4" /> Danh sách CG scene
        </Link>
        <Link to="/cg-scenes/create" className={linkClass}>
          <Plus className="h-4 w-4" /> Tạo CG scene
        </Link>
      </nav>
    );
  }

  return (
    <nav className="space-y-0.5 border-b px-2 pb-2" aria-label="Quản lý thiết kế">
      <Link to="/category" className={linkClass}>
        <Tags className="h-4 w-4" /> Chuyên mục
      </Link>
      {access?.isAdmin && (
        <Link to="/assets/trash" className={linkClass}>
          <Trash2 className="h-4 w-4" /> Thùng rác
        </Link>
      )}
    </nav>
  );
}
