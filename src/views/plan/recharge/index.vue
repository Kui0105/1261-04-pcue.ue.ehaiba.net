<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="用户类型">
                    <el-select class="w-[160px]" v-model="queryParams.user_type" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="个人" :value="1" />
                        <el-option label="企业" :value="2" />
                    </el-select>
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
                <el-table-column label="充值面额" prop="denomination" min-width="120">
                    <template #default="{ row }">{{ row.denomination }} 元</template>
                </el-table-column>
                <el-table-column label="单价" min-width="120">
                    <template #default="{ row }">
                        ¥ {{ row.price ?? 0 }}
                        <el-tag v-if="row.tax_type == 1" class="ml-2" size="small" type="info">
                            含税
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="用户类型" prop="user_type_text" min-width="100" />
                <el-table-column label="排序" prop="sort" min-width="100" />
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

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetDialog">
            <el-form
                ref="dialogFormRef"
                :model="dialogForm"
                label-width="100px"
                :rules="dialogRules"
            >
                <el-form-item label="充值面额" prop="denomination">
                    <el-input
                        v-model.number="dialogForm.denomination"
                        placeholder="请输入充值面额"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="单价" prop="base_price">
                    <el-input
                        v-model.number="dialogForm.base_price"
                        placeholder="请输入单价"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="税费类型" prop="tax_type">
                    <el-select class="w-full" v-model="dialogForm.tax_type">
                        <el-option label="含税" :value="1" />
                        <el-option label="不含税" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item v-if="dialogForm.tax_type == 1" label="含税单价">
                    <span class="text-tx-regular">¥ {{ taxPrice }}</span>
                </el-form-item>
                <el-form-item label="用户类型" prop="user_type">
                    <el-select class="w-full" v-model="dialogForm.user_type">
                        <el-option label="个人" :value="1" />
                        <el-option label="企业" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="dialogForm.sort" :min="0" class="w-full" />
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

<script lang="ts" setup name="planRecharge">
import type { FormInstance, FormRules } from 'element-plus'

import {
    addRechargePlan,
    deleteRechargePlan,
    editRechargePlan,
    getRechargePlanList
} from '@/api/plan'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    user_type: '' as number | string
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getRechargePlanList,
    params: queryParams,
    size: 20
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogType.value === 'add' ? '新增充值档位' : '编辑充值档位'))
const submitLoading = ref(false)
const dialogFormRef = shallowRef<FormInstance>()

const dialogForm = reactive({
    id: '' as number | string,
    denomination: '' as number | string,
    base_price: '' as number | string,
    tax_type: 1,
    user_type: 1,
    sort: 0
})

const taxPrice = computed(() => {
    const base = Number(dialogForm.base_price) || 0
    if (dialogForm.tax_type == 1) {
        return Number((base * 1.06).toFixed(2))
    }
    return base
})

const dialogRules: FormRules = {
    denomination: [{ required: true, message: '请输入充值面额' }],
    base_price: [{ required: true, message: '请输入单价' }],
    tax_type: [{ required: true, message: '请选择税费类型' }],
    user_type: [{ required: true, message: '请选择用户类型' }],
    sort: [{ required: true, message: '请输入排序' }]
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
    dialogType.value = type
    dialogVisible.value = true
    if (type === 'edit' && row) {
        Object.assign(dialogForm, {
            id: row.id,
            denomination: row.denomination,
            base_price: row.base_price,
            tax_type: row.tax_type,
            user_type: row.user_type,
            sort: row.sort
        })
    } else {
        Object.assign(dialogForm, {
            id: '',
            denomination: '',
            base_price: '',
            tax_type: 1,
            user_type: 1,
            sort: 0
        })
    }
}

const resetDialog = () => {
    dialogFormRef.value?.resetFields()
}

const handleSubmit = async () => {
    await dialogFormRef.value?.validate()
    submitLoading.value = true
    try {
        const params = {
            ...dialogForm,
            base_price: Number(dialogForm.base_price),
            denomination: Number(dialogForm.denomination),
            sort: Number(dialogForm.sort)
        }
        if (dialogType.value === 'add') {
            await addRechargePlan(params)
            feedback.msgSuccess('新增成功')
        } else {
            await editRechargePlan(params)
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
    await feedback.confirm('删除后不可恢复，确认删除该充值档位吗？')
    try {
        await deleteRechargePlan({ id: row.id })
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
