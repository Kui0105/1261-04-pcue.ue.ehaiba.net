// 客户管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）

import { timeFormat } from '@/utils/util'

const STATUS_MAP: Record<number, string> = {
    0: '待审核',
    1: '审核通过',
    2: '审核驳回'
}

function genBindings(total: number) {
    const list: any[] = []
    for (let i = 1; i <= total; i++) {
        const userType = i % 3 === 0 ? 2 : 1
        // 0 待审核 / 1 审核通过 / 2 审核驳回
        const status = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() - (i % 30))
        baseDate.setHours(10 + (i % 12), i % 60, 0, 0)
        const createTime = timeFormat(baseDate.getTime(), 'yyyy-mm-dd hh:MM:ss')
        list.push({
            id: 5000 + i,
            user_id: 1000 + i,
            nickname: `测试用户${1000 + i}`,
            mobile: `138${String(10000000 + i * 137).slice(0, 8)}`,
            real_name: `客户${i}`,
            user_type: userType,
            user_type_text: userType === 2 ? '企业' : '个人',
            deal_images: status === 0 || status === 2 ? ['https://picsum.photos/200/200?random=' + i] : [],
            status,
            status_text: STATUS_MAP[status],
            reject_reason: status === 2 ? '资料不完整，请补充后重新提交' : '',
            create_time: createTime
        })
    }
    return list
}

let ALL_BINDINGS = genBindings(35)

function filterBindings(list: any[], params: any) {
    let res = [...list]
    const kw = (params.keyword || '').trim()
    if (kw) {
        res = res.filter(
            (item) =>
                String(item.user_id).includes(kw) ||
                item.nickname.includes(kw) ||
                item.mobile.includes(kw) ||
                item.real_name.includes(kw)
        )
    }
    if (params.status !== '' && params.status != null) {
        res = res.filter((item) => item.status == params.status)
    }
    if (params.start_time && params.end_time) {
        const start = new Date(params.start_time).getTime()
        const end = new Date(params.end_time).getTime()
        res = res.filter((item) => {
            const t = new Date(item.create_time).getTime()
            return t >= start && t <= end
        })
    }
    // 按时间倒序
    res.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime())
    return res
}

export function getCustomerBindListMock(params: any = {}) {
    const filtered = filterBindings(ALL_BINDINGS, params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size
    return {
        lists: filtered.slice(start, start + size),
        count: filtered.length,
        extend: {}
    }
}

export function submitCustomerBindMock(params: any = {}) {
    const id = Number(params.id || 0)
    const now = timeFormat(Date.now(), 'yyyy-mm-dd hh:MM:ss')
    if (id) {
        const idx = ALL_BINDINGS.findIndex((item) => item.id === id)
        if (idx !== -1) {
            ALL_BINDINGS[idx] = {
                ...ALL_BINDINGS[idx],
                user_id: params.user_id,
                nickname: params.nickname || ALL_BINDINGS[idx].nickname,
                mobile: params.mobile || ALL_BINDINGS[idx].mobile,
                real_name: params.real_name || ALL_BINDINGS[idx].real_name,
                user_type: params.user_type ?? ALL_BINDINGS[idx].user_type,
                user_type_text: params.user_type === 2 ? '企业' : '个人',
                deal_images: params.deal_images || ALL_BINDINGS[idx].deal_images,
                status: 0,
                status_text: STATUS_MAP[0],
                reject_reason: '',
                create_time: now
            }
        }
    } else {
        const nextId = (ALL_BINDINGS[ALL_BINDINGS.length - 1]?.id || 5000) + 1
        ALL_BINDINGS.unshift({
            id: nextId,
            user_id: params.user_id,
            nickname: params.nickname || `客户${nextId}`,
            mobile: params.mobile || '',
            real_name: params.real_name || '',
            user_type: params.user_type || 1,
            user_type_text: params.user_type === 2 ? '企业' : '个人',
            deal_images: params.deal_images || [],
            status: 0,
            status_text: STATUS_MAP[0],
            reject_reason: '',
            create_time: now
        })
    }
    return Promise.resolve({})
}

export function approveCustomerBindMock(params: any = {}) {
    const id = Number(params.id)
    const item = ALL_BINDINGS.find((item) => item.id === id)
    if (item) {
        item.status = 1
        item.status_text = STATUS_MAP[1]
        item.reject_reason = ''
    }
    return Promise.resolve({})
}

export function rejectCustomerBindMock(params: any = {}) {
    const id = Number(params.id)
    const item = ALL_BINDINGS.find((item) => item.id === id)
    if (item) {
        item.status = 2
        item.status_text = STATUS_MAP[2]
        item.reject_reason = params.reject_reason || ''
    }
    return Promise.resolve({})
}
