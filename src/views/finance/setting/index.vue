<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="160px"
                style="max-width: 560px"
            >
                <el-form-item label="最低提现额度" prop="min_amount">
                    <el-input-number
                        v-model="formData.min_amount"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        placeholder="请输入最低提现额度"
                        class="w-full"
                    />
                    <span class="text-tx-secondary text-sm ml-2">元</span>
                </el-form-item>
                <el-form-item label="单笔最高提现额度" prop="single_max_amount">
                    <el-input-number
                        v-model="formData.single_max_amount"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        placeholder="请输入单笔最高提现额度"
                        class="w-full"
                    />
                    <span class="text-tx-secondary text-sm ml-2">元</span>
                </el-form-item>
                <el-form-item label="单日累计最高提现额度" prop="daily_max_amount">
                    <el-input-number
                        v-model="formData.daily_max_amount"
                        :min="0"
                        :precision="2"
                        :controls="false"
                        placeholder="请输入单日累计最高提现额度"
                        class="w-full"
                    />
                    <span class="text-tx-secondary text-sm ml-2">元</span>
                </el-form-item>
                <el-form-item label="提现手续费" prop="fee_rate">
                    <el-input-number
                        v-model="formData.fee_rate"
                        :min="0"
                        :max="100"
                        :precision="2"
                        :controls="false"
                        placeholder="请输入百分比"
                        class="w-full"
                    />
                    <span class="text-tx-secondary text-sm ml-2">%</span>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                        保存
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="financeSetting">
import type { FormInstance, FormRules } from 'element-plus'

import { getWithdrawSetting, saveWithdrawSetting } from '@/api/finance'
import feedback from '@/utils/feedback'

const formRef = shallowRef<FormInstance>()
const submitLoading = ref(false)

const formData = reactive({
    min_amount: 0,
    single_max_amount: 0,
    daily_max_amount: 0,
    fee_rate: 0
})

const formRules: FormRules = {
    min_amount: [{ required: true, message: '请输入最低提现额度', trigger: 'blur' }],
    single_max_amount: [{ required: true, message: '请输入单笔最高提现额度', trigger: 'blur' }],
    daily_max_amount: [{ required: true, message: '请输入单日累计最高提现额度', trigger: 'blur' }],
    fee_rate: [{ required: true, message: '请输入提现手续费', trigger: 'blur' }]
}

const getDetails = async () => {
    try {
        const res: any = await getWithdrawSetting()
        if (res) {
            Object.assign(formData, {
                min_amount: res.min_amount ?? 0,
                single_max_amount: res.single_max_amount ?? 0,
                daily_max_amount: res.daily_max_amount ?? 0,
                fee_rate: res.fee_rate ?? 0
            })
        }
    } catch (e: any) {
        feedback.msgError(e?.msg || '获取设置失败')
    }
}

const handleSubmit = async () => {
    await formRef.value?.validate()
    submitLoading.value = true
    try {
        await saveWithdrawSetting({ ...formData })
        feedback.msgSuccess('保存成功')
    } catch (e: any) {
        feedback.msgError(e?.msg || '保存失败')
    } finally {
        submitLoading.value = false
    }
}

onActivated(() => {
    getDetails()
})
getDetails()
</script>
