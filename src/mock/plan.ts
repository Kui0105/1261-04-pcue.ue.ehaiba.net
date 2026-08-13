// 方案管理 Mock 数据（仅本地预览用，受 VITE_USE_MOCK 控制）
// 字段与 src/views/plan/* 的解析逻辑保持一致。

const USER_TYPE_TEXT: Record<number, string> = {
    1: '个人',
    2: '企业'
}

const TAX_TYPE_TEXT: Record<number, string> = {
    1: '含税',
    2: '不含税'
}

function fmtMoney(n: number) {
    return Number(n.toFixed(2))
}

function calcPrice(basePrice: number, taxType: number) {
    if (taxType == 1) {
        return fmtMoney(basePrice * 1.06)
    }
    return fmtMoney(basePrice)
}

// ================== 话费充值档位 ==================
let RECHARGE_PLANS: any[] = []
for (let i = 1; i <= 12; i++) {
    const userType = i % 2 === 0 ? 2 : 1
    const taxType = i % 3 === 0 ? 2 : 1
    const basePrice = Number((10 + i * 5).toFixed(2))
    RECHARGE_PLANS.push({
        id: i,
        denomination: 30 * i,
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType),
        user_type: userType,
        user_type_text: USER_TYPE_TEXT[userType],
        sort: i,
        create_time: `2026-08-${String((i % 13) + 1).padStart(2, '0')} 10:00:00`
    })
}

function filterRechargePlans(params: any) {
    let list = [...RECHARGE_PLANS]
    if (params.user_type !== '' && params.user_type != null) {
        list = list.filter((item) => item.user_type == params.user_type)
    }
    return list
}

export function getRechargePlanListMock(params: any = {}) {
    const list = filterRechargePlans(params)
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size
    return {
        lists: list.slice(start, start + size),
        count: list.length
    }
}

export function addRechargePlanMock(params: any = {}) {
    const userType = Number(params.user_type)
    const count = RECHARGE_PLANS.filter((item) => item.user_type == userType).length
    if (count >= 6) {
        return Promise.reject({ msg: '每个用户类型最多可添加6个充值档位' })
    }
    const taxType = Number(params.tax_type)
    const basePrice = Number(params.base_price)
    const newId = RECHARGE_PLANS.length ? Math.max(...RECHARGE_PLANS.map((i) => i.id)) + 1 : 1
    RECHARGE_PLANS.push({
        id: newId,
        denomination: Number(params.denomination),
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType),
        user_type: userType,
        user_type_text: USER_TYPE_TEXT[userType],
        sort: Number(params.sort || 0),
        create_time: '2026-08-13 12:00:00'
    })
    return Promise.resolve({})
}

export function editRechargePlanMock(params: any = {}) {
    const item = RECHARGE_PLANS.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    const taxType = Number(params.tax_type)
    const basePrice = Number(params.base_price)
    Object.assign(item, {
        denomination: Number(params.denomination),
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType),
        user_type: Number(params.user_type),
        user_type_text: USER_TYPE_TEXT[Number(params.user_type)],
        sort: Number(params.sort)
    })
    return Promise.resolve({})
}

export function deleteRechargePlanMock(params: any = {}) {
    RECHARGE_PLANS = RECHARGE_PLANS.filter((i) => i.id != params.id)
    return Promise.resolve({})
}

// ================== 短信模板 ==================
let SMS_TEMPLATES: any[] = []
for (let i = 1; i <= 18; i++) {
    const taxType = i % 4 === 0 ? 2 : 1
    const basePrice = Number((0.03 + i * 0.01).toFixed(3))
    SMS_TEMPLATES.push({
        id: i,
        template_id: `TPL${String(20260813).padStart(8, '0')}${String(i).padStart(4, '0')}`,
        user_id: 1000 + i,
        user_nickname: `测试用户${1000 + i}`,
        user_mobile: `138${String(10000000 + i * 137).slice(0, 8)}`,
        signature: i % 2 === 0 ? '【测试签名】' : '【平台通知】',
        content: `您的验证码是 ${100000 + i}，5分钟内有效，请勿泄露。`,
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType),
        create_time: `2026-08-${String((i % 13) + 1).padStart(2, '0')} ${String(
            10 + (i % 8)
        ).padStart(2, '0')}:00:00`
    })
}

function filterSmsTemplates(params: any) {
    let list = [...SMS_TEMPLATES]
    const keyword = (params.keyword || '').trim()
    if (keyword) {
        list = list.filter(
            (item) =>
                item.user_nickname.includes(keyword) ||
                item.user_mobile.includes(keyword) ||
                item.signature.includes(keyword)
        )
    }
    if (params.start_time && params.end_time) {
        list = list.filter(
            (item) => item.create_time >= params.start_time && item.create_time <= params.end_time
        )
    }
    return list
}

export function getSmsTemplateListMock(params: any = {}) {
    let list = filterSmsTemplates(params)
    list = list.sort((a, b) => (a.create_time > b.create_time ? -1 : 1))
    const page = Number(params.page_no || 1)
    const size = Number(params.page_size || 20)
    const start = (page - 1) * size
    return {
        lists: list.slice(start, start + size),
        count: list.length
    }
}

export function addSmsTemplateMock(params: any = {}) {
    const taxType = Number(params.tax_type)
    const basePrice = Number(params.base_price)
    const newId = SMS_TEMPLATES.length ? Math.max(...SMS_TEMPLATES.map((i) => i.id)) + 1 : 1
    SMS_TEMPLATES.push({
        id: newId,
        template_id: params.template_id || `TPL${String(newId).padStart(6, '0')}`,
        user_id: Number(params.user_id),
        user_nickname: params.user_nickname || '--',
        user_mobile: params.user_mobile || '--',
        signature: params.signature,
        content: params.content,
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType),
        create_time: '2026-08-13 12:00:00'
    })
    return Promise.resolve({})
}

export function editSmsTemplateMock(params: any = {}) {
    const item = SMS_TEMPLATES.find((i) => i.id == params.id)
    if (!item) return Promise.reject({ msg: '数据不存在' })
    const taxType = Number(params.tax_type)
    const basePrice = Number(params.base_price)
    Object.assign(item, {
        template_id: params.template_id,
        user_id: Number(params.user_id),
        user_nickname: params.user_nickname || item.user_nickname,
        user_mobile: params.user_mobile || item.user_mobile,
        signature: params.signature,
        content: params.content,
        base_price: basePrice,
        tax_type: taxType,
        tax_type_text: TAX_TYPE_TEXT[taxType],
        price: calcPrice(basePrice, taxType)
    })
    return Promise.resolve({})
}

export function deleteSmsTemplateMock(params: any = {}) {
    SMS_TEMPLATES = SMS_TEMPLATES.filter((i) => i.id != params.id)
    return Promise.resolve({})
}
