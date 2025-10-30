<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">DNS Configuration</h5>
      
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="localDns.disable_cache" id="disableCache">
            <label class="form-check-label" for="disableCache">Disable Cache</label>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="localDns.disable_expire" id="disableExpire">
            <label class="form-check-label" for="disableExpire">Disable Expire</label>
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Strategy</label>
          <select class="form-select" v-model="localDns.strategy">
            <option value="prefer_ipv4">Prefer IPv4</option>
            <option value="prefer_ipv6">Prefer IPv6</option>
            <option value="ipv4_only">IPv4 Only</option>
            <option value="ipv6_only">IPv6 Only</option>
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Final DNS</label>
        <input type="text" class="form-control" v-model="localDns.final">
      </div>

      <h6 class="mt-4">DNS Servers</h6>
      <div v-for="(server, index) in localDns.servers" :key="index" class="card mb-2">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label">Address</label>
              <input type="text" class="form-control" v-model="server.address" placeholder="tls://8.8.8.8">
            </div>
            <div class="col-md-3">
              <label class="form-label">Tag</label>
              <input type="text" class="form-control" v-model="server.tag" placeholder="google">
            </div>
            <div class="col-md-3">
              <label class="form-label">Detour</label>
              <input type="text" class="form-control" v-model="server.detour" placeholder="direct">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-danger btn-sm w-100" @click="removeServer(index)">Remove</button>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-success btn-sm" @click="addServer">+ Add DNS Server</button>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'DnsConfig',
  props: {
    dns: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localDns = reactive({ ...props.dns })

    watch(localDns, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    const addServer = () => {
      if (!localDns.servers) {
        localDns.servers = []
      }
      localDns.servers.push({
        address: '',
        tag: '',
        detour: 'direct'
      })
    }

    const removeServer = (index) => {
      localDns.servers.splice(index, 1)
    }

    return {
      localDns,
      addServer,
      removeServer
    }
  }
}
</script>