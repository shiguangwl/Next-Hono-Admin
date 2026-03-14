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
import { useForm } from '@mantine/form'
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
  const [checkedMenuIds, setCheckedMenuIds] = useState<number[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const expandedInitRef = useRef(false)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      roleName: '',
      sort: 0,
      status: '1',
      remark: '',
    },
    validate: {
      roleName: (v) => (!v.trim() ? '请输入角色名称' : null),
    },
  })

  const { data: menuTreeData, isLoading: menuLoading } = useMenuTree()
  const menuTree = (menuTreeData as MenuTreeNode[] | undefined) || []
  const { data: roleDetailData, isLoading: roleLoading } = useRole(role?.id || 0)
  const roleDetail = roleDetailData as { menuIds?: number[] } | undefined
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const updateRoleMenus = useUpdateRoleMenus()

  const allMenuIds = useMemo(() => collectAllIds(menuTree), [menuTree])

  // biome-ignore lint: form methods are stable refs
  useEffect(() => {
    if (!open) return
    if (role && roleDetail) {
      form.setValues({
        roleName: role.roleName,
        sort: role.sort,
        status: String(role.status),
        remark: role.remark || '',
      })
      setCheckedMenuIds(roleDetail.menuIds || [])
    } else if (!role) {
      form.reset()
      setCheckedMenuIds([])
    }
    form.clearErrors()
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

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const payload = {
        roleName: values.roleName,
        sort: values.sort,
        status: Number(values.status),
        remark: values.remark || undefined,
      }
      if (isEdit && role) {
        await updateRole.mutateAsync({ id: role.id, input: payload })
        await updateRoleMenus.mutateAsync({
          id: role.id,
          input: { menuIds: checkedMenuIds },
        })
      } else {
        await createRole.mutateAsync({ ...payload, menuIds: checkedMenuIds })
      }
      onSuccess()
    } catch (err) {
      form.setFieldError('roleName', err instanceof Error ? err.message : '操作失败')
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="角色名称"
            placeholder="请输入角色名称"
            required
            key={form.key('roleName')}
            {...form.getInputProps('roleName')}
          />

          <SimpleGrid cols={2}>
            <NumberInput
              label="排序"
              placeholder="排序值"
              key={form.key('sort')}
              {...form.getInputProps('sort')}
            />
            <Select
              label="状态"
              key={form.key('status')}
              {...form.getInputProps('status')}
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
            key={form.key('remark')}
            {...form.getInputProps('remark')}
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
                <Paper p="xs" radius="md" mb="xs" bg="var(--mantine-color-gray-0)">
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
                <Paper radius="md" p="xs" bg="var(--mantine-color-gray-0)">
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
            <Button type="submit" loading={isPending}>
              确定
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
