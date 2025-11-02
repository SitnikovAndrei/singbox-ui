<template>
  <BaseModal
    :show="show"
    :title="mode === 'create' ? 'Add Outbound' : 'Edit Outbound'"
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
        placeholder="unique-identifier"
        required
        hint="Unique identifier for this outbound"
      />
      
      <!-- Shadowsocks fields -->
      <template v-if="form.type === 'shadowsocks'">
        <div class="form-row">
          <BaseInput
            v-model="form.server"
            label="Server"
            placeholder="example.com"
            required
          />
          <BaseInput
            v-model.number="form.server_port"
            label="Port"
            type="number"
            placeholder="8443"
            required
          />
        </div>
        
        <BaseSelect
          v-model="form.method"
          label="Method"
          :options="shadowsocksMethodOptions"
          required
        />
        
        <BaseInput
          v-model="form.password"
          label="Password"
          type="password"
          required
        />
        
        <BaseSelect
          v-model="form.network"
          label="Network"
          :options="networkOptions"
        />
      </template>
      
      <!-- VLESS fields -->
      <template v-if="form.type === 'vless'">
        <div class="form-row">
          <BaseInput
            v-model="form.server"
            label="Server"
            placeholder="example.com"
            required
          />
          <BaseInput
            v-model.number="form.server_port"
            label="Port"
            type="number"
            placeholder="443"
            required
          />
        </div>
        
        <BaseInput
          v-model="form.uuid"
          label="UUID"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
        
        <div class="form-row">
          <BaseSelect
            v-model="form.network"
            label="Network"
            :options="networkOptions"
          />
          <BaseInput
            v-model="form.flow"
            label="Flow"
            placeholder="xtls-rprx-vision"
          />
        </div>
        
        <!-- TLS Section -->
        <fieldset class="border border-gray-200 rounded-lg p-4 mt-4">
          <legend class="text-sm font-medium text-gray-700 px-2">TLS Settings</legend>
          
          <BaseToggle
            v-model="form.tls.enabled"
            label="Enable TLS"
          />
          
          <template v-if="form.tls.enabled">
            <BaseToggle
              v-model="form.tls.insecure"
              label="Skip Certificate Verification"
            />
            
            <BaseInput
              v-model="form.tls.server_name"
              label="Server Name"
              placeholder="example.com"
            />
            
            <!-- uTLS Section -->
            <fieldset class="border border-gray-200 rounded-lg p-4 mt-4">
              <legend class="text-sm font-medium text-gray-700 px-2">uTLS</legend>
              
              <BaseToggle
                v-model="form.tls.utls.enabled"
                label="Enable uTLS"
              />
              
              <BaseSelect
                v-if="form.tls.utls.enabled"
                v-model="form.tls.utls.fingerprint"
                label="Fingerprint"
                :options="fingerprintOptions"
              />
            </fieldset>
            
            <!-- Reality Section -->
            <fieldset class="border border-gray-200 rounded-lg p-4 mt-4">
              <legend class="text-sm font-medium text-gray-700 px-2">Reality</legend>
              
              <BaseToggle
                v-model="form.tls.reality.enabled"
                label="Enable Reality"
              />
              
              <template v-if="form.tls.reality.enabled">
                <BaseInput
                  v-model="form.tls.reality.public_key"
                  label="Public Key"
                  required
                />
                <BaseInput
                  v-model="form.tls.reality.short_id"
                  label="Short ID"
                />
              </template>
            </fieldset>
          </template>
        </fieldset>
      </template>
      
      <!-- Direct/Block - minimal fields -->
      <template v-if="form.type === 'direct' || form.type === 'block'">
        <p class="text-sm text-gray-600">
          {{ form.type === 'direct' ? 'Direct connection without proxy' : 'Block all traffic' }}
        </p>
      </template>
      
      <!-- Common fields -->
      <BaseInput
        v-model.number="form.routing_mark"
        label="Routing Mark"
        type="number"
        placeholder="255"
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
  { value: 'shadowsocks', label: 'Shadowsocks' },
  { value: 'vless', label: 'VLESS' },
  { value: 'direct', label: 'Direct' },
  { value: 'block', label: 'Block' }
]

const shadowsocksMethodOptions = [
  { value: 'chacha20-ietf-poly1305', label: 'ChaCha20-IETF-Poly1305' },
  { value: 'aes-256-gcm', label: 'AES-256-GCM' },
  { value: 'aes-128-gcm', label: 'AES-128-GCM' }
]

const networkOptions = [
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' }
]

const fingerprintOptions = [
  { value: 'chrome', label: 'Chrome' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'safari', label: 'Safari' },
  { value: 'edge', label: 'Edge' }
]

const defaultForm = {
  type: 'shadowsocks',
  tag: '',
  server: '',
  server_port: 443,
  method: 'chacha20-ietf-poly1305',
  password: '',
  network: 'tcp',
  uuid: '',
  flow: '',
  routing_mark: 255,
  tls: {
    enabled: false,
    insecure: false,
    server_name: '',
    utls: {
      enabled: false,
      fingerprint: 'chrome'
    },
    reality: {
      enabled: false,
      public_key: '',
      short_id: ''
    }
  }
}

const form = ref({ ...defaultForm })

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      ...defaultForm,
      ...newItem,
      tls: {
        ...defaultForm.tls,
        ...newItem.tls,
        utls: {
          ...defaultForm.tls.utls,
          ...newItem.tls?.utls
        },
        reality: {
          ...defaultForm.tls.reality,
          ...newItem.tls?.reality
        }
      }
    }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })

async function handleSave() {
  loading.value = true
  
  const cleanedForm = { ...form.value }
  
  if (cleanedForm.type === 'direct' || cleanedForm.type === 'block') {
    delete cleanedForm.server
    delete cleanedForm.server_port
    delete cleanedForm.method
    delete cleanedForm.password
    delete cleanedForm.uuid
    delete cleanedForm.flow
    delete cleanedForm.tls
  } else if (cleanedForm.type === 'shadowsocks') {
    delete cleanedForm.uuid
    delete cleanedForm.flow
    delete cleanedForm.tls
  } else if (cleanedForm.type === 'vless') {
    delete cleanedForm.method
    delete cleanedForm.password
    
    if (!cleanedForm.tls.enabled) {
      delete cleanedForm.tls
    } else {
      if (!cleanedForm.tls.utls.enabled) {
        delete cleanedForm.tls.utls
      }
      if (!cleanedForm.tls.reality.enabled) {
        delete cleanedForm.tls.reality
      }
    }
  }
  
  try {
    emit('save', cleanedForm)
  } finally {
    loading.value = false
  }
}
</script>