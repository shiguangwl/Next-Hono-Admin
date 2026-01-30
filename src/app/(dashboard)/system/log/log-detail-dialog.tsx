'use client'

/**
 * 日志详情对话框
 * @description 显示操作日志的详细信息
 */

import { Button, Modal, Separator, Surface } from '@heroui/react'
import { StatusChip } from '@/components/ui/status-chip'

type OperationLog = {
  id: number
  adminId: number | null
  adminName: string | null
  module: string | null
  operation: string | null
  description: string | null
  method: string | null
  requestMethod: string | null
  requestUrl: string | null
  requestParams: string | null
  responseResult: string | null
  ip: string | null
  ipLocation: string | null
  userAgent: string | null
  executionTime: number | null
  status: number
  errorMsg: string | null
  createdAt: string
}

interface LogDetailDialogProps {
  log: OperationLog
  onClose: () => void
}

export function LogDetailDialog({ log, onClose }: LogDetailDialogProps) {
  return (
    <Modal isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>日志详情</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="max-h-[60vh] overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="ID" value={log.id} />
                  <DetailItem label="管理员" value={log.adminName} />
                  <DetailItem label="模块" value={log.module} />
                  <DetailItem label="操作" value={log.operation} />
                </div>

                <Separator />

                <DetailItem label="描述" value={log.description} />
                <DetailItem label="请求方法" value={log.requestMethod} />
                <DetailItem label="请求URL" value={log.requestUrl} />
                <DetailItem label="请求参数" value={log.requestParams} isCode />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="IP" value={log.ip} />
                  <DetailItem
                    label="执行时间"
                    value={log.executionTime !== null ? `${log.executionTime}ms` : null}
                  />
                </div>

                <DetailItem label="User-Agent" value={log.userAgent} />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="block text-sm font-medium text-muted">状态</span>
                    <div className="mt-1">
                      <StatusChip status={log.status === 1 ? 'success' : 'danger'}>
                        {log.status === 1 ? '成功' : '失败'}
                      </StatusChip>
                    </div>
                  </div>
                  <DetailItem label="创建时间" value={log.createdAt} />
                </div>

                {log.status === 0 && <DetailItem label="错误信息" value={log.errorMsg} isCode />}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onPress={onClose}>关闭</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}

function DetailItem({
  label,
  value,
  isCode,
}: {
  label: string
  value: string | number | null | undefined
  isCode?: boolean
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-muted">{label}</span>
      {isCode && value ? (
        <Surface className="mt-1 overflow-auto rounded-lg p-3">
          <pre className="text-sm">{value}</pre>
        </Surface>
      ) : (
        <p className="mt-1 text-sm">{value ?? '-'}</p>
      )}
    </div>
  )
}

export type { OperationLog }
