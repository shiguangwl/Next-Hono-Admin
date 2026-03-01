import * as LucideIcons from "lucide-react";

interface DynamicIconProps {
  name?: string | null;
  size?: number;
}

export function DynamicIcon({ name, size = 20 }: DynamicIconProps) {
  if (!name) {
    return <LucideIcons.HelpCircle size={size} />;
  }

  const IconComponent = LucideIcons[
    name as keyof typeof LucideIcons
  ] as React.ComponentType<{ size?: number }>;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle size={size} />;
  }

  return <IconComponent size={size} />;
}
