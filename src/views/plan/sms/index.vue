<template>
    <div>
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
                    <el-button class="ml-2.5" type="primary" @click="openDialog('add')">
                        新增
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="模板ID" prop="template_id" min-width="170" />
                <el-table-column label="关联用户" min-width="180">
                    <template #default="{ row }">
                        {{ row.user_nickname }} / {{ row.user_mobile }}
                    </template>
                </el-table-column>
                <el-table-column label="短信签名" prop="signature" min-width="130" />
                <el-table-column
                    label="模板内容"
                    prop="content"
                    min-width="240"
                    show-overflow-tooltip
                />
                <el-table-column label="单价" min-width="120">
                    <template #default="{ row }">
                        ¥ {{ row.price ?? 0 }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="openDialog('edit', row)">
                            编辑
                        </el-button>
                        <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" @close="resetDialog">
            <el-form
                ref="dialogFormRef"
                :model="dialogForm"
                label-width="100px"
                :rules="dialogRules"
            >
                <el-form-item label="模板ID" prop="template_id">
                    <el-input
                        v-model="dialogForm.template_id"
                        placeholder="请输入模板ID"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="关联用户" prop="user_id">
                    <el-select
                        v-model="dialogForm.user_id"
                        class="w-full"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="请输入用户昵称/手机号"
                        :remote-method="fetchUsers"
                        :loading="userLoading"
                    >
                        <el-option
                            v-for="item in userOptions"
                            :key="item.id"
                            :label="`${item.nickname} / ${item.mobile}`"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="签名名称" prop="signature">
                    <el-input
                        v-model="dialogForm.signature"
                        placeholder="请输入签名名称，如：【测试签名】"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="模板内容" prop="content">
                    <el-input
                        v-model="dialogForm.content"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入模板内容"
                    />
                </el-form-item>
                <el-form-item label="单价" prop="base_price">
                    <el-input
                        v-model.number="dialogForm.base_price"
                        placeholder="请输入单价"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="含税单价">
                    <span class="text-tx-regular">¥ {{ taxPrice }}</span>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    确认
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="planSms">
import type { FormInstance, FormRules } from 'element-plus'

import { searchUser } from '@/api/consumer'
import { addSmsTemplate, deleteSmsTemplate, editSmsTemplate, getSmsTemplateList } from '@/api/plan'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    keyword: '',
    signature: '',
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getSmsTemplateList,
    params: queryParams,
    size: 20
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogType.value === 'add' ? '新增短信模板' : '编辑短信模板'))
const submitLoading = ref(false)
const dialogFormRef = shallowRef<FormInstance>()

const dialogForm = reactive<any>({
    id: '',
    template_id: '',
    user_id: '',
    signature: '',
    content: '',
    base_price: ''
})

const taxPrice = computed(() => {
    const base = Number(dialogForm.base_price) || 0
    return Number((base * 1.06).toFixed(2))
})

const dialogRules: FormRules = {
    template_id: [{ required: true, message: '请输入模板ID' }],
    user_id: [{ required: true, message: '请选择关联用户' }],
    signature: [{ required: true, message: '请输入签名名称' }],
    content: [{ required: true, message: '请输入模板内容' }],
    base_price: [{ required: true, message: '请输入单价' }]
}

const userLoading = ref(false)
const userOptions = ref<any[]>([])
const fetchUsers = async (keyword: string) => {
    if (!keyword) return
    userLoading.value = true
    try {
        const res: any = await searchUser({ keyword })
        userOptions.value = res?.lists || []
    } finally {
        userLoading.value = false
    }
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
    dialogType.value = type
    dialogVisible.value = true
    userOptions.value = []
    if (type === 'edit' && row) {
        Object.assign(dialogForm, {
            id: row.id,
            template_id: row.template_id,
            user_id: row.user_id,
            signature: row.signature,
            content: row.content,
            base_price: row.base_price
        })
        if (row.user_id && row.user_nickname) {
            userOptions.value = [
                { id: row.user_id, nickname: row.user_nickname, mobile: row.user_mobile }
            ]
        }
    } else {
        Object.assign(dialogForm, {
            id: '',
            template_id: '',
            user_id: '',
            signature: '',
            content: '',
            base_price: ''
        })
    }
}

const resetDialog = () => {
    dialogFormRef.value?.resetFields()
    userOptions.value = []
}

const selectedUser = computed(() => {
    return userOptions.value.find((item) => item.id == dialogForm.user_id)
})

const handleSubmit = async () => {
    await dialogFormRef.value?.validate()
    submitLoading.value = true
    try {
        const user = selectedUser.value
        const params = {
            ...dialogForm,
            base_price: Number(dialogForm.base_price),
            user_nickname: user?.nickname || '',
            user_mobile: user?.mobile || ''
        }
        if (dialogType.value === 'add') {
            await addSmsTemplate(params)
            feedback.msgSuccess('新增成功')
        } else {
            await editSmsTemplate(params)
            feedback.msgSuccess('编辑成功')
        }
        dialogVisible.value = false
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '操作失败')
    } finally {
        submitLoading.value = false
    }
}

const handleDelete = async (row: any) => {
    await feedback.confirm('删除后不可恢复，确认删除该短信模板吗？')
    try {
        await deleteSmsTemplate({ id: row.id })
        feedback.msgSuccess('删除成功')
        getLists()
    } catch (e: any) {
        feedback.msgError(e?.msg || '删除失败')
    }
}

onActivated(() => {
    getLists()
})
getLists()
</script>
