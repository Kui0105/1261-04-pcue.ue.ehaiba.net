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
 * 将 STATIC_MENUS 注入到「用户管理」目录之后（应用管理之前），与其同级。
 * 若后端已返回同 paths 的菜单，则跳过注入，避免重复。
 */
function mergeStaticMenus(menus: any[]): any[] {
    const consumerIndex = menus.findIndex(
        (item) => item.type === MenuEnum.CATALOGUE && item.paths === 'consumer'
    )
    if (consumerIndex === -1) return menus
    STATIC_MENUS.forEach((staticItem) => {
        const exists = menus.some((item: any) => item.paths === staticItem.paths)
        if (!exists) {
            menus.splice(consumerIndex + 1, 0, JSON.parse(JSON.stringify(staticItem)))
        }
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
