<script setup lang="ts">
import Sence from './components/sence.vue'
import Nav from './components/nav.vue'
import TabDemo from './components/TabDemo.vue'
import { provide, ref, watch } from 'vue'

const handlerList = ref<Array<(e: any) => void>>([])

const addHandler = (handler: (e: any) => void) => {
  handlerList.value.push(handler)
}

provide('addHandler', addHandler)

const onMessage = (e: any) => {
  handlerList.value.forEach((handler) => {
    handler(e)
  })
}

provide('onMessage', onMessage)

const shareData = ref<Record<string, any>>({
  viewerReady: false,
})

provide('setShareData', (key: string, value: any) => {
  shareData.value[key] = value
})

provide('getShareData', (key: string) => {
  return shareData.value[key]
})

provide('subShareData', (key: string, callback: (key: string, value: any) => void) => {
  return watch(
    () => shareData.value[key],
    (newVal, oldVal) => {
      console.log('shareData changed:', oldVal, '=>', newVal)
      callback(key, newVal)
    }
  )
})

</script>

<template>
  <div class="main">
    <Sence />
    <TabDemo />
  </div>
</template>

<style scoped>
.main {
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
}
</style>
