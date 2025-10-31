<template>
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <h2 class="text-xl font-semibold">Outbounds</h2>
      <button @click="addOutbound" class="btn btn-success btn-sm">
        + Add Outbound
      </button>
    </div>
    <div class="card-body">
      <div v-if="localOutbounds.length === 0" class="text-center py-12 text-gray-500">
        No outbounds configured. Click "+ Add Outbound" to create one.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(outbound, index) in localOutbounds"
          :key="index"
          class="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
        >
          <!-- Header -->
          <div
            @click="toggleExpand(index)"
            class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-90': expandedItems[index] }"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <div>
                <span class="font-semibold text-gray-900">{{ outbound.tag || 'Outbound #' + (index + 1) }}</span>
                <span class="ml-2 text-sm text-gray-500">({{ outbound.type }})</span>
              </div>
            </div>
            <button
              @click.stop="removeOutbound(index)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remove"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- Expanded Content -->
          <div v-show="expandedItems[index]" class="p-4 space-y-4 bg-white">
            <!-- Basic Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="form-label">Type</label>
                <select v-model="outbound.type" class="form-select">
                  <option value="direct">Direct</option>
                  <option value="block">Block</option>
                  <option value="vless">VLESS</option>
                  <option value="vmess">VMess</option>
                  <option value="shadowsocks">Shadowsocks</option>
                  <option value="trojan">Trojan</option>
                </select>
              </div>
              <div>
                <label class="form-label">Tag</label>
                <input type="text" v-model="outbound.tag" class="form-input" placeholder="proxy-out">
              </div>
              
              <template v-if="isProxyType(outbound.type)">
                <div>
                  <label class="form-label">Server</label>
                  <input type="text" v-model="outbound.server" class="form-input" placeholder="example.com">
                </div>
                <div>
                  <label class="form-label">Port</label>
                  <input type="number" v-model.number="outbound.server_port" class="form-input" placeholder="443">
                </div>
              </template>
            </div>

            <!-- VLESS/VMess Specific -->
            <template v-if="outbound.type === 'vless' || outbound.type === 'vmess'">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="form-label">UUID</label>
                  <input type="text" v-model="outbound.uuid" class="form-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
                </div>
                <div>
                  <label class="form-label">Network</label>
                  <select v-model="outbound.network" class="form-select">
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="ws">WebSocket</option>
                    <option value="grpc">gRPC</option>
                  </select>
                </div>
                <div v-if="outbound.type === 'vless'">
                  <label class="form-label">Flow</label>
                  <input type="text" v-model="outbound.flow" class="form-input" placeholder="xtls-rprx-vision">
                </div>
              </div>

              <!-- TLS Section -->
              <div class="border-t pt-4">
                <button
                  @click="toggleSection(outbound, 'tls')"
                  class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-90': outbound.tls }"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  TLS Settings
                </button>

                <div v-if="outbound.tls" class="mt-3 pl-6 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="outbound.tls.enabled"
                        :id="'tls-enabled-' + index"
                        class="form-checkbox"
                      />
                      <label :for="'tls-enabled-' + index" class="ml-2 text-sm text-gray-700">TLS Enabled</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="outbound.tls.insecure"
                        :id="'tls-insecure-' + index"
                        class="form-checkbox"
                      />
                      <label :for="'tls-insecure-' + index" class="ml-2 text-sm text-gray-700">Insecure</label>
                    </div>
                    <div>
                      <label class="form-label">Server Name</label>
                      <input type="text" v-model="outbound.tls.server_name" class="form-input" placeholder="example.com">
                    </div>
                  </div>

                  <!-- Reality Settings -->
                  <div>
                    <button
                      @click="toggleSection(outbound.tls, 'reality')"
                      class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      <svg
                        class="w-4 h-4 transition-transform"
                        :class="{ 'rotate-90': outbound.tls.reality }"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                      </svg>
                      Reality Settings
                    </button>

                    <div v-if="outbound.tls.reality" class="mt-3 pl-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="outbound.tls.reality.enabled"
                          :id="'reality-enabled-' + index"
                          class="form-checkbox"
                        />
                        <label :for="'reality-enabled-' + index" class="ml-2 text-sm text-gray-700">Reality Enabled</label>
                      </div>
                      <div>
                        <label class="form-label">Public Key</label>
                        <input type="text" v-model="outbound.tls.reality.public_key" class="form-input text-xs">
                      </div>
                      <div>
                        <label class="form-label">Short ID</label>
                        <input type="text" v-model="outbound.tls.reality.short_id" class="form-input">
                      </div>
                    </div>
                  </div>

                  <!-- uTLS Settings -->
                  <div>
                    <button
                      @click="toggleSection(outbound.tls, 'utls')"
                      class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      <svg
                        class="w-4 h-4 transition-transform"
                        :class="{ 'rotate-90': outbound.tls.utls }"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                      </svg>
                      uTLS Settings
                    </button>

                    <div v-if="outbound.tls.utls" class="mt-3 pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="outbound.tls.utls.enabled"
                          :id="'utls-enabled-' + index"
                          class="form-checkbox"
                        />
                        <label :for="'utls-enabled-' + index" class="ml-2 text-sm text-gray-700">uTLS Enabled</label>
                      </div>
                      <div>
                        <label class="form-label">Fingerprint</label>
                        <select v-model="outbound.tls.utls.fingerprint" class="form-select">
                          <option value="chrome">Chrome</option>
                          <option value="firefox">Firefox</option>
                          <option value="safari">Safari</option>
                          <option value="edge">Edge</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Routing Mark -->
            <div v-if="outbound.routing_mark !== undefined" class="border-t pt-4">
              <div class="w-full md:w-1/3">
                <label class="form-label">Routing Mark</label>
                <input type="number" v-model.number="outbound.routing_mark" class="form-input">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue'

export default {
  name: 'OutboundsConfig',
  props: {
    outbounds: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localOutbounds = reactive([...props.outbounds])
    const expandedItems = ref({})

    watch(localOutbounds, (newVal) => {
      emit('update', [...newVal])
    }, { deep: true })

    const addOutbound = () => {
      const newIndex = localOutbounds.length
      localOutbounds.push({
        type: 'vless',
        tag: 'new-outbound',
        server: '',
        server_port: 443,
        uuid: '',
        flow: 'xtls-rprx-vision',
        network: 'tcp',
        routing_mark: 255,
        tls: {
          enabled: true,
          insecure: false,
          server_name: '',
          reality: {
            enabled: false,
            public_key: '',
            short_id: ''
          },
          utls: {
            enabled: true,
            fingerprint: 'chrome'
          }
        }
      })
      expandedItems.value[newIndex] = true
    }

    const removeOutbound = (index) => {
      localOutbounds.splice(index, 1)
      delete expandedItems.value[index]
    }

    const toggleExpand = (index) => {
      expandedItems.value[index] = !expandedItems.value[index]
    }

    const toggleSection = (obj, key) => {
      if (obj[key]) {
        delete obj[key]
      } else {
        if (key === 'tls') {
          obj[key] = {
            enabled: true,
            insecure: false,
            server_name: ''
          }
        } else if (key === 'reality') {
          obj[key] = {
            enabled: true,
            public_key: '',
            short_id: ''
          }
        } else if (key === 'utls') {
          obj[key] = {
            enabled: true,
            fingerprint: 'chrome'
          }
        }
      }
    }

    const isProxyType = (type) => {
      return ['vless', 'vmess', 'trojan', 'shadowsocks'].includes(type)
    }

    return {
      localOutbounds,
      expandedItems,
      addOutbound,
      removeOutbound,
      toggleExpand,
      toggleSection,
      isProxyType
    }
  }
}
</script>