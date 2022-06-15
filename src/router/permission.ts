/**路由守卫配置 */
import router from ".";
import { getToken } from '@/utils/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList: Array<string> = ['/login']

/**启动路由守卫 */
router.beforeEach((to, from, next) => {
  NProgress.start()
  /**判断是否存在token */
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {

    }
  } else {
    /**判断当前路由是否存在白名单内 */
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      /**否则全部重定向到登录页 */
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach((to, form, next) => {
  NProgress.done()
})
