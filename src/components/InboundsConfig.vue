<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Inbound Configuration</h5>
      
      <div v-for="(inbound, index) in localInbounds" :key="index" class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><strong>{{ inbound.tag || 'Inbound #' + (index + 1) }}</strong> ({{ inbound.type }})</span>
          <button class="btn btn-danger btn-sm" @click="removeInbound(index)">Remove</button>
        </div>
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label">Type</label>
              <select class="form-select" v-model="inbound.type">
                <option value="tproxy">TProxy</option>
                <option value="socks">SOCKS</option>
                <option value="http">HTTP</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Tag</label>
              <input type="text" class="form-control" v-model="inbound.tag" placeholder="proxy-in">
            </div>
            <div class="col-md-3">
              <label class="form-label">Listen Address</label>
              <input type="text" class="form-control" v-model="inbound.listen" placeholder="127.0.0.1">
            </div>
            <div class="col-md-3">
              <label class="form-label">Port</label>
              <input type="number" class="form-control" v-model.number="inbound.listen_port" placeholder="7893">
            </div>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-md-3">
              <label class="form-label">Domain Strategy</label>
              <select class="form-select" v-model="inbound.domain_strategy">
                <option value="">Default</option>
                <option value="ipv4_only">IPv4 Only</option>
                <option value="ipv6_only">IPv6 Only</option>
                <option value="prefer_ipv4">Prefer IPv4</option>
                <option value="prefer_ipv6">Prefer IPv6</option>
              </select>
            </div>
            <div class="col-md-9 d-flex align-items-end gap-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="inbound.sniff" :id="'sniff-' + index">
                <label class="form-check-label" :for="'sniff-' + index">Sniff</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="inbound.tcp_fast_open" :id="'tfo-' + index">
                <label class="form-check-label" :for="'tfo-' + index">TCP Fast Open</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="inbound.sniff_override_destination" :id="'sniff-override-' + index">
                <label class="form-check-label" :for="'sniff-override-' + index">Sniff Override</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="inbound.udp_fragment" :id="'udp-frag-' + index">
                <label class="form-check-label" :for="'udp-frag-' + index">UDP Fragment</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="btn btn-success btn-sm" @click="addInbound">+ Add Inbound</button>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'InboundsConfig',
  props: {
    inbounds: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localInbounds = reactive([...props.inbounds])

    watch(localInbounds, (newVal) => {
      emit('update', [...newVal])
    }, { deep: true })

    const addInbound = () => {
      localInbounds.push({
        type: 'mixed',
        tag: 'mixed-in',
        listen: '127.0.0.1',
        listen_port: 1080,
        sniff: true,
        sniff_override_destination: false,
        tcp_fast_open: false,
        udp_fragment: false,
        domain_strategy: 'ipv4_only'
      })
    }

    const removeInbound = (index) => {
      localInbounds.splice(index, 1)
    }

    return {
      localInbounds,
      addInbound,
      removeInbound
    }
  }
}
</script>