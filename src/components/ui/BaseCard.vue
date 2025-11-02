<template>
  <div :class="['card-compact', { 'card-disabled': disabled }]">
    <div class="card-header" v-if="$slots.header || title">
      <div>
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <slot name="header" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="headerActions" />
      </div>
    </div>
    
    <div class="card-body">
      <slot />
    </div>
    
    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  disabled: Boolean
})
</script>