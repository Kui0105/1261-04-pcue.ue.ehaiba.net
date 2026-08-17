// 订单管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
// 字段与 src/views/consumer/order/* 的解析逻辑保持一致。

const ORDER_TYPE_TEXT: Record<number, string> = {
    1: '话费充值',
    2: '短信群发'
}

// 订单状态仅存在：进行中 / 已完成
const ORDER_STATUS_TEXT: Record<number, string> = {
    0: '进行中',
    1: '已完成'
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

// 基于 id 的确定性伪随机，保证同一订单每次生成的明细一致
function seedRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

function randomMobileSeed(id: number, offset: number) {
    const prefix = ['138', '139', '150', '151', '152', '157', '158', '159', '186', '187', '188']
    const r1 = seedRandom(id * 100 + offset * 7)
    const r2 = seedRandom(id * 200 + offset * 11)
    const pre = prefix[Math.floor(r1 * prefix.length)]
    const suffix = String(Math.floor(r2 * 100000000)).padStart(8, '0')
    return pre + suffix
}

// 根据订单类型与订单状态生成号码明细
// 进行中：充值中/发送中、成功、失败三种状态均存在
// 已完成：仅成功、失败两种状态（不存在进行中）
function buildItems(base: any) {
    const orderStatus = base.order_status
    const orderType = base.order_type
    const total = base.total_num
    const list: any[] = []
    for (let i = 0; i < total; i++) {
        const r = seedRandom(base.id * 1000 + i * 17)
        let status: number
        if (orderStatus == 1) {
            status = r > 0.5 ? 1 : 2
        } else {
            status = r < 0.34 ? 0 : r < 0.67 ? 1 : 2
        }
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
            mobile: randomMobileSeed(base.id, i),
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

function genOrders(total: number) {
    const list: any[] = []
    for (let i = 1; i <= total; i++) {
        const orderType = i % 3 === 0 ? 2 : 1
        const unit = orderType === 1 ? 30 : 0.1
        const taxType = i % 2 === 0 ? 1 : 2
        const totalNum = Math.floor(Math.random() * 100) + 1
        const isCompleted = Math.random() > 0.4
        let pendingNum: number
        let successNum: number
        let failNum: number
        if (isCompleted) {
            pendingNum = 0
            successNum = Math.floor(Math.random() * (totalNum + 1))
            failNum = totalNum - successNum
        } else {
            pendingNum = Math.floor(Math.random() * totalNum) + 1
            successNum = Math.floor(Math.random() * (totalNum - pendingNum + 1))
            failNum = totalNum - pendingNum - successNum
        }
        const status = isCompleted ? 1 : 0
        const payAmount = Number((totalNum * unit).toFixed(2))
        const refundAmount = Number((failNum * unit).toFixed(2))
        const order: any = {
            id: 10000 + i,
            order_sn: `OD${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}`,
            order_type: orderType,
            order_type_text: ORDER_TYPE_TEXT[orderType],
            tax_type: taxType,
            tax_type_text: TAX_TYPE_TEXT[taxType],
            total_num: totalNum,
            success_num: successNum,
            fail_num: failNum,
            pending_num: pendingNum,
            refund_amount: refundAmount,
            // 优惠折扣（折），0 表示无折扣
            discount: i % 4 === 0 ? 9 : i % 4 === 2 ? 8.5 : 0,
            pay_amount: payAmount,
            order_status: status,
            order_status_text: ORDER_STATUS_TEXT[status],
            create_time: `2026-08-${String((i % 13) + 1).padStart(2, '0')} ${String(
                10 + (i % 8)
            ).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
            user_id: 1000 + i,
            user_nickname: `测试用户${1000 + i}`,
            user_mobile: randomMobileSeed(10000 + i, 999)
        }
        order.items = buildItems(order)
        list.push(order)
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
    const base =
        ALL_ORDERS.find((item) => item.id === id) ||
        (params.order_sn ? ALL_ORDERS.find((item) => item.order_sn === params.order_sn) : null) ||
        ALL_ORDERS[0]
    const orderType = base.order_type
    const items: any[] = base.items || []
    const pendingNum = items.filter((i) => i.status === 0).length
    const successNum = items.filter((i) => i.status === 1).length
    const failNum = items.filter((i) => i.status === 2).length

    return {
        ...base,
        // 充值订单专有
        operator: orderType === 1 ? OPERATORS[base.id % OPERATORS.length] : '',
        denomination: orderType === 1 ? 30 : 0,
        unit_price: orderType === 1 ? 30 : 0.1,
        total_amount: base.pay_amount,
        // 短信订单专有
        sms_template: orderType === 2 ? '【测试】您的验证码是 123456，5分钟内有效，请勿泄露。' : '',
        // 统计卡片（基于明细实时统计，保证与明细列表一致）
        stats: {
            total_num: items.length,
            pending_num: pendingNum,
            success_num: successNum,
            fail_num: failNum,
            refund_amount: base.refund_amount
        }
    }
}

export function getOrderItemListMock(params: any = {}) {
    const id = Number(params.order_id)
    const base = ALL_ORDERS.find((item) => item.id === id) || ALL_ORDERS[0]
    let list: any[] = base.items ? [...base.items] : []

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
