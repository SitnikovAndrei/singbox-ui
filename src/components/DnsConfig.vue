<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">DNS Servers</h2>
      <BaseButton @click="handleAdd">+ Add Server</BaseButton>
    </div>
    
    <div v-if="allServers.length === 0" class="empty-state">
      No DNS servers configured. Click "Add Server" to create one.
    </div>
    
    <div v-else class="list-container">
      <BaseCard
        v-for="server in allServers"
        :key="server._id"
        :disabled="server._disabled"
      >
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">{{ server.tag }}</h3>
            <p class="card-subtitle">{{ server.address }}</p>
          </div>
        </template>
        
        <template #headerActions>
          <BaseToggle
            :model-value="!server._disabled"
            @update:modelValue="toggleDisable(server._id)"
          />
        </template>
        
        <div class="text-sm text-gray-600">
          <div v-if="server.detour">
            <strong>Detour:</strong> {{ server.detour }}
          </div>
        </div>
        
        <template #actions>
          <BaseButton variant="secondary" @click="handleEdit(server)">
            ✏️ Edit
          </BaseButton>
          <BaseButton variant="danger" @click="handleDelete(server._id)">
            🗑️ Delete
          </BaseButton>
        </template>
      </BaseCard>
    </div>
    
    <fieldset class="border border-gray-200 rounded-lg p-4 mt-6">
      <legend class="text-sm font-medium text-gray-700 px-2">Global DNS Settings</legend>
      
      <div class="form-row">
        <BaseSelect
          :model-value="dnsSettings.strategy"
          @update:model-value="updateDnsSetting('strategy', $event)"
          label="Strategy"
          :options="strategyOptions"
        />
        
        <BaseInput
          :model-value="dnsSettings.final"
          @update:model-value="updateDnsSetting('final', $event)"
          label="Final Server"
          placeholder="google"
        />
      </div>
      
      <div class="flex gap-4">
        <BaseToggle
          :model-value="dnsSettings.disable_cache"
          @update:model-value="updateDnsSetting('disable_cache', $event)"
          label="Disable Cache"
        />
        
        <BaseToggle
          :model-value="dnsSettings.disable_expire"
          @update:model-value="updateDnsSetting('disable_expire', $event)"
          label="Disable Expire"
        />
      </div>
    </fieldset>
    
    <DnsServerEditModal
      :show="modal.isOpen.value"
      :item="modal.currentItem.value"
      :mode="modal.mode.value"
      :outbounds="outbounds"
      @close="modal.closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from './ui/BaseCard.vue'
import BaseButton from './ui/BaseButton.vue'
import BaseToggle from './ui/BaseToggle.vue'
import BaseInput from './ui/BaseInput.vue'
import BaseSelect from './ui/BaseSelect.vue'
import DnsServerEditModal from './modals/DnsServerEditModal.vue'
import { useConfigList } from '../composables/useConfigList'
import { useModal } from '../composables/useModal'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  outbounds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const list = useConfigList(props.modelValue.servers || [])
const modal = useModal()

const allServers = computed(() => list.items.value)

const strategyOptions = [
  { value: 'prefer_ipv4', label: 'Prefer IPv4' },
  { value: 'prefer_ipv6', label: 'Prefer IPv6' },
  { value: 'ipv4_only', label: 'IPv4 Only' },
  { value: 'ipv6_only', label: 'IPv6 Only' }
]

const dnsSettings = computed(() => ({
  strategy: props.modelValue.strategy || 'prefer_ipv4',
  final: props.modelValue.final || 'google',
  disable_cache: props.modelValue.disable_cache ?? false,
  disable_expire: props.modelValue.disable_expire ?? false
}))

function handleAdd() {
  modal.openModal()
}

function handleEdit(server) {
  modal.openModal(server)
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this DNS server?')) {
    list.deleteItem(id)
    emitUpdate()
  }
}

function toggleDisable(id) {
  list.toggleDisable(id)
  emitUpdate()
}

function updateDnsSetting(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

function handleSave(server) {
  if (modal.mode.value === 'create') {
    list.addItem(server)
  } else {
    list.updateItem(server._id, server)
  }
  emitUpdate()
  modal.closeModal()
}

function emitUpdate() {
  emit('update:modelValue', {
    ...props.modelValue,
    servers: list.items.value
  })
}
</script>