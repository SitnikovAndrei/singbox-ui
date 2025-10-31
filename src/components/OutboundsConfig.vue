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
            
            <template v-if="outbound.type === 'vless' || outbound.type === 'vmess' || outbound.type === 'trojan' || outbound.type === 'shadowsocks'">
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
            <div class="mt-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">TLS Settings</h6>
                <button 
                  v-if="!outbound.tls" 
                  class="btn btn-outline-primary btn-sm" 
                  @click="addTlsConfig(outbound)"
                >
                  + Add TLS
                </button>
              </div>
              
              <div v-if="outbound.tls">
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
                <div class="mt-2">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="text-muted small mb-0">Reality Settings</h6>
                    <button 
                      v-if="!outbound.tls.reality" 
                      class="btn btn-outline-secondary btn-sm" 
                      @click="addReality(outbound)"
                    >
                      + Add Reality
                    </button>
                  </div>
                  
                  <div v-if="outbound.tls.reality">
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
                </div>

                <!-- UTLS Configuration -->
                <div class="mt-2">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="text-muted small mb-0">uTLS Settings</h6>
                    <button 
                      v-if="!outbound.tls.utls" 
                      class="btn btn-outline-secondary btn-sm" 
                      @click="addUtls(outbound)"
                    >
                      + Add uTLS
                    </button>
                  </div>
                  
                  <div v-if="outbound.tls.utls">
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
        type: 'vless',
        tag: 'new-outbound',
        server: '',
        server_port: 443,
        uuid: '',
        flow: 'xtls-rprx-vision',
        network: 'tcp',
        routing_mark: 255,
        tls: {
          enabled: true,
          insecure: false,
          server_name: '',
          reality: {
            enabled: false,
            public_key: '',
            short_id: ''
          },
          utls: {
            enabled: true,
            fingerprint: 'chrome'
          }
        }
      })
    }

    const removeOutbound = (index) => {
      localOutbounds.splice(index, 1)
    }

    const addTlsConfig = (outbound) => {
      outbound.tls = {
        enabled: true,
        insecure: false,
        server_name: ''
      }
    }

    const addReality = (outbound) => {
      if (!outbound.tls) {
        addTlsConfig(outbound)
      }
      outbound.tls.reality = {
        enabled: true,
        public_key: '',
        short_id: ''
      }
    }

    const addUtls = (outbound) => {
      if (!outbound.tls) {
        addTlsConfig(outbound)
      }
      outbound.tls.utls = {
        enabled: true,
        fingerprint: 'chrome'
      }
    }

    return {
      localOutbounds,
      addOutbound,
      removeOutbound,
      addTlsConfig,
      addReality,
      addUtls
    }
  }
}
</script>