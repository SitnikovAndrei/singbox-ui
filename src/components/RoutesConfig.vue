<template>
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-semibold">Routing Rules</h2>
        <div class="flex gap-2 text-xs">
          <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full">
            {{ enabledCount }} active
          </span>
          <span v-if="disabledCount > 0" class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
            {{ disabledCount }} disabled
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <!-- View mode toggle -->
        <div class="hidden sm:flex border border-gray-200 rounded-md overflow-hidden">
          <button
            @click="viewMode = 'compact'"
            :class="[
              'px-3 py-1 text-sm transition-colors',
              viewMode === 'compact' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Compact
          </button>
          <button
            @click="viewMode = 'detailed'"
            :class="[
              'px-3 py-1 text-sm transition-colors',
              viewMode === 'detailed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Detailed
          </button>
        </div>
        <button @click="addRule" class="btn btn-success btn-sm">
          + Add Rule
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <!-- Search/Filter -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Search rules by outbound, domain, or rule set..."
          class="form-input"
        />
      </div>

      <!-- COMPACT VIEW -->
      <div v-if="viewMode === 'compact'" class="space-y-2">
        <div
          v-for="(rule, index) in filteredRules"
          :key="rule.id"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg border transition-all group cursor-pointer',
            rule.enabled 
              ? 'bg-white border-gray-200 hover:border-blue-300' 
              : 'bg-gray-50 border-gray-200 opacity-60'
          ]"
          @click="rule.enabled && expandRule(rule)"
        >
          <!-- Toggle checkbox -->
          <button
            @click.stop="toggleRule(rule, index)"
            :class="[
              'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
              rule.enabled
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 hover:border-gray-400'
            ]"
            :title="rule.enabled ? 'Disable rule' : 'Enable rule'"
          >
            <svg v-if="rule.enabled" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          
          <!-- Outbound badge -->
          <span :class="[
            'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
            getOutboundColor(rule.outbound)
          ]">
            {{ rule.outbound || '?' }}
          </span>
          
          <!-- Conditions summary -->
          <div class="flex-1 min-w-0">
            <div :class="[
              'text-sm truncate',
              rule.enabled ? 'text-gray-700' : 'text-gray-500'
            ]">
              {{ formatConditions(rule) }}
            </div>
          </div>
          
          <!-- Actions (show on hover) -->
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              @click.stop="expandRule(rule)"
              class="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
              title="Edit details"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
            <button
              @click.stop="confirmDeleteRule(rule, index)"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredRules.length === 0" class="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p v-if="searchQuery">No rules match your search</p>
          <p v-else>No rules configured. Click "+ Add Rule" to create one.</p>
        </div>
      </div>
      
      <!-- DETAILED VIEW -->
      <div v-else>
        <!-- Basic Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
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

        <!-- Rules -->
        <div class="space-y-3">
          <div
            v-for="(rule, index) in filteredRules"
            :key="rule.id"
            :id="'rule-' + rule.id"
            :class="[
              'border rounded-lg transition-all',
              rule.enabled 
                ? 'border-gray-200 bg-white' 
                : 'border-gray-300 bg-gray-50'
            ]"
          >
            <!-- Rule header with toggle -->
            <div class="flex items-center gap-3 p-4 border-b border-gray-100">
              <button
                @click="toggleRule(rule, index)"
                :class="[
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
                  rule.enabled
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                ]"
              >
                <svg v-if="rule.enabled" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
              
              <div class="flex-1">
                <span :class="[
                  'font-semibold',
                  rule.enabled ? 'text-gray-900' : 'text-gray-500'
                ]">
                  Rule #{{ index + 1 }}
                </span>
                <span v-if="!rule.enabled" class="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                  Disabled
                </span>
              </div>

              <button
                @click="confirmDeleteRule(rule, index)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Rule content -->
            <div :class="['p-4 space-y-4', { 'opacity-50': !rule.enabled }]">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <label class="form-label">Outbound</label>
                  <select 
                    v-model="rule.outbound" 
                    class="form-select"
                    :disabled="!rule.enabled"
                  >
                    <option value="">-- Select Outbound --</option>
                    <option v-for="tag in outboundTags" :key="tag" :value="tag">
                      {{ tag }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Additional Fields Toggle -->
              <div class="flex gap-2 flex-wrap">
                <button
                  @click="toggleRuleField(rule, 'rule_set')"
                  :disabled="!rule.enabled"
                  :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    rule.rule_set !== undefined
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    !rule.enabled && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ rule.rule_set !== undefined ? '✓' : '+' }} Rule Set
                </button>
                <button
                  @click="toggleRuleField(rule, 'domain_suffix')"
                  :disabled="!rule.enabled"
                  :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    rule.domain_suffix
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    !rule.enabled && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ rule.domain_suffix ? '✓' : '+' }} Domains
                </button>
                <button
                  @click="toggleRuleField(rule, 'source_ip_cidr')"
                  :disabled="!rule.enabled"
                  :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    rule.source_ip_cidr
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    !rule.enabled && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ rule.source_ip_cidr ? '✓' : '+' }} Source IPs
                </button>
                <button
                  @click="toggleRuleField(rule, 'ip_cidr')"
                  :disabled="!rule.enabled"
                  :class="[
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    rule.ip_cidr
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    !rule.enabled && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ rule.ip_cidr ? '✓' : '+' }} IP CIDRs
                </button>
              </div>

              <!-- Rule Set -->
              <div v-if="rule.rule_set !== undefined" class="pl-4 border-l-2 border-indigo-200">
                <label class="form-label">Rule Set</label>
                <select v-model="rule.rule_set" class="form-select" :disabled="!rule.enabled">
                  <option value="">-- Select Rule Set --</option>
                  <option v-for="tag in ruleSetTags" :key="tag" :value="tag">
                    {{ tag }}
                  </option>
                </select>
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
                      :disabled="!rule.enabled"
                    />
                    <button
                      @click="removeDomain(rule, dIndex)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      :disabled="!rule.enabled"
                    >
                      ×
                    </button>
                  </div>
                  <button 
                    @click="addDomain(rule)" 
                    class="text-sm text-blue-600 hover:text-blue-700"
                    :disabled="!rule.enabled"
                  >
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
                      :disabled="!rule.enabled"
                    />
                    <button
                      @click="removeSourceIp(rule, ipIndex)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      :disabled="!rule.enabled"
                    >
                      ×
                    </button>
                  </div>
                  <button 
                    @click="addSourceIp(rule)" 
                    class="text-sm text-blue-600 hover:text-blue-700"
                    :disabled="!rule.enabled"
                  >
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
                      :disabled="!rule.enabled"
                    />
                    <button
                      @click="removeIpCidr(rule, ipIndex)"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      :disabled="!rule.enabled"
                    >
                      ×
                    </button>
                  </div>
                  <button 
                    @click="addIpCidr(rule)" 
                    class="text-sm text-blue-600 hover:text-blue-700"
                    :disabled="!rule.enabled"
                  >
                    + Add IP CIDR
                  </button>
                </div>
              </div>

              <!-- Disabled note -->
              <div v-if="!rule.enabled" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label class="text-xs font-medium text-yellow-800 block mb-1">
                  Reason for disabling (optional):
                </label>
                <input
                  v-model="rule.disabledNote"
                  type="text"
                  class="form-input text-sm"
                  placeholder="e.g., Testing alternative configuration..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredRules.length === 0" class="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p v-if="searchQuery">No rules match your search</p>
          <p v-else>No routing rules configured. Click "+ Add Rule" to create one.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, watch, nextTick } from 'vue'
import { MetadataService } from '../services/MetadataService'

export default {
  name: 'RoutesConfig',
  props: {
    route: {
      type: Object,
      required: true
    },
    outbounds: {
      type: Array,
      default: () => []
    },
    ruleSets: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localRoute = reactive({ ...props.route })
    const metadata = ref(null)
    const metadataService = new MetadataService()
    const viewMode = ref('compact')
    const searchQuery = ref('')

    // Load metadata
    metadata.value = metadataService.load(props.config)
    viewMode.value = metadata.value.ruleViewMode || 'compact'

    // Extract outbound tags
    const outboundTags = computed(() => {
      return props.outbounds.map(ob => ob.tag).filter(tag => tag)
    })

    // Extract rule set tags
    const ruleSetTags = computed(() => {
      return props.ruleSets.map(rs => rs.tag).filter(tag => tag)
    })

    // Combine active and disabled rules
    const allRules = computed(() => {
      const active = (localRoute.rules || []).map((rule, index) => ({
        ...rule,
        id: metadataService.getRuleId(rule, index),
        enabled: true,
        displayIndex: index
      }))
      
      const disabled = (metadata.value.disabledRules || []).map(item => ({
        ...item.rule,
        id: item.id,
        enabled: false,
        disabledNote: item.note,
        originalPosition: item.originalPosition,
        displayIndex: item.originalPosition
      }))
      
      return [...active, ...disabled].sort((a, b) => a.displayIndex - b.displayIndex)
    })

    // Filter rules by search
    const filteredRules = computed(() => {
      if (!searchQuery.value) return allRules.value
      
      const search = searchQuery.value.toLowerCase()
      return allRules.value.filter(rule => {
        return (
          rule.outbound?.toLowerCase().includes(search) ||
          rule.rule_set?.toLowerCase().includes(search) ||
          rule.domain_suffix?.some(d => d.toLowerCase().includes(search)) ||
          rule.source_ip_cidr?.some(ip => ip.includes(search)) ||
          rule.ip_cidr?.some(ip => ip.includes(search))
        )
      })
    })

    // Count enabled/disabled
    const enabledCount = computed(() => allRules.value.filter(r => r.enabled).length)
    const disabledCount = computed(() => allRules.value.filter(r => !r.enabled).length)

    // Watch for changes and emit
    watch(localRoute, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    // Watch view mode changes
    watch(viewMode, (newMode) => {
      metadata.value.ruleViewMode = newMode
      metadataService.save(props.config, metadata.value)
    })

    // Format conditions for compact view
    const formatConditions = (rule) => {
      const parts = []
      
      if (rule.rule_set) {
        parts.push(`📋 ${rule.rule_set}`)
      }
      
      if (rule.domain_suffix?.length > 0) {
        const domains = rule.domain_suffix.slice(0, 2).join(', ')
        const more = rule.domain_suffix.length > 2 ? ` +${rule.domain_suffix.length - 2}` : ''
        parts.push(`🌐 ${domains}${more}`)
      }
      
      if (rule.source_ip_cidr?.length > 0) {
        parts.push(`📍 ${rule.source_ip_cidr[0]}${rule.source_ip_cidr.length > 1 ? ' +' + (rule.source_ip_cidr.length - 1) : ''}`)
      }
      
      if (rule.ip_cidr?.length > 0) {
        parts.push(`🔗 ${rule.ip_cidr[0]}${rule.ip_cidr.length > 1 ? ' +' + (rule.ip_cidr.length - 1) : ''}`)
      }
      
      return parts.join(' • ') || 'No conditions set'
    }

    // Get color for outbound badge
    const getOutboundColor = (outbound) => {
      const colors = {
        'proxy': 'bg-blue-100 text-blue-700',
        'direct': 'bg-green-100 text-green-700',
        'block': 'bg-red-100 text-red-700'
      }
      return colors[outbound] || 'bg-gray-100 text-gray-700'
    }

    // Toggle rule enabled/disabled
    const toggleRule = (rule, index) => {
      if (rule.enabled) {
        // Disable: remove from active rules, add to disabled
        const ruleIndex = localRoute.rules.findIndex(r => 
          metadataService.getRuleId(r, localRoute.rules.indexOf(r)) === rule.id
        )
        
        if (ruleIndex !== -1) {
          const ruleData = { ...localRoute.rules[ruleIndex] }
          localRoute.rules.splice(ruleIndex, 1)
          
          metadata.value.disabledRules.push({
            id: rule.id,
            rule: ruleData,
            disabledAt: new Date().toISOString(),
            originalPosition: index,
            note: ''
          })
          
          metadataService.save(props.config, metadata.value)
        }
      } else {
        // Enable: remove from disabled, add to active rules
        const disabledIndex = metadata.value.disabledRules.findIndex(r => r.id === rule.id)
        
        if (disabledIndex !== -1) {
          const disabledRule = metadata.value.disabledRules[disabledIndex]
          const insertAt = Math.min(disabledRule.originalPosition, localRoute.rules.length)
          
          localRoute.rules.splice(insertAt, 0, disabledRule.rule)
          metadata.value.disabledRules.splice(disabledIndex, 1)
          
          metadataService.save(props.config, metadata.value)
        }
      }
    }

    // Expand rule (switch to detailed view and scroll)
    const expandRule = (rule) => {
      viewMode.value = 'detailed'
      nextTick(() => {
        const element = document.getElementById('rule-' + rule.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-blue-500')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500')
          }, 2000)
        }
      })
    }

    // Confirm delete rule
    const confirmDeleteRule = (rule, index) => {
      if (confirm('Delete this rule permanently?')) {
        deleteRule(rule, index)
      }
    }

    // Delete rule
    const deleteRule = (rule, index) => {
      if (rule.enabled) {
        const ruleIndex = localRoute.rules.findIndex(r => 
          metadataService.getRuleId(r, localRoute.rules.indexOf(r)) === rule.id
        )
        if (ruleIndex !== -1) {
          localRoute.rules.splice(ruleIndex, 1)
        }
      } else {
        const disabledIndex = metadata.value.disabledRules.findIndex(r => r.id === rule.id)
        if (disabledIndex !== -1) {
          metadata.value.disabledRules.splice(disabledIndex, 1)
        }
      }
      metadataService.save(props.config, metadata.value)
    }

    // Add new rule
    const addRule = () => {
      if (!localRoute.rules) {
        localRoute.rules = []
      }
      localRoute.rules.unshift({
        outbound: ''
      })
    }

    // Toggle rule field
    const toggleRuleField = (rule, field) => {
      if (field === 'rule_set') {
        if (rule.rule_set !== undefined) {
          delete rule.rule_set
        } else {
          rule.rule_set = ''
        }
      } else {
        if (rule[field]) {
          delete rule[field]
        } else {
          rule[field] = []
        }
      }
    }

    // Domain management
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

    // Source IP management
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

    // IP CIDR management
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
      viewMode,
      searchQuery,
      outboundTags,
      ruleSetTags,
      allRules,
      filteredRules,
      enabledCount,
      disabledCount,
      formatConditions,
      getOutboundColor,
      toggleRule,
      expandRule,
      confirmDeleteRule,
      addRule,
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