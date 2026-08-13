// 代理商管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）

const AGENT_STATUS_TEXT: Record<number, string> = {
    0: '禁用',
    1: '启用'
}

const APPLY_STATUS_TEXT: Record<number, string> = {
    0: '待审核',
    1: '审核通过',
    2: '审核驳回'
}

const USER_TYPE_TEXT: Record<number, string> = {
    1: '个人',
    2: '企业'
}

const ORDER_TYPE_TEXT: Record<number, string> = {
    1: '话费充值',
    2: '短信群发'
}

const BANKS = ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行']

const SURNAMES = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙']
const GIVEN = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇', '艳', '杰']

function genRealName(seed: number) {
    return SURNAMES[seed % SURNAMES.length] + GIVEN[(seed * 3) % GIVEN.length]
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

function seedRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

// ================== 代理商列表 ==================
let AGENTS: any[] = []
for (let i = 1; i <= 40; i++) {
    const userType = i % 3 === 0 ? 2 : 1
    const status = i % 5 === 0 ? 0 : 1
    const totalCommission = fmtMoney(500 + i * 50 + seedRandom(i) * 200)
    AGENTS.push({
        id: 3000 + i,
        user_id: 1000 + i,
        nickname: `代理商${2000 + i}`,
        mobile: randomMobile(i + 500),
        real_name: genRealName(i),
        contact_phone: randomMobile(i + 700),
        user_type: userType,
        user_type_text: USER_TYPE_TEXT[userType],
        email: `agent${2000 + i}@example.com`,
        business_license: `https://example.com/license/${i}.png`,
        commission_account: `${BANKS[i % BANKS.length]} ${String(6222 + i).padStart(4, '0')} **** ${String(i).padStart(4, '0')}`,
        status,
        status_text: AGENT_STATUS_TEXT[status],
        total_commission: totalCommission,
        withdrawn_commission: fmtMoney(totalCommission * 0.4),
        commission_balance: fmtMoney(totalCommission * 0.6),
        create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
    })
}

function filterAgents(params: any) {
    let list = [...AGENTS]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.nickname.includes(keyword) ||
                item.mobile.includes(keyword) ||
                item.real_name.includes(keyword) ||
                item.contact_phone.includes(keyword)
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

export function getAgentListMock(params: any = {}) {
    const list = filterAgents(params)
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
            file_name: '代理商列表',
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

export function toggleAgentStatusMock(params: any = {}) {
    const item = AGENTS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = Number(params.status)
    item.status_text = AGENT_STATUS_TEXT[item.status]
    return Promise.resolve({})
}

export function getAgentDetailMock(params: any = {}) {
    const item = AGENTS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    return { ...item }
}

// ================== 代理商佣金明细 ==================
export function getAgentCommissionListMock(params: any = {}) {
    const agentId = Number(params.agent_id)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size

    const list: any[] = []
    const base = AGENTS.find((i) => i.id === agentId)
    if (base) {
        for (let i = 1; i <= 12; i++) {
            const orderType = i % 3 === 0 ? 2 : 1
            const payAmount = orderType === 1 ? fmtMoney(30 + (i % 10) * 10) : fmtMoney(1 + i * 0.5)
            const level = (i % 2) + 1
            list.push({
                id: i,
                order_sn: `OD${String(20260813).padStart(8, '0')}${String(agentId - 3000).padStart(3, '0')}${String(i).padStart(3, '0')}`,
                user_id: 1000 + i,
                user_nickname: `测试用户${1000 + i}`,
                user_mobile: randomMobile(i + 800 + agentId),
                order_type: orderType,
                order_type_text: ORDER_TYPE_TEXT[orderType],
                pay_amount: payAmount,
                distribution_level: level,
                distribution_level_text: level === 1 ? '一级' : '二级',
                commission_amount: fmtMoney(payAmount * (0.05 + level * 0.02)),
                create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
            })
        }
    }

    if (params.export === 1) {
        return {
            count: list.length,
            sum_page: Math.ceil(list.length / size),
            page_size: size,
            max_page: 50,
            all_max_size: 1000,
            file_name: '佣金明细',
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

// ================== 代理商申请 ==================
let AGENT_APPLIES: any[] = []
for (let i = 1; i <= 36; i++) {
    const userType = i % 3 === 0 ? 2 : 1
    const status = i % 3
    AGENT_APPLIES.push({
        id: 4000 + i,
        user_id: 1000 + i,
        nickname: `申请人${i}`,
        mobile: randomMobile(i + 600),
        real_name: genRealName(i + 50),
        contact_phone: randomMobile(i + 800),
        user_type: userType,
        user_type_text: USER_TYPE_TEXT[userType],
        email: `user${i}@example.com`,
        business_license: `https://example.com/license/apply${i}.png`,
        status,
        status_text: APPLY_STATUS_TEXT[status],
        reject_reason: status === 2 ? '资质材料不清晰' : '',
        create_time: fmtTime((i % 13) + 1, 10 + (i % 8))
    })
}

function filterApplies(params: any) {
    let list = [...AGENT_APPLIES]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.nickname.includes(keyword) ||
                item.mobile.includes(keyword) ||
                item.real_name.includes(keyword) ||
                item.contact_phone.includes(keyword)
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

export function getAgentApplyListMock(params: any = {}) {
    const list = filterApplies(params)
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
            file_name: '代理商申请',
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

export function approveAgentApplyMock(params: any = {}) {
    const item = AGENT_APPLIES.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = 1
    item.status_text = APPLY_STATUS_TEXT[1]
    return Promise.resolve({})
}

export function rejectAgentApplyMock(params: any = {}) {
    const item = AGENT_APPLIES.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    item.status = 2
    item.status_text = APPLY_STATUS_TEXT[2]
    item.reject_reason = params.reject_reason || ''
    return Promise.resolve({})
}
