<template>
  <div class="loginForm">
    <canvas class="wave"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'

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
  onMounted(() => {
    wave = new Wave()
    debugger
  })
  onUnmounted(() => {
    // window.cancelAnimationTimeout()
  })

</script>

<style lang="scss">
  .loginForm {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30vw;
    height: 50vh;
    box-shadow: 0 2px 30px rgb(0 0 0 / 20%);
    border-radius: 5px;
    .wave {
      width: 100%;
      height: 20vh;
    }
  }
</style>
