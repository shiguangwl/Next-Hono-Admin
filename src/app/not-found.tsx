/**
 * 404 页面
 * @description 页面未找到时显示的友好错误页面
 */

import { ErrorPage } from '@/components/ui/error-page'

/**
 * 404 Not Found 页面
 */
export default function NotFound() {
  return (
    <ErrorPage
      type="notFound"
      title="页面未找到"
      description="您访问的页面不存在或已被移除，请检查地址是否正确"
      showHomeButton={true}
    />
  )
}
