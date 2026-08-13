import {
    addRechargePlanMock,
    addSmsTemplateMock,
    deleteRechargePlanMock,
    deleteSmsTemplateMock,
    editRechargePlanMock,
    editSmsTemplateMock,
    getRechargePlanListMock,
    getSmsTemplateListMock
} from '@/mock/plan'
import request from '@/utils/request'

// ================== 话费充值档位 ==================
export function getRechargePlanList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getRechargePlanListMock(params))
    }
    return request.get({ url: '/plan.recharge/lists', params }, { ignoreCancelToken: true })
}

export function addRechargePlan(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return addRechargePlanMock(params)
    }
    return request.post({ url: '/plan.recharge/add', params })
}

export function editRechargePlan(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return editRechargePlanMock(params)
    }
    return request.post({ url: '/plan.recharge/edit', params })
}

export function deleteRechargePlan(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return deleteRechargePlanMock(params)
    }
    return request.post({ url: '/plan.recharge/del', params })
}

// ================== 短信模板 ==================
export function getSmsTemplateList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getSmsTemplateListMock(params))
    }
    return request.get({ url: '/plan.sms/lists', params }, { ignoreCancelToken: true })
}

export function addSmsTemplate(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return addSmsTemplateMock(params)
    }
    return request.post({ url: '/plan.sms/add', params })
}

export function editSmsTemplate(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return editSmsTemplateMock(params)
    }
    return request.post({ url: '/plan.sms/edit', params })
}

export function deleteSmsTemplate(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return deleteSmsTemplateMock(params)
    }
    return request.post({ url: '/plan.sms/del', params })
}
