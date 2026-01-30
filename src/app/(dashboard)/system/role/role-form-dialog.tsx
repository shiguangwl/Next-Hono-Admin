'use client'

/**
 * 角色表单对话框
 * @description 创建和编辑角色的表单对话框，集成权限分配功能
 */

import {
  Button,
  Checkbox,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  Surface,
  TextArea,
  TextField,
} from '@heroui/react'
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

export function RoleFormDialog({ open, role, onClose, onSuccess }: RoleFormDialogProps) {
  const isEdit = !!role
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [checkedMenuIds, setCheckedMenuIds] = useState<number[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const expandedInitializedRef = useRef(false)

  const { data: menuTreeData, isLoading: menuLoading } = useMenuTree()
  const menuTree = (menuTreeData as MenuTreeNode[] | undefined) || []
  const { data: roleDetailData, isLoading: roleLoading } = useRole(role?.id || 0)
  const roleDetail = (roleDetailData as { menuIds?: number[] } | undefined) || null
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const updateRoleMenus = useUpdateRoleMenus()

  const allMenuIds = useMemo(() => {
    const ids: number[] = []
    const collect = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        ids.push(node.id)
        if (node.children) collect(node.children)
      }
    }
    collect(menuTree)
    return ids
  }, [menuTree])

  useEffect(() => {
    if (open) {
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
    }
  }, [open, role, roleDetail])

  useEffect(() => {
    if (!open) {
      expandedInitializedRef.current = false
      return
    }
    if (!expandedInitializedRef.current && allMenuIds.length > 0) {
      setExpandedIds(allMenuIds)
      expandedInitializedRef.current = true
    }
  }, [open, allMenuIds])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!formData.roleName.trim()) {
      newErrors.roleName = '请输入角色名称'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({
          id: role.id,
          input: {
            roleName: formData.roleName,
            sort: formData.sort,
            status: formData.status,
            remark: formData.remark || undefined,
          },
        })
        await updateRoleMenus.mutateAsync({
          id: role.id,
          input: { menuIds: checkedMenuIds },
        })
      } else {
        await createRole.mutateAsync({
          roleName: formData.roleName,
          sort: formData.sort,
          status: formData.status,
          remark: formData.remark || undefined,
          menuIds: checkedMenuIds,
        })
      }
      onSuccess()
    } catch (err) {
      setErrors({ roleName: err instanceof Error ? err.message : '操作失败' })
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleCheck = (node: MenuTreeNode) => {
    const getDescendantIds = (n: MenuTreeNode): number[] => {
      const ids = [n.id]
      if (n.children) {
        for (const child of n.children) {
          ids.push(...getDescendantIds(child))
        }
      }
      return ids
    }

    const descendantIds = getDescendantIds(node)
    const isChecked = checkedMenuIds.includes(node.id)

    if (isChecked) {
      setCheckedMenuIds((prev) => prev.filter((id) => !descendantIds.includes(id)))
    } else {
      setCheckedMenuIds((prev) => [...new Set([...prev, ...descendantIds])])
    }
  }

  const handleSelectAll = () => {
    if (checkedMenuIds.length === allMenuIds.length) {
      setCheckedMenuIds([])
    } else {
      setCheckedMenuIds(allMenuIds)
    }
  }

  const isPending = createRole.isPending || updateRole.isPending || updateRoleMenus.isPending
  const isLoading = menuLoading || (isEdit && roleLoading)

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{isEdit ? '编辑角色' : '新增角色'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="max-h-[60vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h4 className="mb-4 font-medium text-foreground">基本信息</h4>
                  <div className="space-y-4">
                    {/* 角色名称 */}
                    <TextField
                      isRequired
                      isInvalid={!!errors.roleName}
                      value={formData.roleName}
                      onChange={(v) => setFormData({ ...formData, roleName: v })}
                    >
                      <Label>角色名称</Label>
                      <Input placeholder="请输入角色名称" />
                      {errors.roleName && <FieldError>{errors.roleName}</FieldError>}
                    </TextField>

                    {/* 排序和状态 */}
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        type="number"
                        value={String(formData.sort)}
                        onChange={(v) => setFormData({ ...formData, sort: Number(v) })}
                      >
                        <Label>排序</Label>
                        <Input placeholder="请输入排序值" />
                      </TextField>

                      <Select
                        selectedKey={String(formData.status)}
                        onSelectionChange={(key) =>
                          setFormData({ ...formData, status: Number(key) })
                        }
                      >
                        <Label>状态</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="1" textValue="正常">
                              正常
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item id="0" textValue="禁用">
                              禁用
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>

                    {/* 备注 */}
                    <TextField
                      value={formData.remark}
                      onChange={(v) => setFormData({ ...formData, remark: v })}
                    >
                      <Label>备注</Label>
                      <TextArea placeholder="请输入备注" rows={3} />
                    </TextField>
                  </div>
                </div>

                {/* 权限分配 */}
                <div>
                  <h4 className="font-medium text-foreground">权限分配</h4>
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="lg" />
                    </div>
                  ) : (
                    <>
                      <Surface className="flex items-center gap-3 rounded-xl p-3">
                        <Checkbox
                          isSelected={
                            checkedMenuIds.length === allMenuIds.length && allMenuIds.length > 0
                          }
                          onChange={handleSelectAll}
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                        <span className="text-sm font-medium">全选/取消全选</span>
                        <span className="text-sm text-muted">
                          (已选 {checkedMenuIds.length}/{allMenuIds.length})
                        </span>
                      </Surface>

                      <Surface className="max-h-64 overflow-y-auto rounded-xl p-2">
                        {menuTree.map((node: MenuTreeNode) => (
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
                      </Surface>
                    </>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
                取消
              </Button>
              <Button onPress={handleSubmit} isDisabled={isPending}>
                {isPending ? '提交中...' : '确定'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
