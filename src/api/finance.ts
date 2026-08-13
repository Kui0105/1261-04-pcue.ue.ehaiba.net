import {
    auditWithdrawMock,
    confirmWithdrawMock,
    getCommissionListMock,
    getTransactionListMock,
    getWithdrawListMock,
    getWithdrawSettingMock,
    rejectWithdrawMock,
    saveWithdrawSettingMock
} from '@/mock/finance'
import request from '@/utils/request'

// ================== 交易明细 ==================
export function getTransactionList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getTransactionListMock(params))
    }
    return request.get({ url: '/finance.transaction/lists', params }, { ignoreCancelToken: true })
}

// ================== 佣金记录 ==================
export function getCommissionList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getCommissionListMock(params))
    }
    return request.get({ url: '/finance.commission/lists', params }, { ignoreCancelToken: true })
}

// ================== 提现申请 ==================
export function getWithdrawList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getWithdrawListMock(params))
    }
    return request.get({ url: '/finance.withdraw/lists', params }, { ignoreCancelToken: true })
}

export function approveWithdraw(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return auditWithdrawMock({ ...params, action: 'approve' })
    }
    return request.post({ url: '/finance.withdraw/approve', params })
}

export function rejectWithdraw(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return rejectWithdrawMock(params)
    }
    return request.post({ url: '/finance.withdraw/reject', params })
}

export function confirmWithdraw(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return confirmWithdrawMock(params)
    }
    return request.post({ url: '/finance.withdraw/confirm', params })
}

// ================== 提现设置 ==================
export function getWithdrawSetting(params?: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getWithdrawSettingMock(params))
    }
    return request.get({ url: '/finance.setting/get', params })
}

export function saveWithdrawSetting(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return saveWithdrawSettingMock(params)
    }
    return request.post({ url: '/finance.setting/save', params })
}
