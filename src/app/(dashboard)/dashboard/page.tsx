"use client";

/**
 * 仪表盘首页
 * @description 后台管理系统首页，显示欢迎信息和统计数据
 */

import { PageContainer } from "@/components/ui/page-header";
import { useAuth } from "@/hooks/use-auth";
import { Card, Surface } from "@heroui/react";
import Link from "next/link";

export default function DashboardPage() {
  const { admin } = useAuth();

  return (
    <PageContainer>
      {/* 欢迎卡片 */}
      <Card>
        <Card.Content className="p-6">
          <h1 className="text-2xl font-bold text-foreground">
            欢迎回来，{admin?.nickname || admin?.username}！
          </h1>
          <p className="mt-2 text-muted">这是您的后台管理系统控制台</p>
        </Card.Content>
      </Card>
    </PageContainer>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "accent" | "success" | "warning" | "danger";
}

const colorClasses = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <Card.Content className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${colorClasses[color]}`}>{icon}</div>
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

interface QuickLinkProps {
  href: string;
  title: string;
  description: string;
}

function QuickLink({ href, title, description }: QuickLinkProps) {
  return (
    <Link href={href}>
      <Surface className="h-full rounded-xl p-4 transition-colors hover:bg-default">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </Surface>
    </Link>
  );
}
