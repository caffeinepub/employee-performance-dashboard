import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { getAvatarColor, getInitials } from "../lib/dateUtils";

export type Module =
  | "dashboard"
  | "employees"
  | "sales"
  | "feedback"
  | "uploads"
  | "settings";

interface SidebarProps {
  active: Module;
  onNavigate: (module: Module) => void;
}

const navItems: { id: Module; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "sales", label: "Sales Trends", icon: TrendingUp },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "uploads", label: "Upload", icon: Upload },
  { id: "settings", label: "Settings", icon: Settings },
];

const USER_NAME = "Alex Johnson";
const USER_ROLE = "Admin";

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const avatarColor = getAvatarColor(USER_NAME);
  const initials = getInitials(USER_NAME);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`sidebar-gradient h-full flex-shrink-0 flex flex-col transition-all duration-200 ${
          collapsed ? "w-16" : "w-[240px]"
        }`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-2.5 px-3 py-5 border-b border-[#1a3560] ${
            collapsed ? "justify-center px-3" : "px-5"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight">
              ProPerform
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            const btn = (
              <button
                type="button"
                key={id}
                data-ocid={`nav.${id}.link`}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  collapsed ? "justify-center" : "text-left"
                } ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-sidebar-foreground hover:bg-[#1a3560] hover:text-white"
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && label}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 pb-2">
          <button
            type="button"
            data-ocid="nav.collapse.toggle"
            onClick={() => setCollapsed((c) => !c)}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg border border-[#2a4870] text-sidebar-foreground text-sm hover:bg-[#1a3560] hover:text-white transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>

        {/* User Section */}
        <div className="px-2 pb-4 border-t border-[#1a3560] pt-4">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto cursor-default"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {USER_NAME} · {USER_ROLE}
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex items-center gap-3 px-2 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {USER_NAME}
                  </p>
                  <p className="text-sidebar-foreground text-xs">{USER_ROLE}</p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="nav.logout.button"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#2a4870] text-sidebar-foreground text-sm hover:bg-[#1a3560] hover:text-white transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
