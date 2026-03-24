/**
 * 认证状态 Hook
 * @description 使用 Zustand 管理认证状态
 */

import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { getApiClient, unwrapApiData } from '@/lib/client'
import type { AuthInfoResult, LoginResult } from '@/server/routes/auth/dtos'

/**
 * 认证状态类型
 */
interface AuthState {
  /** 管理员信息 */
  admin: LoginResult['admin'] | null
  /** 权限标识列表 */
  permissions: string[]
  /** 菜单树 */
  menus: LoginResult['menus']
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
  logout: () => Promise<void>
  /** 刷新认证信息 */
  refreshAuth: () => Promise<void>
  /** 设置初始化状态 */
  setInitialized: (initialized: boolean) => void
}

/**
 * 认证 Store 类型
 */
type AuthStore = AuthState & AuthActions

/**
 * 初始状态
 */
const initialState: AuthState = {
  admin: null,
  permissions: [],
  menus: [],
  initialized: false,
  loading: false,
}

/**
 * 认证 Store
 */
export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,

  login: async (username: string, password: string) => {
    set({ loading: true })
    try {
      const response = await getApiClient().auth.login.$post({
        json: { username, password },
      })

      const data = await unwrapApiData<LoginResult>(response, '登录失败')
      set({
        admin: data.admin,
        permissions: data.permissions,
        menus: data.menus,
        initialized: true,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await getApiClient().auth.logout.$post()
    } catch (err) {
      console.warn('[auth] logout API failed:', err)
    } finally {
      set({ ...initialState, initialized: true })
    }
  },

  refreshAuth: async () => {
    set({ loading: true })
    try {
      const response = await getApiClient().auth.info.$get()

      if (!response.ok && [401, 403].includes(Number(response.status))) {
        set({ ...initialState, initialized: true })
        return
      }

      const data = await unwrapApiData<AuthInfoResult>(response, '获取认证信息失败')
      set({
        admin: data.admin,
        permissions: data.permissions,
        menus: data.menus,
        initialized: true,
        loading: false,
      })
    } catch {
      set({ ...initialState, initialized: true })
    }
  },

  setInitialized: (initialized: boolean) => {
    set({ initialized })
  },
}))

/**
 * 认证 Hook
 * @description 提供认证状态和操作方法
 */
export function useAuth() {
  const store = useAuthStore(
    useShallow((s) => ({
      admin: s.admin,
      permissions: s.permissions,
      menus: s.menus,
      initialized: s.initialized,
      loading: s.loading,
      login: s.login,
      logout: s.logout,
      refreshAuth: s.refreshAuth,
    }))
  )

  return {
    ...store,
    isAuthenticated: !!store.admin,
  }
}
