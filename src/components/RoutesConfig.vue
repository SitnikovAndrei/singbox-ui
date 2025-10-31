<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-xl font-semibold">Routing Rules</h2>
    </div>
    <div class="card-body space-y-6">
      <!-- Basic Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="localRoute.auto_detect_interface"
            id="autoDetect"
            class="form-checkbox"
          />
          <label for="autoDetect" class="ml-2 text-sm text-gray-700">Auto Detect Interface</label>
        </div>
        <div>
          <label class="form-label">Final Outbound</label>
          <input type="text" v-model="localRoute.final" class="form-input" placeholder="direct">
        </div>
      </div>

      <!-- Routing Rules -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Rules</h3>
          <button @click="addRule" class="btn btn-success btn-sm">
            + Add Rule
          </button>
        </div>

        <div v-if="!localRoute.rules || localRoute.rules.length === 0" class="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          No routing rules configured. Click "+ Add Rule" to create one.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(rule, index) in localRoute.rules"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-300 transition-colors"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Outbound</label>
                  <input type="text" v-model="rule.outbound" class="form-input" placeholder="direct">
                </div>
                <div>
                  <label class="form-label">Rule Set</label>
                  <input type="text" v-model="rule.rule_set" class="form-input" placeholder="openai">
                </div>
              </div>
              <button
                @click="removeRule(index)"
                class="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Additional Fields -->
            <div class="flex gap-2">
              <button
                @click="toggleRuleField(rule, 'domain_suffix')"
                :class="[
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  rule.domain_suffix
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ rule.domain_suffix ? '✓' : '+' }} Domains
              </button>
              <button
                @click="toggleRuleField(rule, 'source_ip_cidr')"
                :class="[
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  rule.source_ip_cidr
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ rule.source_ip_cidr ? '✓' : '+' }} Source IPs
              </button>
              <button
                @click="toggleRuleField(rule, 'ip_cidr')"
                :class="[
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  rule.ip_cidr
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ rule.ip_cidr ? '✓' : '+' }} IP CIDRs
              </button>
            </div>

            <!-- Domain Suffix -->
            <div v-if="rule.domain_suffix" class="pl-4 border-l-2 border-blue-200">
              <label class="form-label">Domain Suffixes</label>
              <div class="space-y-2">
                <div v-for="(domain, dIndex) in rule.domain_suffix" :key="dIndex" class="flex gap-2">
                  <input
                    type="text"
                    v-model="rule.domain_suffix[dIndex]"
                    class="form-input flex-1"
                    placeholder="example.com"
                  />
                  <button
                    @click="removeDomain(rule, dIndex)"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    ×
                  </button>
                </div>
                <button @click="addDomain(rule)" class="text-sm text-blue-600 hover:text-blue-700">
                  + Add Domain
                </button>
              </div>
            </div>

            <!-- Source IP CIDR -->
            <div v-if="rule.source_ip_cidr" class="pl-4 border-l-2 border-green-200">
              <label class="form-label">Source IP CIDR</label>
              <div class="space-y-2">
                <div v-for="(ip, ipIndex) in rule.source_ip_cidr" :key="ipIndex" class="flex gap-2">
                  <input
                    type="text"
                    v-model="rule.source_ip_cidr[ipIndex]"
                    class="form-input flex-1"
                    placeholder="192.168.1.0/24"
                  />
                  <button
                    @click="removeSourceIp(rule, ipIndex)"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    ×
                  </button>
                </div>
                <button @click="addSourceIp(rule)" class="text-sm text-blue-600 hover:text-blue-700">
                  + Add IP
                </button>
              </div>
            </div>

            <!-- IP CIDR -->
            <div v-if="rule.ip_cidr" class="pl-4 border-l-2 border-purple-200">
              <label class="form-label">IP CIDR</label>
              <div class="space-y-2">
                <div v-for="(ip, ipIndex) in rule.ip_cidr" :key="ipIndex" class="flex gap-2">
                  <input
                    type="text"
                    v-model="rule.ip_cidr[ipIndex]"
                    class="form-input flex-1"
                    placeholder="160.79.104.0/23"
                  />
                  <button
                    @click="removeIpCidr(rule, ipIndex)"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    ×
                  </button>
                </div>
                <button @click="addIpCidr(rule)" class="text-sm text-blue-600 hover:text-blue-700">
                  + Add IP CIDR
                </button>
              </div>
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
  name: 'RoutesConfig',
  props: {
    route: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localRoute = reactive({ ...props.route })

    watch(localRoute, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    const addRule = () => {
      if (!localRoute.rules) {
        localRoute.rules = []
      }
      localRoute.rules.push({
        outbound: '',
        rule_set: ''
      })
    }

    const removeRule = (index) => {
      localRoute.rules.splice(index, 1)
    }

    const toggleRuleField = (rule, field) => {
      if (rule[field]) {
        delete rule[field]
      } else {
        rule[field] = []
      }
    }

    const addDomain = (rule) => {
      if (!rule.domain_suffix) rule.domain_suffix = []
      rule.domain_suffix.push('')
    }

    const removeDomain = (rule, index) => {
      rule.domain_suffix.splice(index, 1)
      if (rule.domain_suffix.length === 0) {
        delete rule.domain_suffix
      }
    }

    const addSourceIp = (rule) => {
      if (!rule.source_ip_cidr) rule.source_ip_cidr = []
      rule.source_ip_cidr.push('')
    }

    const removeSourceIp = (rule, index) => {
      rule.source_ip_cidr.splice(index, 1)
      if (rule.source_ip_cidr.length === 0) {
        delete rule.source_ip_cidr
      }
    }

    const addIpCidr = (rule) => {
      if (!rule.ip_cidr) rule.ip_cidr = []
      rule.ip_cidr.push('')
    }

    const removeIpCidr = (rule, index) => {
      rule.ip_cidr.splice(index, 1)
      if (rule.ip_cidr.length === 0) {
        delete rule.ip_cidr
      }
    }

    return {
      localRoute,
      addRule,
      removeRule,
      toggleRuleField,
      addDomain,
      removeDomain,
      addSourceIp,
      removeSourceIp,
      addIpCidr,
      removeIpCidr
    }
  }
}
</script>