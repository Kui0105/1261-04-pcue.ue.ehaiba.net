import { MenuEnum } from '@/enums/appEnums'

/**
 * 静态菜单配置
 *
 * 由于侧边栏菜单由后端 /auth.admin/mySelf 动态下发，
 * 此处用于在本地开发/测试阶段补充固定菜单，同时作为后端配置菜单时的参考。
 * 若后端已返回同 paths 的菜单，则不会重复注入。
 */
export const STATIC_MENUS: any[] = [
    {
        type: MenuEnum.CATALOGUE,
        name: '订单管理',
        paths: 'order',
        icon: 'el-icon-Document',
        sort: 0,
        is_show: 1,
        is_disable: 0,
        children: [
            {
                type: MenuEnum.MENU,
                name: '订单列表',
                paths: 'lists',
                component: 'consumer/order/index',
                perms: 'order.order/lists',
                selected: '/consumer/order/lists',
                is_cache: 1,
                is_show: 1,
                is_disable: 0
            },
            {
                type: MenuEnum.MENU,
                name: '订单详情',
                paths: 'detail',
                component: 'consumer/order/detail',
                perms: 'order.order/detail',
                selected: '/consumer/order/lists',
                is_cache: 0,
                is_show: 0,
                is_disable: 0
            }
        ]
    }
]
