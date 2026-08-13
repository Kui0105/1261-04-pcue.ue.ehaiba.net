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
    agent_rebate_two: '' // 二级返利比
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

// 获取备案信息
const getData = async () => {
    const data = await getWebsite()
    for (const key in formData) {
        //@ts-ignore
        formData[key] = data[key]
    }
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
