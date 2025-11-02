<template>
  <BaseModal
    :show="show"
    :title="mode === 'create' ? 'Add Rule Set' : 'Edit Rule Set'"
    :loading="loading"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <form @submit.prevent="handleSave">
      <BaseInput
        v-model="form.tag"
        label="Tag"
        placeholder="openai"
        required
        hint="Unique identifier for this rule set"
      />
      
      <BaseSelect
        v-model="form.type"
        label="Type"
        :options="typeOptions"
        required
      />
      
      <BaseSelect
        v-model="form.format"
        label="Format"
        :options="formatOptions"
        required
      />
      
      <BaseInput
        v-model="form.url"
        label="URL"
        placeholder="https://example.com/rules.srs"
        required
        hint="Remote URL to fetch the rule set"
      />
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'

const props = defineProps({
  show: Boolean,
  item: Object,
  mode: String
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)

const typeOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'local', label: 'Local' }
]

const formatOptions = [
  { value: 'binary', label: 'Binary' },
  { value: 'source', label: 'Source' }
]

const defaultForm = {
  tag: '',
  type: 'remote',
  format: 'binary',
  url: ''
}

const form = ref({ ...defaultForm })

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = { ...defaultForm, ...newItem }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })

async function handleSave() {
  loading.value = true
  
  try {
    emit('save', { ...form.value })
  } finally {
    loading.value = false
  }
}
</script>