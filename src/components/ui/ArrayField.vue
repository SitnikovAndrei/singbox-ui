<template>
  <div class="form-group">
    <label v-if="label" class="label-text">{{ label }}</label>
    
    <div class="space-y-2">
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="flex gap-2"
      >
        <input
          :value="item"
          :placeholder="placeholder"
          class="input-field"
          @input="updateItem(index, $event.target.value)"
        />
        <BaseButton variant="icon" @click="removeItem(index)">
          🗑️
        </BaseButton>
      </div>
      
      <BaseButton variant="secondary" @click="addItem">
        + Add {{ itemName }}
      </BaseButton>
    </div>
    
    <p v-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: String,
  placeholder: String,
  itemName: {
    type: String,
    default: 'item'
  },
  hint: String
})

const emit = defineEmits(['update:modelValue'])

const items = computed(() => props.modelValue || [])

function addItem() {
  emit('update:modelValue', [...items.value, ''])
}

function updateItem(index, value) {
  const newItems = [...items.value]
  newItems[index] = value
  emit('update:modelValue', newItems)
}

function removeItem(index) {
  const newItems = items.value.filter((_, i) => i !== index)
  emit('update:modelValue', newItems)
}
</script>