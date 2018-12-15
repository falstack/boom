import './style.css'
import './tween.js'

const DEG = Math.PI / 180
const POWER = 10 // 力量单位比例 单位。 1:10
const G = 5 // 重力加速度
const DURATION = 400 //动画执行时长
const ANIMATE = Math.tween.Quad

export default class {
  parent = null
  canvas = null
  isMoveUp = false
  startTime = 0
  delay = 0
  targetZ = 0
  targetY = 0
  targetX = 0
  scaleNum = 1
  animating = false
  animateEndCallbackList = []

  constructor() {
    this.canvas = document.createElement('div')
    this.canvas.classList.add('particle-canvas')
  }

  /**
   * 设置画布的渲染位置和内容
   * @param container 画布的父节点
   * @param particle 画布的粒子
   */
  render({ container, particle }) {
    container.appendChild(this.canvas)
    this.parent = container
    this.canvas.innerHTML = ''
    this.canvas.appendChild(particle)
  }

  /**
   * 计算执行动画的参数
   * @param deg 初始角度
   * @param pow 初始力值
   * @param delay 延迟
   */
  animate({ deg, pow, delay } = {}) {
    /**
     * 【力与加速度公式】F = ma
     * 【匀变速位移公式】x = Vot + (0.5 * a * t * t)
     *  当 m（质量）、Vo（初始速度）、t（时间）相同时，F（力）与 x（位移）成正比
     *  根据【力的三角形法则】，可以根据传入的 pow 得出最终粒子的运行终点：targetX、targetY
     *  规定 pow = 1 === 10vh；pow：[1, 10]
     *  -----
     *  规定以笛卡尔坐标系 X 轴正方向为 0°（deg），从 0°开始顺时针方向增加角度
     *  则 deg =< 180 为向下运动， deg > 180 为向上运动；deg：[0, 360]
     */
    const seed = Math.random()
    this.isMoveUp = deg > 180
    this.delay = delay || 0
    this.targetZ = Math.round(pow * pow) * (seed < 0.5 ? -1 : 1)
    this.targetY = Math.round(pow * Math.sin(deg * DEG) * POWER)
    this.targetX = Math.round(pow * Math.cos(deg * DEG) * POWER) * (seed + 1)
    this.scaleNum = seed * 0.8 * (seed < 0.5 ? -1 : 1) // 缩放值变化范围（-0.8 ～ 0.8）
    this.raf()
  }

  /**
   * 通过 requestAnimationFrame 执行动画
   * will-change：https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change
   */
  raf() {
    this.animating = true
    this.startTime = Date.now()
    const startTimeAfterDelay = this.startTime + this.delay

    const animate = () => {
      const timeGap = Date.now() - startTimeAfterDelay
      if (timeGap >= 0) {
        if (timeGap > DURATION) {
          this.runAnimateEndCallback()
          return
        }
        this.canvas.style.cssText += `;will-change:transform;-webkit-transform:translate3d(${this.moveX(
          timeGap
        )}vh,${this.moveY(timeGap)}vh,0) scale(${this.scale(
          timeGap
        )});opacity:${this.opacity(timeGap)};`
      }
      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 设置画布的动画执行完后的回调函数
   * @param callback
   */
  onAnimationEnd(callback) {
    if (typeof callback !== 'function') {
      return
    }
    this.animateEndCallbackList.push(callback)
  }

  /**
   * 执行画布动画结束后的回调
   */
  runAnimateEndCallback() {
    this.canvas.style.cssText += `;-webkit-transform:translate3d(0,0,0);opacity:1;`
    this.animating = false
    try {
      for (const callback of this.animateEndCallbackList) {
        callback()
      }
    } catch (error) {
      console.warn('particle-canvas callback error:', error)
    }
  }

  /**
   * 将画布从父节点移除，但留在内存中，下次复用
   */
  unbind() {
    this.parent.removeChild(this.canvas)
  }

  /**
   * X轴位移
   * @param delta
   * @returns {number}
   */
  moveX(delta) {
    return Math.tween.Linear(delta, 0, this.targetX, DURATION) * 2
  }

  /**
   * Y轴位移
   * @param delta
   * @returns {*}
   */
  moveY(delta) {
    if (this.isMoveUp) {
      // 如果是上抛运动
      if (delta < DURATION / 2) {
        // 上抛过程
        return ANIMATE.easeOut(delta, 0, this.targetY + G, DURATION / 2)
      }
      // 下降过程
      return (
        this.targetY +
        G -
        ANIMATE.easeIn(delta - DURATION / 2, 0, this.targetY / 2, DURATION / 2)
      )
    }
    return ANIMATE.easeIn(delta, 0, this.targetY, DURATION)
  }

  /**
   * Z轴位移
   * @param delta
   * @returns {*}
   */
  moveZ(delta) {
    return ANIMATE.easeIn(delta, 0, this.targetZ, DURATION)
  }

  /**
   * 伸缩
   * @param delta
   * @returns {*}
   */
  scale(delta) {
    return ANIMATE.easeOut(delta, 1, this.scaleNum, DURATION)
  }

  /**
   * 透明度
   * @param delta
   * @returns {*}
   */
  opacity(delta) {
    return ANIMATE.easeIn(delta, 1, -1, DURATION)
  }
}
