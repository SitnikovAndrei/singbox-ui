<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">Inbounds</h2>
      <BaseButton @click="handleAdd">+ Add Inbound</BaseButton>
    </div>
    
    <div v-if="allItems.length === 0" class="empty-state">
      No inbounds configured. Click "Add Inbound" to create one.
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
              <h3 class="text-lg font-semibold">{{ item.tag || 'Unnamed' }}</h3>
            </div>
            <p class="card-subtitle">
              {{ item.listen }}:{{ item.listen_port }}
            </p>
          </div>
        </template>
        
        <template #headerActions>
          <BaseToggle
            :model-value="!item._disabled"
            @update:modelValue="toggleDisable(item._id)"
          />
        </template>
        
        <div class="text-sm text-gray-600 space-y-1">
          <div v-if="item.sniff">
            <span class="badge badge-success">Sniff Enabled</span>
          </div>
          <div v-if="item.domain_strategy">
            <strong>Domain Strategy:</strong> {{ item.domain_strategy }}
          </div>
          <div v-if="item.tcp_fast_open">
            <span class="badge badge-success">TCP Fast Open</span>
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
    
    <InboundEditModal
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
import InboundEditModal from './modals/InboundEditModal.vue'
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

function handleAdd() {
  modal.openModal()
}

function handleEdit(item) {
  modal.openModal(item)
}

function handleDelete(id) {
  if (confirm('Are you sure you want to delete this inbound?')) {
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