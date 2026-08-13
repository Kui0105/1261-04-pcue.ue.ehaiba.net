<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-page-header content="代理商详情" @back="router.back()" />
        </el-card>

        <el-card class="mt-4 !border-none" shadow="never">
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
        </el-card>
    </div>
</template>

<script lang="ts" setup name="agentDetail">
import { getAgentCommissionList, getAgentDetail } from '@/api/agent'
import { useRoute, useRouter } from 'vue-router'
import feedback from '@/utils/feedback'

const route = useRoute()
const router = useRouter()
const activeTab = ref('info')

const detail = reactive<any>({
    id: '',
    user_id: '',
    nickname: '',
    mobile: '',
    user_type_text: '',
    email: '',
    business_license: '',
    status: 1,
    status_text: '',
    total_commission: 0,
    withdrawn_commission: 0,
    commission_balance: 0,
    create_time: ''
})

const commissionLoading = ref(false)
const commissionLists = ref<any[]>([])
const commissionPage = ref(1)
const commissionSize = ref(10)
const commissionCount = ref(0)

const fetchDetail = async () => {
    const id = route.query.id
    if (!id) return
    try {
        const res: any = await getAgentDetail({ id })
        Object.assign(detail, res)
        commissionPage.value = 1
        fetchCommission()
    } catch (e: any) {
        feedback.msgError(e?.msg || '获取详情失败')
    }
}

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
    fetchDetail()
})
fetchDetail()
</script>
