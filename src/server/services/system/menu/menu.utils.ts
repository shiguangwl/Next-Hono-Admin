/**
 * 菜单 - 工具函数
 */

import type { sysMenu } from '@/db/schema'
import { formatDateToLocal } from '@/lib/utils/date'
import type { MenuTreeNode, MenuVo } from './models'

/** 转换为菜单 VO */
export function toMenuVo(menu: typeof sysMenu.$inferSelect): MenuVo {
  return {
    id: menu.id,
    parentId: menu.parentId,
    menuType: menu.menuType,
    menuName: menu.menuName,
    permission: menu.permission,
    path: menu.path,
    component: menu.component,
    icon: menu.icon,
    sort: menu.sort,
    visible: menu.visible,
    status: menu.status,
    isExternal: menu.isExternal,
    isCache: menu.isCache,
    remark: menu.remark,
    createdAt: formatDateToLocal(menu.createdAt) ?? '',
    updatedAt: formatDateToLocal(menu.updatedAt) ?? '',
  }
}

/** 转换为菜单树节点 */
export function toMenuTreeNode(menu: typeof sysMenu.$inferSelect): MenuTreeNode {
  return { ...toMenuVo(menu) }
}

/** 从扁平列表构建菜单树 */
export function buildMenuTree(menus: MenuTreeNode[]): MenuTreeNode[] {
  const menuMap = new Map<number, MenuTreeNode>()
  const roots: MenuTreeNode[] = []

  // 第一遍：创建所有节点
  for (const menu of menus) {
    menuMap.set(menu.id, { ...menu, children: [] })
  }

  // 第二遍：建立父子关系
  for (const menu of menus) {
    const node = menuMap.get(menu.id)!
    if (menu.parentId === 0) {
      roots.push(node)
    } else {
      const parent = menuMap.get(menu.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  }

  // 递归排序
  const sortNodes = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort)
    for (const node of nodes) {
      if (node.children?.length) {
        sortNodes(node.children)
      }
    }
  }
  sortNodes(roots)

  return roots
}
