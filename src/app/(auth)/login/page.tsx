"use client";

/**
 * 登录页面
 * @description 管理员登录页面，使用 HeroUI 组件
 */

import { useAuth } from "@/hooks/use-auth";
import {
  Button,
  FieldError,
  Input,
  Label,
  Surface,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

/** 错误类型映射 */
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  用户名或密码错误: {
    title: "登录失败",
    description: "用户名或密码不正确，请检查后重试",
  },
  账号已禁用: {
    title: "账号已禁用",
    description: "您的账号已被管理员禁用，请联系管理员处理",
  },
};

/** 获取友好的错误提示 */
function getErrorInfo(message: string): { title: string; description: string } {
  return (
    ERROR_MESSAGES[message] || {
      title: "登录失败",
      description: message || "发生未知错误，请稍后重试",
    }
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const formRef = useRef<HTMLFormElement>(null);

  // 登录失败时触发震动动画
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (error) {
      // 每次错误变化时，更新 key 触发动画重新播放
      setShakeKey((prev) => prev + 1);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = "请输入用户名";
    }
    if (!password) {
      errors.password = "请输入密码";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "登录失败";
      setError(getErrorInfo(message));
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* 移动端 Logo - 仅在小屏显示 */}
      <div className="mb-8 flex flex-col items-center lg:hidden">
        <div className="flex size-14 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/30">
          <svg
            className="size-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>系统 Logo</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          后台管理系统
        </h1>
      </div>

      {/* 登录表单区域 */}
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            登录账号
          </h2>
          <p className="text-sm text-muted">请输入您的管理员凭据以继续</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* 错误提示 - 添加动画效果 */}
          {error && (
            <Surface
              key={shakeKey}
              className="
                rounded-xl border border-danger-soft-hover bg-danger-soft p-4
                animate-in fade-in slide-in-from-top-2 duration-300
                animate-shake
              "
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/10">
                  <svg
                    className="size-4 text-danger"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>错误提示</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-danger">
                    {error.title}
                  </p>
                  <p className="mt-0.5 text-sm text-danger/80">
                    {error.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 rounded-lg p-1 text-danger/60 transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="关闭错误提示"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>关闭</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Surface>
          )}

          {/* 用户名 */}
          <TextField
            isRequired
            isInvalid={!!fieldErrors.username}
            isDisabled={loading}
            name="username"
            value={username}
            onChange={setUsername}
          >
            <Label className="text-sm font-medium">用户名</Label>
            <Input
              placeholder="请输入用户名"
              autoComplete="username"
              className="h-11"
            />
            {fieldErrors.username && (
              <FieldError>{fieldErrors.username}</FieldError>
            )}
          </TextField>

          {/* 密码 */}
          <TextField
            isRequired
            isInvalid={!!fieldErrors.password}
            isDisabled={loading}
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
          >
            <Label className="text-sm font-medium">密码</Label>
            <Input
              placeholder="请输入密码"
              autoComplete="current-password"
              className="h-11"
            />
            {fieldErrors.password && (
              <FieldError>{fieldErrors.password}</FieldError>
            )}
          </TextField>

          {/* 登录按钮 */}
          <Button
            type="submit"
            className="mt-2 h-11 w-full text-base font-medium"
            isDisabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>加载中</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                登录中...
              </span>
            ) : (
              "登录"
            )}
          </Button>
        </form>

        {/* 底部信息 */}
        <p className="text-center text-xs text-muted">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
