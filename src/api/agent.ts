import {
    approveAgentApplyMock,
    getAgentApplyListMock,
    getAgentCommissionListMock,
    getAgentDetailMock,
    getAgentListMock,
    rejectAgentApplyMock,
    toggleAgentStatusMock
} from '@/mock/agent'
import request from '@/utils/request'

// 代理商列表
export function getAgentList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getAgentListMock(params))
    }
    return request.get({ url: '/agent.agent/lists', params }, { ignoreCancelToken: true })
}

// 代理商状态切换
export function toggleAgentStatus(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return toggleAgentStatusMock(params)
    }
    return request.post({ url: '/agent.agent/status', params })
}

// 代理商详情
export function getAgentDetail(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getAgentDetailMock(params))
    }
    return request.get({ url: '/agent.agent/detail', params })
}

// 代理商佣金明细
export function getAgentCommissionList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getAgentCommissionListMock(params))
    }
    return request.get({ url: '/agent.agent/commission', params }, { ignoreCancelToken: true })
}

// 代理商申请列表
export function getAgentApplyList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getAgentApplyListMock(params))
    }
    return request.get({ url: '/agent.apply/lists', params }, { ignoreCancelToken: true })
}

// 审核通过
export function approveAgentApply(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return approveAgentApplyMock(params)
    }
    return request.post({ url: '/agent.apply/approve', params })
}

// 审核驳回
export function rejectAgentApply(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return rejectAgentApplyMock(params)
    }
    return request.post({ url: '/agent.apply/reject', params })
}
