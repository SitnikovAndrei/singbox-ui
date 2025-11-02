<template>
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">Log Settings</h2>
    </div>
    
    <div class="card-compact">
      <BaseSelect
        :model-value="modelValue.level"
        @update:model-value="updateLevel"
        label="Log Level"
        :options="logLevelOptions"
        hint="Set the verbosity of logging output"
      />
    </div>
  </div>
</template>

<script setup>
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ level: 'info' })
  }
})

const emit = defineEmits(['update:modelValue'])

const logLevelOptions = [
  { value: 'trace', label: 'Trace (Most Verbose)' },
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'fatal', label: 'Fatal (Least Verbose)' }
]

function updateLevel(level) {
  emit('update:modelValue', {
    ...props.modelValue,
    level
  })
}
</script>