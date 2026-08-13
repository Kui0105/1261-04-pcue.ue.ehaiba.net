<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="订单号">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.order_sn"
                        placeholder="请输入订单号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="用户信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="用户昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="代理商信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.agent_keyword"
                        placeholder="代理商昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="结算时间">
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
                        :fetch-fun="getCommissionList"
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
                    <div class="text-tx-secondary text-sm">累计佣金</div>
                    <div class="text-2xl font-semibold mt-1">
                        ¥ {{ formatMoney(stats.total_commission) }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">累计提现佣金</div>
                    <div class="text-2xl font-semibold mt-1 text-success">
                        ¥ {{ formatMoney(stats.total_withdrawn) }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">提现中佣金</div>
                    <div class="text-2xl font-semibold mt-1 text-warning">
                        ¥ {{ formatMoney(stats.withdrawing) }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">待提现佣金</div>
                    <div class="text-2xl font-semibold mt-1">
                        ¥ {{ formatMoney(stats.pending) }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="关联订单" prop="order_sn" min-width="180" />
                <el-table-column label="用户昵称/手机号" min-width="180">
                    <template #default="{ row }">
                        {{ row.user_nickname }} / {{ row.user_mobile }}
                    </template>
                </el-table-column>
                <el-table-column label="订单类型" prop="order_type_text" min-width="120" />
                <el-table-column label="实付金额" min-width="110">
                    <template #default="{ row }">¥ {{ row.pay_amount ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="代理商昵称/手机号" min-width="180">
                    <template #default="{ row }">
                        {{ row.agent_nickname }} / {{ row.agent_mobile }}
                    </template>
                </el-table-column>
                <el-table-column label="分销层级" prop="distribution_level_text" min-width="100" />
                <el-table-column label="返佣金额" min-width="110">
                    <template #default="{ row }">
                        <span class="text-success">¥ {{ row.commission_amount ?? 0 }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="结算时间" prop="create_time" min-width="160" />
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="financeCommission">
import { getCommissionList } from '@/api/finance'
import { usePaging } from '@/hooks/usePaging'

const formatMoney = (n: number) => Number(n || 0).toFixed(2)

const queryParams = reactive({
    order_sn: '',
    keyword: '',
    agent_keyword: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getCommissionList,
    params: queryParams,
    size: 20
})

const stats = reactive({
    total_commission: 0,
    total_withdrawn: 0,
    withdrawing: 0,
    pending: 0
})

const fetchLists = async () => {
    const res: any = await getLists()
    if (res?.extend) {
        stats.total_commission = res.extend.total_commission ?? 0
        stats.total_withdrawn = res.extend.total_withdrawn ?? 0
        stats.withdrawing = res.extend.withdrawing ?? 0
        stats.pending = res.extend.pending ?? 0
    }
}

onActivated(() => {
    fetchLists()
})
fetchLists()
</script>
