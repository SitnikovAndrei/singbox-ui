export class MetadataService {
  constructor() {
    this.storageKey = 'sing-box-metadata'
  }
  
  // Generate hash for config identification
  getConfigHash(config) {
    const str = JSON.stringify({
      dns: config.dns,
      inbounds: config.inbounds?.map(i => i.tag),
      outbounds: config.outbounds?.map(o => o.tag)
    })
    return btoa(str).substring(0, 16)
  }
  
  // Generate stable ID for rule
  getRuleId(rule, index) {
    const content = JSON.stringify({
      outbound: rule.outbound,
      rule_set: rule.rule_set,
      domain: rule.domain_suffix?.[0],
      index: index
    })
    return `rule-${btoa(content).substring(0, 12)}`
  }
  
  // Load metadata for current config
  load(config) {
    const hash = this.getConfigHash(config)
    const stored = localStorage.getItem(this.storageKey)
    
    if (stored) {
      try {
        const allMetadata = JSON.parse(stored)
        return allMetadata[hash] || this.getDefault()
      } catch (e) {
        console.error('Failed to parse metadata:', e)
        return this.getDefault()
      }
    }
    
    return this.getDefault()
  }
  
  // Save metadata
  save(config, metadata) {
    const hash = this.getConfigHash(config)
    const stored = localStorage.getItem(this.storageKey)
    const allMetadata = stored ? JSON.parse(stored) : {}
    
    allMetadata[hash] = {
      ...metadata,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(allMetadata))
  }
  
  // Default metadata structure
  getDefault() {
    return {
      disabledRules: [],
      ruleViewMode: 'compact',
      groups: [],
      lastUpdated: new Date().toISOString()
    }
  }
}