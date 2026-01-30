"use client";

/**
 * 图标选择器组件
 * @description 支持搜索和选择 lucide-react 图标
 */

import { cn } from "@/lib/utils";
import { Magnifier } from "@gravity-ui/icons";
import { Button, Input, Modal, Surface, TextField } from "@heroui/react";
import * as LucideIcons from "lucide-react";
import { useMemo, useState } from "react";

// 常用图标列表（用于菜单系统）
const COMMON_ICONS = [
  "Settings",
  "Users",
  "Shield",
  "Menu",
  "FileText",
  "House",
  "LayoutDashboard",
  "UserCog",
  "Lock",
  "Key",
  "Database",
  "Server",
  "Folder",
  "File",
  "Search",
  "Plus",
  "Edit",
  "Trash2",
  "Check",
  "X",
  "ChevronRight",
  "ChevronDown",
  "AlertCircle",
  "Info",
  "Bell",
  "Mail",
  "Calendar",
  "Clock",
  "Download",
  "Upload",
  "RefreshCw",
  "LogOut",
  "Eye",
  "EyeOff",
  "Star",
  "Heart",
  "Bookmark",
  "Tag",
  "Filter",
  "ArrowUpDown",
  "Grid",
  "List",
  "Image",
  "Package",
  "Box",
  "Layers",
];

interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string) => void;
  onClose: () => void;
}

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 过滤图标
  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return COMMON_ICONS;

    return COMMON_ICONS.filter((name) => name.toLowerCase().includes(term));
  }, [searchTerm]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    onClose();
  };

  return (
    <Modal isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>选择图标</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
              {/* 搜索框 */}
              <TextField
                className="mb-4"
                value={searchTerm}
                onChange={setSearchTerm}
              >
                <div className="relative">
                  <Magnifier className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input className="pl-10" placeholder="搜索图标..." />
                </div>
              </TextField>

              {/* 图标网格 */}
              <Surface className="max-h-96 overflow-y-auto rounded-xl p-3">
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {filteredIcons.map((iconName) => {
                    const IconComponent =
                      LucideIcons[iconName as keyof typeof LucideIcons];
                    const isSelected = value === iconName;

                    // lucide-react 导出的图标是 object 类型，需要检查是否存在且有效
                    if (!IconComponent || typeof IconComponent !== "object") {
                      return null;
                    }

                    const Icon = IconComponent as unknown as React.ComponentType<{
                      className?: string;
                    }>;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelect(iconName)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl p-3 transition-colors",
                          "hover:bg-default",
                          isSelected &&
                            "bg-accent text-accent-foreground hover:bg-accent"
                        )}
                        title={iconName}
                      >
                        <Icon className="size-6" />
                        <span className="w-full truncate text-center text-xs">
                          {iconName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {filteredIcons.length === 0 && (
                  <div className="py-8 text-center text-muted">
                    未找到匹配的图标
                  </div>
                )}
              </Surface>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onClose}>
                取消
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
