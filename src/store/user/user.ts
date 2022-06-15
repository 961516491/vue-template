import { defineStore } from 'pinia'
import { login } from '@/api/login'

import type { LoginForm } from '#/user'

import { getToken, setToken} from '@/utils/auth'

export const useUserStore = defineStore({
  id: 'user', // id必填，且需要唯一
  state: () => {
    return {
      token: getToken()
    }
  },
  actions: {
    Login(user: LoginForm) {
      return new Promise((resolve, reject) => {
        login(user).then(res => {
          // @ts-ignore
          this.token = res.token || ''
          setToken(this.token)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
})
