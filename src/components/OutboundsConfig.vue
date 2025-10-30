<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Outbound Configuration</h5>
      
      <div v-for="(outbound, index) in localOutbounds" :key="index" class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><strong>{{ outbound.tag || 'Outbound #' + (index + 1) }}</strong> ({{ outbound.type }})</span>
          <button class="btn btn-danger btn-sm" @click="removeOutbound(index)">Remove</button>
        </div>
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label">Type</label>
              <select class="form-select" v-model="outbound.type">
                <option value="direct">Direct</option>
                <option value="block">Block</option>
                <option value="vless">VLESS</option>
                <option value="vmess">VMess</option>
                <option value="shadowsocks">Shadowsocks</option>
                <option value="trojan">Trojan</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Tag</label>
              <input type="text" class="form-control" v-model="outbound.tag" placeholder="proxy-out">
            </div>
            
            <template v-if="outbound.type === 'vless' || outbound.type === 'vmess' || outbound.type === 'trojan'">
              <div class="col-md-3">
                <label class="form-label">Server</label>
                <input type="text" class="form-control" v-model="outbound.server" placeholder="example.com">
              </div>
              <div class="col-md-3">
                <label class="form-label">Port</label>
                <input type="number" class="form-control" v-model.number="outbound.server_port" placeholder="443">
              </div>
            </template>
          </div>

          <template v-if="outbound.type === 'vless' || outbound.type === 'vmess'">
            <div class="row g-2 mt-2">
              <div class="col-md-4">
                <label class="form-label">UUID</label>
                <input type="text" class="form-control" v-model="outbound.uuid" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
              </div>
              <div class="col-md-4">
                <label class="form-label">Network</label>
                <select class="form-select" v-model="outbound.network">
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="ws">WebSocket</option>
                  <option value="grpc">gRPC</option>
                </select>
              </div>
              <div class="col-md-4" v-if="outbound.type === 'vless'">
                <label class="form-label">Flow</label>
                <input type="text" class="form-control" v-model="outbound.flow" placeholder="xtls-rprx-vision">
              </div>
            </div>

            <!-- TLS Configuration -->
            <div v-if="outbound.tls" class="mt-3">
              <h6>TLS Settings</h6>
              <div class="row g-2">
                <div class="col-md-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="outbound.tls.enabled" :id="'tls-enabled-' + index">
                    <label class="form-check-label" :for="'tls-enabled-' + index">TLS Enabled</label>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="outbound.tls.insecure" :id="'tls-insecure-' + index">
                    <label class="form-check-label" :for="'tls-insecure-' + index">Insecure</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Server Name</label>
                  <input type="text" class="form-control" v-model="outbound.tls.server_name" placeholder="example.com">
                </div>
              </div>

              <!-- Reality Configuration -->
              <div v-if="outbound.tls.reality" class="mt-2">
                <h6 class="text-muted small">Reality Settings</h6>
                <div class="row g-2">
                  <div class="col-md-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="outbound.tls.reality.enabled" :id="'reality-enabled-' + index">
                      <label class="form-check-label" :for="'reality-enabled-' + index">Reality Enabled</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Public Key</label>
                    <input type="text" class="form-control form-control-sm" v-model="outbound.tls.reality.public_key">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Short ID</label>
                    <input type="text" class="form-control form-control-sm" v-model="outbound.tls.reality.short_id">
                  </div>
                </div>
              </div>

              <!-- UTLS Configuration -->
              <div v-if="outbound.tls.utls" class="mt-2">
                <h6 class="text-muted small">uTLS Settings</h6>
                <div class="row g-2">
                  <div class="col-md-6">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="outbound.tls.utls.enabled" :id="'utls-enabled-' + index">
                      <label class="form-check-label" :for="'utls-enabled-' + index">uTLS Enabled</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Fingerprint</label>
                    <select class="form-select form-select-sm" v-model="outbound.tls.utls.fingerprint">
                      <option value="chrome">Chrome</option>
                      <option value="firefox">Firefox</option>
                      <option value="safari">Safari</option>
                      <option value="edge">Edge</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div class="row g-2 mt-2" v-if="outbound.routing_mark !== undefined">
            <div class="col-md-6">
              <label class="form-label">Routing Mark</label>
              <input type="number" class="form-control" v-model.number="outbound.routing_mark">
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-success btn-sm" @click="addOutbound">+ Add Outbound</button>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'OutboundsConfig',
  props: {
    outbounds: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localOutbounds = reactive([...props.outbounds])

    watch(localOutbounds, (newVal) => {
      emit('update', [...newVal])
    }, { deep: true })

    const addOutbound = () => {
      localOutbounds.push({
        type: 'direct',
        tag: 'direct',
        routing_mark: 255
      })
    }

    const removeOutbound = (index) => {
      localOutbounds.splice(index, 1)
    }

    return {
      localOutbounds,
      addOutbound,
      removeOutbound
    }
  }
}
</script>