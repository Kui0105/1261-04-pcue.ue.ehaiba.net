<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="代理商信息">
                    <el-input
                        class="w-[220px]"
                        v-model="queryParams.keyword"
                        placeholder="真实姓名/联系电话"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select class="w-[200px]" v-model="queryParams.status" clearable placeholder="请选择状态">
                        <el-option label="启用" :value="1" />
                        <el-option label="禁用" :value="0" />
                    </el-select>
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
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getAgentList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户ID" prop="user_id" min-width="100" />
                <el-table-column label="真实姓名" prop="real_name" min-width="110" />
                <el-table-column label="联系电话" prop="contact_phone" min-width="130" />
                <el-table-column label="用户类型" prop="user_type_text" min-width="100" />
                <el-table-column label="邮箱" prop="email" min-width="180" />
                <el-table-column label="营业执照" min-width="120">
                    <template #default="{ row }">
                        <el-image
                            v-if="row.business_license"
                            :src="row.business_license"
                            style="width: 60px; height: 40px"
                            fit="contain"
                            :preview-src-list="[row.business_license]"
                            preview-teleported
                        />
                        <span v-else>--</span>
                    </template>
                </el-table-column>
                <el-table-column label="佣金余额" min-width="120">
                    <template #default="{ row }">¥ {{ row.commission_balance ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="累计佣金" min-width="120">
                    <template #default="{ row }">¥ {{ row.total_commission ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="已提现佣金" min-width="120">
                    <template #default="{ row }">¥ {{ row.withdrawn_commission ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="状态" min-width="90">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" prop="create_time" min-width="160" />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="goDetail(row)">
                            查看详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="agentList">
import { getAgentList, toggleAgentStatus } from '@/api/agent'
import { usePaging } from '@/hooks/usePaging'
import { useRouter } from 'vue-router'
import feedback from '@/utils/feedback'

const router = useRouter()

const goDetail = (row: any) => {
    router.push({ path: '/agent/detail', query: { id: row.id } })
}

const queryParams = reactive({
    keyword: '',
    status: '' as number | string,
    start_time: '',
    end_time: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getAgentList,
    params: queryParams,
    size: 20
})

// 状态切换
const handleStatusChange = async (row: any) => {
    const actionText = row.status == 1 ? '启用' : '禁用'
    try {
        await feedback.confirm(`确认${actionText}该代理商吗？`)
        await toggleAgentStatus({ id: row.id, status: row.status })
        feedback.msgSuccess(`${actionText}成功`)
    } catch (e: any) {
        row.status = row.status == 1 ? 0 : 1
        feedback.msgError(e?.msg || '操作失败')
    }
}

onActivated(() => {
    getLists()
})
getLists()
</script>
