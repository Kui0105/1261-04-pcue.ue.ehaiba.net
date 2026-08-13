import request from '@/utils/request'
import { getWorkbenchMock } from '@/mock/workbench'

// 配置
export function getConfig() {
    return request.get({ url: '/config/getConfig' })
}

// 工作台主页
// 在 .env.development 里设置 VITE_USE_MOCK = true 启用 mock（默认关闭、走真实接口）
export function getWorkbench(params?: any) {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        return Promise.resolve(getWorkbenchMock(params))
    }
    return request.get({ url: '/workbench/index', params })
}

//字典数据
export function getDictData(params: any) {
    return request.get({ url: '/config/dict', params })
}
