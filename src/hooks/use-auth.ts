/**
 * 认证状态 Hook
 * @description 使用 Zustand 管理认证状态，支持持久化
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { type ClientResponse, createClient, unwrapApiData } from '@/lib/client'

/**
 * 菜单树节点类型
 */
interface MenuTreeNode {
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
  createdAt: string
  updatedAt: string
  children?: MenuTreeNode[]
}

/**
 * 管理员信息类型
 */
interface AdminInfo {
  id: number
  username: string
  nickname: string
  status: number
  loginIp: string | null
  loginTime: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  roles?: Array<{ id: number; roleName: string }>
}

/**
 * 认证状态类型
 */
interface AuthState {
  /** JWT Token */
  token: string | null
  /** 管理员信息 */
  admin: AdminInfo | null
  /** 权限标识列表 */
  permissions: string[]
  /** 菜单树 */
  menus: MenuTreeNode[]
  /** 是否已初始化 */
  initialized: boolean
  /** 是否正在加载 */
  loading: boolean
}

/**
 * 认证操作类型
 */
interface AuthActions {
  /** 登录 */
  login: (username: string, password: string) => Promise<void>
  /** 登出 */
  logout: () => void
  /** 刷新认证信息 */
  refreshAuth: () => Promise<void>
  /** 设置初始化状态 */
  setInitialized: (initialized: boolean) => void
}

/**
 * 认证 Store 类型
 */
type AuthStore = AuthState & AuthActions

type AuthClient = {
  auth: {
    login: {
      $post: (args: {
        json: { username: string; password: string }
      }) => Promise<ClientResponse<unknown>>
    }
    logout: {
      $post: () => Promise<ClientResponse<unknown>>
    }
    info: {
      $get: () => Promise<ClientResponse<unknown>>
    }
  }
}

function authClient(customToken?: string): AuthClient {
  return createClient({ token: customToken }) as unknown as AuthClient
}

/**
 * 初始状态
 */
const initialState: AuthState = {
  token: null,
  admin: null,
  permissions: [],
  menus: [],
  initialized: false,
  loading: false,
}

/**
 * 持久化状态类型
 */
type PersistedState = Pick<AuthState, 'token' | 'admin' | 'permissions' | 'menus'>

/**
 * 认证 Store
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (username: string, password: string) => {
        set({ loading: true })
        try {
          const response = await authClient().auth.login.$post({
            json: { username, password },
          })

          const data = await unwrapApiData<{
            token: string
            admin: AdminInfo
            permissions: string[]
            menus: MenuTreeNode[]
          }>(response, '登录失败')
          set({
            token: data.token,
            admin: data.admin as AdminInfo,
            permissions: data.permissions,
            menus: data.menus as MenuTreeNode[],
            initialized: true,
            loading: false,
          })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        const token = get().token
        set(initialState)
        // 可选：调用后端登出接口
        if (token) {
          authClient(token)
            .auth.logout.$post()
            .catch(() => {
              // 忽略登出接口错误
            })
        }
      },

      refreshAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ ...initialState, initialized: true })
          return
        }

        set({ loading: true })
        try {
          const response = await authClient(token).auth.info.$get()

          if (!response.ok) {
            // Token 无效，清除认证状态
            set({ ...initialState, initialized: true })
            return
          }

          const data = await unwrapApiData<{
            admin: AdminInfo
            permissions: string[]
            menus: MenuTreeNode[]
          }>(response, '获取认证信息失败')
          set({
            admin: data.admin as AdminInfo,
            permissions: data.permissions,
            menus: data.menus as MenuTreeNode[],
            initialized: true,
            loading: false,
          })
        } catch {
          // 请求失败，清除认证状态
          set({ ...initialState, initialized: true })
        }
      },

      setInitialized: (initialized: boolean) => {
        set({ initialized })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        token: state.token,
        admin: state.admin,
        permissions: state.permissions,
        menus: state.menus,
      }),
    }
  )
)

/**
 * 认证 Hook
 * @description 提供认证状态和操作方法
 */
export function useAuth() {
  const store = useAuthStore()

  return {
    // 状态
    token: store.token,
    admin: store.admin,
    permissions: store.permissions,
    menus: store.menus,
    isAuthenticated: !!store.token && !!store.admin,
    initialized: store.initialized,
    loading: store.loading,

    // 操作
    login: store.login,
    logout: store.logout,
    refreshAuth: store.refreshAuth,
  }
}
