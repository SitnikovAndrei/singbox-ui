import axios from 'axios'
import { normalize, sanitize } from './ConfigNormalizer'
import disabledStateService from './DisabledStateService'

const API_URL = '/cgi-bin/api.uc?file=/etc/sing-box/config.json'

export default {
  async loadConfig() {
    try {
      // Загружаем конфиг и отключенные элементы параллельно
      const [configResponse, disabledState] = await Promise.all([
        axios.get(API_URL),
        disabledStateService.load()
      ])
      
      const normalized = normalize(configResponse.data)
      
      // Восстанавливаем отключенные элементы из отдельного файла
      return disabledStateService.restore(normalized, disabledState)
    } catch (error) {
      console.error('Failed to load config:', error)
      throw error
    }
  },

  async saveConfig(config) {
    try {
      // Сохраняем отключенные элементы в отдельный файл (с полными данными)
      await disabledStateService.save(config)
      
      // Очищаем и сохраняем основной конфиг (без отключенных элементов)
      const sanitized = sanitize(config)
      await axios.post(API_URL, sanitized)
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }
}