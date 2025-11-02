import { ref } from 'vue'

/**
 * Composable для управления состоянием модального окна
 */
export function useModal() {
  const isOpen = ref(false)
  const currentItem = ref(null)
  const mode = ref('create') // 'create' | 'edit'
  
  function openModal(item = null) {
    if (item) {
      mode.value = 'edit'
      currentItem.value = { ...item }
    } else {
      mode.value = 'create'
      currentItem.value = null
    }
    isOpen.value = true
  }
  
  function closeModal() {
    isOpen.value = false
    currentItem.value = null
  }
  
  return {
    isOpen,
    currentItem,
    mode,
    openModal,
    closeModal
  }
}