<template>
    <div>
        <!-- 顶部筛选 -->
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item label="用户信息">
                    <el-input
                        class="w-[280px]"
                        v-model="queryParams.keyword"
                        placeholder="用户ID/用户昵称/手机号码"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-select class="w-[160px]" v-model="queryParams.user_type" clearable>
                        <el-option label="全部" value="" />
                        <el-option label="个人" :value="1" />
                        <el-option label="企业" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="注册时间">
                    <daterange-picker
                        v-model:startTime="queryParams.create_time_start"
                        v-model:endTime="queryParams.create_time_end"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getUserList"
                        :params="queryParams"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 列表 -->
        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="用户ID" prop="id" min-width="80" />
                <el-table-column label="用户头像" min-width="80">
                    <template #default="{ row }">
                        <el-avatar :src="row.avatar" :size="40" />
                    </template>
                </el-table-column>
                <el-table-column label="用户昵称" prop="nickname" min-width="120" />
                <el-table-column label="手机号码" prop="mobile" min-width="120" />
                <el-table-column label="用户类型" prop="user_type_text" min-width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.user_type == 2 ? 'warning' : 'info'" size="small">
                            {{ row.user_type_text || (row.user_type == 2 ? '企业' : '个人') }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="上级用户" min-width="160" show-overflow-tooltip>
                    <template #default="{ row }">
                        <span v-if="row.parent_user">
                            {{ row.parent_user.nickname }}（{{ row.parent_user.id }}）
                        </span>
                        <span v-else class="text-tx-secondary">--</span>
                    </template>
                </el-table-column>
                <el-table-column label="余额" min-width="110">
                    <template #default="{ row }">¥ {{ row.user_money ?? 0 }}</template>
                </el-table-column>
                <el-table-column label="用户状态" min-width="90">
                    <template #default="{ row }">
                        <el-switch
                            :model-value="row.status == 1"
                            :loading="row._statusLoading"
                            :active-text="row.status == 1 ? '启用' : '禁用'"
                            inline-prompt
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="注册时间" prop="create_time" min-width="150" />
                <el-table-column label="操作" width="320" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            v-perms="['user.user/detail']"
                            type="primary"
                            link
                            @click="goDetail(row)"
                        >
                            详情
                        </el-button>
                        <el-button type="primary" link @click="openRecharge(row)">
                            余额充值
                        </el-button>
                        <el-button type="primary" link @click="openCredit(row)">
                            修改额度
                        </el-button>
                        <el-button type="primary" link @click="openParent(row)">
                            修改上级
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 弹窗 -->
        <user-recharge
            v-model:show="dialog.recharge"
            :user-id="dialog.userId"
            :admin-mobile="dialog.adminMobile"
            @success="onDialogSuccess"
        />
        <user-credit
            v-model:show="dialog.credit"
            :user-id="dialog.userId"
            :current-credit="dialog.currentCredit"
            @success="onDialogSuccess"
        />
        <user-parent
            v-model:show="dialog.parent"
            :user-id="dialog.userId"
            :current-parent="dialog.currentParent"
            @success="onDialogSuccess"
        />
    </div>
</template>

<script lang="ts" setup name="consumerLists">
import {
    getUserList,
    toggleUserStatus
} from '@/api/consumer'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

import UserRecharge from '../components/user-recharge.vue'
import UserCredit from '../components/user-credit.vue'
import UserParent from '../components/user-parent.vue'

const router = useRouter()

const queryParams = reactive({
    keyword: '',
    user_type: '' as number | string,
    create_time_start: '',
    create_time_end: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getUserList,
    params: queryParams
})

// 弹窗状态
const dialog = reactive({
    recharge: false,
    credit: false,
    parent: false,
    userId: '' as number | string,
    adminMobile: '',
    currentCredit: 0,
    currentParent: null as { id: number | string; nickname: string } | null
})

const openRecharge = (row: any) => {
    dialog.userId = row.id
    dialog.adminMobile = row.admin_mobile || row.mobile || ''
    dialog.recharge = true
}
const openCredit = (row: any) => {
    dialog.userId = row.id
    dialog.currentCredit = row.credit_limit ?? 0
    dialog.credit = true
}
const openParent = (row: any) => {
    dialog.userId = row.id
    dialog.currentParent = row.parent_user
        ? { id: row.parent_user.id, nickname: row.parent_user.nickname }
        : null
    dialog.parent = true
}
const onDialogSuccess = () => {
    getLists()
}

// 启用/禁用
const handleStatusChange = async (row: any) => {
    const next = row.status == 1 ? 0 : 1
    row._statusLoading = true
    try {
        await toggleUserStatus({ id: row.id, status: next })
        row.status = next
    } catch (e: any) {
        feedback.msgError(e?.msg || '状态切换失败')
    } finally {
        row._statusLoading = false
    }
}

const goDetail = (row: any) => {
    router.push({ path: '/consumer/lists/detail', query: { id: row.id } })
}

onActivated(() => {
    getLists()
})
getLists()
</script>