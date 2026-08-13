// 管理员用户绑定 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
import { getUserListMock } from '@/mock/consumer'

// admin_id -> 已绑定用户 id 列表（内存态，仅会话内有效）
const ADMIN_BIND_USERS: Record<number, number[]> = {}

// 获取某管理员已绑定的用户列表
export function getAdminBindUsersMock(params: any = {}) {
    const adminId = Number(params.admin_id)
    const ids = ADMIN_BIND_USERS[adminId] || []
    const all = getUserListMock({ page_no: 1, page_size: 9999 }).lists
    const bound = all.filter((u: any) => ids.includes(u.id))
    return { lists: bound, count: bound.length }
}

// 设置某管理员绑定的用户
export function setAdminBindUsersMock(params: any = {}) {
    const adminId = Number(params.admin_id)
    ADMIN_BIND_USERS[adminId] = (params.user_ids || []).map((x: any) => Number(x))
    return {}
}
