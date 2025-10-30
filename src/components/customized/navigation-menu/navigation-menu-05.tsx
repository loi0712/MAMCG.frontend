import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { FolderOpen, PencilRuler, TvMinimalPlay} from "lucide-react";
import {useMenu} from "@/components/layout/Authenticated-layout"

const navigationMenuItems = [
  { title: "Đồ hoạ", icon: FolderOpen },
  { title: "CG", icon: TvMinimalPlay },
  { title: "Công việc", icon: PencilRuler},
];

export default function NavigationMenuWithActiveItem() {
  const {menu, changeMenu} = useMenu();

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-4">
        {navigationMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink
              className={cn(
                "relative group inline-flex h-9 w-max items-center justify-center px-0.5 py-2 text-sm font-medium",
                
                // For interactive elements
                "cursor-pointer hover:cursor-pointer active:cursor-grabbing",

                // For disabled state
                "disabled:cursor-not-allowed disabled:opacity-50",

                // For loading state
                "data-loading:cursor-wait",

                // Enhanced hover effects
                "hover:scale-105 hover:-translate-y-0.5",
                "hover:text-accent-foreground hover:drop-shadow-sm",
                
                // Existing underline effect with smoother transition
                "before:absolute before:bottom-0 before:inset-x-0 before:h-[2px] before:bg-primary", 
                "before:scale-x-0 before:transition-all before:duration-300 before:ease-out",
                "hover:before:scale-x-100",
                
                // Focus and active states
                "focus:before:scale-x-100 focus:text-accent-foreground focus:outline-hidden",
                "disabled:pointer-events-none disabled:opacity-50",
                
                // Active state
                item.title === menu && "before:scale-x-100 text-accent-foreground",
                
                // Keep backgrounds transparent
                "hover:bg-transparent active:bg-transparent focus:bg-transparent"
              )}
              asChild
              active={item.title == menu}
              onClick={() => {changeMenu(item.title)}}
            >
              <div className="flex-row items-center gap-2.5">
                <item.icon className="h-5 w-5 shrink-0" />
                {item.title}
              </div>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
