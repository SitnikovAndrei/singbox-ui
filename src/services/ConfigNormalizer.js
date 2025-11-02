import { v4 as uuidv4 } from 'uuid'

/**
 * Генерирует уникальный ID
 */
function generateId() {
  return uuidv4()
}

/**
 * Проверяет, является ли поле служебным (начинается с _)
 */
function isInternalField(key) {
  return key.startsWith('_')
}

/**
 * Рекурсивно удаляет все служебные поля из объекта
 */
function removeInternalFields(obj) {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => !item._disabled) // Удаляем отключенные элементы
      .map(item => removeInternalFields(item))
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned = {}
    for (const [key, value] of Object.entries(obj)) {
      if (!isInternalField(key)) {
        cleaned[key] = removeInternalFields(value)
      }
    }
    return cleaned
  }
  
  return obj
}

/**
 * Добавляет служебные поля к элементу массива
 */
function normalizeItem(item, index) {
  return {
    ...item,
    _id: item.tag || item._id || generateId(),
    _order: index,
    _disabled: item._disabled ?? false
  }
}

/**
 * Нормализует конфигурацию sing-box, добавляя служебные поля
 */
export function normalize(config) {
  if (!config) {
    // Возвращаем пустой конфиг если данных нет
    return {
      log: { level: 'info' },
      dns: {
        servers: [],
        strategy: 'prefer_ipv4',
        final: 'google',
        disable_cache: false,
        disable_expire: false
      },
      inbounds: [],
      outbounds: [],
      route: {
        rules: [],
        rule_set: [],
        auto_detect_interface: true,
        final: 'direct'
      }
    }
  }
  
  return {
    log: config.log || { level: 'info' },
    
    dns: {
      servers: ((config.dns && config.dns.servers) || []).map(normalizeItem),
      strategy: (config.dns && config.dns.strategy) || 'prefer_ipv4',
      final: (config.dns && config.dns.final) || 'google',
      disable_cache: (config.dns && config.dns.disable_cache) ?? false,
      disable_expire: (config.dns && config.dns.disable_expire) ?? false
    },
    
    inbounds: (config.inbounds || []).map(normalizeItem),
    
    outbounds: (config.outbounds || []).map(normalizeItem),
    
    route: {
      rules: ((config.route && config.route.rules) || []).map(normalizeItem),
      rule_set: ((config.route && config.route.rule_set) || []).map(normalizeItem),
      auto_detect_interface: (config.route && config.route.auto_detect_interface) ?? true,
      final: (config.route && config.route.final) || 'direct'
    }
  }
}

/**
 * Очищает конфигурацию от служебных полей перед сохранением
 */
export function sanitize(config) {
  if (!config) return null
  
  return removeInternalFields(config)
}

/**
 * Создает новый элемент с служебными полями
 */
export function createNewItem(baseItem = {}) {
  return {
    ...baseItem,
    _id: generateId(),
    _disabled: false
  }
}