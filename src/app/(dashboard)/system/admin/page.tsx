'use client'

import { Button, Group, Paper, PasswordInput, TextInput } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useState } from 'react'

import { PermissionGuard } from '@/components/permission-guard'
import { FormDialog } from '@/components/ui/form-dialog'
import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useAdmins, useDeleteAdmin, useResetPassword } from '@/hooks/queries'
import { type Admin, buildAdminColumns } from './admin-columns'
import { AdminFormDialog } from './admin-form-dialog'

const PAGE_SIZE = 20

export default function AdminPage() {
  const [{ page, keyword: searchKeyword }, setQueryParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    keyword: parseAsString.withDefault(''),
  })
  const [localKeyword, setLocalKeyword] = useState(searchKeyword)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Admin>>({
    columnAccessor: 'id',
    direction: 'desc',
  })

  const { data, isLoading, refetch } = useAdmins({
    page,
    pageSize: PAGE_SIZE,
    keyword: searchKeyword,
    sortBy: sortStatus.columnAccessor,
    sortOrder: sortStatus.direction,
  })
  const deleteAdmin = useDeleteAdmin()
  const resetPassword = useResetPassword()

  const handleSearch = () => {
    setQueryParams({ keyword: localKeyword || null, page: 1 })
  }

  const handleCreate = () => {
    setEditingAdmin(null)
    setDialogOpen(true)
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setDialogOpen(true)
  }

  const openDeleteConfirm = (admin: Admin) => {
    modals.openConfirmModal({
      title: '删除管理员',
      children: `确定要删除管理员 "${admin.username}" 吗？此操作不可恢复。`,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteAdmin.mutateAsync(admin.id)
          notifications.show({ message: '删除成功', color: 'green' })
        } catch (err) {
          notifications.show({
            message: err instanceof Error ? err.message : '删除失败',
            color: 'red',
          })
        }
      },
    })
  }

  const handleResetPassword = async () => {
    if (!resetPasswordId) return
    if (!newPassword) {
      setPasswordError('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('密码长度不能少于6位')
      return
    }
    try {
      await resetPassword.mutateAsync({
        id: resetPasswordId,
        input: { newPassword },
      })
      setResetPasswordId(null)
      setNewPassword('')
      setPasswordError('')
      notifications.show({ message: '密码重置成功', color: 'green' })
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '重置密码失败',
        color: 'red',
      })
    }
  }

  const columns = buildAdminColumns({
    onEdit: handleEdit,
    onDelete: openDeleteConfirm,
    onResetPassword: (admin) => {
      setResetPasswordId(admin.id)
      setNewPassword('')
      setPasswordError('')
    },
  })

  return (
    <PageContainer>
      <PageHeader
        title="用户管理"
        breadcrumbs={[{ label: '系统管理' }, { label: '用户管理' }]}
        actions={
          <PermissionGuard permission="system:admin:create">
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
              新增管理员
            </Button>
          </PermissionGuard>
        }
      />

      <Paper withBorder p="md" radius="md" mb="md">
        <Group>
          <TextInput
            flex={1}
            maw={300}
            label="关键词"
            placeholder="搜索用户名或昵称"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="default" onClick={handleSearch} mt="auto">
            搜索
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={14} />}
            onClick={() => refetch()}
            mt="auto"
          >
            刷新
          </Button>
        </Group>
      </Paper>

      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        minHeight={200}
        columns={columns}
        records={data?.items ?? []}
        fetching={isLoading}
        noRecordsText="暂无管理员数据"
        totalRecords={data?.total ?? 0}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setQueryParams({ page: p })}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        paginationText={({ from, to, totalRecords }) => `${from}-${to} / 共 ${totalRecords} 条`}
      />

      <AdminFormDialog
        open={dialogOpen}
        admin={editingAdmin}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false)
          refetch()
        }}
      />

      <FormDialog
        title="重置密码"
        description="请输入新密码"
        isOpen={!!resetPasswordId}
        onClose={() => {
          setResetPasswordId(null)
          setNewPassword('')
          setPasswordError('')
        }}
        onSubmit={handleResetPassword}
        isSubmitting={resetPassword.isPending}
        submitText="确定"
        size="sm"
      >
        <PasswordInput
          label="新密码"
          placeholder="请输入新密码（至少6位）"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          error={passwordError || undefined}
        />
      </FormDialog>
    </PageContainer>
  )
}
