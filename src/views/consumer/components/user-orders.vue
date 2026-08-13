<template>
    <el-table size="large" v-loading="loading" :data="lists">
        <el-table-column label="订单号" prop="order_sn" min-width="160" />
        <el-table-column label="订单类型" prop="order_type_text" min-width="100" />
        <el-table-column label="订单金额" prop="order_amount" min-width="110">
            <template #default="{ row }">¥ {{ row.order_amount }}</template>
        </el-table-column>
        <el-table-column label="实付金额" prop="pay_amount" min-width="110">
            <template #default="{ row }">¥ {{ row.pay_amount }}</template>
        </el-table-column>
        <el-table-column label="订单状态" prop="order_status_text" min-width="100" />
        <el-table-column label="下单时间" prop="create_time" min-width="150" />
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
import { getUserOrders } from '@/api/consumer'

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
        const res: any = await getUserOrders({
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