<!-- 网站信息 -->
<template>
    <div class="website-information">
        <el-form
            ref="formRef"
            :rules="rules"
            class="ls-form"
            :model="formData"
            label-width="120px"
            scroll-to-error
        >
            <el-card shadow="never" class="!border-none">
                <div class="text-xl font-medium mb-[20px]">后台设置</div>
                <el-form-item label="网站名称" prop="name">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.name"
                            placeholder="请输入网站名称"
                            maxlength="30"
                            show-word-limit
                        />
                    </div>
                </el-form-item>
                <el-form-item label="网站图标" prop="web_favicon" required>
                    <div>
                        <material-picker v-model="formData.web_favicon" :limit="1" />
                        <div class="form-tips">建议尺寸：100*100像素，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
                <el-form-item label="网站LOGO" prop="web_logo" required>
                    <div>
                        <material-picker v-model.trim="formData.web_logo" :limit="1" />
                        <div class="form-tips">建议尺寸：100*100像素，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
                <el-form-item label="登录页广告图" prop="login_image" required>
                    <div>
                        <material-picker v-model.trim="formData.login_image" :limit="1" />
                        <div class="form-tips">建议尺寸：100*100像素，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
            </el-card>
            <el-card shadow="never" class="!border-none mt-4">
                <div class="text-xl font-medium mb-[20px]">PC端设置</div>
                <el-form-item label="PC端LOGO" prop="pc_logo">
                    <div>
                        <material-picker v-model="formData.pc_logo" :limit="1" />
                        <div class="form-tips">建议尺寸：120*28px，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
                <el-form-item label="网站标题" prop="pc_title">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.pc_title"
                            placeholder="请输入PC端网站标题"
                            maxlength="30"
                            show-word-limit
                        />
                    </div>
                </el-form-item>
                <el-form-item label="网站图标" prop="pc_ico">
                    <div>
                        <material-picker v-model="formData.pc_ico" :limit="1" />
                        <div class="form-tips">建议尺寸：100*100像素，支持jpg，jpeg，png格式</div>
                    </div>
                </el-form-item>
                <el-form-item label="网站描述" prop="pc_desc">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.pc_desc"
                            placeholder="请输入PC端网站描述"
                        />
                    </div>
                </el-form-item>
                <el-form-item label="网站关键词" prop="pc_keywords">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.pc_keywords"
                            placeholder="请输入PC端网站关键词"
                        />
                    </div>
                </el-form-item>
            </el-card>
            <el-card shadow="never" class="!border-none mt-4">
                <div class="text-xl font-medium mb-[20px]">代理商分润配置</div>
                <el-form-item label="一级返利比" prop="agent_rebate_one">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.agent_rebate_one"
                            placeholder="请输入一级返利比"
                            type="number"
                        >
                            <template #suffix>‰</template>
                        </el-input>
                        <div class="form-tips">单位：千分比（例如 50 表示 5%）</div>
                    </div>
                </el-form-item>
                <el-form-item label="二级返利比" prop="agent_rebate_two">
                    <div class="w-80">
                        <el-input
                            v-model.trim="formData.agent_rebate_two"
                            placeholder="请输入二级返利比"
                            type="number"
                        >
                            <template #suffix>‰</template>
                        </el-input>
                        <div class="form-tips">单位：千分比（例如 30 表示 3%）</div>
                    </div>
                </el-form-item>
            </el-card>
            <el-card shadow="never" class="!border-none mt-4">
                <div class="text-xl font-medium mb-[20px]">优惠折扣设置</div>
                <div class="form-tips mb-4">
                    折扣时间重叠或不重叠时，系统均按最低折扣（折扣数最小）计算优惠。
                </div>

                <!-- 日期折扣 -->
                <div class="font-medium mb-3">日期折扣（指定日期区间内的折扣）</div>
                <el-table :data="formData.date_discount" size="large" border>
                    <el-table-column label="开始日期" min-width="160">
                        <template #default="{ row }">
                            <el-date-picker
                                v-model="row.start_date"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="选择日期"
                                style="width: 100%"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="开始时" min-width="90" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.start_hour" placeholder="时">
                                <el-option v-for="h in hourOptions" :key="h" :label="h" :value="h" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="开始分" min-width="90" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.start_minute" placeholder="分">
                                <el-option v-for="m in minuteOptions" :key="m" :label="m" :value="m" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="结束日期" min-width="160">
                        <template #default="{ row }">
                            <el-date-picker
                                v-model="row.end_date"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="选择日期"
                                style="width: 100%"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="结束时" min-width="90" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.end_hour" placeholder="时">
                                <el-option v-for="h in hourOptions" :key="h" :label="h" :value="h" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="结束分" min-width="90" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.end_minute" placeholder="分">
                                <el-option v-for="m in minuteOptions" :key="m" :label="m" :value="m" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="折扣数" min-width="150">
                        <template #default="{ row }">
                            <el-input v-model="row.discount" type="number" placeholder="如 9 表示 9 折">
                                <template #suffix>折</template>
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="80" fixed="right" align="center">
                        <template #default="{ $index }">
                            <el-button
                                type="danger"
                                link
                                @click="formData.date_discount.splice($index, 1)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button class="mt-3" type="primary" plain @click="addDateDiscount">
                    + 添加日期折扣
                </el-button>

                <!-- 每日折扣 -->
                <div class="font-medium mb-3 mt-6">每日折扣（每天固定时段的折扣）</div>
                <el-table :data="formData.daily_discount" size="large" border>
                    <el-table-column label="开始时" min-width="100" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.start_hour" placeholder="时">
                                <el-option v-for="h in hourOptions" :key="h" :label="h" :value="h" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="开始分" min-width="100" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.start_minute" placeholder="分">
                                <el-option v-for="m in minuteOptions" :key="m" :label="m" :value="m" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="结束时" min-width="100" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.end_hour" placeholder="时">
                                <el-option v-for="h in hourOptions" :key="h" :label="h" :value="h" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="结束分" min-width="100" align="center">
                        <template #default="{ row }">
                            <el-select v-model="row.end_minute" placeholder="分">
                                <el-option v-for="m in minuteOptions" :key="m" :label="m" :value="m" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="折扣数" min-width="150">
                        <template #default="{ row }">
                            <el-input v-model="row.discount" type="number" placeholder="如 8.5 表示 8.5 折">
                                <template #suffix>折</template>
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="80" fixed="right" align="center">
                        <template #default="{ $index }">
                            <el-button
                                type="danger"
                                link
                                @click="formData.daily_discount.splice($index, 1)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button class="mt-3" type="primary" plain @click="addDailyDiscount">
                    + 添加每日折扣
                </el-button>
            </el-card>
        </el-form>
        <footer-btns v-perms="['setting.web.web_setting/setWebsite']">
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="webInformation">
import type { FormInstance } from 'element-plus'

import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'

const formRef = ref<FormInstance>()

const appStore = useAppStore()
// 表单数据
const formData = reactive({
    name: '', // 网站名称
    web_favicon: '', // 网站图标
    web_logo: '', // 网站logo
    login_image: '', // 登录页广告图
    pc_logo: '',
    pc_title: '',
    pc_desc: '',
    pc_ico: '',
    pc_keywords: '',
    agent_rebate_one: '', // 一级返利比
    agent_rebate_two: '', // 二级返利比
    date_discount: [] as any[], // 日期折扣
    daily_discount: [] as any[] // 每日折扣
})

// 表单验证
const rules = {
    name: [
        {
            required: true,
            message: '请输入网站名称',
            trigger: ['blur']
        }
    ],
    web_favicon: [
        {
            required: true,
            message: '请选择网站图标',
            trigger: ['change']
        }
    ],
    web_logo: [
        {
            required: true,
            message: '请选择网站logo',
            trigger: ['change']
        }
    ],
    login_image: [
        {
            required: true,
            message: '请选择登录页广告图',
            trigger: ['change']
        }
    ],
    pc_logo: [
        {
            required: true,
            message: '请选择PC端LOGO',
            trigger: ['change']
        }
    ],
    pc_title: [
        {
            required: true,
            message: '请输入PC端网站标题',
            trigger: ['blur']
        }
    ],
    pc_ico: [
        {
            required: true,
            message: '请选择PC端网站图标',
            trigger: ['change']
        }
    ]
}

// 时/分下拉选项
const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

// 新增日期折扣行
const addDateDiscount = () => {
    formData.date_discount.push({
        start_date: '',
        start_hour: '00',
        start_minute: '00',
        end_date: '',
        end_hour: '23',
        end_minute: '59',
        discount: ''
    })
}

// 新增每日折扣行
const addDailyDiscount = () => {
    formData.daily_discount.push({
        start_hour: '00',
        start_minute: '00',
        end_hour: '23',
        end_minute: '59',
        discount: ''
    })
}

// 获取备案信息
const getData = async () => {
    const data = await getWebsite()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key]
    }
    // 后端未返回对应字段时，保持数组结构，避免表格渲染报错
    if (!Array.isArray(formData.date_discount)) formData.date_discount = []
    if (!Array.isArray(formData.daily_discount)) formData.daily_discount = []
}

// 设置备案信息
const handleSubmit = async () => {
    await formRef.value?.validate()
    await setWebsite(formData)
    appStore.getConfig()
    getData()
}

getData()
</script>

<style lang="scss" scoped></style>
