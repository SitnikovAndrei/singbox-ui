<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div v-if="error" class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div class="flex items-center justify-between">
          <p class="text-red-800">{{ error }}</p>
          <button @click="error = null" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="success" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
        <div class="flex items-center justify-between">
          <p class="text-green-800">{{ success }}</p>
          <button @click="success = null" class="text-green-500 hover:text-green-700">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="config">
        <!-- Mobile Dropdown -->
        <div class="md:hidden mb-6">
          <label for="mobile-tabs" class="sr-only">Select a tab</label>
          <select
            id="mobile-tabs"
            v-model="activeTab"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
              {{ tab.name }}
            </option>
          </select>
        </div>

        <!-- Desktop Tabs -->
        <div class="hidden md:block border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
          <dns-config v-show="activeTab === 'dns'" :dns="config.dns" @update="updateDns" />
          <inbounds-config v-show="activeTab === 'inbounds'" :inbounds="config.inbounds" @update="updateInbounds" />
          <outbounds-config v-show="activeTab === 'outbounds'" :outbounds="config.outbounds" @update="updateOutbounds" />
          <rule-sets-config v-show="activeTab === 'rule-sets'" :rule-sets="config.route?.rule_set || []" @update="updateRuleSets" />
          <routes-config 
            v-show="activeTab === 'routes'" 
            :route="config.route" 
            :outbounds="config.outbounds"
            :rule-sets="config.route?.rule_set || []"
            :config="config"
            @update="updateRoute" 
          />
          <log-config v-show="activeTab === 'log'" :log="config.log" @update="updateLog" />
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-4">
          <button @click="saveConfig" :disabled="saving" class="btn btn-primary w-full sm:w-auto">
            <span v-if="saving" class="inline-block animate-spin mr-2">⟳</span>
            Save Configuration
          </button>
          <button @click="loadConfig" class="btn btn-secondary w-full sm:w-auto">Reload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ConfigService } from './services/ConfigService'
import DnsConfig from './components/DnsConfig.vue'
import InboundsConfig from './components/InboundsConfig.vue'
import OutboundsConfig from './components/OutboundsConfig.vue'
import RuleSetsConfig from './components/RuleSetsConfig.vue'
import RoutesConfig from './components/RoutesConfig.vue'
import LogConfig from './components/LogConfig.vue'

export default {
  name: 'App',
  components: {
    DnsConfig,
    InboundsConfig,
    OutboundsConfig,
    RuleSetsConfig,
    RoutesConfig,
    LogConfig
  },
  setup() {
    const config = ref(null)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const success = ref(null)
    const activeTab = ref('dns')
    const configService = new ConfigService()

    const tabs = [
      { id: 'dns', name: 'DNS' },
      { id: 'inbounds', name: 'Inbounds' },
      { id: 'outbounds', name: 'Outbounds' },
      { id: 'rule-sets', name: 'Rule Sets' },
      { id: 'routes', name: 'Routes' },
      { id: 'log', name: 'Log' }
    ]

    const loadConfig = async () => {
      loading.value = true
      error.value = null
      try {
        config.value = await configService.load()
      } catch (err) {
        error.value = `Failed to load configuration: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    const saveConfig = async () => {
      saving.value = true
      error.value = null
      success.value = null
      try {
        await configService.save(config.value)
        success.value = 'Configuration saved successfully'
      } catch (err) {
        error.value = `Failed to save configuration: ${err.message}`
      } finally {
        saving.value = false
      }
    }

    const updateDns = (dns) => {
      config.value.dns = dns
    }

    const updateInbounds = (inbounds) => {
      config.value.inbounds = inbounds
    }

    const updateOutbounds = (outbounds) => {
      config.value.outbounds = outbounds
    }

    const updateRuleSets = (ruleSets) => {
      if (!config.value.route) {
        config.value.route = {}
      }
      config.value.route.rule_set = ruleSets
    }

    const updateRoute = (route) => {
      config.value.route = route
    }

    const updateLog = (log) => {
      config.value.log = log
    }

    onMounted(() => {
      loadConfig()
    })

    return {
      config,
      loading,
      saving,
      error,
      success,
      activeTab,
      tabs,
      loadConfig,
      saveConfig,
      updateDns,
      updateInbounds,
      updateOutbounds,
      updateRuleSets,
      updateRoute,
      updateLog
    }
  }
}
</script>