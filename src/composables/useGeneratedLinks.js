/** 管理已生成长链接、对应短链接，以及尚未完成的缩短请求。 */
export function useGeneratedLinks() {
  return {
    longUrl: '',
    shortUrl: '',
    pending: false,
    revision: 0,

    get importUrl() {
      return this.shortUrl || this.longUrl
    },

    setLongUrl(url) {
      this.revision += 1
      this.longUrl = url
      this.shortUrl = ''
      this.pending = false
    },

    async shorten(generateShortUrl) {
      if (!this.longUrl || this.pending) return null
      const revision = this.revision
      this.pending = true
      try {
        const shortUrl = await generateShortUrl(this.longUrl)
        if (revision !== this.revision) return null
        this.shortUrl = shortUrl
        return shortUrl
      } catch (error) {
        // 过期请求的结果与错误都不影响当前生成链接。
        if (revision !== this.revision) return null
        throw error
      } finally {
        if (revision === this.revision) this.pending = false
      }
    }
  }
}
