<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-xl font-semibold">DNS Configuration</h2>
    </div>
    <div class="card-body space-y-6">
      <!-- Basic Settings -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="localDns.disable_cache"
            id="disableCache"
            class="form-checkbox"
          />
          <label for="disableCache" class="ml-2 text-sm text-gray-700">Disable Cache</label>
        </div>
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="localDns.disable_expire"
            id="disableExpire"
            class="form-checkbox"
          />
          <label for="disableExpire" class="ml-2 text-sm text-gray-700">Disable Expire</label>
        </div>
        <div>
          <label class="form-label">Strategy</label>
          <select v-model="localDns.strategy" class="form-select">
            <option value="prefer_ipv4">Prefer IPv4</option>
            <option value="prefer_ipv6">Prefer IPv6</option>
            <option value="ipv4_only">IPv4 Only</option>
            <option value="ipv6_only">IPv6 Only</option>
          </select>
        </div>
      </div>

      <div class="w-full md:w-1/2">
        <label class="form-label">Final DNS</label>
        <input type="text" v-model="localDns.final" class="form-input">
      </div>

      <!-- DNS Servers -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">DNS Servers</h3>
          <button @click="addServer" class="btn btn-success btn-sm">
            + Add DNS Server
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(server, index) in localDns.servers"
            :key="index"
            class="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="form-label">Address</label>
                  <input
                    type="text"
                    v-model="server.address"
                    class="form-input"
                    placeholder="tls://8.8.8.8"
                  />
                </div>
                <div>
                  <label class="form-label">Tag</label>
                  <input
                    type="text"
                    v-model="server.tag"
                    class="form-input"
                    placeholder="google"
                  />
                </div>
                <div>
                  <label class="form-label">Detour</label>
                  <input
                    type="text"
                    v-model="server.detour"
                    class="form-input"
                    placeholder="direct"
                  />
                </div>
              </div>
              <button
                @click="removeServer(index)"
                class="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'DnsConfig',
  props: {
    dns: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localDns = reactive({ ...props.dns })

    watch(localDns, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    const addServer = () => {
      if (!localDns.servers) {
        localDns.servers = []
      }
      localDns.servers.push({
        address: '',
        tag: '',
        detour: 'direct'
      })
    }

    const removeServer = (index) => {
      localDns.servers.splice(index, 1)
    }

    return {
      localDns,
      addServer,
      removeServer
    }
  }
}
</script>