import ParticleCanvas from './particle-canvas'

export default class {
  canvasList = []
  onceAnimationMaxCount = 6
  animationThrottle = 100 // 最多每 100 毫秒触发一次
  animationLastRunAt = 0
  particleList = []
  rotate = 120 // 默认旋转角度
  spread = 180 // 默认的粒子发散范围
  delayRange = 100 // 默认随机延迟范围
  power = 3 // 默认力度
  container = null

  constructor({
    particleList,
    container,
    createOnce,
    rotate,
    spread,
    delayRange,
    power
  } = {}) {
    this.particleList = particleList || []
    this.container = container || null
    this.onceAnimationMaxCount = createOnce || 6
    this.rotate = rotate || 120
    this.spread = spread || 180
    this.delayRange = delayRange || 100
    this.power = power || 3
    this.createParticleCanvas(this.onceAnimationMaxCount)
  }

  setContainer(DOM) {
    this.container = DOM
  }

  createParticleCanvas(num) {
    for (let i = 0; i < num; i++) {
      const particleCanvas = new ParticleCanvas()
      particleCanvas.onAnimationEnd(() => {
        particleCanvas.unbind()
      })
      this.canvasList.push(particleCanvas)
    }
  }

  boom() {
    const now = Date.now()
    if (now - this.animationLastRunAt < this.animationThrottle) {
      // 触发评率过高
      return
    }
    this.animationLastRunAt = now

    const unAnimatedCanvasList = this.canvasList.filter(_ => !_.animating)
    let animatingCount = 0

    for (const particleCanvas of unAnimatedCanvasList) {
      if (animatingCount >= this.onceAnimationMaxCount) {
        return
      }
      if (particleCanvas.animating) {
        continue
      }

      animatingCount++
      const seed = Math.random()

      particleCanvas.render({
        container: this.container,
        particle: this.getRandomParticle()
      })
      particleCanvas.animate({
        deg: (seed * this.spread + this.rotate) % 360,
        pow: seed * this.power + 1,
        delay: seed * this.delayRange
      })
    }

    if (animatingCount < this.onceAnimationMaxCount) {
      this.createParticleCanvas(this.onceAnimationMaxCount - animatingCount)
    }
  }

  getRandomParticle() {
    return this.particleList[
      parseInt(Math.random() * this.particleList.length)
    ].cloneNode(true)
  }
}
