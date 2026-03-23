import { getAvatarColor, getInitials } from "../lib/dateUtils";

interface EmployeeAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function EmployeeAvatar({ name, size = "md" }: EmployeeAvatarProps) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const sizeClass =
    size === "sm"
      ? "w-7 h-7 text-xs"
      : size === "lg"
        ? "w-10 h-10 text-sm"
        : "w-8 h-8 text-xs";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
