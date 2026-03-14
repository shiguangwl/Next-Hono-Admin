'use client'

import { AreaChart } from '@mantine/charts'
import { Box, Card, Grid, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconActivity, IconShield, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { FileDropzone } from '@/components/ui/file-dropzone'
import { PageContainer } from '@/components/ui/page-header'
import { RichEditor } from '@/components/ui/rich-text-editor'
import { useAuth } from '@/hooks/use-auth'

const MOCK_CHART_DATA = [
  { date: '周一', 登录次数: 42, 操作次数: 120 },
  { date: '周二', 登录次数: 58, 操作次数: 145 },
  { date: '周三', 登录次数: 35, 操作次数: 98 },
  { date: '周四', 登录次数: 61, 操作次数: 168 },
  { date: '周五', 登录次数: 72, 操作次数: 195 },
  { date: '周六', 登录次数: 28, 操作次数: 54 },
  { date: '周日', 登录次数: 19, 操作次数: 38 },
]

const STAT_CARDS = [
  { label: '管理员', value: '12', icon: IconUsers, color: 'indigo' },
  { label: '角色数', value: '5', icon: IconShield, color: 'violet' },
  { label: '今日操作', value: '347', icon: IconActivity, color: 'cyan' },
  { label: '系统健康', value: '99.9%', icon: IconTrendingUp, color: 'green' },
] as const

export default function DashboardPage() {
  const { admin } = useAuth()
  const displayName = admin?.nickname || admin?.username || '管理员'

  return (
    <PageContainer>
      <Stack gap="xl">
        <WelcomeBanner displayName={displayName} />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {STAT_CARDS.map((card) => (
            <Card key={card.label} p="lg">
              <Stack gap="xs">
                <ThemeIcon size={44} radius="md" variant="light" color={card.color}>
                  <card.icon size={22} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.04em">
                  {card.label}
                </Text>
                <Text size="xl" fw={800}>
                  {card.value}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Card p="lg">
          <Text size="sm" fw={600} mb="md">
            近 7 天系统活动趋势
          </Text>
          <AreaChart
            h={280}
            data={MOCK_CHART_DATA}
            dataKey="date"
            series={[
              { name: '登录次数', color: 'indigo.6' },
              { name: '操作次数', color: 'violet.4' },
            ]}
            curveType="monotone"
            withLegend
            withDots={false}
            gridAxis="xy"
            areaChartProps={{ syncId: 'dashboard' }}
          />
        </Card>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="lg">
              <Text size="sm" fw={600} mb="md">
                文件上传
              </Text>
              <FileDropzone
                onFilesAccepted={(files) => {
                  notifications.show({
                    message: `已选择 ${files.length} 个文件：${files.map((f) => f.name).join(', ')}`,
                    color: 'blue',
                  })
                }}
              />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card p="lg">
              <Text size="sm" fw={600} mb="md">
                富文本编辑器
              </Text>
              <RichEditor placeholder="在这里输入公告内容..." />
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </PageContainer>
  )
}

function WelcomeBanner({ displayName }: { displayName: string }) {
  return (
    <Card
      p={40}
      radius="lg"
      bg="linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-7))"
      style={{
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <DecorativeCircle top="-10%" right="-5%" size={400} opacity={0.15} />
      <DecorativeCircle bottom="-20%" left="5%" size={300} opacity={0.1} />

      <Stack gap="md" style={{ position: 'relative', zIndex: 1 }}>
        <Text size="lg" c="white" opacity={0.9} fw={500} lts="0.05em">
          {getGreeting()}
        </Text>
        <Title order={1} c="white" fw={800} size={42} style={{ letterSpacing: '-0.02em' }}>
          欢迎回来，{displayName} 👋
        </Title>
        <Box maw={600}>
          <Text size="md" c="white" opacity={0.8} lh={1.6}>
            您已成功登录管理系统。以下是系统运行概况。
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

function DecorativeCircle({
  top,
  right,
  bottom,
  left,
  size,
  opacity,
}: {
  top?: string
  right?: string
  bottom?: string
  left?: string
  size: number
  opacity: number
}) {
  return (
    <Box
      style={{
        position: 'absolute',
        top,
        right,
        bottom,
        left,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}), transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙 夜深了'
  if (hour < 12) return '🌅 上午好'
  if (hour < 14) return '☀️ 中午好'
  if (hour < 18) return '🌤️ 下午好'
  return '🌆 晚上好'
}
