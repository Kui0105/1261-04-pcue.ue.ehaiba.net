<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-page-header content="用户详情" @back="$router.back()" />
        </el-card>

        <!-- 基本信息 -->
        <el-card class="mt-4 !border-none" header="基本信息" shadow="never">
            <el-form class="ls-form" :model="formData" label-width="120px">
                <div class="bg-page flex py-5 mb-6 items-center">
                    <div class="basis-40 flex flex-col justify-center items-center">
                        <div class="mb-2 text-tx-regular">用户头像</div>
                        <el-avatar :src="formData.avatar" :size="58" />
                    </div>
                    <div class="basis-40 flex flex-col justify-center items-center">
                        <div class="text-tx-regular">用户状态</div>
                        <div class="mt-2">
                            <el-tag :type="formData.status == 1 ? 'success' : 'danger'" size="small">
                                {{ formData.status == 1 ? '启用' : '禁用' }}
                            </el-tag>
                        </div>
                    </div>
                </div>
                <el-form-item label="用户ID：">{{ formData.id }}</el-form-item>
                <el-form-item label="用户昵称：">{{ formData.nickname || '--' }}</el-form-item>
                <el-form-item label="手机号码：">{{ formData.mobile || '--' }}</el-form-item>
                <el-form-item label="用户类型：">
                    <el-tag :type="formData.user_type == 2 ? 'warning' : 'info'" size="small">
                        {{ formData.user_type == 2 ? '企业' : '个人' }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="上级用户：">
                    <span v-if="formData.parent_user">
                        {{ formData.parent_user.nickname }}（{{ formData.parent_user.id }}）
                    </span>
                    <span v-else class="text-tx-secondary">--</span>
                </el-form-item>
                <el-form-item label="注册时间：">{{ formData.create_time || '--' }}</el-form-item>
                <el-form-item
                    v-if="formData.user_type == 1"
                    label="累计消费金额："
                >
                    ¥ {{ formData.total_consume ?? 0 }}
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 账户信息 -->
        <el-card
            v-if="formData.user_type != 1"
            class="mt-4 !border-none"
            header="账户信息"
            shadow="never"
        >
            <div class="flex flex-wrap">
                <div class="account-cell">
                    <div class="text-tx-secondary text-sm">用户余额</div>
                    <div class="text-2xl font-semibold mt-1">¥ {{ formData.user_money ?? 0 }}</div>
                </div>
                <div class="account-cell">
                    <div class="text-tx-secondary text-sm">预授信额度</div>
                    <div class="text-2xl font-semibold mt-1">¥ {{ formData.credit_limit ?? 0 }}</div>
                </div>
                <div class="account-cell">
                    <div class="text-tx-secondary text-sm">累计充值金额</div>
                    <div class="text-2xl font-semibold mt-1">
                        ¥ {{ formData.total_recharge ?? 0 }}
                    </div>
                </div>
                <div class="account-cell">
                    <div class="text-tx-secondary text-sm">累计消费金额</div>
                    <div class="text-2xl font-semibold mt-1">
                        ¥ {{ formData.total_consume ?? 0 }}
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 订单 & 交易记录 TAB -->
        <el-card class="mt-4 !border-none" shadow="never">
            <el-tabs v-model="activeTab">
                <el-tab-pane label="订单列表" name="orders">
                    <user-orders :user-id="userId" />
                </el-tab-pane>
                <el-tab-pane label="交易记录" name="transactions">
                    <user-transactions :user-id="userId" />
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="consumerDetail">
import { getUserDetail } from '@/api/consumer'

import UserOrders from '../components/user-orders.vue'
import UserTransactions from '../components/user-transactions.vue'

const route = useRoute()
const userId = computed(() => route.query.id)

const activeTab = ref<'orders' | 'transactions'>('orders')

const formData = reactive<any>({
    id: '',
    avatar: '',
    nickname: '',
    mobile: '',
    user_type: 1,
    parent_user: null as { id: number | string; nickname: string } | null,
    status: 1,
    create_time: '',
    user_money: 0,
    credit_limit: 0,
    total_recharge: 0,
    total_consume: 0
})

const getDetails = async () => {
    const data: any = await getUserDetail({ id: userId.value })
    Object.assign(formData, {
        id: data?.id ?? '',
        avatar: data?.avatar ?? '',
        nickname: data?.nickname ?? '',
        mobile: data?.mobile ?? '',
        user_type: data?.user_type ?? 1,
        parent_user: data?.parent_user ?? null,
        status: data?.status ?? 1,
        create_time: data?.create_time ?? '',
        user_money: data?.user_money ?? 0,
        credit_limit: data?.credit_limit ?? 0,
        total_recharge: data?.total_recharge ?? 0,
        total_consume: data?.total_consume ?? 0
    })
}

watch(userId, () => getDetails(), { immediate: true })
</script>

<style lang="scss" scoped>
.account-cell {
    width: 25%;
    padding: 12px 16px;
    border-right: 1px solid var(--el-border-color-lighter);
    &:last-child {
        border-right: none;
    }
    @media (max-width: 768px) {
        width: 50%;
        &:nth-child(2) {
            border-right: none;
        }
    }
}
</style>