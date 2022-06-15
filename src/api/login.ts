import request from "@/utils/request/request";
import type { LoginForm } from '#/user'

export function getCodeImg() {
  return request({
    url: '/captcha'
  })
}

export function login(data: LoginForm) {
  return request({
    url: '/seed/sys/sign',
    method: 'post',
    data
  })
}
