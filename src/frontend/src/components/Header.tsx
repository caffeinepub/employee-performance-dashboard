import { Bell } from "lucide-react";
import { getAvatarColor, getInitials } from "../lib/dateUtils";
import type { Module } from "./Sidebar";

const MODULE_TITLES: Record<Module, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  sales: "Sales Trends",
  feedback: "Feedback",
  settings: "Settings",
  uploads: "Top Performers",
};

interface HeaderProps {
  active: Module;
}

const USER_NAME = "Alex Johnson";

export function Header({ active }: HeaderProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-xl font-bold text-foreground">
        {MODULE_TITLES[active]}
      </h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="header.notifications.button"
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{ backgroundColor: getAvatarColor(USER_NAME) }}
        >
          {getInitials(USER_NAME)}
        </div>
      </div>
    </header>
  );
}
