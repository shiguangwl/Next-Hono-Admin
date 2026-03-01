'use client'

import {
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  useCreateRole,
  useMenuTree,
  useRole,
  useUpdateRole,
  useUpdateRoleMenus,
} from '@/hooks/queries'
import { MenuTreeItem, type MenuTreeNode } from './menu-tree-item'

type Role = {
  id: number
  roleName: string
  sort: number
  status: number
  remark: string | null
}

interface RoleFormDialogProps {
  open: boolean
  role: Role | null
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  roleName: string
  sort: number
  status: number
  remark: string
}

const initialFormData: FormData = {
  roleName: '',
  sort: 0,
  status: 1,
  remark: '',
}

// WHY: 递归收集所有节点 ID，用于全选和默认展开
function collectAllIds(nodes: MenuTreeNode[]): number[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? collectAllIds(n.children) : [])])
}

// WHY: 递归收集节点及其所有后代 ID，用于级联勾选
function getDescendantIds(node: MenuTreeNode): number[] {
  return [node.id, ...(node.children?.flatMap(getDescendantIds) ?? [])]
}

export function RoleFormDialog({ open, role, onClose, onSuccess }: RoleFormDialogProps) {
  const isEdit = !!role
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [checkedMenuIds, setCheckedMenuIds] = useState<number[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const expandedInitRef = useRef(false)

  const { data: menuTreeData, isLoading: menuLoading } = useMenuTree()
  const menuTree = (menuTreeData as MenuTreeNode[] | undefined) || []
  const { data: roleDetailData, isLoading: roleLoading } = useRole(role?.id || 0)
  const roleDetail = roleDetailData as { menuIds?: number[] } | undefined
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const updateRoleMenus = useUpdateRoleMenus()

  const allMenuIds = useMemo(() => collectAllIds(menuTree), [menuTree])

  useEffect(() => {
    if (!open) return
    if (role && roleDetail) {
      setFormData({
        roleName: role.roleName,
        sort: role.sort,
        status: role.status,
        remark: role.remark || '',
      })
      setCheckedMenuIds(roleDetail.menuIds || [])
    } else if (!role) {
      setFormData(initialFormData)
      setCheckedMenuIds([])
    }
    setErrors({})
  }, [open, role, roleDetail])

  useEffect(() => {
    if (!open) {
      expandedInitRef.current = false
      return
    }
    if (!expandedInitRef.current && allMenuIds.length > 0) {
      setExpandedIds(allMenuIds)
      expandedInitRef.current = true
    }
  }, [open, allMenuIds])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!formData.roleName.trim()) e.roleName = '请输入角色名称'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({
          id: role.id,
          input: { ...formData, remark: formData.remark || undefined },
        })
        await updateRoleMenus.mutateAsync({
          id: role.id,
          input: { menuIds: checkedMenuIds },
        })
      } else {
        await createRole.mutateAsync({
          ...formData,
          remark: formData.remark || undefined,
          menuIds: checkedMenuIds,
        })
      }
      onSuccess()
    } catch (err) {
      setErrors({ roleName: err instanceof Error ? err.message : '操作失败' })
    }
  }

  const toggleExpand = (id: number) =>
    setExpandedIds((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]))

  const toggleCheck = (node: MenuTreeNode) => {
    const ids = getDescendantIds(node)
    setCheckedMenuIds((p) =>
      p.includes(node.id) ? p.filter((id) => !ids.includes(id)) : [...new Set([...p, ...ids])]
    )
  }

  const handleSelectAll = () =>
    setCheckedMenuIds(checkedMenuIds.length === allMenuIds.length ? [] : allMenuIds)

  const isPending = createRole.isPending || updateRole.isPending || updateRoleMenus.isPending
  const isDataLoading = menuLoading || (isEdit && roleLoading)

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? '编辑角色' : '新增角色'}
      size="lg"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="角色名称"
          placeholder="请输入角色名称"
          required
          value={formData.roleName}
          onChange={(e) => setFormData({ ...formData, roleName: e.currentTarget.value })}
          error={errors.roleName}
        />

        <SimpleGrid cols={2}>
          <NumberInput
            label="排序"
            placeholder="排序值"
            value={formData.sort}
            onChange={(v) => setFormData({ ...formData, sort: Number(v) })}
          />
          <Select
            label="状态"
            value={String(formData.status)}
            onChange={(v) => setFormData({ ...formData, status: Number(v) })}
            data={[
              { value: '1', label: '正常' },
              { value: '0', label: '禁用' },
            ]}
          />
        </SimpleGrid>

        <Textarea
          label="备注"
          placeholder="请输入备注"
          rows={2}
          value={formData.remark}
          onChange={(e) => setFormData({ ...formData, remark: e.currentTarget.value })}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            权限分配
          </Text>
          {isDataLoading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : (
            <>
              <Paper withBorder p="xs" radius="md" mb="xs">
                <Group>
                  <Checkbox
                    label="全选/取消全选"
                    size="xs"
                    checked={checkedMenuIds.length === allMenuIds.length && allMenuIds.length > 0}
                    onChange={handleSelectAll}
                  />
                  <Text size="xs" c="dimmed">
                    (已选 {checkedMenuIds.length}/{allMenuIds.length})
                  </Text>
                </Group>
              </Paper>
              <Paper withBorder radius="md" p="xs">
                <ScrollArea.Autosize mah={256}>
                  {menuTree.map((node) => (
                    <MenuTreeItem
                      key={node.id}
                      node={node}
                      checkedIds={checkedMenuIds}
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
        </div>

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
