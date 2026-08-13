import request from '@/utils/request'

// 用户列表
export function getUserList(params: any) {
    return request.get({ url: '/user.user/lists', params }, { ignoreCancelToken: true })
}

// 用户详情
export function getUserDetail(params: any) {
    return request.get({ url: '/user.user/detail', params })
}

// 用户编辑
export function userEdit(params: any) {
    return request.post({ url: '/user.user/edit', params })
}

// 余额调整（兼容保留）
export function adjustMoney(params: any) {
    return request.post({ url: '/user.user/adjustMoney', params })
}

// 启用 / 禁用
export function toggleUserStatus(params: any) {
    return request.post({ url: '/user.user/status', params })
}

// 余额充值
export function rechargeUser(params: any) {
    return request.post({ url: '/user.user/recharge', params })
}

// 充值发送验证码
export function sendRechargeCode(params: any) {
    return request.post({ url: '/user.user/sendRechargeCode', params })
}

// 修改预授信额度
export function updateCreditLimit(params: any) {
    return request.post({ url: '/user.user/credit', params })
}

// 修改上级
export function updateParentUser(params: any) {
    return request.post({ url: '/user.user/parent', params })
}

// 用户搜索（用于「修改上级」选择，可输入 ID/昵称/手机号）
export function searchUser(params: any) {
    return request.get({ url: '/user.user/search', params }, { ignoreCancelToken: true })
}

// 用户订单列表
export function getUserOrders(params: any) {
    return request.get({ url: '/user.user/orders', params }, { ignoreCancelToken: true })
}

// 用户交易记录
export function getUserTransactions(params: any) {
    return request.get({ url: '/user.user/transactions', params }, { ignoreCancelToken: true })
}