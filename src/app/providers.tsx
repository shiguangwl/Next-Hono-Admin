'use client'

import { Card, createTheme, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/hooks/use-auth'

const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 7 },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: { fw: 600 },
      styles: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    Card: Card.extend({
      defaultProps: { shadow: 'sm', withBorder: true, radius: 'lg' },
      styles: {
        root: {
          transition:
            'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    }),
    Paper: {
      defaultProps: { shadow: 'xs', withBorder: true, radius: 'lg' },
    },
    TextInput: {
      styles: {
        input: {
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-md)',
          transition: 'all 0.15s ease',
        },
      },
    },
    Table: {
      styles: {
        tr: { transition: 'background-color 0.15s ease' },
      },
    },
    Modal: {
      defaultProps: { radius: 'lg', overlayProps: { blur: 4 } },
    },
    ActionIcon: {
      styles: {
        root: { transition: 'all 0.15s ease' },
      },
    },
    Badge: {
      styles: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
})

function AuthInitializer({ children }: { children: ReactNode }) {
  const { initialized, refreshAuth } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      refreshAuth()
    }
  }, [initialized, refreshAuth])

  return <>{children}</>
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <NuqsAdapter>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ModalsProvider>
          <QueryClientProvider client={queryClient}>
            <AuthInitializer>{children}</AuthInitializer>
            <Notifications position="top-center" />
          </QueryClientProvider>
        </ModalsProvider>
      </MantineProvider>
    </NuqsAdapter>
  )
}
