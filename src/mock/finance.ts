// 财务管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
// 字段与 src/views/finance/* 的解析逻辑保持一致。

const TRANSACTION_TYPE_TEXT: Record<number, string> = {
    1: '话费充值',
    2: '短信群发',
    3: '平台充值',
    4: '平台扣减',
    5: '订单退款'
}

const ACCOUNT_TYPE_TEXT: Record<number, string> = {
    1: '系统余额',
    2: '微信支付'
}

const ORDER_TYPE_TEXT: Record<number, string> = {
    1: '话费充值',
    2: '短信群发'
}

const WITHDRAW_STATUS_TEXT: Record<number, string> = {
    0: '待审核',
    1: '待打款',
    2: '打款成功',
    3: '审核驳回'
}

function fmtMoney(n: number) {
    return Number(n.toFixed(2))
}

function fmtTime(day: number, hour: number) {
    return `2026-08-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(
        (day * hour) % 60
    ).padStart(2, '0')}:00`
}

function randomMobile(seed: number) {
    const prefix = ['138', '139', '150', '151', '152', '157', '158', '159', '186', '187', '188']
    const pre = prefix[seed % prefix.length]
    const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0')
    return pre + suffix
}

// ================== 交易明细 ==================
let TRANSACTIONS: any[] = []
for (let i = 1; i <= 60; i++) {
    const type = (i % 5) + 1
    const amount = type === 1 ? 30 : type === 2 ? fmtMoney(0.05 + (i % 10) * 0.01) : fmtMoney(10 + (i % 20) * 5)
    TRANSACTIONS.push({
        id: i,
        transaction_sn: `TX${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}`,
        order_sn: type <= 2 ? `OD${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}` : '',
        user_id: 1000 + i,
        user_nickname: `测试用户${1000 + i}`,
        user_mobile: randomMobile(i),
        transaction_type: type,
        transaction_type_text: TRANSACTION_TYPE_TEXT[type],
        amount: amount,
        balance_after: fmtMoney(1000 + i * 10 - amount),
        account_type: type === 3 || type === 5 ? 2 : 1,
        account_type_text: ACCOUNT_TYPE_TEXT[type === 3 || type === 5 ? 2 : 1],
        signature: type === 2 ? '【平台通知】' : '',
        create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
    })
}

function filterTransactions(params: any) {
    let list = [...TRANSACTIONS]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.user_nickname.includes(keyword) ||
                item.user_mobile.includes(keyword)
        )
    }
    const signature = (params.signature || '').trim()
    if (signature) {
        list = list.filter((item) => item.signature.includes(signature))
    }
    if (params.start_time && params.end_time) {
        list = list.filter(
            (item) => item.create_time >= params.start_time && item.create_time <= params.end_time
        )
    }
    return list.sort((a, b) => (a.create_time > b.create_time ? -1 : 1))
}

function computeTransactionStats(list: any[]) {
    return {
        total_recharge: list
            .filter((item) => item.transaction_type === 1 || item.transaction_type === 3)
            .reduce((sum, item) => sum + item.amount, 0),
        total_consume: list
            .filter((item) => item.transaction_type === 2 || item.transaction_type === 4)
            .reduce((sum, item) => sum + item.amount, 0),
        total_refund: list.filter((item) => item.transaction_type === 5).reduce((sum, item) => sum + item.amount, 0),
        total_credit: list.filter((item) => item.transaction_type === 4).reduce((sum, item) => sum + item.amount, 0)
    }
}

export function getTransactionListMock(params: any = {}) {
    const list = filterTransactions(params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size

    const stats = computeTransactionStats(list)

    if (params.export === 1) {
        return {
            count: list.length,
            sum_page: Math.ceil(list.length / size),
            page_size: size,
            max_page: 50,
            all_max_size: 1000,
            file_name: '交易明细',
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
        extend: stats
    }
}

// ================== 佣金记录 ==================
let COMMISSIONS: any[] = []
for (let i = 1; i <= 50; i++) {
    const orderType = i % 3 === 0 ? 2 : 1
    const payAmount = orderType === 1 ? fmtMoney(30 + (i % 10) * 10) : fmtMoney(1 + (i % 10) * 0.5)
    const level = (i % 3) + 1
    const commissionAmount = fmtMoney(payAmount * (0.05 + level * 0.02))
    COMMISSIONS.push({
        id: i,
        order_sn: `OD${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}`,
        user_id: 1000 + i,
        user_nickname: `测试用户${1000 + i}`,
        user_mobile: randomMobile(i + 100),
        order_type: orderType,
        order_type_text: ORDER_TYPE_TEXT[orderType],
        pay_amount: payAmount,
        agent_id: 2000 + (i % 5),
        agent_nickname: `代理商${2000 + (i % 5)}`,
        agent_mobile: randomMobile(i + 200),
        distribution_level: level,
        commission_amount: commissionAmount,
        create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
    })
}

function filterCommissions(params: any) {
    let list = [...COMMISSIONS]
    const orderSn = (params.order_sn || '').trim()
    if (orderSn) {
        list = list.filter((item) => item.order_sn.includes(orderSn))
    }
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.user_nickname.includes(keyword) ||
                item.user_mobile.includes(keyword)
        )
    }
    const agentKeyword = (params.agent_keyword || '').trim()
    if (agentKeyword) {
        list = list.filter(
            (item) =>
                item.agent_nickname.includes(agentKeyword) ||
                item.agent_mobile.includes(agentKeyword)
        )
    }
    if (params.start_time && params.end_time) {
        list = list.filter(
            (item) => item.create_time >= params.start_time && item.create_time <= params.end_time
        )
    }
    return list.sort((a, b) => (a.create_time > b.create_time ? -1 : 1))
}

function computeCommissionStats(list: any[]) {
    return {
        total_commission: list.reduce((sum, item) => sum + item.commission_amount, 0),
        total_withdrawn: fmtMoney(list.reduce((sum, item) => sum + item.commission_amount, 0) * 0.3),
        withdrawing: fmtMoney(list.reduce((sum, item) => sum + item.commission_amount, 0) * 0.1),
        pending: fmtMoney(list.reduce((sum, item) => sum + item.commission_amount, 0) * 0.6)
    }
}

export function getCommissionListMock(params: any = {}) {
    const list = filterCommissions(params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size

    const stats = computeCommissionStats(list)

    if (params.export === 1) {
        return {
            count: list.length,
            sum_page: Math.ceil(list.length / size),
            page_size: size,
            max_page: 50,
            all_max_size: 1000,
            file_name: '佣金记录',
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
        extend: stats
    }
}

// ================== 提现申请 ==================
let WITHDRAWS: any[] = []
const BANKS = ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行']
for (let i = 1; i <= 48; i++) {
    const status = i % 4
    const amount = fmtMoney(50 + (i % 20) * 50)
    const feeRate = 0.02
    const fee = fmtMoney(amount * feeRate)
    const paymentAmount = fmtMoney(amount - fee)
    WITHDRAWS.push({
        id: i,
        withdraw_sn: `WD${String(20260813).padStart(8, '0')}${String(i).padStart(5, '0')}`,
        agent_id: 2000 + (i % 5),
        agent_nickname: `代理商${2000 + (i % 5)}`,
        agent_mobile: randomMobile(i + 300),
        amount,
        fee,
        payment_amount: paymentAmount,
        account_name: `收款人${i}`,
        bank_name: BANKS[i % BANKS.length],
        account_number: `6222${String(i).padStart(12, '0')}`,
        status,
        status_text: WITHDRAW_STATUS_TEXT[status],
        reject_reason: status === 3 ? '信息填写不完整' : '',
        voucher_url: status === 2 ? 'https://example.com/voucher.png' : '',
        create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
    })
}

function filterWithdraws(params: any) {
    let list = [...WITHDRAWS]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.agent_nickname.includes(keyword) ||
                item.agent_mobile.includes(keyword)
        )
    }
    if (params.status !== '' && params.status != null) {
        list = list.filter((item) => item.status == params.status)
    }
    if (params.start_time && params.end_time) {
        list = list.filter(
            (item) => item.create_time >= params.start_time && item.create_time <= params.end_time
        )
    }
    return list.sort((a, b) => (a.create_time > b.create_time ? -1 : 1))
}

export function getWithdrawListMock(params: any = {}) {
    const list = filterWithdraws(params)
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
            file_name: '提现申请',
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

export function auditWithdrawMock(params: any = {}) {
    const item = WITHDRAWS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = 1
    item.status_text = WITHDRAW_STATUS_TEXT[1]
    return Promise.resolve({})
}

export function rejectWithdrawMock(params: any = {}) {
    const item = WITHDRAWS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = 3
    item.status_text = WITHDRAW_STATUS_TEXT[3]
    item.reject_reason = params.reject_reason || ''
    return Promise.resolve({})
}

export function confirmWithdrawMock(params: any = {}) {
    const item = WITHDRAWS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = 2
    item.status_text = WITHDRAW_STATUS_TEXT[2]
    item.voucher_url = params.voucher_url || item.voucher_url || 'https://example.com/voucher.png'
    return Promise.resolve({})
}

// ================== 提现设置 ==================
let WITHDRAW_SETTING = {
    min_amount: 100,
    single_max_amount: 50000,
    daily_max_amount: 200000,
    fee_rate: 2
}

export function getWithdrawSettingMock(_params?: any) {
    return { ...WITHDRAW_SETTING }
}

export function saveWithdrawSettingMock(params: any = {}) {
    WITHDRAW_SETTING = {
        min_amount: Number(params.min_amount),
        single_max_amount: Number(params.single_max_amount),
        daily_max_amount: Number(params.daily_max_amount),
        fee_rate: Number(params.fee_rate)
    }
    return Promise.resolve({})
}
