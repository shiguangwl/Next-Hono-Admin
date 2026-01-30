"use client";

/**
 * 表单对话框组件
 * @description 通用表单对话框，支持新增和编辑模式
 */

import { Button, Modal, useOverlayState } from "@heroui/react";
import { type ReactNode, useState } from "react";

interface FormDialogProps {
  /** 对话框标题 */
  title: string;
  /** 对话框描述 */
  description?: string;
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 提交回调 */
  onSubmit: () => void | Promise<void>;
  /** 是否提交中 */
  isSubmitting?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 对话框宽度 */
  size?: "sm" | "md" | "lg" | "xl";
  /** 子元素 */
  children: ReactNode;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
};

/**
 * 表单对话框组件
 */
export function FormDialog({
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitText = "确定",
  cancelText = "取消",
  size = "md",
  children,
}: FormDialogProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className={sizeClasses[size]}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </Modal.Header>
            <Modal.Body className="p-6">{children}</Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                {cancelText}
              </Button>
              <Button onPress={handleSubmit} isDisabled={isSubmitting}>
                {isSubmitting ? "提交中..." : submitText}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/**
 * 确认对话框组件
 */
interface ConfirmDialogProps {
  /** 对话框标题 */
  title: string;
  /** 对话框内容 */
  content: ReactNode;
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 确认回调 */
  onConfirm: () => void | Promise<void>;
  /** 是否确认中 */
  isConfirming?: boolean;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 是否危险操作 */
  isDanger?: boolean;
}

export function ConfirmDialog({
  title,
  content,
  isOpen,
  onClose,
  onConfirm,
  isConfirming = false,
  confirmText = "确定",
  cancelText = "取消",
  isDanger = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-sm">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
              <div className="text-sm text-muted">{content}</div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onPress={onClose}
                isDisabled={isConfirming}
              >
                {cancelText}
              </Button>
              <Button
                variant={isDanger ? "danger" : "primary"}
                onPress={handleConfirm}
                isDisabled={isConfirming}
              >
                {isConfirming ? "处理中..." : confirmText}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/**
 * 使用表单对话框的 Hook
 */
export function useFormDialog<T = undefined>() {
  const { isOpen, open, close } = useOverlayState();
  const [data, setData] = useState<T | undefined>(undefined);

  const openWithData = (initialData?: T) => {
    setData(initialData);
    open();
  };

  const closeAndReset = () => {
    close();
    setData(undefined);
  };

  return {
    isOpen,
    data,
    open: openWithData,
    close: closeAndReset,
  };
}
