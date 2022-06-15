<template>
  <div class="loginForm">
    <canvas class="wave"></canvas>
    <div class="photo">
      <img :src="photo" alt="">
    </div>
    <el-form ref="loginForm" :model="formData" :rules="rules">
      <el-form-item prop="username">
        <el-input v-model="formData.username" type="text" :prefix-icon="User" auto-complete="off" placeholder="账号" clearable></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          :prefix-icon="Key"
        ></el-input>
      </el-form-item>
      <el-form-item prop="code" style="margin-bottom: 3px;">
        <el-input v-model="formData.code" type="test" autocomplete="off" placeholder="验证码" style="width: 60%;"></el-input>
        <div class="code">
          <img :src="codeImg" alt="" @click="refreshCode()">
        </div>
      </el-form-item>
      <el-form-item  style="margin-bottom: 3px;">
        <el-checkbox v-model="remeber.username" label="记住账号" size="small" />
        <el-checkbox v-model="remeber.password" label="记住密码" size="small" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%;" :loading="loading" @click="submitForm(loginForm)">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watchEffect, onMounted, onUnmounted } from 'vue'
  import router from '@/router'
  import { User, Key } from '@element-plus/icons-vue'
  import { getCodeImg } from '@/api/login'
  import { useUserStore } from '@/store/user/user'

  import logo from '@/assets/logo.png'
  import { FormInstance ,FormRules } from 'element-plus/es'

  import type { LoginForm } from '#/user'

  const user = useUserStore()
  const loading = ref(false)

  const photo = logo
  const codeImg = ref('')
  /**记住账号/记住密码 */
  const remeber = reactive({
    username: false,
    password: false
  })
  watchEffect(() => {
    /**记住密码的同时也要记住账号 */
    if (remeber.password) {
      remeber.username = true
    }
  })

  let wave
  class Line {
    x: number
    y: number
    addedX: number
    addedY: number
    rad: number
    lightInputMultiplier
    color: string
    cumulativeTime: number
    time: number = 0
    targetTime: number = 0
    constructor(wave: Wave) {
      this.x = 0;
      this.y = 0;
      this.addedX = 0;
      this.addedY = 0;

      this.rad = 0;

      this.lightInputMultiplier = wave.opts.baseLightInputMultiplier + wave.opts.addedLightInputMultiplier * Math.random();

      this.color = wave.opts.color.replace( 'hue', (wave.tick * wave.opts.hueChange).toString() );
      this.cumulativeTime = 0;

      this.beginPhase(wave);
    }
    beginPhase(wave: Wave) {
      this.x += this.addedX;
      this.y += this.addedY;

      this.time = 0;
      this.targetTime = ( wave.opts.baseTime + wave.opts.addedTime * Math.random() ) |0;

      this.rad += wave.baseRad * ( Math.random() < .5 ? 1 : -1 );
      this.addedX = Math.cos( this.rad );
      this.addedY = Math.sin( this.rad );

      if( Math.random() < wave.opts.dieChance || this.x > wave.dieX || this.x < -wave.dieX || this.y > wave.dieY || this.y < -wave.dieY )
        this.reset(wave);
    }
    step(wave: Wave) {
      ++this.time;
      ++this.cumulativeTime;

      if( this.time >= this.targetTime )
        this.beginPhase(wave);

      let prop = this.time / this.targetTime,
      waves = Math.sin( prop * Math.PI / 2  ),
      x = this.addedX * waves,
      y = this.addedY * waves;

      wave.ctx.shadowBlur = prop * wave.opts.shadowToTimePropMult;
      wave.ctx.fillStyle = wave.ctx.shadowColor =
        this.color.replace( 'light', (wave.opts.baseLight + wave.opts.addedLight * Math.sin( this.cumulativeTime * this.lightInputMultiplier )).toString() );
      wave.ctx.fillRect( wave.opts.cx + ( this.x + x ) * wave.opts.len, wave.opts.cy + ( this.y + y ) * wave.opts.len, 2, 2 );

      if( Math.random() < wave.opts.sparkChance )
        wave.ctx.fillRect( wave.opts.cx + ( this.x + x )
          * wave.opts.len + Math.random()
          * wave.opts.sparkDist
          * ( Math.random() < .5 ? 1 : -1 ) - wave.opts.sparkSize / 2, wave.opts.cy + ( this.y + y )
          * wave.opts.len + Math.random() * wave.opts.sparkDist
          * ( Math.random() < .5 ? 1 : -1 ) - wave.opts.sparkSize / 2, wave.opts.sparkSize, wave.opts.sparkSize )
    }
    reset(wave: Wave) {
      this.x = 0;
      this.y = 0;
      this.addedX = 0;
      this.addedY = 0;

      this.rad = 0;

      this.lightInputMultiplier = wave.opts.baseLightInputMultiplier + wave.opts.addedLightInputMultiplier * Math.random();

      this.color = wave.opts.color.replace( 'hue', (wave.tick * wave.opts.hueChange).toString() );
      this.cumulativeTime = 0;

      this.beginPhase(wave);
    }
  }

  class Wave {
    dom: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    w: number
    h: number
    opts
    tick: number
    private lines: Array<Line>
    dieX: number
    dieY: number
    baseRad: number
    constructor() {
      this.dom = document.querySelector('.wave')!
      this.ctx = this.dom.getContext( '2d' )!,
      this.w = this.dom.width,
      this.h = this.dom.height,
      this.opts = {
        len: 20,
        count: 50,
        baseTime: 10,
        addedTime: 10,
        dieChance: .05,
        spawnChance: 1,
        sparkChance: .1,
        sparkDist: 10,
        sparkSize: 2,

        color: 'hsl(hue,100%,light%)',
        baseLight: 50,
        addedLight: 10, // [50-10,50+10]
        shadowToTimePropMult: 6,
        baseLightInputMultiplier: .01,
        addedLightInputMultiplier: .02,

        cx: this.w / 2,
        cy: this.h / 2,
        repaintAlpha: .04,
        hueChange: .1
      },
      this.tick = 0,
      this.lines = [],
      this.dieX = this.w / 2 / this.opts.len,
      this.dieY = this.h / 2 / this.opts.len,
      this.baseRad = Math.PI * 2 / 6

      this.ctx.fillStyle = 'black'
      this.ctx.fillRect( 0, 0, this.w, this.h )

      this.loop()
    }
    loop() {
      ++this.tick;

      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(0,0,0,alp)'.replace( 'alp', this.opts.repaintAlpha.toString() );
      this.ctx.fillRect( 0, 0, this.w, this.h );
      this.ctx.globalCompositeOperation = 'lighter';

      if( this.lines.length < this.opts.count && Math.random() < this.opts.spawnChance )
        this.lines.push(new Line(this));

      this.lines.map(( line: Line ) => {
        line.step(this);
      } );
      /**
       * 在class中使用requestAnimationFrame
       * 将this的指向用bind方法强制给指向到这个class
       */
      window.requestAnimationFrame(this.loop.bind(this))

    }
  }

  const loginForm = ref<FormInstance>()
  const formData: LoginForm = reactive({
    username: '',
    password: '',
    code: '',
    uuid: ''
  })
  /**表单校验规则 */
  const rules = reactive<FormRules>({
    username: [
      {required: true, message: '请填写账号', trigger: 'blur'}
    ],
    password: [
      {required: true, message: '请填写密码', trigger: 'blur'}
    ],
    code: [
      {required: true, message: '请填写验证码', trigger: 'blue'}
    ]
  })
  /**表单提交事件 */
  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        loading.value = true
        user.Login(formData).then(res => {
          loading.value = false
          router.push('/')
        })
      } else {

      }
    })
  }

  /**刷新验证码 */
  const refreshCode = () => {
    getCodeImg().then((res) => {
      // @ts-ignore
      codeImg.value = `data:image/gif;base64,${res.img}`
      // @ts-ignore
      formData.uuid = res.uuid
    })
  }

  onMounted(() => {
    wave = new Wave()
    getCodeImg().then((res) => {
      // @ts-ignore
      codeImg.value = `data:image/gif;base64,${res.img}`
      // @ts-ignore
      formData.uuid = res.uuid
    })
  })
  onUnmounted(() => {
    // window.cancelAnimationTimeout()
  })

</script>

<style lang="scss">
input {
    background-color:transparent;
}
  .loginForm {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30vw;
    height: 54vh;
    box-shadow: 0 2px 30px rgb(0 0 0 / 20%);
    border-radius: 5px;
    overflow: hidden;
    .wave {
      width: 100%;
      height: 18vh;
    }
    .photo {
      width: 6vw;
      height: 6vw;
      border-radius: 50%;
      box-shadow: 0 2px 30px rgb(0 0 0 / 20%);
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      padding: 2px;
      background-clip: content-box;
      background-color: white;
      overflow: hidden;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .ep-form {
      width: 75%;
      margin: 0 auto;
      margin-top: 10%;
      // .ep-form-item {
      //   margin-bottom: 10px;
      // }
      .code {
        flex-grow: 1;
        height: calc(var(--ep-input-height, 32px));
        img {
          height: 100%;
        }
      }
    }
  }
</style>
