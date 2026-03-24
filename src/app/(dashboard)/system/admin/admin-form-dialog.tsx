'use client'

import {
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  PasswordInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'

import { useAllRoles, useCreateAdmin, useUpdateAdmin, useUpdateAdminRoles } from '@/hooks/queries'
import { SUPER_ADMIN_ID } from '@/lib/constants'
import type { Admin } from '@/server/routes/admins/dtos'

interface AdminFormDialogProps {
  open: boolean
  admin: Admin | null
  onClose: () => void
  onSuccess: () => void
}

export function AdminFormDialog({ open, admin, onClose, onSuccess }: AdminFormDialogProps) {
  const isEdit = !!admin
  const isSuperAdmin = admin?.id === SUPER_ADMIN_ID

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      nickname: '',
      status: '1',
      remark: '',
      roleIds: [] as number[],
    },
    validate: {
      username: (v) => (!v.trim() ? '请输入用户名' : null),
      password: (v) => {
        if (isEdit) return null
        if (!v) return '请输入密码'
        if (v.length < 6) return '密码长度不能少于6位'
        return null
      },
    },
  })

  const { data: rolesData } = useAllRoles()
  const roles = (rolesData as Array<{ id: number; roleName: string }> | undefined) || []
  const createAdmin = useCreateAdmin()
  const updateAdmin = useUpdateAdmin()
  const updateAdminRoles = useUpdateAdminRoles()

  // biome-ignore lint: form methods are stable refs
  useEffect(() => {
    if (open) {
      if (admin) {
        form.setValues({
          username: admin.username,
          password: '',
          nickname: admin.nickname || '',
          status: String(admin.status),
          remark: admin.remark || '',
          roleIds: admin.roles?.map((r) => r.id) || [],
        })
      } else {
        form.reset()
      }
      form.clearErrors()
    }
  }, [open, admin])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEdit && admin) {
        await updateAdmin.mutateAsync({
          id: admin.id,
          input: {
            nickname: values.nickname,
            status: Number(values.status),
            remark: values.remark || undefined,
          },
        })
        if (!isSuperAdmin) {
          await updateAdminRoles.mutateAsync({
            id: admin.id,
            input: { roleIds: values.roleIds },
          })
        }
      } else {
        await createAdmin.mutateAsync({
          username: values.username,
          password: values.password,
          nickname: values.nickname || undefined,
          status: Number(values.status),
          remark: values.remark || undefined,
          roleIds: values.roleIds.length > 0 ? values.roleIds : undefined,
        })
      }
      onSuccess()
    } catch (err) {
      form.setFieldError('username', err instanceof Error ? err.message : '操作失败')
    }
  }

  const isPending = createAdmin.isPending || updateAdmin.isPending || updateAdminRoles.isPending

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    const current = form.getValues().roleIds
    form.setFieldValue(
      'roleIds',
      checked ? [...current, roleId] : current.filter((id) => id !== roleId)
    )
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? '编辑管理员' : '新增管理员'}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="用户名"
            placeholder="请输入用户名"
            required
            disabled={isEdit}
            key={form.key('username')}
            {...form.getInputProps('username')}
          />

          {!isEdit && (
            <PasswordInput
              label="密码"
              placeholder="请输入密码（至少6位）"
              required
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
          )}

          <TextInput
            label="昵称"
            placeholder="请输入昵称"
            key={form.key('nickname')}
            {...form.getInputProps('nickname')}
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

          <div>
            <Text size="sm" fw={500} mb="xs">
              角色
            </Text>
            {isSuperAdmin ? (
              <Paper p="sm" radius="md" bg="var(--mantine-color-gray-0)">
                <Text size="sm" c="dimmed">
                  超级管理员角色不可修改
                </Text>
              </Paper>
            ) : (
              <Paper radius="md" bg="var(--mantine-color-gray-0)">
                <ScrollArea.Autosize mah={160} p="xs" type="hover">
                  {roles.length === 0 ? (
                    <Text size="sm" c="dimmed" p="xs">
                      暂无角色
                    </Text>
                  ) : (
                    <Stack gap="xs">
                      {roles.map((role) => (
                        <Checkbox
                          key={role.id}
                          label={role.roleName}
                          checked={form.getValues().roleIds.includes(role.id)}
                          onChange={(e) => handleRoleToggle(role.id, e.currentTarget.checked)}
                        />
                      ))}
                    </Stack>
                  )}
                </ScrollArea.Autosize>
              </Paper>
            )}
          </div>

          <Textarea
            label="备注"
            placeholder="请输入备注"
            rows={3}
            key={form.key('remark')}
            {...form.getInputProps('remark')}
          />

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
