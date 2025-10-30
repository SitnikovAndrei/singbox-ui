<template>
  <div class="container-fluid py-4">
    <header class="mb-4">
      <h1 class="h3">Sing-Box Configuration Editor</h1>
    </header>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ success }}
      <button type="button" class="btn-close" @click="success = null"></button>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="config">
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#dns-tab">DNS</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#inbounds-tab">Inbounds</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#outbounds-tab">Outbounds</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#routes-tab">Routes</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#log-tab">Log</button>
        </li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="dns-tab">
          <dns-config :dns="config.dns" @update="updateDns" />
        </div>
        <div class="tab-pane fade" id="inbounds-tab">
          <inbounds-config :inbounds="config.inbounds" @update="updateInbounds" />
        </div>
        <div class="tab-pane fade" id="outbounds-tab">
          <outbounds-config :outbounds="config.outbounds" @update="updateOutbounds" />
        </div>
        <div class="tab-pane fade" id="routes-tab">
          <routes-config :route="config.route" @update="updateRoute" />
        </div>
        <div class="tab-pane fade" id="log-tab">
          <log-config :log="config.log" @update="updateLog" />
        </div>
      </div>

      <div class="mt-4 d-flex gap-2">
        <button class="btn btn-primary" @click="saveConfig" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          Save Configuration
        </button>
        <button class="btn btn-secondary" @click="loadConfig">Reload</button>
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
import RoutesConfig from './components/RoutesConfig.vue'
import LogConfig from './components/LogConfig.vue'

export default {
  name: 'App',
  components: {
    DnsConfig,
    InboundsConfig,
    OutboundsConfig,
    RoutesConfig,
    LogConfig
  },
  setup() {
    const config = ref(null)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref(null)
    const success = ref(null)
    const configService = new ConfigService()

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
      loadConfig,
      saveConfig,
      updateDns,
      updateInbounds,
      updateOutbounds,
      updateRoute,
      updateLog
    }
  }
}
</script>