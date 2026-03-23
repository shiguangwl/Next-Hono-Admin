/**
 * OpenTelemetry 可选初始化模块
 * @description 通过 OTEL_EXPORTER_OTLP_ENDPOINT 环境变量控制是否启用
 * 未设置时完全不加载 OTel SDK，零开销
 */

import pino from 'pino'
import { type Attributes, trace } from '@opentelemetry/api'
import { HEALTH_CHECK_PATH } from '@/lib/constants'

// WHY: 独立 pino 实例避免循环依赖（telemetry ↔ logger）
const bootstrapLog = pino({ name: 'telemetry', timestamp: pino.stdTimeFunctions.isoTime })

/** OTel 是否已启用 */
let otelEnabled = false

/**
 * 判断 OTel 是否启用
 * WHY: 用函数而非直接导出变量，确保在初始化完成后才能读取
 */
export function isOTelEnabled(): boolean {
  return otelEnabled
}

/**
 * 从当前 OTel context 中提取 trace 信息
 * @returns traceId 和 spanId，未启用 OTel 时返回 undefined
 */
export function getTraceContext(): Attributes | undefined {
  if (!otelEnabled) return undefined

  const span = trace.getActiveSpan()
  if (!span) return undefined

  const spanContext = span.spanContext()
  // WHY: traceId 全零表示无效 trace，不注入
  if (!spanContext.traceId || spanContext.traceId === '00000000000000000000000000000000') {
    return undefined
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  }
}

/**
 * 初始化 OpenTelemetry SDK
 * @description 仅在 OTEL_EXPORTER_OTLP_ENDPOINT 存在时执行
 */
export async function initTelemetry(): Promise<void> {
  const rawEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (!rawEndpoint) return

  // WHY: 末尾斜杠会导致拼接时出现双斜杠 (e.g. http://host:4318//v1/traces)
  const otlpEndpoint = rawEndpoint.replace(/\/+$/, '')

  try {
    const serviceName = process.env.OTEL_SERVICE_NAME || 'next-hono-admin'

    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http')
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http')
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics')
    const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs')
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    )
    const { resourceFromAttributes } = await import('@opentelemetry/resources')
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions')

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    })

    const sdk = new NodeSDK({
      resource,

      traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      }),

      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 30_000,
      }),

      logRecordProcessors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${otlpEndpoint}/v1/logs`,
          })
        ),
      ],

      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-http': {
            ignoreIncomingRequestHook: (req) => req.url === HEALTH_CHECK_PATH,
          },
          // WHY: fs instrumentation 噪音太大，关闭
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    })

    sdk.start()
    otelEnabled = true

    // WHY: 确保进程退出时 flush 所有 telemetry 数据
    const shutdown = async () => {
      try {
        await sdk.shutdown()
      } catch {
        // 静默处理，避免 shutdown 失败影响进程退出
      }
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    bootstrapLog.info({ endpoint: otlpEndpoint, service: serviceName }, 'OpenTelemetry initialized')
  } catch (err) {
    // WHY: OTel 是可选增强，初始化失败不应阻止应用启动
    bootstrapLog.error({ err }, 'Failed to initialize OpenTelemetry, continuing without it')
  }
}
