<template>
  <div class="flex items-center gap-3">
    <label v-if="label" class="label-text">{{ label }}</label>
    <div class="toggle-wrapper" @click="handleClick">
      <input
        type="checkbox"
        class="toggle-input"
        :checked="modelValue"
        :disabled="disabled"
        style="pointer-events: none;"
      />
      <span class="toggle-slider"></span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  label: String,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

function handleClick(event) {
  if (props.disabled) return
  
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
}
</script>