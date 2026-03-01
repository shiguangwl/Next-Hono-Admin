"use client";

import {
  Button,
  Center,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

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
    <Modal opened onClose={onClose} title="选择图标" size="lg" centered>
      <Stack gap="md">
        <TextInput
          placeholder="搜索图标..."
          leftSection={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />

        <ScrollArea h={320}>
          <Paper withBorder p="sm" radius="md">
            {filteredIcons.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  未找到匹配的图标
                </Text>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 6, sm: 8 }} spacing="xs">
                {filteredIcons.map((iconName) => {
                  const IconComponent =
                    LucideIcons[iconName as keyof typeof LucideIcons];
                  if (!IconComponent || typeof IconComponent !== "object")
                    return null;
                  const Icon = IconComponent as unknown as React.ComponentType<{
                    size?: number;
                  }>;
                  const isSelected = value === iconName;

                  return (
                    <UnstyledButton
                      key={iconName}
                      onClick={() => handleSelect(iconName)}
                      p="xs"
                      style={(theme) => ({
                        borderRadius: theme.radius.md,
                        textAlign: "center",
                        backgroundColor: isSelected
                          ? theme.colors.blue[1]
                          : undefined,
                        "&:hover": { backgroundColor: theme.colors.gray[1] },
                      })}
                      title={iconName}
                    >
                      <Stack align="center" gap={2}>
                        <Icon size={20} />
                        <Text size="xs" truncate w="100%">
                          {iconName}
                        </Text>
                      </Stack>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            )}
          </Paper>
        </ScrollArea>

        <Button variant="default" onClick={onClose} fullWidth>
          取消
        </Button>
      </Stack>
    </Modal>
  );
}
