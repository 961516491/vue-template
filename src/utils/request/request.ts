import Axios from "@/utils/request";
import type { RequestConfig } from '#/axios'

interface SeedRequestConfig<T> extends RequestConfig {
  data?: T
}

interface SeedResponse<T> {
  code: number
  message: string
  data: T
}

const request = <D, T = any>(config: SeedRequestConfig<D>) => {
  const axios = new Axios(config)
  const { method = 'GET' } = config
  if (method === 'get' || method === 'GET') {
    config.params = config.data
  }
  return axios.request<SeedResponse<T>>(config)
}
export default request
