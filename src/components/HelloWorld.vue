<template>
  <h1>{{ msg }}</h1>
  <p>
    Recommended IDE setup:
    <a href="https://code.visualstudio.com/" target="_blank">VS Code</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>
  <p>See <code>README.md</code> for more information.</p>
  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Docs
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>
  <button type="button" @click="count++">count is: {{ count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
  <p @click="updateUser()">PIANA: {{user.name}}</p>
  <p>element-plus</p>
  <el-button type="primary">Click to upload</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
/**
 * 读取用户信息
 */
import { useUserStore } from '@/store/user/user'
const user = useUserStore()

/**修改用户信息 */
const updateUser = (): void => {
  user.updateName('孙悟空')
}

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
