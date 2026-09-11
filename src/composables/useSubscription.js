import { validateForm } from '@/utils/validators'
import { processSubUrl } from '@/utils/formatters'

const stringParams = {
  remoteConfig: 'config',
  excludeRemarks: 'exclude',
  includeRemarks: 'include',
  filename: 'filename'
}

const booleanParams = {
  emoji: 'emoji',
  nodeList: 'list',
  tfo: 'tfo',
  scv: 'scv',
  fdn: 'fdn',
  expand: 'expand',
  sort: 'sort'
}

export function createSubscriptionForm() {
  return {
    sourceSubUrl: '',
    clientType: '',
    customBackend: '',
    remoteConfig: '',
    excludeRemarks: '',
    includeRemarks: '',
    filename: '',
    emoji: true,
    nodeList: false,
    extraset: false,
    sort: false,
    udp: null, // null 表示未指定，区别于显式关闭 UDP。
    tfo: false,
    scv: true,
    fdn: false,
    expand: true,
    appendType: false,
    insert: false,
    new_name: true,
    tpl: {
      surge: { doh: false },
      clash: { doh: false }
    }
  }
}

/** 生成和解析共享参数规则；解析成功前不修改调用方的表单。 */
export function useSubscription(defaultBackend = '') {
  const makeUrl = (form, advanced, customParams = []) => {
    if (!validateForm(form)) return ''

    const backend = form.customBackend || defaultBackend
    if (!backend) return ''

    const [target, version] = form.clientType.split('&ver=')
    const params = new URLSearchParams()
    params.set('target', target)
    if (target === 'surge' && version) params.set('ver', version)
    params.set('url', processSubUrl(form.sourceSubUrl))
    params.set('insert', form.insert)

    if (advanced === '2') {
      for (const [field, param] of Object.entries(stringParams)) {
        if (form[field]) params.set(param, form[field])
      }
      if (form.appendType) params.set('append_type', true)
      for (const [field, param] of Object.entries(booleanParams)) {
        params.set(param, form[field])
      }
      if (form.udp !== null) params.set('udp', form.udp)
      if (form.tpl.surge.doh) params.set('surge.doh', true)
      if (target === 'clash') {
        if (form.tpl.clash.doh) params.set('clash.doh', true)
        params.set('new_name', form.new_name)
      }
      for (const { name, value } of customParams) {
        if (name && value !== null && value !== undefined) params.append(name, value)
      }
    }

    const separator = backend.includes('?') ? (/[?&]$/.test(backend) ? '' : '&') : '?'
    return backend + separator + params.toString()
  }

  const parseUrl = (input) => {
    const invalid = { success: false, message: '请输入正确的订阅地址!' }
    if (!input || !input.trim()) return { success: false, message: '订阅链接不能为空' }

    let url
    try {
      url = new URL(input)
    } catch {
      return invalid
    }
    if (!['http:', 'https:'].includes(url.protocol)) return invalid

    const params = url.searchParams
    const form = createSubscriptionForm()
    form.clientType = params.get('target') || ''
    form.sourceSubUrl = (params.get('url') || '').replace(/\|/g, '\n')
    if (!validateForm(form)) return invalid

    form.customBackend = url.origin + url.pathname + '?'
    const knownParams = new Set([
      'target', 'url', 'insert', 'append_type', 'udp', 'surge.doh', 'clash.doh', 'new_name',
      ...Object.values(stringParams), ...Object.values(booleanParams)
    ])
    if (form.clientType === 'surge') {
      form.clientType += '&ver=' + (params.get('ver') || '4')
      knownParams.add('ver')
    }
    for (const [field, param] of Object.entries(stringParams)) {
      form[field] = params.get(param) || ''
    }
    // 保留既有导入语义：缺失的布尔选项为 false，UDP 单独保留未指定状态。
    for (const [field, param] of Object.entries(booleanParams)) {
      form[field] = params.get(param) === 'true'
    }
    form.insert = params.get('insert') === 'true'
    form.appendType = params.get('append_type') === 'true'
    form.udp = params.has('udp') ? params.get('udp') === 'true' : null
    form.tpl.surge.doh = params.get('surge.doh') === 'true'
    form.tpl.clash.doh = params.get('clash.doh') === 'true'
    form.new_name = params.get('new_name') === 'true'

    const customParams = Array.from(params.entries())
      .filter(([name]) => !knownParams.has(name))
      .map(([name, value]) => ({ name, value }))
    return { success: true, form, customParams }
  }

  return { makeUrl, parseUrl }
}
