'use client'

/**
 * 角色菜单权限分配对话框
 * @description 为角色分配菜单权限
 */

import { Button, Checkbox, Modal, Spinner, Surface } from '@heroui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMenuTree, useRole, useUpdateRoleMenus } from '@/hooks/queries'
import { MenuTreeItem, type MenuTreeNode } from './menu-tree-item'

type Role = {
  id: number
  roleName: string
}

interface RoleMenuDialogProps {
  open: boolean
  role: Role | null
  onClose: () => void
  onSuccess: () => void
}

export function RoleMenuDialog({ open, role, onClose, onSuccess }: RoleMenuDialogProps) {
  const [checkedIds, setCheckedIds] = useState<number[]>([])
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const expandedInitializedRef = useRef(false)

  const { data: menuTree, isLoading: menuLoading } = useMenuTree()
  const { data: roleDetail, isLoading: roleLoading } = useRole(role?.id || 0)
  const updateRoleMenus = useUpdateRoleMenus()

  const allMenuIds = useMemo(() => {
    const ids: number[] = []
    const collect = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        ids.push(node.id)
        if (node.children) collect(node.children)
      }
    }
    if (menuTree) collect(menuTree)
    return ids
  }, [menuTree])

  // 构建父节点映射表
  const parentMap = useMemo(() => {
    const map = new Map<number, number>()
    const buildMap = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        if (node.children) {
          for (const child of node.children) {
            map.set(child.id, node.id)
          }
          buildMap(node.children)
        }
      }
    }
    if (menuTree) buildMap(menuTree)
    return map
  }, [menuTree])

  useEffect(() => {
    if (open && roleDetail?.menuIds) {
      setCheckedIds(roleDetail.menuIds)
    } else if (open) {
      setCheckedIds([])
    }
    setError('')
  }, [open, roleDetail])

  useEffect(() => {
    if (!open) {
      expandedInitializedRef.current = false
      return
    }
    if (menuTree && !expandedInitializedRef.current) {
      setExpandedIds(allMenuIds)
      expandedInitializedRef.current = true
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

    // 获取所有父节点 ID
    const getAncestorIds = (id: number): number[] => {
      const ids: number[] = []
      let currentId: number | undefined = id
      while (currentId !== undefined) {
        const parentId = parentMap.get(currentId)
        if (parentId !== undefined) {
          ids.push(parentId)
          currentId = parentId
        } else {
          currentId = undefined
        }
      }
      return ids
    }

    const descendantIds = getDescendantIds(node)
    const ancestorIds = getAncestorIds(node.id)
    const isChecked = checkedIds.includes(node.id)

    if (isChecked) {
      // 取消勾选：移除当前节点和所有子节点
      setCheckedIds((prev) => prev.filter((id) => !descendantIds.includes(id)))
    } else {
      // 勾选：添加当前节点、所有子节点和所有父节点
      setCheckedIds((prev) => [...new Set([...prev, ...descendantIds, ...ancestorIds])])
    }
  }

  const handleSelectAll = () => {
    if (checkedIds.length === allMenuIds.length) {
      setCheckedIds([])
    } else {
      setCheckedIds(allMenuIds)
    }
  }

  const isLoading = menuLoading || roleLoading
  const isPending = updateRoleMenus.isPending

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>分配权限 - {role?.roleName}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
              {error && (
                <Surface className="mb-4 rounded-xl border border-danger-soft-hover bg-danger-soft p-3">
                  <p className="text-sm text-danger">{error}</p>
                </Surface>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <>
                  <Surface className="flex items-center gap-3 rounded-xl p-3">
                    <Checkbox
                      isSelected={checkedIds.length === allMenuIds.length && allMenuIds.length > 0}
                      onChange={handleSelectAll}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>
                    <span className="text-sm font-medium">全选/取消全选</span>
                    <span className="text-sm text-muted">
                      (已选 {checkedIds.length}/{allMenuIds.length})
                    </span>
                  </Surface>

                  <Surface className="max-h-80 overflow-y-auto rounded-xl p-2">
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
                  </Surface>
                </>
              )}
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
