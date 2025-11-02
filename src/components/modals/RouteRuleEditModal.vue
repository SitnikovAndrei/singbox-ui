<template>
  <BaseModal
    :show="show"
    :title="mode === 'create' ? 'Add Route Rule' : 'Edit Route Rule'"
    :loading="loading"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <form @submit.prevent="handleSave">
      <BaseSelect
        v-model="form.outbound"
        label="Outbound"
        :options="outboundOptions"
        required
        hint="Traffic matching this rule will use this outbound"
      />
      
      <fieldset class="border border-gray-200 rounded-lg p-4 mt-4">
        <legend class="text-sm font-medium text-gray-700 px-2">Match Conditions</legend>
        <p class="text-sm text-gray-500 mb-4">Add at least one condition</p>
        
        <ArrayField
          v-model="form.source_ip_cidr"
          label="Source IP CIDR"
          placeholder="192.168.1.0/24"
          item-name="IP/CIDR"
          hint="Match source IP addresses"
        />
        
        <ArrayField
          v-model="form.ip_cidr"
          label="Destination IP CIDR"
          placeholder="160.79.104.0/23"
          item-name="IP/CIDR"
          hint="Match destination IP addresses"
        />
        
        <ArrayField
          v-model="form.domain_suffix"
          label="Domain Suffix"
          placeholder="example.com"
          item-name="domain"
          hint="Match domain suffixes"
        />
        
        <BaseSelect
          v-if="ruleSetOptions.length > 0"
          v-model="form.rule_set"
          label="Rule Set"
          :options="ruleSetOptions"
          placeholder="Select a rule set"
          hint="Use predefined rule set"
        />
      </fieldset>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import ArrayField from '../ui/ArrayField.vue'

const props = defineProps({
  show: Boolean,
  item: Object,
  mode: String,
  outbounds: {
    type: Array,
    default: () => []
  },
  ruleSets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)

const outboundOptions = computed(() =>
  props.outbounds
    .filter(o => !o._disabled && o.tag)
    .map(o => ({ value: o.tag, label: `${o.tag} (${o.type})` }))
)

const ruleSetOptions = computed(() => [
  { value: '', label: 'None' },
  ...props.ruleSets
    .filter(rs => !rs._disabled && rs.tag)
    .map(rs => ({ value: rs.tag, label: rs.tag }))
])

const defaultForm = {
  outbound: '',
  source_ip_cidr: [],
  ip_cidr: [],
  domain_suffix: [],
  rule_set: ''
}

const form = ref({ ...defaultForm })

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      ...defaultForm,
      ...newItem,
      source_ip_cidr: newItem.source_ip_cidr || [],
      ip_cidr: newItem.ip_cidr || [],
      domain_suffix: newItem.domain_suffix || []
    }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })

async function handleSave() {
  loading.value = true
  
  try {
    const cleanedForm = { ...form.value }
    
    if (!cleanedForm.source_ip_cidr?.length) delete cleanedForm.source_ip_cidr
    if (!cleanedForm.ip_cidr?.length) delete cleanedForm.ip_cidr
    if (!cleanedForm.domain_suffix?.length) delete cleanedForm.domain_suffix
    if (!cleanedForm.rule_set) delete cleanedForm.rule_set
    
    emit('save', cleanedForm)
  } finally {
    loading.value = false
  }
}
</script>