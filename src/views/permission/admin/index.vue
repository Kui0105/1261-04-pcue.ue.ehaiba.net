<template>
    <div class="admin">
        <el-card class="!border-none" shadow="never">
            <el-form class="mb-[-16px]" :model="formData" inline>
                <el-form-item label="管理员账号">
                    <el-input
                        v-model="formData.account"
                        class="w-[280px]"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="管理员名称">
                    <el-input
                        v-model="formData.name"
                        class="w-[280px]"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item label="管理员角色">
                    <el-select class="w-[280px]" v-model="formData.role_id">
                        <el-option label="全部" value="" />
                        <el-option
                            v-for="(item, index) in optionsData.role"
                            :key="index"
                            :label="item.name"
                            :value="item.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                    <export-data
                        class="ml-2.5"
                        :fetch-fun="adminLists"
                        :params="formData"
                        :page-size="pager.size"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-card v-loading="pager.loading" class="mt-4 !border-none" shadow="never">
            <el-button v-perms="['auth.admin/add']" type="primary" @click="handleAdd">
                <template #icon>
                    <icon name="el-icon-Plus" />
                </template>
                新增
            </el-button>
            <div class="mt-4">
                <el-table :data="pager.lists" size="large">
                    <el-table-column label="ID" prop="id" min-width="60" />>
                    <el-table-column label="头像" min-width="100">
                        <template #default="{ row }">
                            <el-avatar :size="50" :src="row.avatar"></el-avatar>
                        </template>
                    </el-table-column>
                    <el-table-column label="账号" prop="account" min-width="100" />
                    <el-table-column label="名称" prop="name" min-width="100" />
                    <el-table-column
                        label="角色"
                        prop="role_name"
                        min-width="100"
                        show-tooltip-when-overflow
                    />
                    <el-table-column
                        label="部门"
                        prop="dept_name"
                        min-width="100"
                        show-tooltip-when-overflow
                    />
                    <el-table-column label="创建时间" prop="create_time" min-width="180" />
                    <el-table-column label="最近登录时间" prop="login_time" min-width="180" />
                    <el-table-column label="最近登录IP" prop="login_ip" min-width="120" />
                    <el-table-column label="状态" min-width="100" v-perms="['auth.admin/edit']">
                        <template #default="{ row }">
                            <el-switch
                                v-if="row.root != 1"
                                v-model="row.disable"
                                :active-value="0"
                                :inactive-value="1"
                                @change="changeStatus(row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" fixed="right">
                        <template #default="{ row }">
                            <el-button
                                v-perms="['auth.admin/bindUsers']"
                                type="primary"
                                link
                                @click="handleBind(row)"
                            >
                                用户绑定
                            </el-button>
                            <el-button
                                v-perms="['auth.admin/edit']"
                                type="primary"
                                link
                                @click="handleEdit(row)"
                            >
                                编辑
                            </el-button>
                            <el-button
                                v-if="row.root != 1"
                                v-perms="['auth.admin/delete']"
                                type="danger"
                                link
                                @click="handleDelete(row.id)"
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="flex mt-4 justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>
        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />

        <!-- 用户绑定 -->
        <el-dialog
            v-model="bindDialogVisible"
            title="用户绑定"
            width="760px"
            :close-on-click-modal="false"
            @closed="bindDialogVisible = false"
        >
            <el-form :model="userQuery" inline class="mb-2">
                <el-form-item label="用户昵称/手机号">
                    <el-input
                        v-model="userQuery.keyword"
                        class="w-[240px]"
                        clearable
                        placeholder="请输入用户昵称/手机号"
                        @keyup.enter="resetUserPage"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetUserPage">查询</el-button>
                </el-form-item>
            </el-form>
            <el-table
                ref="userTableRef"
                row-key="id"
                :data="userPager.lists"
                size="large"
                height="360px"
                v-loading="userPager.loading"
                @selection-change="handleUserSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column label="用户昵称" prop="nickname" min-width="140" />
                <el-table-column label="手机号" prop="mobile" min-width="140" />
                <el-table-column label="用户类型" prop="user_type_text" min-width="100" />
                <el-table-column label="注册时间" prop="create_time" min-width="180" />
            </el-table>
            <div class="flex mt-4 justify-end">
                <el-pagination
                    v-model:current-page="userPager.page"
                    v-model:page-size="userPager.size"
                    :total="userPager.count"
                    :page-sizes="[15, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    background
                    @change="fetchUsers"
                />
            </div>
            <template #footer>
                <span class="mr-2 text-gray-400">已选 {{ selectedUserIds.length }} 个用户</span>
                <el-button @click="bindDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleBindSubmit">确定绑定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup name="admin">
import {
    adminDelete,
    adminEdit,
    adminLists,
    getAdminBindUsers,
    setAdminBindUsers
} from '@/api/perms/admin'
import { roleAll } from '@/api/perms/role'
import { getUserList } from '@/api/consumer'
import { useDictOptions } from '@/hooks/useDictOptions'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
// 表单数据
const formData = reactive({
    account: '',
    name: '',
    role_id: ''
})
const showEdit = ref(false)
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: adminLists,
    params: formData
})

const changeStatus = (data: any) => {
    adminEdit({
        id: data.id,
        avatar: data.avatar,
        account: data.account,
        name: data.name,
        role_id: data.role_id,
        job_id: data.job_id,
        dept_id: data.dept_id,
        disable: data.disable,
        multipoint_login: data.multipoint_login
    }).finally(() => {
        getLists()
    })
}
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await adminDelete({ id })
    getLists()
}

const { optionsData } = useDictOptions<{
    role: any[]
}>({
    role: {
        api: roleAll
    }
})

// ===== 用户绑定 =====
const bindDialogVisible = ref(false)
const bindAdminId = ref<number>(0)
const selectedUserIds = ref<number[]>([])
const userTableRef = ref<any>()
const userQuery = reactive({
    keyword: ''
})
const { pager: userPager, getLists: getUserLists } = usePaging({
    fetchFun: getUserList,
    params: userQuery,
    size: 15
})

// 拉取用户列表并同步当前页勾选状态
const fetchUsers = async () => {
    await getUserLists()
    await syncSelection()
}

// 重置用户列表查询条件
const resetUserPage = () => {
    userPager.page = 1
    fetchUsers()
}

// 按已选集合同步当前页勾选
const syncSelection = async () => {
    await nextTick()
    if (!userTableRef.value) return
    userPager.lists.forEach((row: any) => {
        userTableRef.value!.toggleRowSelection(row, selectedUserIds.value.includes(row.id))
    })
}

// 多选变更：合并当前页与跨页已选项
const handleUserSelectionChange = (rows: any[]) => {
    const pageIds = new Set(userPager.lists.map((r: any) => r.id))
    const others = selectedUserIds.value.filter((id) => !pageIds.has(id))
    selectedUserIds.value = [...others, ...rows.map((r) => r.id)]
}

const handleBind = async (row: any) => {
    bindAdminId.value = row.id
    bindDialogVisible.value = true
    selectedUserIds.value = []
    try {
        const res: any = await getAdminBindUsers({ admin_id: row.id })
        selectedUserIds.value = (res?.lists || []).map((u: any) => u.id)
    } catch (e) {
        // 忽略，默认空绑定
    }
    userPager.page = 1
    userQuery.keyword = ''
    await fetchUsers()
}

const handleBindSubmit = async () => {
    await setAdminBindUsers({
        admin_id: bindAdminId.value,
        user_ids: selectedUserIds.value
    })
    feedback.msgSuccess('绑定成功')
    bindDialogVisible.value = false
}

onMounted(() => {
    getLists()
})
</script>
