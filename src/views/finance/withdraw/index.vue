<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="代理商信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="代理商昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="提现时间">
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
                        :fetch-fun="getWithdrawList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-tabs v-model="queryParams.status" @tab-change="handleTabChange">
                <el-tab-pane label="全部" name="" />
                <el-tab-pane label="待审核" name="0" />
                <el-tab-pane label="待打款" name="1" />
                <el-tab-pane label="已完成" name="2" />
                <el-tab-pane label="审核驳回" name="3" />
            </el-tabs>
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="提现单号" prop="withdraw_sn" min-width="180" />
                <el-table-column label="代理商昵称/手机号" min-width="180">
                    <template #default="{ row }">
                        {{ row.agent_nickname }} / {{ row.agent_mobile }}
                    </template>
                </el-table-column>
                <el-table-column label="提现金额" min-width="110">
                    <template #default="{ row }">¥ {{ row.amount ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="手续费" min-width="110">
                    <template #default="{ row }">¥ {{ row.fee ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="打款金额" min-width="110">
                    <template #default="{ row }">
                        <span class="text-success">¥ {{ row.payment_amount ?? 0 }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="提现账户" min-width="220">
                    <template #default="{ row }">
                        <div>户名：{{ row.account_name }}</div>
                        <div>银行：{{ row.bank_name }}</div>
                        <div>账号：{{ row.account_number }}</div>
                    </template>
                </el-table-column>
                <el-table-column v-if="queryParams.status === '3'" label="驳回原因" min-width="180">
                    <template #default="{ row }">
                        <span class="text-error">{{ row.reject_reason || '--' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" min-width="110" fixed="right">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small">
                            {{ row.status_text }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <template v-if="row.status === 0">
                            <el-button type="primary" link @click="handleApprove(row)">
                                审核通过
                            </el-button>
                            <el-button type="danger" link @click="openReject(row)">
                                审核驳回
                            </el-button>
                        </template>
                        <template v-else-if="row.status === 1">
                            <el-button type="primary" link @click="openConfirm(row)">
                                确认打款
                            </el-button>
                        </template>
                        <template v-else-if="row.status === 2">
                            <el-button type="primary" link @click="openVoucher(row)">
                                查看凭证
                            </el-button>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 审核驳回弹窗 -->
        <el-dialog v-model="rejectVisible" title="审核驳回" width="460px" @close="resetReject">
            <el-form ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-width="90px">
                <el-form-item label="驳回原因" prop="reject_reason">
                    <el-input
                        v-model="rejectForm.reject_reason"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入驳回原因"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="rejectVisible = false">取消</el-button>
                <el-button type="primary" :loading="rejectLoading" @click="handleRejectSubmit">
                    确认
                </el-button>
            </template>
        </el-dialog>

        <!-- 确认打款弹窗 -->
        <el-dialog v-model="confirmVisible" title="确认打款" width="460px" @close="resetConfirm">
            <el-form
                ref="confirmFormRef"
                :model="confirmForm"
                :rules="confirmRules"
                label-width="100px"
            >
                <el-form-item label="打款凭证" prop="voucher_url">
                    <material-picker v-model="confirmForm.voucher_url" type="image" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="confirmVisible = false">取消</el-button>
                <el-button type="primary" :loading="confirmLoading" @click="handleConfirmSubmit">
                    确认打款
                </el-button>
            </template>
        </el-dialog>

        <!-- 查看凭证弹窗 -->
        <el-dialog v-model="voucherVisible" title="打款凭证" width="480px">
            <div class="flex justify-center">
                <el-image
                    :src="currentVoucher"
                    fit="contain"
                    style="max-width: 100%; max-height: 400px"
                />
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="financeWithdraw">
import type { FormInstance, FormRules } from 'element-plus'

import { approveWithdraw, confirmWithdraw, getWithdrawList, rejectWithdraw } from '@/api/finance'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive<any>({
    keyword: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getWithdrawList,
    params: queryParams,
    size: 20
})

const getStatusType = (status: number) => {
    switch (status) {
        case 0:
            return 'warning'
        case 1:
            return 'primary'
        case 2:
            return 'success'
        case 3:
            return 'danger'
        default:
            return 'info'
    }
}

const handleTabChange = () => {
    resetPage()
}

// 审核通过
const handleApprove = async (row: any) => {
    await feedback.confirm('确认审核通过该提现申请吗？')
    try {
        await approveWithdraw({ id: row.id })
        feedback.msgSuccess('审核通过成功')
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    }
}

// 审核驳回
const rejectVisible = ref(false)
const rejectLoading = ref(false)
const rejectFormRef = shallowRef<FormInstance>()
const rejectForm = reactive({
    id: '',
    reject_reason: ''
})
const rejectRules: FormRules = {
    reject_reason: [{ required: true, message: '请输入驳回原因' }]
}

const openReject = (row: any) => {
    rejectForm.id = row.id
    rejectVisible.value = true
}

const resetReject = () => {
    rejectForm.id = ''
    rejectForm.reject_reason = ''
    rejectFormRef.value?.resetFields()
}

const handleRejectSubmit = async () => {
    await rejectFormRef.value?.validate()
    rejectLoading.value = true
    try {
        await rejectWithdraw({ id: rejectForm.id, reject_reason: rejectForm.reject_reason })
        feedback.msgSuccess('驳回成功')
        rejectVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        rejectLoading.value = false
    }
}

// 确认打款
const confirmVisible = ref(false)
const confirmLoading = ref(false)
const confirmFormRef = shallowRef<FormInstance>()
const confirmForm = reactive({
    id: '',
    voucher_url: ''
})
const confirmRules: FormRules = {
    voucher_url: [{ required: true, message: '请上传打款凭证' }]
}

const openConfirm = (row: any) => {
    confirmForm.id = row.id
    confirmVisible.value = true
}

const resetConfirm = () => {
    confirmForm.id = ''
    confirmForm.voucher_url = ''
    confirmFormRef.value?.resetFields()
}

const handleConfirmSubmit = async () => {
    await confirmFormRef.value?.validate()
    confirmLoading.value = true
    try {
        await confirmWithdraw({ id: confirmForm.id, voucher_url: confirmForm.voucher_url })
        feedback.msgSuccess('确认打款成功')
        confirmVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        confirmLoading.value = false
    }
}

// 查看凭证
const voucherVisible = ref(false)
const currentVoucher = ref('')

const openVoucher = (row: any) => {
    currentVoucher.value = row.voucher_url
    voucherVisible.value = true
}

onActivated(() => {
    getLists()
})
getLists()
</script>
