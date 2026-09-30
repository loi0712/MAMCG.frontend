import { ClipboardList } from "lucide-react";
import { type SidebarData } from "@/components/layout/Types";

// Menu "Công việc": các trạng thái kèm số việc được vẽ động từ API
// (features/tasks/components/work-tasks-nav). Ở đây chỉ giữ lối tắt cho command menu.
export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Công việc",
      items: [
        {
          title: "Công việc của tôi",
          url: "/tasks",
          icon: ClipboardList,
        },
      ],
    },
  ],
};
