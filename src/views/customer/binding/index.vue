<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="用户信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="用户昵称/手机号码/姓名"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="申请时间">
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
                        :fetch-fun="getCustomerBindList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                    <el-button
                        v-perms="['customer.bind/add']"
                        class="ml-2.5"
                        type="success"
                        @click="openEdit()"
                    >
                        新增申请
                    </el-button>
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
                <el-table-column label="成交图片" min-width="160">
                    <template #default="{ row }">
                        <div v-if="row.deal_images && row.deal_images.length" class="flex gap-2">
                            <el-image
                                v-for="(url, idx) in row.deal_images"
                                :key="idx"
                                :src="url"
                                style="width: 50px; height: 50px"
                                fit="cover"
                                :preview-src-list="row.deal_images"
                                preview-teleported
                            />
                        </div>
                        <span v-else>--</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" min-width="100" fixed="right">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)" size="small">
                            {{ row.status_text }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="create_time" min-width="160" />
                <el-table-column v-if="queryParams.status === '2'" label="驳回原因" min-width="180">
                    <template #default="{ row }">
                        <span class="text-error">{{ row.reject_reason || '--' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <template v-if="row.status === 0">
                            <el-button
                                v-perms="['customer.bind/approve']"
                                type="primary"
                                link
                                @click="handleApprove(row)"
                            >
                                审核通过
                            </el-button>
                            <el-button
                                v-perms="['customer.bind/reject']"
                                type="danger"
                                link
                                @click="openReject(row)"
                            >
                                审核驳回
                            </el-button>
                        </template>
                        <el-button
                            v-if="row.status === 2"
                            v-perms="['customer.bind/edit']"
                            type="primary"
                            link
                            @click="openEdit(row)"
                        >
                            编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 新增/编辑弹窗 -->
        <el-dialog
            v-model="editVisible"
            :title="editForm.id ? '编辑客户绑定申请' : '新增客户绑定申请'"
            width="520px"
            @close="resetEdit"
        >
            <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
                <el-form-item label="选择用户" prop="user_id">
                    <el-select
                        v-model="editForm.user_id"
                        filterable
                        remote
                        reserve-keyword
                        :remote-method="handleUserSearch"
                        :loading="userSearching"
                        placeholder="输入手机号/昵称/ID搜索用户"
                        style="width: 100%"
                        clearable
                        @change="handleUserChange"
                    >
                        <el-option
                            v-for="item in userOptions"
                            :key="item.id"
                            :label="`${item.id} / ${item.nickname} / ${item.mobile || ''}`"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="手机号码">
                    <el-input v-model="editForm.mobile" placeholder="选择用户后自动填充" disabled />
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-input v-model="editForm.user_type_text" placeholder="选择用户后自动填充" disabled />
                </el-form-item>
                <el-form-item label="成交图片" prop="deal_images">
                    <div>
                        <material-picker v-model="editForm.deal_images" :limit="3" type="image" />
                        <div class="form-tips">最多上传 3 张成交图片，支持 jpg、jpeg、png 格式</div>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editVisible = false">取消</el-button>
                <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">
                    确认
                </el-button>
            </template>
        </el-dialog>

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

<script lang="ts" setup name="customerBinding">
import type { FormInstance, FormRules } from 'element-plus'

import {
    approveCustomerBind,
    getCustomerBindList,
    rejectCustomerBind,
    submitCustomerBind
} from '@/api/customer'
import { searchUser } from '@/api/consumer'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive<any>({
    keyword: '',
    status: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getCustomerBindList,
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
    await feedback.confirm('确认审核通过该客户绑定申请吗？')
    try {
        await approveCustomerBind({ id: row.id })
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
        await rejectCustomerBind({ id: rejectForm.id, reject_reason: rejectForm.reject_reason })
        feedback.msgSuccess('驳回成功')
        rejectVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        rejectLoading.value = false
    }
}

// 新增/编辑
const editVisible = ref(false)
const editLoading = ref(false)
const editFormRef = shallowRef<FormInstance>()
const editForm = reactive<any>({
    id: '',
    user_id: '',
    mobile: '',
    user_type: '',
    user_type_text: '',
    deal_images: []
})
const editRules: FormRules = {
    user_id: [{ required: true, message: '请选择用户', trigger: 'change' }],
    deal_images: [{ required: true, message: '请上传成交图片', trigger: 'change' }]
}

const userOptions = ref<any[]>([])
const userSearching = ref(false)
let lastUserKeyword = ''

const handleUserSearch = async (keyword: string) => {
    lastUserKeyword = keyword
    if (!keyword) {
        userOptions.value = []
        return
    }
    userSearching.value = true
    try {
        const res: any = await searchUser({ keyword })
        if (lastUserKeyword !== keyword) return
        userOptions.value = res?.lists || res || []
    } catch (e: any) {
        feedback.msgError(e?.msg || '搜索失败')
    } finally {
        userSearching.value = false
    }
}

const handleUserChange = (val: any) => {
    const user = userOptions.value.find((item) => item.id === val)
    if (user) {
        editForm.mobile = user.mobile || ''
        editForm.user_type = user.user_type || ''
        editForm.user_type_text = user.user_type_text || ''
    }
}

const openEdit = (row?: any) => {
    if (row) {
        editForm.id = row.id
        editForm.user_id = row.user_id
        editForm.mobile = row.mobile
        editForm.user_type = row.user_type
        editForm.user_type_text = row.user_type_text
        editForm.deal_images = Array.isArray(row.deal_images) ? [...row.deal_images] : []
        if (row.user_id) {
            userOptions.value = [
                {
                    id: row.user_id,
                    nickname: row.nickname,
                    mobile: row.mobile,
                    user_type: row.user_type,
                    user_type_text: row.user_type_text
                }
            ]
        }
    } else {
        editForm.id = ''
        editForm.user_id = ''
        editForm.mobile = ''
        editForm.user_type = ''
        editForm.user_type_text = ''
        editForm.deal_images = []
        userOptions.value = []
    }
    editVisible.value = true
}

const resetEdit = () => {
    editForm.id = ''
    editForm.user_id = ''
    editForm.mobile = ''
    editForm.user_type = ''
    editForm.user_type_text = ''
    editForm.deal_images = []
    userOptions.value = []
    editFormRef.value?.resetFields()
}

const handleEditSubmit = async () => {
    await editFormRef.value?.validate()
    editLoading.value = true
    try {
        const payload: any = {
            user_id: editForm.user_id,
            mobile: editForm.mobile,
            user_type: editForm.user_type,
            deal_images: editForm.deal_images
        }
        if (editForm.id) {
            payload.id = editForm.id
        }
        await submitCustomerBind(payload)
        feedback.msgSuccess(editForm.id ? '编辑成功' : '新增成功')
        editVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        editLoading.value = false
    }
}

onActivated(() => {
    getLists()
})
getLists()
</script>

<style lang="scss" scoped>
.form-tips {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    margin-top: 6px;
}
</style>
