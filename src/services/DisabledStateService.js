import axios from 'axios'

const STATE_FILE_URL = '/cgi-bin/api.uc?file=/etc/sing-box/disabled-state.json'

/**
 * Управляет отключенными элементами в отдельном файле
 * Хранит ПОЛНЫЕ данные элементов, а не только ID
 */
class DisabledStateService {
  /**
   * Загрузить отключенные элементы
   */
  async load() {
    try {
      const response = await axios.get(STATE_FILE_URL)
      return response.data || this.getDefaultState()
    } catch (error) {
      // Файл не существует или ошибка - возвращаем пустое состояние
      console.warn('Disabled state file not found, using defaults')
      return this.getDefaultState()
    }
  }
  
  /**
   * Сохранить отключенные элементы (с полными данными)
   */
  async save(config) {
    try {
      const disabledState = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        items: {
          dns: this.extractDisabledItems(config.dns?.servers),
          inbounds: this.extractDisabledItems(config.inbounds),
          outbounds: this.extractDisabledItems(config.outbounds),
          rules: this.extractDisabledItems(config.route?.rules),
          ruleSets: this.extractDisabledItems(config.route?.rule_set)
        }
      }
      
      await axios.post(STATE_FILE_URL, disabledState)
    } catch (error) {
      console.error('Failed to save disabled state:', error)
      throw error // Бросаем ошибку т.к. это важно для сохранения данных
    }
  }
  
  /**
   * Восстановить отключенные элементы в конфиг
   */
  restore(config, disabledState) {
    if (!disabledState || !disabledState.items) {
      return config
    }
    
    const items = disabledState.items
    
    // Добавляем отключенные элементы обратно в конфиг
    if (items.dns?.length && config.dns) {
      config.dns.servers = [
        ...(config.dns.servers || []),
        ...items.dns.map(item => ({ ...item, _disabled: true }))
      ]
    }
    
    if (items.inbounds?.length) {
      config.inbounds = [
        ...(config.inbounds || []),
        ...items.inbounds.map(item => ({ ...item, _disabled: true }))
      ]
    }
    
    if (items.outbounds?.length) {
      config.outbounds = [
        ...(config.outbounds || []),
        ...items.outbounds.map(item => ({ ...item, _disabled: true }))
      ]
    }
    
    if (items.rules?.length && config.route) {
      config.route.rules = [
        ...(config.route.rules || []),
        ...items.rules.map(item => ({ ...item, _disabled: true }))
      ]
    }
    
    if (items.ruleSets?.length && config.route) {
      config.route.rule_set = [
        ...(config.route.rule_set || []),
        ...items.ruleSets.map(item => ({ ...item, _disabled: true }))
      ]
    }
    
    return config
  }
  
  /**
   * Извлечь отключенные элементы (с полными данными)
   */
  extractDisabledItems(items) {
    if (!Array.isArray(items)) return []
    
    return items
      .filter(item => item._disabled)
      .map(item => {
        // Копируем все данные элемента, кроме служебных полей
        const cleaned = { ...item }
        delete cleaned._id
        delete cleaned._disabled
        delete cleaned._order
        return cleaned
      })
  }
  
  /**
   * Состояние по умолчанию
   */
  getDefaultState() {
    return {
      version: '1.0',
      items: {
        dns: [],
        inbounds: [],
        outbounds: [],
        rules: [],
        ruleSets: []
      }
    }
  }
}

export default new DisabledStateService()