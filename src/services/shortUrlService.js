import { CONSTANTS } from '@/config/constants';

/**
 * 短链接生成服务
 */
export class ShortUrlService {
  /**
   * 生成短链接
   * @param {Object} $axios - Axios实例
   * @param {string} longUrl - 长链接
   * @returns {Promise<string>} 短链接
   */
  static async generateShortUrl($axios, longUrl) {
    // 构建请求数据
    const formData = new FormData();
    formData.append("longUrl", btoa(longUrl));

    const response = await $axios.post(CONSTANTS.SHORT_URL_API, formData, {
      headers: {
        "Content-Type": "application/form-data; charset=utf-8"
      }
    });

    if (response.data.Code === 1 && response.data.ShortUrl !== "") {
      return response.data.ShortUrl;
    } else {
      throw new Error(response.data.Message || "短链接获取失败");
    }
  }

  /** 只展开没有 target 查询参数的链接，网络请求留在此模块。 */
  static async resolveUrl(input, fetchUrl = fetch) {
    let url
    try {
      url = new URL(input)
    } catch {
      return input
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.searchParams.has('target')) {
      return input
    }
    try {
      const response = await fetchUrl(url.href, { method: 'GET', redirect: 'follow' })
      return response.url
    } catch (cause) {
      throw new Error('解析短链接失败，请检查短链接服务端是否配置跨域', { cause })
    }
  }
}
