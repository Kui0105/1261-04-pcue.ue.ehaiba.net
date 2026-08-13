// 订单管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
// 字段与 src/views/consumer/order/* 的解析逻辑保持一致。

const ORDER_TYPE_TEXT: Record<number, string> = {
    1: '话费充值',
    2: '短信群发'
}

const ORDER_STATUS_TEXT: Record<number, string> = {
    0: '进行中',
    1: '已完成',
    2: '已失败'
}

const TAX_TYPE_TEXT: Record<number, string> = {
    1: '含税',
    2: '不含税'
}

const RECHARGE_STATUS_TEXT: Record<number, string> = {
    0: '充值中',
    1: '充值成功',
    2: '充值失败'
}

const SMS_STATUS_TEXT: Record<number, string> = {
    0: '发送中',
    1: '发送成功',
    2: '发送失败'
}

const OPERATORS = ['中国移动', '中国联通', '中国电信']

function randomMobile() {
    const prefix = ['138', '139', '150', '151', '152', '157', '158', '159', '186', '187', '188']
    const pre = prefix[Math.floor(Math.random() * prefix.length)]
    const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
    return pre + suffix
}

function genOrders(total: number) {
    const list: any[] = []
    for (let i = 1; i <= total; i++) {
        const orderType = i % 3 === 0 ? 2 : 1
        const totalNum = Math.floor(Math.random() * 100) + 1
        const successNum = Math.floor(Math.random() * totalNum)
        const failNum = Math.floor(Math.random() * (totalNum - successNum))
        const pendingNum = totalNum - successNum - failNum
        const payAmount = Number((totalNum * (orderType === 1 ? 30 : 0.1)).toFixed(2))
        const refundAmount = Number((failNum * (orderType === 1 ? 30 : 0.1)).toFixed(2))
        const status = pendingNum > 0 ? 0 : successNum > 0 ? 1 : 2
        list.push({
            id: 10000 + i,
            order_sn: `OD${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}`,
            order_type: orderType,
            order_type_text: ORDER_TYPE_TEXT[orderType],
            tax_type: i % 2 === 0 ? 1 : 2,
            tax_type_text: TAX_TYPE_TEXT[i % 2 === 0 ? 1 : 2],
            total_num: totalNum,
            success_num: successNum,
            fail_num: failNum,
            pending_num: pendingNum,
            refund_amount: refundAmount,
            pay_amount: payAmount,
            order_status: status,
            order_status_text: ORDER_STATUS_TEXT[status],
            create_time: `2026-08-${String((i % 13) + 1).padStart(2, '0')} ${String(
                10 + (i % 8)
            ).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
            user_id: 1000 + i,
            user_nickname: `测试用户${1000 + i}`,
            user_mobile: randomMobile()
        })
    }
    return list
}

const ALL_ORDERS = genOrders(43)

function filterOrders(list: any[], params: any) {
    let res = [...list]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        res = res.filter(
            (item) =>
                String(item.user_id).includes(keyword) ||
                item.user_nickname.includes(keyword) ||
                item.user_mobile.includes(keyword) ||
                item.order_sn.includes(keyword)
        )
    }
    if (params.order_type !== '' && params.order_type != null) {
        res = res.filter((item) => item.order_type == params.order_type)
    }
    if (params.order_status !== '' && params.order_status != null) {
        res = res.filter((item) => item.order_status == params.order_status)
    }
    if (params.tax_type !== '' && params.tax_type != null) {
        res = res.filter((item) => item.tax_type == params.tax_type)
    }
    if (params.start_time && params.end_time) {
        res = res.filter(
            (item) => item.create_time >= params.start_time && item.create_time <= params.end_time
        )
    }
    return res
}

export function getOrderListMock(params: any = {}) {
    const list = filterOrders(ALL_ORDERS, params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size

    const totalCount = ALL_ORDERS.length
    const pendingCount = ALL_ORDERS.filter((item) => item.order_status === 0).length
    const completedCount = ALL_ORDERS.filter((item) => item.order_status === 1).length

    if (params.export === 1) {
        return {
            count: list.length,
            sum_page: Math.ceil(list.length / size),
            page_size: size,
            max_page: 50,
            all_max_size: 1000,
            file_name: '订单列表',
            page_start: 1,
            page_end: Math.ceil(list.length / size)
        }
    }

    if (params.export === 2) {
        return {}
    }

    return {
        lists: list.slice(start, start + size),
        count: list.length,
        extend: {
            total_count: totalCount,
            pending_count: pendingCount,
            completed_count: completedCount
        }
    }
}

export function getOrderDetailMock(params: any = {}) {
    const id = Number(params.id)
    const base = ALL_ORDERS.find((item) => item.id === id) || ALL_ORDERS[0]
    const orderType = base.order_type

    return {
        ...base,
        // 充值订单专有
        operator: orderType === 1 ? OPERATORS[id % OPERATORS.length] : '',
        denomination: orderType === 1 ? 30 : 0,
        unit_price: orderType === 1 ? 30 : 0.1,
        total_amount: base.pay_amount,
        // 短信订单专有
        sms_template: orderType === 2 ? '【测试】您的验证码是 123456，5分钟内有效，请勿泄露。' : '',
        // 统计卡片
        stats: {
            total_num: base.total_num,
            pending_num: base.pending_num,
            success_num: base.success_num,
            fail_num: base.fail_num,
            refund_amount: base.refund_amount
        }
    }
}

function genItems(orderType: number, total: number) {
    const list: any[] = []
    for (let i = 0; i < total; i++) {
        const status = Math.floor(Math.random() * 3)
        const resultDesc =
            status === 0
                ? '处理中'
                : status === 1
                ? orderType === 1
                    ? '充值成功'
                    : '发送成功'
                : orderType === 1
                ? '运营商返回失败'
                : '号码无效或空号'
        list.push({
            mobile: randomMobile(),
            status,
            status_text: orderType === 1 ? RECHARGE_STATUS_TEXT[status] : SMS_STATUS_TEXT[status],
            result_desc: resultDesc,
            callback_time:
                status === 0
                    ? '--'
                    : `2026-08-${String((i % 13) + 1).padStart(2, '0')} ${String(
                          10 + (i % 8)
                      ).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`
        })
    }
    return list
}

export function getOrderItemListMock(params: any = {}) {
    const id = Number(params.order_id)
    const base = ALL_ORDERS.find((item) => item.id === id) || ALL_ORDERS[0]
    let list = genItems(base.order_type, base.total_num)

    const mobile = (params.mobile || '').trim()
    if (mobile) {
        list = list.filter((item) => item.mobile.includes(mobile))
    }
    if (params.status !== '' && params.status != null) {
        list = list.filter((item) => item.status == params.status)
    }

    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size

    if (params.export === 1) {
        return {
            count: list.length,
            sum_page: Math.ceil(list.length / size),
            page_size: size,
            max_page: 50,
            all_max_size: 1000,
            file_name: '订单明细',
            page_start: 1,
            page_end: Math.ceil(list.length / size)
        }
    }

    if (params.export === 2) {
        return {}
    }

    return {
        lists: list.slice(start, start + size),
        count: list.length
    }
}
