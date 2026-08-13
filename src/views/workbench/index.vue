<template>
    <div class="workbench">
        <!-- 顶部时间筛选 -->
        <el-card class="!border-none mb-4" shadow="never">
            <div class="flex flex-wrap items-center gap-3">
                <span class="text-tx-regular font-medium">时间范围：</span>
                <el-radio-group
                    v-model="filter.range"
                    @change="handleRangeChange"
                >
                    <el-radio-button label="all">全部</el-radio-button>
                    <el-radio-button label="7d">近7天</el-radio-button>
                    <el-radio-button label="30d">近30天</el-radio-button>
                    <el-radio-button label="custom">自定义时间段</el-radio-button>
                </el-radio-group>
                <template v-if="filter.range === 'custom'">
                    <el-date-picker
                        v-model="filter.customRange"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        @change="getData"
                        class="!w-[220px]"
                    />
                </template>
                <el-button
                    type="primary"
                    plain
                    :icon="Refresh"
                    @click="resetFilter"
                >
                    重置（全部）
                </el-button>
                <span class="text-tx-secondary text-xs ml-auto">
                    更新时间：{{ workbenchData.today.time || '--' }}
                </span>
            </div>
        </el-card>

        <!-- 数据卡片：访问量 / 订单数 / 充值金额 / 退款金额 -->
        <el-card class="!border-none mb-4" shadow="never">
            <div class="flex flex-wrap">
                <div
                    v-for="card in cards"
                    :key="card.key"
                    class="stat-card"
                    :class="{ 'is-active': activeCard === card.key }"
                    @click="selectCard(card.key)"
                >
                    <div class="leading-10 text-tx-regular">{{ card.label }}</div>
                    <div class="text-4xl font-semibold mt-1">
                        {{ workbenchData.today[card.valueKey] ?? 0 }}
                    </div>
                    <div class="text-tx-secondary text-xs mt-1">
                        总：{{ workbenchData.today[card.totalKey] ?? 0 }}
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 图表区域：订单趋势图 + 订单类型趋势图 -->
        <div class="lg:flex gap-4">
            <el-card class="!border-none w-full lg:w-1/2" shadow="never">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="card-title">订单趋势图</span>
                        <el-radio-group
                            v-model="orderTrend.granularity"
                            size="small"
                            @change="getData"
                        >
                            <el-radio-button label="day">按日</el-radio-button>
                            <el-radio-button label="week">按周</el-radio-button>
                            <el-radio-button label="month">按月</el-radio-button>
                        </el-radio-group>
                    </div>
                </template>
                <v-charts
                    style="height: 350px"
                    :option="orderTrend.option"
                    :autoresize="true"
                    @click="onChartClick('orderTrend')"
                />
            </el-card>

            <el-card class="!border-none w-full lg:w-1/2 mt-4 lg:mt-0" shadow="never">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="card-title">订单类型趋势图</span>
                        <el-radio-group
                            v-model="orderType.granularity"
                            size="small"
                            @change="getData"
                        >
                            <el-radio-button label="day">按日</el-radio-button>
                            <el-radio-button label="week">按周</el-radio-button>
                            <el-radio-button label="month">按月</el-radio-button>
                        </el-radio-group>
                    </div>
                </template>
                <v-charts
                    style="height: 350px"
                    :option="orderType.option"
                    :autoresize="true"
                    @click="onChartClick('orderType')"
                />
            </el-card>
        </div>
    </div>
</template>

<script lang="ts" setup name="workbench">
import { Refresh } from '@element-plus/icons-vue'
import vCharts from 'vue-echarts'

import { getWorkbench } from '@/api/app'

// ============ 筛选条件 ============
const defaultFilter = () => ({
    range: 'all' as 'today' | 'all' | '7d' | '30d' | 'custom',
    customRange: [] as string[]
})
const filter = reactive(defaultFilter())

// 当前选中的数据卡片（点击会联动筛选）
const activeCard = ref<string>('')

const cards = [
    { key: 'visit', label: '访问量', valueKey: 'today_visit', totalKey: 'total_visit' },
    { key: 'order', label: '订单数', valueKey: 'today_order', totalKey: 'total_order' },
    { key: 'recharge', label: '充值金额', valueKey: 'today_recharge', totalKey: 'total_recharge' },
    { key: 'refund', label: '退款金额', valueKey: 'today_refund', totalKey: 'total_refund' }
]

// ============ 图表配置 ============
const orderTrend = reactive({
    granularity: 'day' as 'day' | 'week' | 'month',
    option: buildLineOption('订单数', '#4A5DFF')
})

const orderType = reactive({
    granularity: 'day' as 'day' | 'week' | 'month',
    option: buildStackOption()
})

function buildLineOption(name: string, color: string) {
    return {
        tooltip: { trigger: 'axis' },
        legend: { data: [name] },
        grid: { left: 40, right: 20, top: 40, bottom: 40 },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: { type: 'value' },
        series: [
            {
                name,
                data: [],
                type: 'line',
                smooth: true,
                lineStyle: { color, width: 2 },
                itemStyle: { color },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color },
                            { offset: 1, color: 'rgba(74,93,255,0.08)' }
                        ]
                    },
                    opacity: 0.3
                }
            }
        ]
    }
}

function buildStackOption() {
    return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['普通订单', '团购订单', '秒杀订单'] },
        grid: { left: 40, right: 20, top: 40, bottom: 40 },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: { type: 'value' },
        series: [
            { name: '普通订单', type: 'line', smooth: true, data: [], areaStyle: {} },
            { name: '团购订单', type: 'line', smooth: true, data: [], areaStyle: {} },
            { name: '秒杀订单', type: 'line', smooth: true, data: [], areaStyle: {} }
        ]
    }
}

// ============ 顶部数据汇总 ============
const workbenchData = reactive<any>({
    today: {
        time: '',
        today_visit: 0,
        total_visit: 0,
        today_order: 0,
        total_order: 0,
        today_recharge: 0,
        total_recharge: 0,
        today_refund: 0,
        total_refund: 0
    }
})

// ============ 行为 ============
function selectCard(key: string) {
    activeCard.value = activeCard.value === key ? '' : key
    getData()
}

function resetFilter() {
    Object.assign(filter, defaultFilter())
    activeCard.value = ''
    orderTrend.granularity = 'day'
    orderType.granularity = 'day'
    getData()
}

function handleRangeChange() {
    // 切到非 custom 时直接拉数据
    if (filter.range !== 'custom') {
        filter.customRange = []
        getData()
    }
}

function onChartClick(_key: 'orderTrend' | 'orderType') {
    // 点击图表点位：保持当前筛选，可由业务扩展为钻取
    // 此处保留入口，后续可结合 activeCard 传入维度参数
    getData()
}

// 构造请求参数：把当前所有筛选条件打包给后端
function buildParams() {
    const params: Record<string, any> = {
        range: filter.range,
        active_card: activeCard.value || '',
        order_granularity: orderTrend.granularity,
        order_type_granularity: orderType.granularity
    }
    if (filter.range === 'custom' && filter.customRange?.length === 2) {
        params.start_time = filter.customRange[0]
        params.end_time = filter.customRange[1]
    }
    return params
}

function getData() {
    const params = buildParams()
    getWorkbench(params)
        .then((res: any) => {
            const today = res.today || {}
            Object.assign(workbenchData.today, {
                time: today.time || '',
                today_visit: today.today_visit ?? 0,
                total_visit: today.total_visit ?? 0,
                today_order: today.today_order ?? 0,
                total_order: today.total_order ?? 0,
                today_recharge: today.today_recharge ?? 0,
                total_recharge: today.total_recharge ?? 0,
                today_refund: today.today_refund ?? 0,
                total_refund: today.total_refund ?? 0
            })

            // 订单趋势图（折线）
            const order = res.orderTrend || {}
            orderTrend.option.xAxis.data = order.date || []
            orderTrend.option.series[0].data = order.list || []

            // 订单类型趋势图（堆叠趋势）
            const type = res.orderType || {}
            orderType.option.xAxis.data = type.date || []
            const seriesData = type.list || []
            ;['普通订单', '团购订单', '秒杀订单'].forEach((n, i) => {
                orderType.option.series[i].data = seriesData[i] || []
            })
        })
        .catch((err: any) => {
            console.log('workbench err', err)
        })
}

onMounted(() => {
    getData()
})
</script>

<style lang="scss" scoped>
.workbench {
    .stat-card {
        width: 25%;
        padding: 12px 16px;
        border-right: 1px solid var(--el-border-color-lighter);
        cursor: pointer;
        transition: background 0.2s ease;

        &:last-child {
            border-right: none;
        }

        &.is-active {
            background: var(--el-color-primary-light-9);
        }

        &:hover {
            background: var(--el-color-primary-light-9);
        }
    }

    @media (max-width: 768px) {
        .stat-card {
            width: 50%;
            border-bottom: 1px solid var(--el-border-color-lighter);

            &:nth-child(2) {
                border-right: none;
            }

            &:nth-child(3),
            &:nth-child(4) {
                border-bottom: none;
            }
        }
    }
}
</style>
