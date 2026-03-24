'use client'

import {
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Switch,
  TagsInput,
  TextInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconDeviceFloppy, IconPlugConnected, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { PageContainer, PageHeader } from '@/components/ui/page-header'
import { useStorageConfig, useTestStorageConnection, useUpdateStorageConfig } from '@/hooks/queries'

interface ConfigForm {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string
  forcePathStyle: boolean
  maxFileSize: number
  allowedExtensions: string[]
}

const DEFAULT_MAX_FILE_SIZE_MB = 50

function createEmptyForm(): ConfigForm {
  return {
    endpoint: '',
    region: 'auto',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    publicUrl: '',
    forcePathStyle: false,
    maxFileSize: DEFAULT_MAX_FILE_SIZE_MB,
    allowedExtensions: [],
  }
}

export default function StorageConfigPage() {
  const [form, setForm] = useState<ConfigForm>(createEmptyForm)
  const { data: config, isLoading } = useStorageConfig()
  const updateConfig = useUpdateStorageConfig()
  const testConnection = useTestStorageConnection()

  useEffect(() => {
    if (!config) return
    const c = config as Record<string, unknown>
    setForm({
      endpoint: (c.endpoint as string) ?? '',
      region: (c.region as string) ?? 'auto',
      bucket: (c.bucket as string) ?? '',
      accessKeyId: (c.accessKeyId as string) ?? '',
      secretAccessKey: '',
      publicUrl: (c.publicUrl as string) ?? '',
      forcePathStyle: (c.forcePathStyle as boolean) ?? false,
      maxFileSize: Math.round(
        ((c.maxFileSize as number) ?? DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024) / 1024 / 1024
      ),
      allowedExtensions: (c.allowedExtensions as string[]) ?? [],
    })
  }, [config])

  const handleSave = async () => {
    if (!form.endpoint || !form.bucket || !form.accessKeyId) {
      notifications.show({ message: '请填写必要配置', color: 'red' })
      return
    }
    try {
      await updateConfig.mutateAsync({
        endpoint: form.endpoint,
        region: form.region || 'auto',
        bucket: form.bucket,
        accessKeyId: form.accessKeyId,
        secretAccessKey: form.secretAccessKey || undefined,
        publicUrl: form.publicUrl || undefined,
        forcePathStyle: form.forcePathStyle,
        maxFileSize: form.maxFileSize * 1024 * 1024,
        allowedExtensions: form.allowedExtensions,
      })
      notifications.show({ message: '配置已保存', color: 'green' })
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '保存失败',
        color: 'red',
      })
    }
  }

  const handleTest = async () => {
    if (!form.endpoint || !form.bucket || !form.accessKeyId) {
      notifications.show({ message: '请先填写 Endpoint、Bucket 和 Access Key ID', color: 'red' })
      return
    }
    try {
      const result = await testConnection.mutateAsync({
        endpoint: form.endpoint,
        region: form.region || 'auto',
        bucket: form.bucket,
        accessKeyId: form.accessKeyId,
        secretAccessKey: form.secretAccessKey || undefined,
        forcePathStyle: form.forcePathStyle,
      })
      if (result.success) {
        notifications.show({
          message: result.message,
          color: 'green',
          icon: <IconCheck size={16} />,
        })
      } else {
        notifications.show({
          message: result.message,
          color: 'red',
          icon: <IconX size={16} />,
        })
      }
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : '测试失败',
        color: 'red',
      })
    }
  }

  const update = (key: keyof ConfigForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) return null

  return (
    <PageContainer>
      <PageHeader
        title="存储配置"
        breadcrumbs={[{ label: '存储管理' }, { label: '存储配置' }]}
        actions={
          <Group gap="sm">
            <Button
              variant="light"
              leftSection={<IconPlugConnected size={14} />}
              onClick={handleTest}
              loading={testConnection.isPending}
            >
              测试连接
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={handleSave}
              loading={updateConfig.isPending}
            >
              保存
            </Button>
          </Group>
        }
      />

      {config && !(config as Record<string, unknown>).isConfigured ? (
        <Alert color="yellow" title="尚未配置">
          请填写以下信息以启用对象存储服务
        </Alert>
      ) : null}

      <Paper withBorder p="lg" radius="md">
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Endpoint"
              placeholder="https://s3.amazonaws.com"
              required
              value={form.endpoint}
              onChange={(e) => update('endpoint', e.currentTarget.value)}
            />
            <TextInput
              label="Region"
              placeholder="auto"
              value={form.region}
              onChange={(e) => update('region', e.currentTarget.value)}
            />
            <TextInput
              label="Bucket"
              placeholder="my-bucket"
              required
              value={form.bucket}
              onChange={(e) => update('bucket', e.currentTarget.value)}
            />
            <TextInput
              label="Access Key ID"
              required
              value={form.accessKeyId}
              onChange={(e) => update('accessKeyId', e.currentTarget.value)}
            />
            <PasswordInput
              label="Secret Access Key"
              placeholder="留空则不更新"
              value={form.secretAccessKey}
              onChange={(e) => update('secretAccessKey', e.currentTarget.value)}
            />
            <TextInput
              label="公开访问 URL 前缀"
              placeholder="https://cdn.example.com"
              value={form.publicUrl}
              onChange={(e) => update('publicUrl', e.currentTarget.value)}
            />
          </SimpleGrid>

          <Switch
            label="Force Path Style"
            description="MinIO 等自托管服务需要开启"
            checked={form.forcePathStyle}
            onChange={(e) => update('forcePathStyle', e.currentTarget.checked)}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="最大文件大小 (MB)"
              min={1}
              max={1024}
              value={form.maxFileSize}
              onChange={(v) => update('maxFileSize', v || DEFAULT_MAX_FILE_SIZE_MB)}
            />
            <TagsInput
              label="允许的文件扩展名"
              placeholder="输入后回车添加"
              value={form.allowedExtensions}
              onChange={(v) => update('allowedExtensions', v)}
            />
          </SimpleGrid>
        </Stack>
      </Paper>
    </PageContainer>
  )
}
