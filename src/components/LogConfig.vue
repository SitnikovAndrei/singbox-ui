<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Log Configuration</h5>
      
      <div class="row">
        <div class="col-md-6">
          <label class="form-label">Log Level</label>
          <select class="form-select" v-model="localLog.level">
            <option value="trace">Trace</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="fatal">Fatal</option>
            <option value="panic">Panic</option>
          </select>
          <div class="form-text">
            <strong>Debug</strong> - максимальная детализация для отладки<br>
            <strong>Info</strong> - стандартный уровень логирования<br>
            <strong>Error</strong> - только ошибки
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Output (optional)</label>
          <input type="text" class="form-control" v-model="localLog.output" placeholder="/var/log/sing-box.log">
          <div class="form-text">Путь к файлу логов. Оставьте пустым для вывода в stdout</div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-md-6">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="localLog.timestamp" id="logTimestamp">
            <label class="form-check-label" for="logTimestamp">Include Timestamp</label>
          </div>
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