<template>
    <div>
        <el-card class="!border-none" shadow="never">
            <el-page-header content="订单详情" @back="router.back()" />
        </el-card>

        <!-- 基本信息 -->
        <el-card class="mt-4 !border-none" header="基本信息" shadow="never">
            <el-form class="ls-form" :model="formData" label-width="120px">
                <el-form-item label="订单号：">{{ formData.order_sn || '--' }}</el-form-item>
                <el-form-item label="订单类型：">
                    <el-tag size="small">{{ formData.order_type_text || '--' }}</el-tag>
                </el-form-item>
                <template v-if="formData.order_type == 1">
                    <el-form-item label="运营商：">{{ formData.operator || '--' }}</el-form-item>
                    <el-form-item label="面额：">{{ formData.denomination || '--' }}</el-form-item>
                </template>
                <el-form-item label="税费类型：">{{ formData.tax_type_text || '--' }}</el-form-item>
                <el-form-item label="单价：">¥ {{ formData.unit_price ?? 0 }}</el-form-item>
                <el-form-item label="总额：">¥ {{ formData.total_amount ?? 0 }}</el-form-item>
                <el-form-item label="状态：">
                    <el-tag
                        :type="
                            formData.order_status == 1
                                ? 'success'
                                : formData.order_status == 0
                                ? 'warning'
                                : 'danger'
                        "
                        size="small"
                    >
                        {{ formData.order_status_text || '--' }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="提交时间：">{{ formData.create_time || '--' }}</el-form-item>
                <el-form-item v-if="formData.order_type == 2" label="短信模板：">
                    {{ formData.sms_template || '--' }}
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-card class="mt-4 !border-none" header="卡片数据" shadow="never">
            <el-row :gutter="16">
                <el-col :span="4" :xs="12">
                    <div class="text-tx-secondary text-sm">号码总数</div>
                    <div class="text-2xl font-semibold mt-1">
                        {{ formData.stats?.total_num ?? 0 }}
                    </div>
                </el-col>
                <el-col :span="5" :xs="12">
                    <div class="text-tx-secondary text-sm">进行中数量</div>
                    <div class="text-2xl font-semibold mt-1 text-warning">
                        {{ formData.stats?.pending_num ?? 0 }}
                    </div>
                </el-col>
                <el-col :span="5" :xs="12">
                    <div class="text-tx-secondary text-sm">成功数量</div>
                    <div class="text-2xl font-semibold mt-1 text-success">
                        {{ formData.stats?.success_num ?? 0 }}
                    </div>
                </el-col>
                <el-col :span="5" :xs="12">
                    <div class="text-tx-secondary text-sm">失败数量</div>
                    <div class="text-2xl font-semibold mt-1 text-error">
                        {{ formData.stats?.fail_num ?? 0 }}
                    </div>
                </el-col>
                <el-col :span="5" :xs="12">
                    <div class="text-tx-secondary text-sm">退款总额</div>
                    <div class="text-2xl font-semibold mt-1">
                        ¥ {{ formData.stats?.refund_amount ?? 0 }}
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 明细列表 -->
        <el-card class="mt-4 !border-none" header="明细列表" shadow="never">
            <el-form ref="itemFormRef" class="mb-[-16px]" :model="itemQueryParams" :inline="true">
                <el-form-item label="手机号码">
                    <el-input
                        class="w-[220px]"
                        v-model="itemQueryParams.mobile"
                        placeholder="请输入手机号码"
                        clearable
                        @keyup.enter="resetItemPage"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select class="w-[160px]" v-model="itemQueryParams.status" clearable>
                        <el-option label="全部" value="" />
                        <el-option
                            v-for="item in statusOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetItemPage">查询</el-button>
                    <el-button @click="resetItemParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="getOrderItemList"
                        :params="itemQueryParams"
                        :page-size="itemPager.size"
                    />
                </el-form-item>
            </el-form>

            <el-table
                class="mt-4"
                size="large"
                v-loading="itemPager.loading"
                :data="itemPager.lists"
            >
                <el-table-column label="手机号码" prop="mobile" min-width="130" />
                <el-table-column label="状态" min-width="110">
                    <template #default="{ row }">
                        <el-tag
                            :type="
                                row.status == 1 ? 'success' : row.status == 0 ? 'warning' : 'danger'
                            "
                            size="small"
                        >
                            {{ row.status_text }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="formData.order_type == 1 ? '充值结果说明' : '发送结果说明'"
                    prop="result_desc"
                    min-width="180"
                    show-overflow-tooltip
                />
                <el-table-column label="回调时间" prop="callback_time" min-width="160" />
            </el-table>
            <div class="flex justify-end mt-4">
                <pagination v-model="itemPager" @change="getItemLists" />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="consumerOrderDetail">
import { getOrderDetail, getOrderItemList } from '@/api/order'
import { usePaging } from '@/hooks/usePaging'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.query.id)

const formData = reactive<any>({
    id: '',
    order_sn: '',
    order_type: 1,
    order_type_text: '',
    operator: '',
    denomination: 0,
    tax_type: 1,
    tax_type_text: '',
    unit_price: 0,
    total_amount: 0,
    order_status: 0,
    order_status_text: '',
    create_time: '',
    sms_template: '',
    stats: {
        total_num: 0,
        pending_num: 0,
        success_num: 0,
        fail_num: 0,
        refund_amount: 0
    }
})

const statusOptions = computed(() => {
    if (formData.order_type == 1) {
        return [
            { label: '充值中', value: 0 },
            { label: '充值成功', value: 1 },
            { label: '充值失败', value: 2 }
        ]
    }
    return [
        { label: '发送中', value: 0 },
        { label: '发送成功', value: 1 },
        { label: '发送失败', value: 2 }
    ]
})

const getDetails = async () => {
    const data: any = await getOrderDetail({ id: orderId.value })
    Object.assign(formData, {
        id: data?.id ?? '',
        order_sn: data?.order_sn ?? '',
        order_type: data?.order_type ?? 1,
        order_type_text: data?.order_type_text ?? '',
        operator: data?.operator ?? '',
        denomination: data?.denomination ?? 0,
        tax_type: data?.tax_type ?? 1,
        tax_type_text: data?.tax_type_text ?? '',
        unit_price: data?.unit_price ?? 0,
        total_amount: data?.total_amount ?? 0,
        order_status: data?.order_status ?? 0,
        order_status_text: data?.order_status_text ?? '',
        create_time: data?.create_time ?? '',
        sms_template: data?.sms_template ?? '',
        stats: data?.stats ?? {
            total_num: 0,
            pending_num: 0,
            success_num: 0,
            fail_num: 0,
            refund_amount: 0
        }
    })
}

const itemQueryParams = reactive({
    order_id: orderId.value,
    mobile: '',
    status: '' as number | string
})

const {
    pager: itemPager,
    getLists: getItemLists,
    resetPage: resetItemPage,
    resetParams: resetItemParams
} = usePaging({
    fetchFun: getOrderItemList,
    params: itemQueryParams,
    size: 20
})

watch(orderId, () => {
    itemQueryParams.order_id = orderId.value
    getDetails()
    resetItemPage()
})

getDetails()
resetItemPage()
</script>
