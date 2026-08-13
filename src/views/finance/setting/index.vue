<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <div class="mb-7">
                <div class="text-base font-medium leading-6">提现设置</div>
                <div class="text-tx-secondary text-sm mt-1.5">
                    配置代理商提现的额度限制与手续费规则，保存后即时生效
                </div>
            </div>
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="190px"
                class="setting-form"
                style="max-width: 680px"
            >
                <el-form-item label="最低提现额度" prop="min_amount">
                    <div>
                        <div class="flex items-center">
                            <el-input-number
                                v-model="formData.min_amount"
                                :min="0"
                                :precision="2"
                                :step="1"
                                :controls="false"
                                placeholder="请输入最低提现额度"
                                class="!w-[220px]"
                            />
                            <span class="text-tx-secondary text-sm ml-3">元</span>
                        </div>
                        <div class="form-tip">单笔提现申请不得低于此金额</div>
                    </div>
                </el-form-item>
                <el-form-item label="单笔最高提现额度" prop="single_max_amount">
                    <div>
                        <div class="flex items-center">
                            <el-input-number
                                v-model="formData.single_max_amount"
                                :min="0"
                                :precision="2"
                                :step="100"
                                :controls="false"
                                placeholder="请输入单笔最高提现额度"
                                class="!w-[220px]"
                            />
                            <span class="text-tx-secondary text-sm ml-3">元</span>
                        </div>
                        <div class="form-tip">单笔提现金额的上限</div>
                    </div>
                </el-form-item>
                <el-form-item label="单日累计最高提现额度" prop="daily_max_amount">
                    <div>
                        <div class="flex items-center">
                            <el-input-number
                                v-model="formData.daily_max_amount"
                                :min="0"
                                :precision="2"
                                :step="1000"
                                :controls="false"
                                placeholder="请输入单日累计最高提现额度"
                                class="!w-[220px]"
                            />
                            <span class="text-tx-secondary text-sm ml-3">元</span>
                        </div>
                        <div class="form-tip">同一代理商每日提现累计上限</div>
                    </div>
                </el-form-item>
                <el-form-item label="提现手续费" prop="fee_rate">
                    <div>
                        <div class="flex items-center">
                            <el-input-number
                                v-model="formData.fee_rate"
                                :min="0"
                                :max="100"
                                :precision="2"
                                :step="0.1"
                                :controls="false"
                                placeholder="请输入百分比"
                                class="!w-[220px]"
                            />
                            <span class="text-tx-secondary text-sm ml-3">%</span>
                        </div>
                        <div class="form-tip">每笔提现按比例收取手续费（0 ~ 100%）</div>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                        保存设置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
.setting-form {
    :deep(.el-form-item) {
        margin-bottom: 22px;
    }
    :deep(.el-input-number) {
        width: 220px;
    }
    .form-tip {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 18px;
        margin-top: 6px;
    }
}
</style>

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
