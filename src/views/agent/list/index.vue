<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="代理商信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="真实姓名/联系电话"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select class="w-[200px]" v-model="queryParams.status" clearable placeholder="请选择状态">
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
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
                        :fetch-fun="getAgentList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户ID" prop="user_id" min-width="100" />
                <el-table-column label="真实姓名" prop="real_name" min-width="110" />
                <el-table-column label="联系电话" prop="contact_phone" min-width="130" />
                <el-table-column label="用户类型" prop="user_type_text" min-width="100" />
                <el-table-column label="邮箱" prop="email" min-width="180" />
                <el-table-column label="营业执照" min-width="120">
                    <template #default="{ row }">
                        <el-image
                            v-if="row.business_license"
                            :src="row.business_license"
                            style="width: 60px; height: 40px"
                            fit="contain"
                            :preview-src-list="[row.business_license]"
                            preview-teleported
                        />
                        <span v-else>--</span>
                    </template>
                </el-table-column>
                <el-table-column label="佣金余额" min-width="120">
                    <template #default="{ row }">¥ {{ row.commission_balance ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="累计佣金" min-width="120">
                    <template #default="{ row }">¥ {{ row.total_commission ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="已提现佣金" min-width="120">
                    <template #default="{ row }">¥ {{ row.withdrawn_commission ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="状态" min-width="90">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="openDetail(row)">
                            查看详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 代理商详情 -->
        <el-dialog v-model="detailVisible" title="代理商详情" width="780px" @close="resetDetail">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基本信息" name="info">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="用户ID">{{ detail.user_id }}</el-descriptions-item>
                        <el-descriptions-item label="代理昵称">{{ detail.nickname }}</el-descriptions-item>
                        <el-descriptions-item label="手机号码">{{ detail.mobile }}</el-descriptions-item>
                        <el-descriptions-item label="用户类型">{{ detail.user_type_text }}</el-descriptions-item>
                        <el-descriptions-item label="邮箱">{{ detail.email }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="detail.status == 1 ? 'success' : 'danger'" size="small">
                                {{ detail.status_text }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="营业执照" :span="2">
                            <el-image
                                v-if="detail.business_license"
                                :src="detail.business_license"
                                style="width: 120px; height: 80px"
                                fit="contain"
                                :preview-src-list="[detail.business_license]"
                                preview-teleported
                            />
                            <span v-else>--</span>
                        </el-descriptions-item>
                        <el-descriptions-item label="创建时间" :span="2">{{ detail.create_time }}</el-descriptions-item>
                    </el-descriptions>

                    <div class="mt-6">
                        <div class="text-base font-medium mb-3">账户信息</div>
                        <el-descriptions :column="3" border>
                            <el-descriptions-item label="累计佣金">
                                ¥ {{ detail.total_commission ?? 0 }}
                            </el-descriptions-item>
                            <el-descriptions-item label="已提现佣金">
                                ¥ {{ detail.withdrawn_commission ?? 0 }}
                            </el-descriptions-item>
                            <el-descriptions-item label="佣金账户余额">
                                ¥ {{ detail.commission_balance ?? 0 }}
                            </el-descriptions-item>
                            <el-descriptions-item label="佣金账户" :span="3">
                                {{ detail.commission_account || '--' }}
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="佣金明细" name="commission">
                    <el-table size="large" v-loading="commissionLoading" :data="commissionLists">
                        <el-table-column label="关联订单" prop="order_sn" min-width="180" />
                        <el-table-column label="用户昵称/手机号" min-width="180">
                            <template #default="{ row }">
                                {{ row.user_nickname }} / {{ row.user_mobile }}
                            </template>
                        </el-table-column>
                        <el-table-column label="订单类型" prop="order_type_text" min-width="100" />
                        <el-table-column label="实付金额" min-width="110">
                            <template #default="{ row }">¥ {{ row.pay_amount ?? 0 }}</template>
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
                        <el-pagination
                            v-model:current-page="commissionPage"
                            v-model:page-size="commissionSize"
                            :total="commissionCount"
                            :page-sizes="[10, 20, 50]"
                            layout="total, sizes, prev, pager, next, jumper"
                            background
                            @change="fetchCommission"
                        />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="agentList">
import { getAgentCommissionList, getAgentDetail, getAgentList, toggleAgentStatus } from '@/api/agent'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    keyword: '',
    status: '' as number | string,
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getAgentList,
    params: queryParams,
    size: 20
})

// 状态切换
const handleStatusChange = async (row: any) => {
    const actionText = row.status == 1 ? '启用' : '禁用'
    try {
        await feedback.confirm(`确认${actionText}该代理商吗？`)
        await toggleAgentStatus({ id: row.id, status: row.status })
        feedback.msgSuccess(`${actionText}成功`)
    } catch (e: any) {
        row.status = row.status == 1 ? 0 : 1
        feedback.msgError(e?.msg || '操作失败')
    }
}

// 详情弹窗
const detailVisible = ref(false)
const activeTab = ref('info')
const detail = reactive<any>({
    id: '',
    user_id: '',
    nickname: '',
    mobile: '',
    user_type_text: '',
    email: '',
    business_license: '',
    commission_account: '',
    status: 1,
    status_text: '',
    total_commission: 0,
    withdrawn_commission: 0,
    commission_balance: 0,
    create_time: ''
})

const openDetail = async (row: any) => {
    try {
        const res: any = await getAgentDetail({ id: row.id })
        Object.assign(detail, res)
        detailVisible.value = true
        activeTab.value = 'info'
        commissionPage.value = 1
        fetchCommission()
    } catch (e: any) {
        feedback.msgError(e?.msg || '获取详情失败')
    }
}

const resetDetail = () => {
    Object.assign(detail, {
        id: '',
        user_id: '',
        nickname: '',
        mobile: '',
        user_type_text: '',
        email: '',
        business_license: '',
        commission_account: '',
        status: 1,
        status_text: '',
        total_commission: 0,
        withdrawn_commission: 0,
        commission_balance: 0,
        create_time: ''
    })
    commissionLists.value = []
    commissionCount.value = 0
    commissionPage.value = 1
}

// 佣金明细
const commissionLoading = ref(false)
const commissionLists = ref<any[]>([])
const commissionPage = ref(1)
const commissionSize = ref(10)
const commissionCount = ref(0)

const fetchCommission = async () => {
    if (!detail.id) return
    commissionLoading.value = true
    try {
        const res: any = await getAgentCommissionList({
            agent_id: detail.id,
            page_no: commissionPage.value,
            page_size: commissionSize.value
        })
        commissionLists.value = res?.lists || []
        commissionCount.value = res?.count || 0
    } finally {
        commissionLoading.value = false
    }
}

onActivated(() => {
    getLists()
})
getLists()
</script>
