<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">Route Rules</h2>
      <BaseButton @click="handleAdd">+ Add Rule</BaseButton>
    </div>
    
    <div v-if="allItems.length === 0" class="empty-state">
      No routing rules configured. Click "Add Rule" to create one.
    </div>
    
    <div v-else class="list-container">
      <BaseCard
        v-for="item in allItems"
        :key="item._id"
        :disabled="item._disabled"
      >
        <template #header>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-warning">Rule #{{ item._order + 1 }}</span>
              <span class="badge badge-primary">→ {{ item.outbound }}</span>
            </div>
            <p class="card-subtitle mt-2">
              {{ getRuleSummary(item) }}
            </p>
          </div>
        </template>
        
        <template #headerActions>
          <div class="flex gap-1">
            <BaseButton 
              variant="icon" 
              @click="moveItem(item._id, 'up')"
              :disabled="item._order === 0"
            >
              ⬆️
            </BaseButton>
            <BaseButton 
              variant="icon" 
              @click="moveItem(item._id, 'down')"
              :disabled="item._order === allItems.length - 1"
            >
              ⬇️
            </BaseButton>
            <BaseToggle
              :model-value="!item._disabled"
              @update:modelValue="toggleDisable(item._id)"
            />
          </div>
        </template>
        
        <div class="text-sm text-gray-600 space-y-1">
          <div v-if="item.source_ip_cidr?.length">
            <strong>Source IPs:</strong> {{ item.source_ip_cidr.join(', ') }}
          </div>
          <div v-if="item.ip_cidr?.length">
            <strong>Destination IPs:</strong> {{ item.ip_cidr.join(', ') }}
          </div>
          <div v-if="item.domain_suffix?.length">
            <strong>Domains:</strong> {{ item.domain_suffix.join(', ') }}
          </div>
          <div v-if="item.rule_set">
            <strong>Rule Set:</strong> {{ item.rule_set }}
          </div>
        </div>
        
        <template #actions>
          <BaseButton variant="secondary" @click="handleEdit(item)">
            ✏️ Edit
          </BaseButton>
          <BaseButton variant="danger" @click="handleDelete(item._id)">
            🗑️ Delete
          </BaseButton>
        </template>
      </BaseCard>
    </div>
    
    <fieldset class="border border-gray-200 rounded-lg p-4 mt-6">
      <legend class="text-sm font-medium text-gray-700 px-2">Global Route Settings</legend>
      
      <BaseToggle
        :model-value="routeSettings.auto_detect_interface"
        @update:model-value="updateRouteSetting('auto_detect_interface', $event)"
        label="Auto Detect Interface"
      />
      
      <BaseInput
        :model-value="routeSettings.final"
        @update:model-value="updateRouteSetting('final', $event)"
        label="Final Outbound"
        placeholder="direct"
        hint="Default outbound when no rules match"
      />
    </fieldset>
    
    <RouteRuleEditModal
      :show="modal.isOpen.value"
      :item="modal.currentItem.value"
      :mode="modal.mode.value"
      :outbounds="outbounds"
      :rule-sets="ruleSets"
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
import RouteRuleEditModal from './modals/RouteRuleEditModal.vue'
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
  },
  ruleSets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const list = useConfigList(props.modelValue.rules || [])
const modal = useModal()

const allItems = computed(() => list.items.value)
const routeSettings = computed(() => ({
  auto_detect_interface: props.modelValue.auto_detect_interface ?? true,
  final: props.modelValue.final || 'direct'
}))

function getRuleSummary(item) {
  const conditions = []
  if (item.source_ip_cidr?.length) conditions.push(`${item.source_ip_cidr.length} source IPs`)
  if (item.ip_cidr?.length) conditions.push(`${item.ip_cidr.length} dest IPs`)
  if (item.domain_suffix?.length) conditions.push(`${item.domain_suffix.length} domains`)
  if (item.rule_set) conditions.push(`rule set: ${item.rule_set}`)
  return conditions.length ? conditions.join(' • ') : 'No conditions'
}

function handleAdd() {
  modal.openModal()
}

function handleEdit(item) {
  modal.openModal(item)
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this rule?')) {
    list.deleteItem(id)
    emitUpdate()
  }
}

function toggleDisable(id) {
  list.toggleDisable(id)
  emitUpdate()
}

function moveItem(id, direction) {
  list.moveItem(id, direction)
  list.items.value.forEach((item, index) => {
    item._order = index
  })
  emitUpdate()
}

function updateRouteSetting(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

function handleSave(item) {
  if (modal.mode.value === 'create') {
    list.addItem(item)
  } else {
    list.updateItem(item._id, item)
  }
  emitUpdate()
  modal.closeModal()
}

function emitUpdate() {
  emit('update:modelValue', {
    ...props.modelValue,
    rules: list.items.value
  })
}
</script>