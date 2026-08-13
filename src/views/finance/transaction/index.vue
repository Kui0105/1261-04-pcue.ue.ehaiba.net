<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="用户信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="用户昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="签名名称">
                    <el-input
                        class="w-[200px]"
                        v-model="queryParams.signature"
                        placeholder="请输入签名名称"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="创建时间">
                    <daterange-picker
                        v-model:startTime="queryParams.start_time"
                        v-model:endTime="queryParams.end_time"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getTransactionList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-row :gutter="16" class="mt-4">
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">累计充值总额</div>
                    <div class="text-2xl font-semibold mt-1 text-success">
                        ¥ {{ stats.total_recharge }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">累计消费总额</div>
                    <div class="text-2xl font-semibold mt-1">¥ {{ stats.total_consume }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">累计退款总额</div>
                    <div class="text-2xl font-semibold mt-1 text-error">
                        ¥ {{ stats.total_refund }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">预授信消费总额</div>
                    <div class="text-2xl font-semibold mt-1 text-warning">
                        ¥ {{ stats.total_credit }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="交易流水号" prop="transaction_sn" min-width="180" />
                <el-table-column label="关联订单" prop="order_sn" min-width="180">
                    <template #default="{ row }">
                        {{ row.order_sn || '--' }}
                    </template>
                </el-table-column>
                <el-table-column label="用户昵称/手机号" min-width="180">
                    <template #default="{ row }">
                        {{ row.user_nickname }} / {{ row.user_mobile }}
                    </template>
                </el-table-column>
                <el-table-column label="交易类型" prop="transaction_type_text" min-width="120" />
                <el-table-column label="交易金额" min-width="110">
                    <template #default="{ row }">
                        <span :class="getAmountClass(row.transaction_type)">
                            {{ getAmountPrefix(row.transaction_type) }}¥ {{ row.amount ?? 0 }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="变动后余额" min-width="120">
                    <template #default="{ row }">¥ {{ row.balance_after ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="交易账户" prop="account_type_text" min-width="120" />
                <el-table-column label="交易时间" prop="create_time" min-width="160" />
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="financeTransaction">
import { getTransactionList } from '@/api/finance'
import { usePaging } from '@/hooks/usePaging'

const queryParams = reactive({
    keyword: '',
    signature: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getTransactionList,
    params: queryParams,
    size: 20
})

const stats = reactive({
    total_recharge: 0,
    total_consume: 0,
    total_refund: 0,
    total_credit: 0
})

const getAmountClass = (type: number) => {
    if (type === 3 || type === 1) return 'text-success'
    if (type === 5) return 'text-error'
    return ''
}

const getAmountPrefix = (type: number) => {
    if (type === 4 || type === 2) return '-'
    if (type === 3 || type === 1) return '+'
    return ''
}

const fetchLists = async () => {
    const res: any = await getLists()
    if (res?.extend) {
        stats.total_recharge = res.extend.total_recharge ?? 0
        stats.total_consume = res.extend.total_consume ?? 0
        stats.total_refund = res.extend.total_refund ?? 0
        stats.total_credit = res.extend.total_credit ?? 0
    }
}

onActivated(() => {
    fetchLists()
})
fetchLists()
</script>
