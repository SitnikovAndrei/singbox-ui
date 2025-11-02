<template>
  <BaseModal
    :show="show"
    :title="mode === 'create' ? 'Add DNS Server' : 'Edit DNS Server'"
    :loading="loading"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <form @submit.prevent="handleSave">
      <BaseInput
        v-model="form.tag"
        label="Tag"
        placeholder="google"
        required
        hint="Unique identifier for this DNS server"
      />
      
      <BaseInput
        v-model="form.address"
        label="Address"
        placeholder="tls://8.8.8.8"
        required
        hint="DNS server address (supports tls://, https://, udp://)"
      />
      
      <BaseSelect
        v-model="form.detour"
        label="Detour"
        :options="detourOptions"
        placeholder="Select outbound"
        hint="Outbound to use for DNS queries"
      />
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'

const props = defineProps({
  show: Boolean,
  item: Object,
  mode: String,
  outbounds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)

const detourOptions = computed(() => [
  { value: '', label: 'None' },
  ...props.outbounds
    .filter(o => !o._disabled && o.tag)
    .map(o => ({ value: o.tag, label: `${o.tag} (${o.type})` }))
])

const defaultForm = {
  tag: '',
  address: '',
  detour: ''
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
    const cleanedForm = { ...form.value }
    if (!cleanedForm.detour) delete cleanedForm.detour
    
    emit('save', cleanedForm)
  } finally {
    loading.value = false
  }
}
</script>