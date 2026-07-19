<script setup lang="ts">
import { computed } from 'vue'

const dark = defineModel<boolean>({ default: false })

const toggle = () => {
  dark.value = !dark.value
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle()
  }
}

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'
const DUR = '0.55s'

const trackBg = computed(() =>
  dark.value
    ? 'linear-gradient(160deg, #1a2242 0%, #0c1120 100%)'
    : 'linear-gradient(160deg, #8ecdf7 0%, #4fa3e3 100%)'
)

const trackStyle = computed(() => ({
  position: 'relative' as const,
  width: '136px',
  height: '68px',
  borderRadius: '34px',
  background: trackBg.value,
  boxShadow: dark.value
    ? 'inset 0 2px 6px rgba(0,0,0,0.5), 0 4px 14px rgba(10,14,30,0.35)'
    : 'inset 0 2px 4px rgba(30,90,150,0.2), 0 4px 14px rgba(70,150,220,0.35)',
  cursor: 'pointer',
  outline: 'none',
  transition: `background ${DUR} ${EASE}, box-shadow ${DUR} ${EASE}`,
  overflow: 'hidden',
  userSelect: 'none' as const,
}))

const TRACK_W = 136
const TRACK_H = 68
const KNOB = 38
const MARGIN = (TRACK_H - KNOB) / 2

const knobOuterStyle = computed(() => ({
  position: 'absolute' as const,
  top: MARGIN + 'px',
  left: (dark.value ? TRACK_W - KNOB - MARGIN : MARGIN) + 'px',
  width: KNOB + 'px',
  height: KNOB + 'px',
  transition: `left ${DUR} ${EASE}`,
}))

const faceStyle = computed(() => ({
  position: 'absolute' as const,
  inset: '0',
  borderRadius: '50%',
  overflow: 'hidden',
  background: dark.value ? '#f2ecdd' : '#ffd54f',
  boxShadow: dark.value
    ? 'inset -3px -3px 6px rgba(0,0,0,0.08)'
    : '0 0 12px 3px rgba(255,170,0,0.55)',
  transition: `background ${DUR} ${EASE}, box-shadow ${DUR} ${EASE}, transform ${DUR} ${EASE}`,
  transform: `rotate(${dark.value ? '0deg' : '-25deg'})`,
}))

const coverStyle = computed(() => ({
  position: 'absolute' as const,
  width: '27px',
  height: '27px',
  borderRadius: '50%',
  top: '-3px',
  right: '-3px',
  background: trackBg.value,
  transform: dark.value ? 'translate(5px, -2px)' : 'translate(26px, -23px)',
  transition: `transform ${DUR} ${EASE}, background ${DUR} ${EASE}`,
}))

const craterDefs = [
  { size: 6, top: 22, left: 9 },
  { size: 4.5, top: 10, left: 19 },
  { size: 3.5, top: 27, left: 23 },
]

const craters = computed(() =>
  craterDefs.map((c) => ({
    style: {
      position: 'absolute' as const,
      width: c.size + 'px',
      height: c.size + 'px',
      borderRadius: '50%',
      top: c.top + 'px',
      left: c.left + 'px',
      background: 'rgba(180,165,140,0.55)',
      opacity: dark.value ? 1 : 0,
      transition: `opacity ${DUR} ${EASE}`,
    },
  }))
)

const RAY_COUNT = 8
const rays = computed(() =>
  Array.from({ length: RAY_COUNT }).map((_, i) => {
    const angle = (360 / RAY_COUNT) * i
    return {
      outerStyle: {
        position: 'absolute' as const,
        inset: '0',
        transform: `rotate(${angle}deg)`,
      },
      style: {
        position: 'absolute' as const,
        top: '-12px',
        left: '50%',
        width: '4px',
        height: '11px',
        borderRadius: '2px',
        background: '#ffb300',
        boxShadow: '0 0 3px rgba(255,170,0,0.8)',
        transform: `translateX(-50%) scale(${dark.value ? 0.25 : 1})`,
        transformOrigin: '50% 100%',
        opacity: dark.value ? 0 : 1,
        transition: `opacity ${DUR} ${EASE}, transform ${DUR} ${EASE}`,
      },
    }
  })
)

const starDefs = [
  { x: 18, y: 12, size: 2.5, delay: '0s' },
  { x: 34, y: 30, size: 2, delay: '0.4s' },
  { x: 14, y: 42, size: 2, delay: '0.9s' },
  { x: 44, y: 46, size: 2.5, delay: '1.3s' },
  { x: 30, y: 16, size: 1.8, delay: '1.7s' },
  { x: 48, y: 20, size: 2, delay: '0.7s' },
]

const stars = computed(() =>
  starDefs.map((s) => ({
    style: {
      position: 'absolute' as const,
      top: s.y + 'px',
      left: s.x + 'px',
      width: s.size + 'px',
      height: s.size + 'px',
      borderRadius: '50%',
      background: '#fdf6e3',
      opacity: dark.value ? 1 : 0,
      transition: `opacity ${DUR} ${EASE} ${dark.value ? '0.15s' : '0s'}`,
      animation: dark.value ? `twinkle 2.4s ease-in-out ${s.delay} infinite` : 'none',
    },
  }))
)

const cloudDefs = [
  { top: 12, left: 68, scale: 0.62, dur: '7s', delay: '0s' },
  { top: 34, left: 92, scale: 0.46, dur: '5.5s', delay: '0.6s' },
  { top: 46, left: 62, scale: 0.36, dur: '6.5s', delay: '1.4s' },
]

const cloudParts = [
  { w: 30, h: 14, top: 8, left: 0, radius: '7px' },
  { w: 16, h: 16, top: 0, left: 3, radius: '50%' },
  { w: 18, h: 18, top: -4, left: 12, radius: '50%' },
  { w: 12, h: 12, top: 2, left: 22, radius: '50%' },
]

const clouds = computed(() =>
  cloudDefs.map((c, ci) => ({
    wrapStyle: {
      position: 'absolute' as const,
      top: c.top + 'px',
      left: c.left + 'px',
      width: '42px',
      height: '20px',
      transform: `scale(${c.scale})`,
      transformOrigin: 'left top',
      opacity: dark.value ? 0 : 0.95,
      transition: `opacity ${DUR} ${EASE}`,
    },
    driftStyle: {
      position: 'relative' as const,
      width: '100%',
      height: '100%',
      animation: dark.value
        ? 'none'
        : `driftCloud${ci % 2} ${c.dur} ease-in-out ${c.delay} infinite alternate`,
    },
    parts: cloudParts.map((p) => ({
      style: {
        position: 'absolute' as const,
        top: p.top + 'px',
        left: p.left + 'px',
        width: p.w + 'px',
        height: p.h + 'px',
        borderRadius: p.radius,
        background: 'rgba(255,255,255,0.92)',
      },
    })),
  }))
)

const ariaLabel = computed(() =>
  dark.value ? 'Switch to light theme' : 'Switch to dark theme'
)
</script>

<template>
  <div style="display:inline-flex; align-items:center; justify-content:center; padding:20px; background:transparent;">
    <div
      role="button"
      :aria-label="ariaLabel"
      tabindex="0"
      :style="trackStyle"
      @click="toggle"
      @keydown="onKeyDown"
    >
      <div v-for="(star, i) in stars" :key="'star-' + i" :style="star.style"></div>

      <div v-for="(cloud, ci) in clouds" :key="'cloud-' + ci" :style="cloud.wrapStyle">
        <div :style="cloud.driftStyle">
          <div v-for="(part, pi) in cloud.parts" :key="'part-' + pi" :style="part.style"></div>
        </div>
      </div>

      <div :style="knobOuterStyle">
        <div v-for="(ray, ri) in rays" :key="'ray-' + ri" :style="ray.outerStyle">
          <div :style="ray.style"></div>
        </div>

        <div :style="faceStyle">
          <div v-for="(crater, cri) in craters" :key="'crater-' + cri" :style="crater.style"></div>
          <div :style="coverStyle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes twinkle {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
@keyframes driftCloud0 {
  from { transform: translateX(-6px); }
  to { transform: translateX(6px); }
}
@keyframes driftCloud1 {
  from { transform: translateX(5px); }
  to { transform: translateX(-5px); }
}
</style>
