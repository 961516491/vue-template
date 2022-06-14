import request from "@/utils/request/request";

export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}
