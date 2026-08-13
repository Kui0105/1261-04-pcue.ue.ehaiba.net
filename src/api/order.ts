import { getOrderDetailMock, getOrderItemListMock, getOrderListMock } from '@/mock/order'
import request from '@/utils/request'

// 订单列表
export function getOrderList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getOrderListMock(params))
    }
    return request.get({ url: '/order.order/lists', params }, { ignoreCancelToken: true })
}

// 订单详情
export function getOrderDetail(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getOrderDetailMock(params))
    }
    return request.get({ url: '/order.order/detail', params })
}

// 订单明细列表（充值 / 短信等子记录）
export function getOrderItemList(params: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getOrderItemListMock(params))
    }
    return request.get({ url: '/order.order/itemLists', params }, { ignoreCancelToken: true })
}
