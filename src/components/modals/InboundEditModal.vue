<template>
  <BaseModal
    :show="show"
    :title="mode === 'create' ? 'Add Inbound' : 'Edit Inbound'"
    :loading="loading"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <form @submit.prevent="handleSave">
      <BaseSelect
        v-model="form.type"
        label="Type"
        :options="typeOptions"
        required
      />
      
      <BaseInput
        v-model="form.tag"
        label="Tag"
        placeholder="tproxy-in"
        hint="Optional identifier for this inbound"
      />
      
      <div class="form-row">
        <BaseInput
          v-model="form.listen"
          label="Listen Address"
          placeholder="127.0.0.1"
          required
        />
        <BaseInput
          v-model.number="form.listen_port"
          label="Port"
          type="number"
          placeholder="7893"
          required
        />
      </div>
      
      <BaseToggle
        v-model="form.sniff"
        label="Enable Traffic Sniffing"
      />
      
      <BaseToggle
        v-if="form.sniff"
        v-model="form.sniff_override_destination"
        label="Override Destination from Sniff"
      />
      
      <BaseSelect
        v-model="form.domain_strategy"
        label="Domain Strategy"
        :options="domainStrategyOptions"
      />
      
      <BaseToggle
        v-model="form.tcp_fast_open"
        label="TCP Fast Open"
      />
      
      <BaseToggle
        v-model="form.udp_fragment"
        label="UDP Fragment"
      />
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseToggle from '../ui/BaseToggle.vue'

const props = defineProps({
  show: Boolean,
  item: Object,
  mode: String
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)

const typeOptions = [
  { value: 'tproxy', label: 'TProxy' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'http', label: 'HTTP' },
  { value: 'socks', label: 'SOCKS' }
]

const domainStrategyOptions = [
  { value: 'ipv4_only', label: 'IPv4 Only' },
  { value: 'ipv6_only', label: 'IPv6 Only' },
  { value: 'prefer_ipv4', label: 'Prefer IPv4' },
  { value: 'prefer_ipv6', label: 'Prefer IPv6' }
]

const defaultForm = {
  type: 'tproxy',
  tag: '',
  listen: '127.0.0.1',
  listen_port: 7893,
  sniff: true,
  sniff_override_destination: true,
  domain_strategy: 'ipv4_only',
  tcp_fast_open: true,
  udp_fragment: false
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