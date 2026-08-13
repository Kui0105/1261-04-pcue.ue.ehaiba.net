<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="用户信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="用户ID/用户昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="订单编号">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.order_sn"
                        placeholder="请输入订单编号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="订单类型">
                    <el-select class="w-[160px]" v-model="queryParams.order_type" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="话费充值" :value="1" />
                        <el-option label="短信群发" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="订单状态">
                    <el-select class="w-[160px]" v-model="queryParams.order_status" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="进行中" :value="0" />
                        <el-option label="已完成" :value="1" />
                        <el-option label="已失败" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="税费类型">
                    <el-select class="w-[160px]" v-model="queryParams.tax_type" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="含税" :value="1" />
                        <el-option label="不含税" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="提交时间">
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
                        :fetch-fun="getOrderList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-row :gutter="16" class="mt-4">
            <el-col :span="8">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">订单总数</div>
                    <div class="text-2xl font-semibold mt-1">{{ stats.total_count }}</div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">进行中</div>
                    <div class="text-2xl font-semibold mt-1 text-warning">
                        {{ stats.pending_count }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="!border-none" shadow="never">
                    <div class="text-tx-secondary text-sm">已完成</div>
                    <div class="text-2xl font-semibold mt-1 text-success">
                        {{ stats.completed_count }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="订单编号" prop="order_sn" min-width="170" />
                <el-table-column label="订单类型" prop="order_type_text" min-width="100" />
                <el-table-column label="税费类型" prop="tax_type_text" min-width="100" />
                <el-table-column label="成功/失败/总数" min-width="140">
                    <template #default="{ row }">
                        {{ row.success_num }} / {{ row.fail_num }} / {{ row.total_num }}
                    </template>
                </el-table-column>
                <el-table-column label="退款金额" min-width="110">
                    <template #default="{ row }">¥ {{ row.refund_amount ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="支付总额" min-width="110">
                    <template #default="{ row }">¥ {{ row.pay_amount ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="订单状态" min-width="100">
                    <template #default="{ row }">
                        <el-tag
                            :type="
                                row.order_status == 1
                                    ? 'success'
                                    : row.order_status == 0
                                    ? 'warning'
                                    : 'danger'
                            "
                            size="small"
                        >
                            {{ row.order_status_text }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="goDetail(row)"> 查看详情 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="consumerOrderLists">
import { getOrderList } from '@/api/order'
import { usePaging } from '@/hooks/usePaging'

const router = useRouter()

const queryParams = reactive({
    keyword: '',
    order_sn: '',
    order_type: '' as number | string,
    order_status: '' as number | string,
    tax_type: '' as number | string,
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getOrderList,
    params: queryParams,
    size: 20
})

const stats = reactive({
    total_count: 0,
    pending_count: 0,
    completed_count: 0
})

const fetchLists = async () => {
    const res: any = await getLists()
    if (res?.extend) {
        stats.total_count = res.extend.total_count ?? 0
        stats.pending_count = res.extend.pending_count ?? 0
        stats.completed_count = res.extend.completed_count ?? 0
    }
}

const goDetail = (row: any) => {
    router.push({ path: '/consumer/order/detail', query: { id: row.id } })
}

onActivated(() => {
    fetchLists()
})
fetchLists()
</script>
