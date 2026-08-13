<template>
    <el-table size="large" v-loading="loading" :data="lists">
        <el-table-column label="流水号" prop="sn" min-width="180" />
        <el-table-column label="类型" prop="type_text" min-width="100" />
        <el-table-column label="变动金额" prop="change_amount" min-width="110">
            <template #default="{ row }">
                <span :class="Number(row.change_amount) >= 0 ? 'text-success' : 'text-error'">
                    {{ Number(row.change_amount) >= 0 ? '+' : '' }}¥ {{ row.change_amount }}
                </span>
            </template>
        </el-table-column>
        <el-table-column label="变动后余额" prop="after_money" min-width="110">
            <template #default="{ row }">¥ {{ row.after_money }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="时间" prop="create_time" min-width="150" />
    </el-table>
    <div class="flex justify-end mt-4">
        <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :total="count"
            :page-sizes="[15, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="fetch"
            @size-change="fetch"
        />
    </div>
</template>

<script lang="ts" setup>
import { getUserTransactions } from '@/api/consumer'

const props = defineProps({
    userId: { type: [Number, String], default: '' }
})

const lists = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const size = ref(15)
const count = ref(0)

const fetch = async () => {
    if (!props.userId) return
    loading.value = true
    try {
        const res: any = await getUserTransactions({
            user_id: props.userId,
            page_no: page.value,
            page_size: size.value
        })
        lists.value = res?.lists || []
        count.value = res?.count || 0
    } finally {
        loading.value = false
    }
}

watch(
    () => props.userId,
    () => {
        page.value = 1
        fetch()
    },
    { immediate: true }
)
</script>