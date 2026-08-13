import { MenuEnum } from '@/enums/appEnums'

/**
 * 静态菜单配置
 *
 * 由于侧边栏菜单由后端 /auth.admin/mySelf 动态下发，
 * 此处用于在本地开发/测试阶段补充固定菜单，同时作为后端配置菜单时的参考。
 *
 * 结构：{ after: '已存在目录的 paths', menu: { 目录或菜单对象 } }
 * 菜单会按顺序插入到 `after` 指定目录之后；若后端已返回同 paths 的菜单，则不会重复注入。
 */
export const STATIC_MENUS: { after: string; menu: any }[] = [
    {
        after: 'consumer',
        menu: {
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
                    selected: '/order/lists',
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
                    selected: '/order/lists',
                    is_cache: 0,
                    is_show: 0,
                    is_disable: 0
                }
            ]
        }
    },
    {
        after: 'order',
        menu: {
            type: MenuEnum.CATALOGUE,
            name: '方案管理',
            paths: 'plan',
            icon: 'el-icon-SetUp',
            sort: 0,
            is_show: 1,
            is_disable: 0,
            children: [
                {
                    type: MenuEnum.MENU,
                    name: '话费充值',
                    paths: 'recharge',
                    component: 'plan/recharge/index',
                    perms: 'plan.recharge/lists',
                    selected: '/plan/recharge',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                },
                {
                    type: MenuEnum.MENU,
                    name: '短信模板',
                    paths: 'sms',
                    component: 'plan/sms/index',
                    perms: 'plan.sms/lists',
                    selected: '/plan/sms',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                }
            ]
        }
    },
    {
        after: 'plan',
        menu: {
            type: MenuEnum.CATALOGUE,
            name: '财务管理',
            paths: 'finance',
            icon: 'el-icon-Money',
            sort: 0,
            is_show: 1,
            is_disable: 0,
            children: [
                {
                    type: MenuEnum.MENU,
                    name: '交易明细',
                    paths: 'transaction',
                    component: 'finance/transaction/index',
                    perms: 'finance.transaction/lists',
                    selected: '/finance/transaction',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                },
                {
                    type: MenuEnum.MENU,
                    name: '佣金记录',
                    paths: 'commission',
                    component: 'finance/commission/index',
                    perms: 'finance.commission/lists',
                    selected: '/finance/commission',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                },
                {
                    type: MenuEnum.MENU,
                    name: '提现申请',
                    paths: 'withdraw',
                    component: 'finance/withdraw/index',
                    perms: 'finance.withdraw/lists',
                    selected: '/finance/withdraw',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                },
                {
                    type: MenuEnum.MENU,
                    name: '提现设置',
                    paths: 'setting',
                    component: 'finance/setting/index',
                    perms: 'finance.setting/get',
                    selected: '/finance/setting',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                }
            ]
        }
    },
    {
        after: 'finance',
        menu: {
            type: MenuEnum.CATALOGUE,
            name: '代理商管理',
            paths: 'agent',
            icon: 'el-icon-OfficeBuilding',
            sort: 0,
            is_show: 1,
            is_disable: 0,
            children: [
                {
                    type: MenuEnum.MENU,
                    name: '代理商列表',
                    paths: 'list',
                    component: 'agent/list/index',
                    perms: 'agent.agent/lists',
                    selected: '/agent/list',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                },
                {
                    type: MenuEnum.MENU,
                    name: '代理商申请',
                    paths: 'apply',
                    component: 'agent/apply/index',
                    perms: 'agent.apply/lists',
                    selected: '/agent/apply',
                    is_cache: 1,
                    is_show: 1,
                    is_disable: 0
                }
            ]
        }
    }
]
