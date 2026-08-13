<template>
    <popup
        ref="popupRef"
        title="修改预授信额度"
        width="500px"
        :async="true"
        @confirm="handleConfirm"
        @close="popupClose"
    >
        <el-form ref="formRef" :model="formData" label-width="110px" :rules="formRules">
            <el-form-item label="当前额度">
                <span class="text-tx-regular">¥ {{ currentCredit || 0 }}</span>
            </el-form-item>
            <el-form-item label="预授信额度" prop="credit">
                <el-input
                    v-model="formData.credit"
                    type="number"
                    placeholder="请输入预授信额度"
                    clearable
                />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input
                    v-model="formData.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="可选，备注本次调整原因"
                />
            </el-form-item>
        </el-form>
    </popup>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
import { updateCreditLimit } from '@/api/consumer'

const props = defineProps({
    show: { type: Boolean, required: true },
    userId: { type: [Number, String], default: '' },
    currentCredit: { type: [Number, String], default: 0 }
})
const emit = defineEmits<{
    (event: 'update:show', value: boolean): void
    (event: 'success'): void
}>()

const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()

const formData = reactive({
    credit: '',
    remark: ''
})

const formRules: FormRules = {
    credit: [
        { required: true, message: '请输入预授信额度' },
        {
            validator: (_r: any, v: any, cb: any) => {
                if (Number(v) < 0) cb(new Error('额度不可为负数'))
                else cb()
            }
        }
    ]
}

const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
        await feedback.confirm(
            `确认将用户【${props.userId}】的预授信额度修改为 ¥${formData.credit}？`
        )
    } catch {
        return
    }
    try {
        await updateCreditLimit({
            user_id: props.userId,
            credit: Number(formData.credit),
            remark: formData.remark
        })
        feedback.msgSuccess('额度修改成功')
        emit('success')
        popupRef.value?.close()
    } catch (e: any) {
        feedback.msgError(e?.msg || '修改失败')
    }
}

const popupClose = () => {
    emit('update:show', false)
    formRef.value?.resetFields()
}

watch(
    () => props.show,
    (val) => {
        if (val) popupRef.value?.open()
        else popupRef.value?.close()
    }
)
</script>