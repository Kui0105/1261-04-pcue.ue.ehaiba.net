<template>
    <popup
        ref="popupRef"
        title="余额充值"
        width="500px"
        :async="true"
        @confirm="handleConfirm"
        @close="popupClose"
    >
        <el-form ref="formRef" :model="formData" label-width="110px" :rules="formRules">
            <el-form-item label="充值金额" prop="amount">
                <el-input
                    v-model="formData.amount"
                    type="number"
                    placeholder="请输入充值金额"
                    clearable
                />
            </el-form-item>
            <el-form-item label="管理手机号">
                <span class="text-tx-regular">{{ adminMobile || '--' }}</span>
            </el-form-item>
            <el-form-item label="验证码" prop="code">
                <div class="flex">
                    <el-input
                        v-model="formData.code"
                        placeholder="请输入验证码"
                        clearable
                        maxlength="6"
                    />
                    <el-button
                        class="!ml-2"
                        :disabled="countdown > 0"
                        @click="handleSendCode"
                    >
                        {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
                    </el-button>
                </div>
            </el-form-item>
        </el-form>
    </popup>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
import { rechargeUser, sendRechargeCode } from '@/api/consumer'

const props = defineProps({
    show: { type: Boolean, required: true },
    userId: { type: [Number, String], default: '' },
    adminMobile: { type: String, default: '' }
})
const emit = defineEmits<{
    (event: 'update:show', value: boolean): void
    (event: 'success'): void
}>()

const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()

const formData = reactive({
    amount: '',
    code: ''
})

const formRules: FormRules = {
    amount: [{ required: true, message: '请输入充值金额' }],
    code: [{ required: true, message: '请输入验证码' }]
}

const countdown = ref(0)
let timer: any = null

const startCountdown = () => {
    countdown.value = 60
    timer = setInterval(() => {
        countdown.value -= 1
        if (countdown.value <= 0) {
            clearInterval(timer)
            timer = null
        }
    }, 1000)
}

const handleSendCode = async () => {
    try {
        await sendRechargeCode({ user_id: props.userId })
        feedback.msgSuccess('验证码已发送')
        startCountdown()
    } catch (e: any) {
        feedback.msgError(e?.msg || '验证码发送失败')
    }
}

const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
        await feedback.confirm(
            `确认向用户【${props.userId}】充值 ¥${formData.amount} 元？`
        )
    } catch {
        return
    }
    try {
        await rechargeUser({
            user_id: props.userId,
            amount: Number(formData.amount),
            code: formData.code
        })
        feedback.msgSuccess('充值成功')
        emit('success')
        popupRef.value?.close()
    } catch (e: any) {
        feedback.msgError(e?.msg || '充值失败')
    }
}

const popupClose = () => {
    emit('update:show', false)
    formRef.value?.resetFields()
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    countdown.value = 0
}

watch(
    () => props.show,
    (val) => {
        if (val) popupRef.value?.open()
        else popupRef.value?.close()
    }
)
</script>