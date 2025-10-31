<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-xl font-semibold">Log Configuration</h2>
    </div>
    <div class="card-body">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="form-label">Log Level</label>
          <select v-model="localLog.level" class="form-select">
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="fatal">Fatal</option>
            <option value="panic">Panic</option>
          </select>
          <p class="mt-2 text-sm text-gray-500">
            <strong>Debug:</strong> максимальная детализация для отладки<br>
            <strong>Info:</strong> стандартный уровень логирования<br>
            <strong>Error:</strong> только ошибки
          </p>
        </div>
        <div>
          <label class="form-label">Output (optional)</label>
          <input
            type="text"
            v-model="localLog.output"
            class="form-input"
            placeholder="/var/log/sing-box.log"
          />
          <p class="mt-2 text-sm text-gray-500">
            Путь к файлу логов. Оставьте пустым для вывода в stdout
          </p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            v-model="localLog.timestamp"
            id="logTimestamp"
            class="form-checkbox"
          />
          <label for="logTimestamp" class="ml-2 text-sm text-gray-700">Include Timestamp</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'LogConfig',
  props: {
    log: {
      type: Object,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localLog = reactive({ ...props.log })

    watch(localLog, (newVal) => {
      emit('update', { ...newVal })
    }, { deep: true })

    return {
      localLog
    }
  }
}
</script>