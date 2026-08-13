import request from '@/utils/request'

// 配置
export function getConfig() {
    return request.get({ url: '/config/getConfig' })
}

// 工作台主页
export function getWorkbench(params?: any) {
    return request.get({ url: '/workbench/index', params })
}

//字典数据
export function getDictData(params: any) {
    return request.get({ url: '/config/dict', params })
}
