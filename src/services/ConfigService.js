import axios from 'axios'

export class ConfigService {
  constructor() {
    this.apiUrl = '/cgi-bin/api.uc?file=/etc/sing-box/config.json'
  }

  async load() {
    try {
      const response = await axios.get(this.apiUrl)
      return response.data
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`)
    }
  }

  async save(config) {
    try {
      const response = await axios.post(this.apiUrl, config, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`)
    }
  }
}