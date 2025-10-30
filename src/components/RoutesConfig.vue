<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Route Configuration</h5>

      <div class="row mb-3">
        <div class="col-md-6">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="localRoute.auto_detect_interface" id="autoDetect">
            <label class="form-check-label" for="autoDetect">Auto Detect Interface</label>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Final Outbound</label>
          <input type="text" class="form-control" v-model="localRoute.final" placeholder="direct">
        </div>
      </div>

      <h6 class="mt-4">Rule Sets</h6>
      <div v-for="(ruleSet, index) in localRoute.rule_set" :key="index" class="card mb-2">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label">Tag</label>
              <input type="text" class="form-control" v-model="ruleSet.tag" placeholder="openai">
            </div>
            <div class="col-md-3">
              <label class="form-label">Type</label>
              <select class="form-select" v-model="ruleSet.type">
                <option value="remote">Remote</option>
                <option value="local">Local</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Format</label>
              <select class="form-select" v-model="ruleSet.format">
                <option value="binary">Binary</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-danger btn-sm w-100" @click="removeRuleSet(index)">Remove</button>
            </div>
          </div>
          <div class="row g-2 mt-2" v-if="ruleSet.type === 'remote'">
            <div class="col-md-12">
              <label class="form-label">URL</label>
              <input type="text" class="form-control" v-model="ruleSet.url" placeholder="https://...">
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-success btn-sm" @click="addRuleSet">+ Add Rule Set</button>

      <h6 class="mt-4">Routing Rules</h6>
      <div v-for="(rule, index) in localRoute.rules" :key="index" class="card mb-2">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label">Outbound</label>
              <input type="text" class="form-control" v-model="rule.outbound" placeholder="direct">
            </div>
            <div class="col-md-4">
              <label class="form-label">Rule Set</label>
              <input type="text" class="form-control" v-model="rule.rule_set" placeholder="openai">
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-danger btn-sm w-100" @click="removeRule(index)">Remove</button>
            </div>
          </div>
          
          <!-- Domain Suffix -->
          <div class="mt-2" v-if="rule.domain_suffix">
            <label class="form-label">Domain Suffixes</label>
            <div v-for="(domain, dIndex) in rule.domain_suffix" :key="dIndex" class="input-group mb-1">
              <input type="text" class="form-control form-control-sm" v-model="rule.domain_suffix[dIndex]" placeholder="example.com">
              <button class="btn btn-outline-danger btn-sm" @click="removeDomain(rule, dIndex)">×</button>
            </div>
            <button class="btn btn-outline-success btn-sm" @click="addDomain(rule)">+ Add Domain</button>
          </div>

          <!-- Source IP CIDR -->
          <div class="mt-2" v-if="rule.source_ip_cidr">
            <label class="form-label">Source IP CIDR</label>
            <div v-for="(ip, ipIndex) in rule.source_ip_cidr" :key="ipIndex" class="input-group mb-1">
              <input type="text" class="form-control form-control-sm" v-model="rule.source_ip_cidr[ipIndex]" placeholder="192.168.1.0/24">
              <button class="btn btn-outline-danger btn-sm" @click="removeSourceIp(rule, ipIndex)">×</button>
            </div>
            <button class="btn btn-outline-success btn-sm" @click="addSourceIp(rule)">+ Add IP</button>
          </div>

          <!-- IP CIDR -->
          <div class="mt-2" v-if="rule.ip_cidr">
            <label class="form-label">IP CIDR</label>
            <div v-for="(ip, ipIndex) in rule.ip_cidr" :key="ipIndex" class="input-group mb-1">
              <input type="text" class="form-control form-control-sm" v-model="rule.ip_cidr[ipIndex]" placeholder="160.79.104.0/23">
              <button class="btn btn-outline-danger btn-sm" @click="removeIpCidr(rule, ipIndex)">×</button>
            </div>
            <button class="btn btn-outline-success btn-sm" @click="addIpCidr(rule)">+ Add IP CIDR</button>
          </div>

          <div class="mt-2">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-primary" @click="toggleRuleField(rule, 'domain_suffix')">
                {{ rule.domain_suffix ? '✓' : '+' }} Domains
              </button>
              <button class="btn btn-outline-primary" @click="toggleRuleField(rule, 'source_ip_cidr')">
                {{ rule.source_ip_cidr ? '✓' : '+' }} Source IPs
              </button>
              <button class="btn btn-outline-primary" @click="toggleRuleField(rule, 'ip_cidr')">
                {{ rule.ip_cidr ? '✓' : '+' }} IP CIDRs
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-success btn-sm" @click="addRule">+ Add Rule</button>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'RoutesConfig',
  props: {
    route: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localRoute = reactive({ ...props.route })

    watch(localRoute, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    const addRuleSet = () => {
      if (!localRoute.rule_set) {
        localRoute.rule_set = []
      }
      localRoute.rule_set.push({
        tag: '',
        type: 'remote',
        format: 'binary',
        url: ''
      })
    }

    const removeRuleSet = (index) => {
      localRoute.rule_set.splice(index, 1)
    }

    const addRule = () => {
      if (!localRoute.rules) {
        localRoute.rules = []
      }
      localRoute.rules.push({
        outbound: '',
        rule_set: ''
      })
    }

    const removeRule = (index) => {
      localRoute.rules.splice(index, 1)
    }

    const toggleRuleField = (rule, field) => {
      if (rule[field]) {
        delete rule[field]
      } else {
        rule[field] = []
      }
    }

    const addDomain = (rule) => {
      if (!rule.domain_suffix) rule.domain_suffix = []
      rule.domain_suffix.push('')
    }

    const removeDomain = (rule, index) => {
      rule.domain_suffix.splice(index, 1)
      if (rule.domain_suffix.length === 0) {
        delete rule.domain_suffix
      }
    }

    const addSourceIp = (rule) => {
      if (!rule.source_ip_cidr) rule.source_ip_cidr = []
      rule.source_ip_cidr.push('')
    }

    const removeSourceIp = (rule, index) => {
      rule.source_ip_cidr.splice(index, 1)
      if (rule.source_ip_cidr.length === 0) {
        delete rule.source_ip_cidr
      }
    }

    const addIpCidr = (rule) => {
      if (!rule.ip_cidr) rule.ip_cidr = []
      rule.ip_cidr.push('')
    }

    const removeIpCidr = (rule, index) => {
      rule.ip_cidr.splice(index, 1)
      if (rule.ip_cidr.length === 0) {
        delete rule.ip_cidr
      }
    }

    return {
      localRoute,
      addRuleSet,
      removeRuleSet,
      addRule,
      removeRule,
      toggleRuleField,
      addDomain,
      removeDomain,
      addSourceIp,
      removeSourceIp,
      addIpCidr,
      removeIpCidr
    }
  }
}
</script>