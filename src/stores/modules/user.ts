import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

import { getUserInfo, login, logout } from '@/api/user'
import { STATIC_MENUS } from '@/config/staticMenus'
import { MenuEnum } from '@/enums/appEnums'
import { TOKEN_KEY } from '@/enums/cacheEnums'
import { PageEnum } from '@/enums/pageEnum'
import router, { filterAsyncRoutes } from '@/router'
import { clearAuthInfo, getToken } from '@/utils/auth'
import cache from '@/utils/cache'

/**
 * 将 STATIC_MENUS 按 `after` 字段指定的目录依次注入到顶级菜单中，与其同级。
 * 若后端已返回同 paths 的菜单，则跳过注入，避免重复。
 */
function mergeStaticMenus(menus: any[]): any[] {
    STATIC_MENUS.forEach(({ after, menu }) => {
        // 若后端已返回同 paths 的目录，先移除原位置，再按 after 重新插入，
        // 实现目录位置调整与子菜单替换。
        const existingIndex = menus.findIndex(
            (item: any) => item.type === MenuEnum.CATALOGUE && item.paths === menu.paths
        )
        if (existingIndex !== -1) {
            menus.splice(existingIndex, 1)
        }
        const afterIndex = menus.findIndex(
            (item) => item.type === MenuEnum.CATALOGUE && item.paths === after
        )
        const insertIndex = afterIndex === -1 ? menus.length : afterIndex + 1
        menus.splice(insertIndex, 0, JSON.parse(JSON.stringify(menu)))
    })
    return menus
}

export interface UserState {
    token: string
    userInfo: Record<string, any>
    routes: RouteRecordRaw[]
    perms: string[]
}

const useUserStore = defineStore({
    id: 'user',
    state: (): UserState => ({
        token: getToken() || '',
        // 用户信息
        userInfo: {},
        // 路由
        routes: [],
        // 权限
        perms: []
    }),
    getters: {},
    actions: {
        resetState() {
            this.token = ''
            this.userInfo = {}
            this.perms = []
        },
        login(playload: any) {
            const { account, password } = playload
            return new Promise((resolve, reject) => {
                login({
                    account: account.trim(),
                    password: password
                })
                    .then((data) => {
                        this.token = data.token
                        cache.set(TOKEN_KEY, data.token)
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        logout() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(async (data) => {
                        this.token = ''
                        await router.push(PageEnum.LOGIN)
                        clearAuthInfo()
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        getUserInfo() {
            return new Promise((resolve, reject) => {
                getUserInfo()
                    .then((data) => {
                        this.userInfo = data.user
                        this.perms = data.permissions
                        this.routes = filterAsyncRoutes(mergeStaticMenus(data.menu || []))
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        }
    }
})

export default useUserStore
