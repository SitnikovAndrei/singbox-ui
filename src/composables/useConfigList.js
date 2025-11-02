import { ref, computed } from 'vue'
import { createNewItem } from '../services/ConfigNormalizer'

/**
 * Composable для управления списком элементов конфигурации
 */
export function useConfigList(initialItems = []) {
  const items = ref([...initialItems])
  
  const activeItems = computed(() => 
    items.value.filter(item => !item._disabled)
  )
  
  const disabledItems = computed(() => 
    items.value.filter(item => item._disabled)
  )
  
  function addItem(newItem) {
    const item = createNewItem(newItem)
    items.value.push(item)
    return item
  }
  
  function updateItem(id, updates) {
    const index = items.value.findIndex(item => item._id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }
  }
  
  function deleteItem(id) {
    const index = items.value.findIndex(item => item._id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }
  
  function toggleDisable(id) {
    const index = items.value.findIndex(item => item._id === id)
    
    if (index !== -1) {
      // Создаем полностью новый массив для гарантированной реактивности
      const newItems = [...items.value]
      newItems[index] = {
        ...newItems[index],
        _disabled: !newItems[index]._disabled
      }
      items.value = newItems
    }
  }
  
  function moveItem(id, direction) {
    const index = items.value.findIndex(item => item._id === id)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.value.length) return
    
    const temp = items.value[index]
    items.value[index] = items.value[newIndex]
    items.value[newIndex] = temp
  }
  
  function getItemById(id) {
    return items.value.find(item => item._id === id)
  }
  
  return {
    items,
    activeItems,
    disabledItems,
    addItem,
    updateItem,
    deleteItem,
    toggleDisable,
    moveItem,
    getItemById
  }
}