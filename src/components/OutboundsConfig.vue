<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">Outbounds</h2>
      <BaseButton @click="handleAdd">+ Add Outbound</BaseButton>
    </div>
    
    <div v-if="allItems.length === 0" class="empty-state">
      No outbounds configured. Click "Add Outbound" to create one.
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
              <span class="badge badge-primary">{{ item.type }}</span>
              <h3 class="text-lg font-semibold">{{ item.tag }}</h3>
            </div>
            <p class="card-subtitle">
              {{ getOutboundSummary(item) }}
            </p>
          </div>
        </template>
        
        <template #headerActions>
          <BaseToggle
            :model-value="!item._disabled"
            @update:modelValue="toggleDisable(item._id)"
          />
        </template>
        
        <div class="text-sm text-gray-600">
          <div v-if="item.server">
            <strong>Server:</strong> {{ item.server }}:{{ item.server_port }}
          </div>
          <div v-if="item.method">
            <strong>Method:</strong> {{ item.method }}
          </div>
          <div v-if="item.network">
            <strong>Network:</strong> {{ item.network }}
          </div>
          <div v-if="item.tls?.enabled">
            <span class="badge badge-success">TLS Enabled</span>
            <span v-if="item.tls.reality?.enabled" class="badge badge-success ml-1">Reality</span>
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
    
    <OutboundEditModal
      :show="modal.isOpen.value"
      :item="modal.currentItem.value"
      :mode="modal.mode.value"
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
import OutboundEditModal from './modals/OutboundEditModal.vue'
import { useConfigList } from '../composables/useConfigList'
import { useModal } from '../composables/useModal'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const list = useConfigList(props.modelValue)
const modal = useModal()

const allItems = computed(() => list.items.value)

function getOutboundSummary(item) {
  if (item.type === 'direct') return 'Direct connection'
  if (item.type === 'block') return 'Block traffic'
  if (item.server) return `${item.server}:${item.server_port}`
  return 'No server configured'
}

function handleAdd() {
  modal.openModal()
}

function handleEdit(item) {
  modal.openModal(item)
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this outbound?')) {
    list.deleteItem(id)
    emit('update:modelValue', list.items.value)
  }
}

function toggleDisable(id) {
  list.toggleDisable(id)
  emit('update:modelValue', list.items.value)
}

function handleSave(item) {
  if (modal.mode.value === 'create') {
    list.addItem(item)
  } else {
    list.updateItem(item._id, item)
  }
  emit('update:modelValue', list.items.value)
  modal.closeModal()
}
</script>