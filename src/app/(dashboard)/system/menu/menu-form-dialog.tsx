'use client'

import { Alert, Button, Group, Modal, ScrollArea, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useCreateMenu, useUpdateMenu } from '@/hooks/queries'
import { type MenuFormData, MenuFormFields } from './menu-form-fields'

type MenuTreeNode = {
  id: number
  parentId: number
  menuType: 'D' | 'M' | 'B'
  menuName: string
  permission: string | null
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  visible: number
  status: number
  isExternal: number
  isCache: number
  remark: string | null
}

interface MenuFormDialogProps {
  open: boolean
  menu: MenuTreeNode | null
  parentMenu: MenuTreeNode | null
  onClose: () => void
  onSuccess: () => void
}

const defaultFormData: MenuFormData = {
  parentId: 0,
  menuType: 'M',
  menuName: '',
  permission: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  visible: 1,
  status: 1,
  isExternal: 0,
  isCache: 1,
  remark: '',
}

export function MenuFormDialog({
  open,
  menu,
  parentMenu,
  onClose,
  onSuccess,
}: MenuFormDialogProps) {
  const isEdit = !!menu
  const [error, setError] = useState('')

  const form = useForm<MenuFormData>({
    mode: 'controlled',
    initialValues: defaultFormData,
    validate: {
      menuName: (v) => (!v.trim() ? '请输入菜单名称' : null),
    },
  })

  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()

  // biome-ignore lint: form methods are stable refs
  useEffect(() => {
    if (open) {
      if (menu) {
        form.setValues({
          parentId: menu.parentId,
          menuType: menu.menuType,
          menuName: menu.menuName,
          permission: menu.permission || '',
          path: menu.path || '',
          component: menu.component || '',
          icon: menu.icon || '',
          sort: menu.sort,
          visible: menu.visible,
          status: menu.status,
          isExternal: menu.isExternal,
          isCache: menu.isCache,
          remark: menu.remark || '',
        })
      } else {
        form.setValues({
          ...defaultFormData,
          parentId: parentMenu?.id || 0,
          menuType: parentMenu ? (parentMenu.menuType === 'D' ? 'M' : 'B') : 'D',
        })
      }
      form.clearErrors()
      setError('')
    }
  }, [open, menu, parentMenu])

  const handleSubmit = async (values: MenuFormData) => {
    setError('')
    try {
      const input = {
        parentId: values.parentId,
        menuType: values.menuType,
        menuName: values.menuName,
        permission: values.permission || undefined,
        // WHY: 目录/按钮类型不需要路径
        path:
          values.menuType === 'D' || values.menuType === 'B' ? undefined : values.path || undefined,
        component: values.component || undefined,
        icon: values.icon || undefined,
        sort: values.sort,
        visible: values.visible,
        status: values.status,
        isExternal: values.isExternal,
        isCache: values.isCache,
        remark: values.remark || undefined,
      }
      if (isEdit && menu) {
        await updateMenu.mutateAsync({ id: menu.id, input })
      } else {
        await createMenu.mutateAsync(input)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const isPending = createMenu.isPending || updateMenu.isPending
  const parentMenuName =
    parentMenu?.menuName ||
    (form.getValues().parentId === 0 ? '根目录' : `ID: ${form.getValues().parentId}`)

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? '编辑菜单' : '新增菜单'}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {error}
            </Alert>
          )}
          <ScrollArea.Autosize mah="60vh">
            <MenuFormFields
              formData={form.getValues()}
              onChange={(data) => form.setValues(data)}
              parentMenuName={parentMenuName}
            />
          </ScrollArea.Autosize>
          <Group justify="flex-end">
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
