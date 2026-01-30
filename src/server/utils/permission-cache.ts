const CACHE_TTL = 5 * 60 * 1000

interface PermissionCacheEntry {
  permissions: string[]
  expireAt: number
}

const permissionCache = new Map<number, PermissionCacheEntry>()

export async function getCachedPermissions(
  adminId: number,
  fetchPermissions: (adminId: number) => Promise<string[]>
): Promise<string[]> {
  const cached = permissionCache.get(adminId)
  if (cached && cached.expireAt > Date.now()) {
    return cached.permissions
  }

  const permissions = await fetchPermissions(adminId)
  permissionCache.set(adminId, { permissions, expireAt: Date.now() + CACHE_TTL })
  return permissions
}

export function invalidatePermissionCache(adminId: number): void {
  permissionCache.delete(adminId)
}

export function invalidateAllPermissionCache(): void {
  permissionCache.clear()
}

export function getPermissionCacheSize(): number {
  return permissionCache.size
}
