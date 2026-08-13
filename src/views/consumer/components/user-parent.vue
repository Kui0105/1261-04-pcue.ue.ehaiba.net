<template>
    <popup
        ref="popupRef"
        title="修改上级用户"
        width="500px"
        :async="true"
        @confirm="handleConfirm"
        @close="popupClose"
    >
        <el-form label-width="110px">
            <el-form-item label="当前上级">
                <span class="text-tx-regular">
                    {{ currentParent ? `${currentParent.id} / ${currentParent.nickname}` : '--' }}
                </span>
            </el-form-item>
            <el-form-item label="选择上级" required>
                <el-select
                    v-model="selectedId"
                    filterable
                    remote
                    reserve-keyword
                    :remote-method="handleSearch"
                    :loading="searching"
                    placeholder="输入用户ID/昵称/手机号搜索"
                    style="width: 100%"
                    clearable
                >
                    <el-option
                        v-for="item in options"
                        :key="item.id"
                        :label="`${item.id} / ${item.nickname} / ${item.mobile || ''}`"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>
    </popup>
</template>

<script lang="ts" setup>
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
import { searchUser, updateParentUser } from '@/api/consumer'

const props = defineProps({
    show: { type: Boolean, required: true },
    userId: { type: [Number, String], default: '' },
    currentParent: {
        type: Object as () => { id: number | string; nickname: string } | null,
        default: null
    }
})
const emit = defineEmits<{
    (event: 'update:show', value: boolean): void
    (event: 'success'): void
}>()

const popupRef = shallowRef<InstanceType<typeof Popup>>()
const selectedId = ref<number | string | ''>('')
const options = ref<any[]>([])
const searching = ref(false)
let lastKeyword = ''

const handleSearch = async (keyword: string) => {
    lastKeyword = keyword
    if (!keyword) {
        options.value = []
        return
    }
    searching.value = true
    try {
        const res: any = await searchUser({ keyword, exclude_id: props.userId })
        if (lastKeyword !== keyword) return
        options.value = res?.lists || res || []
    } catch (e: any) {
        feedback.msgError(e?.msg || '搜索失败')
    } finally {
        searching.value = false
    }
}

const handleConfirm = async () => {
    if (!selectedId.value) {
        feedback.msgError('请选择上级用户')
        return
    }
    try {
        await feedback.confirm(
            `确认将用户【${props.userId}】的上级修改为【${selectedId.value}】？`
        )
    } catch {
        return
    }
    try {
        await updateParentUser({
            user_id: props.userId,
            parent_id: selectedId.value
        })
        feedback.msgSuccess('上级修改成功')
        emit('success')
        popupRef.value?.close()
    } catch (e: any) {
        feedback.msgError(e?.msg || '修改失败')
    }
}

const popupClose = () => {
    emit('update:show', false)
    selectedId.value = ''
    options.value = []
}

watch(
    () => props.show,
    (val) => {
        if (val) popupRef.value?.open()
        else popupRef.value?.close()
    }
)
</script>