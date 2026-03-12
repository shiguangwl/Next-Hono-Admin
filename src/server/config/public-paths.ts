/**
 * 公开路径配置
 * @description 定义无需会话认证的 API 路径
 */

/**
 * 无需会话认证的路径列表
 * @description 这些路径将跳过会话认证中间件
 */
const PUBLIC_PATHS = new Set(["/api/auth/login", "/api/health"]);

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path);
}
