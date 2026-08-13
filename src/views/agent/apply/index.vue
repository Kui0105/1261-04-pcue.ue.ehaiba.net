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
                        :fetch-fun="getAgentApplyList"
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
                <el-tab-pane label="审核通过" name="1" />
                <el-tab-pane label="审核驳回" name="2" />
            </el-tabs>
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户ID" prop="user_id" min-width="100" />
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
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
                <el-table-column label="提交时间" prop="create_time" min-width="160" />
                <el-table-column v-if="queryParams.status === '2'" label="驳回原因" min-width="180">
                    <template #default="{ row }">
                        <span class="text-error">{{ row.reject_reason || '--' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" min-width="100" fixed="right">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small">
                            {{ row.status_text }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <template v-if="row.status === 0">
                            <el-button type="primary" link @click="handleApprove(row)">
                                审核通过
                            </el-button>
                            <el-button type="danger" link @click="openReject(row)">
                                审核驳回
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
    </div>
</template>

<script lang="ts" setup name="agentApply">
import type { FormInstance, FormRules } from 'element-plus'

import { approveAgentApply, getAgentApplyList, rejectAgentApply } from '@/api/agent'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive<any>({
    keyword: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getAgentApplyList,
    params: queryParams,
    size: 20
})

const getStatusType = (status: number) => {
    switch (status) {
        case 0:
            return 'warning'
        case 1:
            return 'success'
        case 2:
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
    await feedback.confirm('确认审核通过该代理商申请吗？')
    try {
        await approveAgentApply({ id: row.id })
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
        await rejectAgentApply({ id: rejectForm.id, reject_reason: rejectForm.reject_reason })
        feedback.msgSuccess('驳回成功')
        rejectVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        rejectLoading.value = false
    }
}

onActivated(() => {
    getLists()
})
getLists()
</script>
