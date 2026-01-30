'use client'

/**
 * 管理员表单对话框
 * @description 创建和编辑管理员的表单对话框
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
  Surface,
  TextArea,
  TextField,
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { useAllRoles, useCreateAdmin, useUpdateAdmin, useUpdateAdminRoles } from '@/hooks/queries'
import { SUPER_ADMIN_ID } from '@/lib/utils'

type Admin = {
  id: number
  username: string
  nickname: string
  status: number
  remark: string | null
  roles?: Array<{ id: number; roleName: string }>
}

interface AdminFormDialogProps {
  open: boolean
  admin: Admin | null
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  username: string
  password: string
  nickname: string
  status: number
  remark: string
  roleIds: number[]
}

const initialFormData: FormData = {
  username: '',
  password: '',
  nickname: '',
  status: 1,
  remark: '',
  roleIds: [],
}

export function AdminFormDialog({ open, admin, onClose, onSuccess }: AdminFormDialogProps) {
  const isEdit = !!admin
  const isSuperAdmin = admin?.id === SUPER_ADMIN_ID
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const { data: rolesData } = useAllRoles()
  const roles = (rolesData as Array<{ id: number; roleName: string }> | undefined) || []
  const createAdmin = useCreateAdmin()
  const updateAdmin = useUpdateAdmin()
  const updateAdminRoles = useUpdateAdminRoles()

  useEffect(() => {
    if (open) {
      if (admin) {
        setFormData({
          username: admin.username,
          password: '',
          nickname: admin.nickname || '',
          status: admin.status,
          remark: admin.remark || '',
          roleIds: admin.roles?.map((r) => r.id) || [],
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
    }
  }, [open, admin])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }
    if (!isEdit && !formData.password) {
      newErrors.password = '请输入密码'
    }
    if (!isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = '密码长度不能少于6位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      if (isEdit && admin) {
        await updateAdmin.mutateAsync({
          id: admin.id,
          input: {
            nickname: formData.nickname,
            status: formData.status,
            remark: formData.remark || undefined,
          },
        })
        if (!isSuperAdmin) {
          await updateAdminRoles.mutateAsync({
            id: admin.id,
            input: { roleIds: formData.roleIds },
          })
        }
      } else {
        await createAdmin.mutateAsync({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname || undefined,
          status: formData.status,
          remark: formData.remark || undefined,
          roleIds: formData.roleIds.length > 0 ? formData.roleIds : undefined,
        })
      }
      onSuccess()
    } catch (err) {
      setErrors({ username: err instanceof Error ? err.message : '操作失败' })
    }
  }

  const isPending = createAdmin.isPending || updateAdmin.isPending || updateAdminRoles.isPending

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, roleIds: [...formData.roleIds, roleId] })
    } else {
      setFormData({ ...formData, roleIds: formData.roleIds.filter((id) => id !== roleId) })
    }
  }

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-lg">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{isEdit ? '编辑管理员' : '新增管理员'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4 p-6">
              {/* 用户名 */}
              <TextField
                isRequired
                isInvalid={!!errors.username}
                isDisabled={isEdit}
                value={formData.username}
                onChange={(v) => setFormData({ ...formData, username: v })}
              >
                <Label>用户名</Label>
                <Input placeholder="请输入用户名" />
                {errors.username && <FieldError>{errors.username}</FieldError>}
              </TextField>

              {/* 密码 */}
              {!isEdit && (
                <TextField
                  isRequired
                  isInvalid={!!errors.password}
                  type="password"
                  value={formData.password}
                  onChange={(v) => setFormData({ ...formData, password: v })}
                >
                  <Label>密码</Label>
                  <Input placeholder="请输入密码（至少6位）" />
                  {errors.password && <FieldError>{errors.password}</FieldError>}
                </TextField>
              )}

              {/* 昵称 */}
              <TextField
                value={formData.nickname}
                onChange={(v) => setFormData({ ...formData, nickname: v })}
              >
                <Label>昵称</Label>
                <Input placeholder="请输入昵称" />
              </TextField>

              {/* 状态 */}
              <Select
                selectedKey={String(formData.status)}
                onSelectionChange={(key) => setFormData({ ...formData, status: Number(key) })}
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

              {/* 角色 */}
              <div>
                <Label className="mb-2 block">角色</Label>
                {isSuperAdmin ? (
                  <Surface className="rounded-xl p-3">
                    <p className="text-sm text-muted">超级管理员角色不可修改</p>
                  </Surface>
                ) : (
                  <Surface className="max-h-40 space-y-2 overflow-y-auto rounded-xl p-3">
                    {roles.length === 0 ? (
                      <p className="text-sm text-muted">暂无角色</p>
                    ) : (
                      roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`role-${role.id}`}
                            isSelected={formData.roleIds.includes(role.id)}
                            onChange={(checked) => handleRoleToggle(role.id, checked)}
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox>
                          <Label htmlFor={`role-${role.id}`}>{role.roleName}</Label>
                        </div>
                      ))
                    )}
                  </Surface>
                )}
              </div>

              {/* 备注 */}
              <TextField
                value={formData.remark}
                onChange={(v) => setFormData({ ...formData, remark: v })}
              >
                <Label>备注</Label>
                <TextArea placeholder="请输入备注" rows={3} />
              </TextField>
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
