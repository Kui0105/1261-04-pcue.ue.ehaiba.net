import request from '@/utils/request'

// 配置
export function getConfig() {
    return request.get({ url: '/config/getConfig' })
}

// 工作台主页
export function getWorkbench(params?: any) {
    // 开发环境返回 mock 数据便于本地预览；生产构建走真实接口（不打包 mock）
    if (import.meta.env.DEV) {
        return import('@/mock/workbench').then((m) => m.getWorkbenchMock(params))
    }
    return request.get({ url: '/workbench/index', params })
}

//字典数据
export function getDictData(params: any) {
    return request.get({ url: '/config/dict', params })
}
