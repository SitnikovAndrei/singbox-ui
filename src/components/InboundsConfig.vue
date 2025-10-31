<template>
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <h2 class="text-xl font-semibold">Inbounds</h2>
      <button @click="addInbound" class="btn btn-success btn-sm">
        + Add Inbound
      </button>
    </div>
    <div class="card-body">
      <div v-if="localInbounds.length === 0" class="text-center py-12 text-gray-500">
        No inbounds configured. Click "+ Add Inbound" to create one.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(inbound, index) in localInbounds"
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
                <span class="font-semibold text-gray-900">{{ inbound.tag || 'Inbound #' + (index + 1) }}</span>
                <span class="ml-2 text-sm text-gray-500">({{ inbound.type }})</span>
              </div>
            </div>
            <button
              @click.stop="removeInbound(index)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remove"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- Expanded Content -->
          <div v-show="expandedItems[index]" class="p-4 bg-white space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="form-label">Type</label>
                <select v-model="inbound.type" class="form-select">
                  <option value="tproxy">TProxy</option>
                  <option value="socks">SOCKS</option>
                  <option value="http">HTTP</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label class="form-label">Tag</label>
                <input type="text" v-model="inbound.tag" class="form-input" placeholder="proxy-in">
              </div>
              <div>
                <label class="form-label">Listen Address</label>
                <input type="text" v-model="inbound.listen" class="form-input" placeholder="127.0.0.1">
              </div>
              <div>
                <label class="form-label">Port</label>
                <input type="number" v-model.number="inbound.listen_port" class="form-input" placeholder="7893">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="form-label">Domain Strategy</label>
                <select v-model="inbound.domain_strategy" class="form-select">
                  <option value="">Default</option>
                  <option value="ipv4_only">IPv4 Only</option>
                  <option value="ipv6_only">IPv6 Only</option>
                  <option value="prefer_ipv4">Prefer IPv4</option>
                  <option value="prefer_ipv6">Prefer IPv6</option>
                </select>
              </div>
              <div class="flex items-center space-x-4 pt-6">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="inbound.sniff"
                    :id="'sniff-' + index"
                    class="form-checkbox"
                  />
                  <label :for="'sniff-' + index" class="ml-2 text-sm text-gray-700">Sniff</label>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="inbound.tcp_fast_open"
                    :id="'tfo-' + index"
                    class="form-checkbox"
                  />
                  <label :for="'tfo-' + index" class="ml-2 text-sm text-gray-700">TCP Fast Open</label>
                </div>
              </div>
              <div class="flex items-center pt-6">
                <input
                  type="checkbox"
                  v-model="inbound.sniff_override_destination"
                  :id="'sniff-override-' + index"
                  class="form-checkbox"
                />
                <label :for="'sniff-override-' + index" class="ml-2 text-sm text-gray-700">Sniff Override</label>
              </div>
              <div class="flex items-center pt-6">
                <input
                  type="checkbox"
                  v-model="inbound.udp_fragment"
                  :id="'udp-frag-' + index"
                  class="form-checkbox"
                />
                <label :for="'udp-frag-' + index" class="ml-2 text-sm text-gray-700">UDP Fragment</label>
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
  name: 'InboundsConfig',
  props: {
    inbounds: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localInbounds = reactive([...props.inbounds])
    const expandedItems = ref({})

    watch(localInbounds, (newVal) => {
      emit('update', [...newVal])
    }, { deep: true })

    const addInbound = () => {
      const newIndex = 0
      localInbounds.unshift({
        type: 'mixed',
        tag: 'mixed-in',
        listen: '127.0.0.1',
        listen_port: 1080,
        sniff: true,
        sniff_override_destination: false,
        tcp_fast_open: false,
        udp_fragment: false,
        domain_strategy: 'ipv4_only'
      })
      expandedItems.value[newIndex] = true
    }

    const removeInbound = (index) => {
      localInbounds.splice(index, 1)
      delete expandedItems.value[index]
    }

    const toggleExpand = (index) => {
      expandedItems.value[index] = !expandedItems.value[index]
    }

    return {
      localInbounds,
      expandedItems,
      addInbound,
      removeInbound,
      toggleExpand
    }
  }
}
</script>