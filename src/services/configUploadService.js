import { CONSTANTS } from '@/config/constants'

export class ConfigUploadService {
  /** 上传成功后尝试复制；复制失败时仍返回可恢复的配置链接。 */
  static async uploadConfig($axios, content, copyText) {
    const { data: result } = await $axios.post(CONSTANTS.CONFIG_UPLOAD_API, { content })
    if (result?.code !== 0 || typeof result.data?.url !== 'string' || !result.data.url) {
      throw new Error(result?.msg || '远程配置上传失败')
    }

    const url = result.data.url
    let copied = false
    try {
      copied = await copyText(url) === true
    } catch {
      // 复制失败不改变上传结果，调用方仍可展示链接供手动复制。
    }
    return { url, copied }
  }
}
