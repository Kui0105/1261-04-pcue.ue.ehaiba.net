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
 * 将 STATIC_MENUS 注入到指定父级目录下（当前为「用户管理 / consumer」）。
 * 若后端已返回同 paths 的菜单，则跳过注入，避免重复。
 */
function mergeStaticMenus(menus: any[]): any[] {
    const consumer = menus.find(
        (item) => item.type === MenuEnum.CATALOGUE && item.paths === 'consumer'
    )
    if (!consumer) return menus
    consumer.children = consumer.children || []
    STATIC_MENUS.forEach((staticItem) => {
        const exists = consumer.children.some((child: any) => child.paths === staticItem.paths)
        if (!exists) {
            consumer.children.push(JSON.parse(JSON.stringify(staticItem)))
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
