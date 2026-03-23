import {
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAvatarColor, getInitials } from "../lib/dateUtils";

export type Module =
  | "dashboard"
  | "employees"
  | "sales"
  | "feedback"
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
  { id: "settings", label: "Settings", icon: Settings },
];

const USER_NAME = "Alex Johnson";
const USER_ROLE = "Admin";

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const avatarColor = getAvatarColor(USER_NAME);
  const initials = getInitials(USER_NAME);

  return (
    <aside
      className="sidebar-gradient h-full w-[240px] flex-shrink-0 flex flex-col"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1a3560]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          ProPerform
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-sidebar-foreground hover:bg-[#1a3560] hover:text-white"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-[#1a3560] pt-4">
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
      </div>
    </aside>
  );
}
