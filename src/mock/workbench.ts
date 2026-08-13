// workbench 页面 Mock 数据（仅开发环境使用，生产构建不打包）
// 字段需与前端 src/views/workbench/index.vue 的 getData 解析逻辑保持一致。

function rangeDays(range: string, params?: any): number {
    switch (range) {
        case 'today':
            return 1
        case '7d':
            return 7
        case '30d':
            return 30
        case 'all':
            return 90
        case 'custom': {
            if (params?.start_time && params?.end_time) {
                const d =
                    (new Date(params.end_time).getTime() -
                        new Date(params.start_time).getTime()) /
                    86400000
                return Math.max(1, Math.round(d))
            }
            return 14
        }
        default:
            return 30
    }
}

function genLabels(days: number, granularity: string): string[] {
    const labels: string[] = []
    const now = new Date()
    if (granularity === 'month') {
        const months = Math.min(Math.max(days, 1), 12)
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            labels.push(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            )
        }
    } else if (granularity === 'week') {
        const weeks = Math.max(1, Math.round(days / 7))
        for (let i = weeks - 1; i >= 0; i--) {
            labels.push(`第${weeks - i}周`)
        }
    } else {
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000)
            labels.push(
                `${String(d.getMonth() + 1).padStart(2, '0')}-${String(
                    d.getDate()
                ).padStart(2, '0')}`
            )
        }
    }
    return labels
}

// 生成一条确定性的波动序列（不同筛选会得到不同曲线，方便演示联动）
function genSeries(len: number, base: number, amp: number): number[] {
    const arr: number[] = []
    for (let i = 0; i < len; i++) {
        const v = base + amp * Math.sin(i / 2) + (i % 3) * base * 0.1
        arr.push(Math.round(v))
    }
    return arr
}

export function getWorkbenchMock(params: any = {}) {
    const range = params.range || 'today'
    const days = rangeDays(range, params)
    const orderG = params.order_granularity || 'day'
    const typeG = params.order_type_granularity || 'day'

    const orderLabels = genLabels(days, orderG)
    const typeLabels = genLabels(days, typeG)

    // 卡片：根据筛选范围缩放总量，便于直观看到“筛选变更数据”
    const scale =
        range === 'today'
            ? 0.03
            : range === '7d'
            ? 0.2
            : range === '30d'
            ? 0.6
            : 1

    const today = {
        time: new Date().toLocaleString('zh-CN'),
        today_visit: Math.round(1280 * scale),
        total_visit: 86420,
        today_order: Math.round(326 * scale),
        total_order: 19876,
        today_recharge: Number((5680.5 * scale).toFixed(2)),
        total_recharge: 342189.2,
        today_refund: Number((320.0 * scale).toFixed(2)),
        total_refund: 18960.5
    }

    return {
        today,
        // 订单趋势图（折线）：一维数组
        orderTrend: {
            date: orderLabels,
            list: genSeries(orderLabels.length, 200, 80)
        },
        // 订单类型趋势图（堆叠）：三维数组 [普通, 团购, 秒杀]
        orderType: {
            date: typeLabels,
            list: [
                genSeries(typeLabels.length, 120, 40),
                genSeries(typeLabels.length, 60, 25),
                genSeries(typeLabels.length, 30, 15)
            ]
        }
    }
}
