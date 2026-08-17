import request from '@/utils/request'

import {
    approveCustomerBindMock,
    getCustomerBindListMock,
    rejectCustomerBindMock,
    submitCustomerBindMock
} from '@/mock/customer'

// 客户绑定申请列表
export function getCustomerBindList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getCustomerBindListMock(params))
    }
    return request.get({ url: '/customer.bind/lists', params }, { ignoreCancelToken: true })
}

// 提交客户绑定申请（新增/编辑）
export function submitCustomerBind(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return submitCustomerBindMock(params)
    }
    return request.post({ url: '/customer.bind/submit', params })
}

// 审核通过
export function approveCustomerBind(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return approveCustomerBindMock(params)
    }
    return request.post({ url: '/customer.bind/approve', params })
}

// 审核驳回
export function rejectCustomerBind(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return rejectCustomerBindMock(params)
    }
    return request.post({ url: '/customer.bind/reject', params })
}
