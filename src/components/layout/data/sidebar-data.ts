import {
  Construction,
  FileX,
  Lock,
  ServerOff,
  UserX,
} from "lucide-react";
import { type SidebarData } from "@/components/layout/Types";
import { TFoldersResponse } from "../types/folders";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      title: "Công việc",
      items: [
        {
          title: "1_Yêu cầu",
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Sign In (2 Col)",
              url: "/sign-in-2",
            },
            {
              title: "Sign Up",
              url: "/sign-up",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
        {
          title: "2_Thiết kế đồ hoạ",
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Sign In (2 Col)",
              url: "/sign-in-2",
            },
            {
              title: "Sign Up",
              url: "/sign-up",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
        {
          title: "3_Duyệt cấp 1",
          items: [
            {
              title: "Unauthorized",
              url: "/errors/unauthorized",
              icon: Lock,
            },
            {
              title: "Forbidden",
              url: "/errors/forbidden",
              icon: UserX,
            },
            {
              title: "Not Found",
              url: "/errors/not-found",
              icon: FileX,
            },
            {
              title: "Internal Server Error",
              url: "/errors/internal-server-error",
              icon: ServerOff,
            },
            {
              title: "Maintenance Error",
              url: "/errors/maintenance-error",
              icon: Construction,
            },
          ],
        },
        {
          title: "4_Duyệt cấp 2",
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Sign In (2 Col)",
              url: "/sign-in-2",
            },
            {
              title: "Sign Up",
              url: "/sign-up",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
        {
          title: "5_Duyệt trung tâm",
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Sign In (2 Col)",
              url: "/sign-in-2",
            },
            {
              title: "Sign Up",
              url: "/sign-up",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
      ],
    }
  ],
};
export const treeFolderData: TFoldersResponse = [
  {
    id: 1,
    name: "Khối tin tức",
    description: "Các bản tin của khối tin tức",
    index: 0,
    level: 1,
    pathCode: "1",
    parentId: 0,
    folderStyle: 1,
    projectCode: "",
    hasChilds: true,
    childs: [
      {
        id: 2,
        name: "BT Nhanh 2025",
        description: "Bản tin nhanh 2025",
        index: 0,
        level: 2,
        pathCode: "1/c1-1",
        parentId: 1,
        folderStyle: 1,
        projectCode: "",
        hasChilds: false,
        childs: []
      },
      // ... more complete objects
    ]
  },
  // ... more folders
];