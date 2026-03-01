'use client'

import {
  Alert,
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useMenuTree, useRole, useUpdateRoleMenus } from '@/hooks/queries'
import { MenuTreeItem, type MenuTreeNode } from './menu-tree-item'

type Role = { id: number; roleName: string }

interface RoleMenuDialogProps {
  open: boolean
  role: Role | null
  onClose: () => void
  onSuccess: () => void
}

function collectAllIds(nodes: MenuTreeNode[]): number[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? collectAllIds(n.children) : [])])
}

function getDescendantIds(node: MenuTreeNode): number[] {
  return [node.id, ...(node.children?.flatMap(getDescendantIds) ?? [])]
}

// WHY: 构建子→父映射，勾选时自动选中所有祖先节点
function buildParentMap(nodes: MenuTreeNode[]): Map<number, number> {
  const map = new Map<number, number>()
  const walk = (list: MenuTreeNode[]) => {
    for (const n of list) {
      if (n.children) {
        for (const c of n.children) map.set(c.id, n.id)
        walk(n.children)
      }
    }
  }
  walk(nodes)
  return map
}

function getAncestorIds(id: number, parentMap: Map<number, number>): number[] {
  const ids: number[] = []
  let cur: number | undefined = id
  while (cur !== undefined) {
    const pid = parentMap.get(cur)
    if (pid !== undefined) {
      ids.push(pid)
      cur = pid
    } else cur = undefined
  }
  return ids
}

export function RoleMenuDialog({ open, role, onClose, onSuccess }: RoleMenuDialogProps) {
  const [checkedIds, setCheckedIds] = useState<number[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const expandedInitRef = useRef(false)

  const { data: menuTree, isLoading: menuLoading } = useMenuTree()
  const { data: roleDetail, isLoading: roleLoading } = useRole(role?.id || 0)
  const updateRoleMenus = useUpdateRoleMenus()

  const allMenuIds = useMemo(() => (menuTree ? collectAllIds(menuTree) : []), [menuTree])
  const parentMap = useMemo(() => (menuTree ? buildParentMap(menuTree) : new Map()), [menuTree])

  useEffect(() => {
    if (open && roleDetail?.menuIds) setCheckedIds(roleDetail.menuIds)
    else if (open) setCheckedIds([])
    setError('')
  }, [open, roleDetail])

  useEffect(() => {
    if (!open) {
      expandedInitRef.current = false
      return
    }
    if (menuTree && !expandedInitRef.current) {
      setExpandedIds(allMenuIds)
      expandedInitRef.current = true
    }
  }, [open, menuTree, allMenuIds])

  const handleSubmit = async () => {
    if (!role) return
    setError('')
    try {
      await updateRoleMenus.mutateAsync({
        id: role.id,
        input: { menuIds: checkedIds },
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const toggleExpand = (id: number) =>
    setExpandedIds((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]))

  const toggleCheck = (node: MenuTreeNode) => {
    const descIds = getDescendantIds(node)
    const ancIds = getAncestorIds(node.id, parentMap)
    setCheckedIds((p) =>
      p.includes(node.id)
        ? p.filter((id) => !descIds.includes(id))
        : [...new Set([...p, ...descIds, ...ancIds])]
    )
  }

  const handleSelectAll = () =>
    setCheckedIds(checkedIds.length === allMenuIds.length ? [] : allMenuIds)

  const isLoading = menuLoading || roleLoading
  const isPending = updateRoleMenus.isPending

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={`分配权限 - ${role?.roleName}`}
      size="lg"
      centered
    >
      <Stack gap="md">
        {error && <Alert color="red">{error}</Alert>}

        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <>
            <Paper withBorder p="xs" radius="md">
              <Group>
                <Checkbox
                  label="全选/取消全选"
                  size="xs"
                  checked={checkedIds.length === allMenuIds.length && allMenuIds.length > 0}
                  onChange={handleSelectAll}
                />
                <Text size="xs" c="dimmed">
                  (已选 {checkedIds.length}/{allMenuIds.length})
                </Text>
              </Group>
            </Paper>
            <Paper withBorder radius="md" p="xs">
              <ScrollArea.Autosize mah={320}>
                {menuTree?.map((node: MenuTreeNode) => (
                  <MenuTreeItem
                    key={node.id}
                    node={node}
                    checkedIds={checkedIds}
                    expandedIds={expandedIds}
                    onToggleCheck={toggleCheck}
                    onToggleExpand={toggleExpand}
                    level={0}
                  />
                ))}
              </ScrollArea.Autosize>
            </Paper>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isPending}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
            确定
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
