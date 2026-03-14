/** biome-ignore-all lint/suspicious/noExplicitAny: 图标库类型无法精确推断，需要动态索引 */
'use client'

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
} from '@mantine/core'
import * as Icons from '@tabler/icons-react'
import { IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

import { ICON_REGISTRY } from './icon-registry'

interface IconPickerProps {
  value?: string | null
  onChange: (icon: string) => void
  onClose: () => void
}

const ALL_ICON_NAMES = Object.keys(Icons).filter(
  (name) => name.startsWith('Icon') && (Icons as any)[name]?.render
)

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredIcons = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      // 默认显示注册表里的常用图标，避免由于图标过多导致首次渲染卡顿
      return Object.keys(ICON_REGISTRY)
    }
    return ALL_ICON_NAMES.filter(
      (name) =>
        name.toLowerCase().includes(term) || name.replace('Icon', '').toLowerCase().includes(term)
    ).slice(0, 100)
  }, [searchTerm])

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    onClose()
  }

  return (
    <Modal opened onClose={onClose} title="选择图标" size="lg" centered>
      <Stack gap="md">
        <TextInput
          placeholder="搜索图标 (例如: Home, Settings, User...)"
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          autoFocus
        />

        <ScrollArea h={400}>
          <Paper withBorder p="sm" radius="md">
            {filteredIcons.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  未找到匹配的图标
                </Text>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 4, sm: 6 }} spacing="xs">
                {filteredIcons.map((iconName) => {
                  const IconComponent = (Icons as any)[iconName]
                  if (!IconComponent) return null
                  const isSelected = value === iconName

                  return (
                    <UnstyledButton
                      key={iconName}
                      onClick={() => handleSelect(iconName)}
                      p="xs"
                      title={iconName}
                      style={(theme) => ({
                        borderRadius: theme.radius.md,
                        textAlign: 'center',
                        backgroundColor: isSelected ? theme.colors.blue[1] : undefined,
                        '&:hover': { backgroundColor: theme.colors.gray[0] },
                      })}
                    >
                      <Stack align="center" gap={4}>
                        <IconComponent size={24} stroke={1.5} />
                        <Text size="xs" truncate w="100%" ta="center">
                          {iconName.replace('Icon', '')}
                        </Text>
                      </Stack>
                    </UnstyledButton>
                  )
                })}
              </SimpleGrid>
            )}
          </Paper>
        </ScrollArea>
        <Text size="xs" c="dimmed" ta="center">
          {searchTerm ? `显示前 ${filteredIcons.length} 个匹配结果` : '显示常用图标'}
        </Text>
        <Button variant="default" onClick={onClose} fullWidth>
          取消
        </Button>
      </Stack>
    </Modal>
  )
}
