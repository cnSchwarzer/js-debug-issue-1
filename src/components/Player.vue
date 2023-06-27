<script setup lang="ts">
import { ref } from 'vue' 

const count = ref(0)

setInterval(() => {
  count.value += 1
}, 2000)
</script>

<template>
  <div>
    Player {{count}}
  </div>
</template>

<style scoped> 
</style>
