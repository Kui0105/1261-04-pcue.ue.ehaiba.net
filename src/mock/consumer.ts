// 用户管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
// 字段与 src/views/consumer/lists/* 的解析逻辑保持一致。

function genUsers(total: number) {
    const list: any[] = []
    for (let i = 1; i <= total; i++) {
        const userType = i % 3 === 0 ? 2 : 1 // 企业 / 个人
        const status = i % 5 === 0 ? 0 : 1 // 部分禁用
        const parent = i % 4 === 0
        list.push({
            id: 1000 + i,
            avatar: '',
            nickname: `测试用户${1000 + i}`,
            mobile: `138${String(10000000 + i * 137).slice(0, 8)}`,
            user_type: userType,
            user_type_text: userType === 2 ? '企业' : '个人',
            parent_user: parent
                ? { id: 1000 + i - 1, nickname: `测试用户${1000 + i - 1}` }
                : null,
            user_money: Number((Math.random() * 5000).toFixed(2)),
            status,
            create_time: `2026-0${((i % 8) + 1)}-${String((i % 27) + 1).padStart(2, '0')} 10:00:00`
        })
    }
    return list
}

const ALL_USERS = genUsers(63)

function filterUsers(list: any[], params: any) {
    const kw = (params.keyword || '').trim()
    let res = [...list]
    if (kw) {
        res = res.filter(
            (u) =>
                String(u.id).includes(kw) ||
                u.nickname.includes(kw) ||
                u.mobile.includes(kw)
        )
    }
    if (params.user_type !== '' && params.user_type != null) {
        res = res.filter((u) => u.user_type == params.user_type)
    }
    return res
}

export function getUserListMock(params: any = {}) {
    const list = filterUsers(ALL_USERS, params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 15)
    const start = (page - 1) * size
    return {
        lists: list.slice(start, start + size),
        count: list.length,
        extend: {}
    }
}

export function getUserDetailMock(params: any = {}) {
    const id = Number(params.id)
    const base = ALL_USERS.find((u) => u.id === id) || ALL_USERS[0]
    return {
        ...base,
        credit_limit: 1000,
        total_recharge: 12800.5,
        total_consume: 9600.3
    }
}

export function searchUserMock(params: any = {}) {
    let list = filterUsers(ALL_USERS, params)
    if (params.exclude_id) {
        list = list.filter((u) => u.id != params.exclude_id)
    }
    return { lists: list.slice(0, 20) }
}

export function getUserOrdersMock(params: any = {}) {
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 15)
    const total = 28
    const lists: any[] = []
    for (let i = 0; i < Math.min(size, total - (page - 1) * size); i++) {
        const idx = (page - 1) * size + i
        lists.push({
            order_sn: `NO${String(20260813).padStart(8, '0')}${String(idx + 1).padStart(4, '0')}`,
            order_type_text: idx % 2 === 0 ? '话费充值' : '短信群发',
            order_amount: Number((20 + Math.random() * 200).toFixed(2)),
            pay_amount: Number((20 + Math.random() * 200).toFixed(2)),
            order_status_text: idx % 4 === 0 ? '已取消' : '已完成',
            create_time: `2026-08-${String((idx % 13) + 1).padStart(2, '0')} 12:00:00`
        })
    }
    return { lists, count: total }
}

export function getUserTransactionsMock(params: any = {}) {
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 15)
    const total = 40
    const lists: any[] = []
    for (let i = 0; i < Math.min(size, total - (page - 1) * size); i++) {
        const idx = (page - 1) * size + i
        const change = idx % 2 === 0 ? 100 + i : -(50 + i)
        lists.push({
            sn: `TXN${String(20260813).padStart(8, '0')}${String(idx + 1).padStart(4, '0')}`,
            type_text: change >= 0 ? '充值' : '消费',
            change_amount: change,
            after_money: 5000 + change,
            remark: change >= 0 ? '后台充值' : '订单扣款',
            create_time: `2026-08-${String((idx % 13) + 1).padStart(2, '0')} 12:00:00`
        })
    }
    return { lists, count: total }
}
