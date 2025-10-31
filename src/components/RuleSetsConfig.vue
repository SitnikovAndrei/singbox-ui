<template>
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <h2 class="text-xl font-semibold">Rule Sets</h2>
      <button @click="addRuleSet" class="btn btn-success btn-sm">
        + Add Rule Set
      </button>
    </div>
    <div class="card-body">
      <div v-if="localRuleSets.length === 0" class="text-center py-12 text-gray-500">
        No rule sets configured. Click "+ Add Rule Set" to create one.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(ruleSet, index) in localRuleSets"
          :key="index"
          class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
        >
          <div class="flex items-start gap-4">
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">Tag</label>
                <input
                  type="text"
                  v-model="ruleSet.tag"
                  class="form-input"
                  placeholder="openai"
                />
              </div>
              <div>
                <label class="form-label">Type</label>
                <select v-model="ruleSet.type" class="form-select">
                  <option value="remote">Remote</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div>
                <label class="form-label">Format</label>
                <select v-model="ruleSet.format" class="form-select">
                  <option value="binary">Binary</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
            <button
              @click="removeRuleSet(index)"
              class="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remove"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <div v-if="ruleSet.type === 'remote'" class="mt-4">
            <label class="form-label">URL</label>
            <input
              type="text"
              v-model="ruleSet.url"
              class="form-input"
              placeholder="https://raw.githubusercontent.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'RuleSetsConfig',
  props: {
    ruleSets: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localRuleSets = reactive([...props.ruleSets])

    watch(localRuleSets, (newVal) => {
      emit('update', [...newVal])
    }, { deep: true })

    const addRuleSet = () => {
      localRuleSets.unshift({
        tag: '',
        type: 'remote',
        format: 'binary',
        url: ''
      })
    }

    const removeRuleSet = (index) => {
      localRuleSets.splice(index, 1)
    }

    return {
      localRuleSets,
      addRuleSet,
      removeRuleSet
    }
  }
}
</script>