import { type SidebarData } from "@/components/layout/Types";

// Các bước quy trình "Công việc" chưa có trang riêng (backend mới có API
// đọc Workflow). Hiển thị dạng "Sắp có" thay vì link tới route không tồn tại.
const WORKFLOW_STAGES = [
  "1_Yêu cầu",
  "2_Thiết kế đồ hoạ",
  "3_Duyệt cấp 1",
  "4_Duyệt cấp 2",
  "5_Duyệt trung tâm",
];

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Công việc",
      items: WORKFLOW_STAGES.map((title) => ({
        title,
        url: "/assets",
        badge: "Sắp có",
        disabled: true,
      })),
    },
  ],
};
