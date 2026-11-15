'use client'

import { useEffect, useRef } from 'react'

function between(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const sketches = [
  // Cup: rim, body, handle, inner rim, and steam.
  [
    'M116 104 C119 91 149 87 178 88 C207 88 235 93 238 104 C240 116 212 122 177 121 C143 121 115 115 116 104',
    'M117 107 C121 129 125 154 137 170 C151 184 205 184 219 170 C230 153 234 128 238 106',
    'M235 119 C258 109 272 118 270 132 C269 146 251 155 226 155',
    'M131 106 C152 99 201 98 224 106',
    'M162 72 C148 63 169 58 160 48',
    'M190 71 C177 62 199 55 190 42',
  ],
  // Leaf: midrib, two edges, and alternating veins.
  [
    'M119 184 C143 164 173 132 195 106 C218 79 237 68 259 53',
    'M137 166 C115 111 164 61 259 53',
    'M259 53 C257 98 236 147 198 163 C177 172 156 170 137 166',
    'M153 151 C146 134 146 120 154 106',
    'M173 130 C192 132 207 127 221 118',
    'M192 110 C188 99 191 86 196 78',
    'M211 88 C225 90 238 82 245 76',
  ],
  // Paper plane: silhouette, folds, and a loose flight trail.
  [
    'M100 108 L278 60 L229 159 L179 133 L100 108',
    'M179 133 L278 60 L155 124',
    'M155 124 L153 162 L179 133',
    'M153 162 L191 139',
    'M142 168 C129 177 117 181 104 179',
    'M92 176 C85 173 81 168 80 162',
  ],
  // Kite: sail, spars, and a ribbon tail.
  [
    'M191 48 Q207 72 250 100 Q215 122 183 153 Q161 115 135 101 Q170 78 191 48',
    'M191 48 Q184 97 183 153',
    'M135 101 Q191 88 250 100',
    'M183 153 C205 171 163 177 178 197 C185 205 194 205 194 216',
    'M191 169 l-13 -4 l3 10',
    'M174 190 l-11 2 l9 5',
  ],
  // Sailboat: mast, sails, hull, and water.
  [
    'M183 65 L182 151',
    'M178 74 Q150 116 131 136 L177 135',
    'M190 91 Q210 118 231 136 L190 136',
    'M123 150 Q185 157 245 147 Q232 170 218 176 L151 176 Q135 167 123 150',
    'M109 187 Q129 183 150 188 T191 188 T230 187 T262 187',
    'M140 199 Q158 195 181 199 M210 199 Q229 196 247 199',
  ],
  // Fish: body and tail, eye, fins, and bubbles.
  [
    'M251 116 C230 82 180 84 151 109 L119 92 Q127 117 119 139 L151 124 C183 151 227 146 251 116',
    'M225 101 Q215 117 226 132',
    'M236 111 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    'M175 98 Q184 77 205 89 M180 140 Q190 157 207 141',
    'M269 105 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0',
    'M279 87 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0',
  ],
  // Umbrella: canopy, ribs, handle, and rain.
  [
    'M116 119 Q137 67 188 64 Q237 67 260 119 Q236 104 213 119 Q187 104 165 119 Q139 104 116 119',
    'M165 119 Q172 81 188 64 Q206 84 213 119',
    'M188 58 L188 64 M188 113 L188 175 Q187 193 174 192 Q161 191 161 179',
    'M112 77 l-8 12 M255 67 l-7 11',
    'M275 98 l-8 12 M130 56 l-7 11',
    'M131 147 l-7 10 M236 143 l-8 12',
  ],
  // Cat: round cheeks, soft ears, smiling eyes, and a curled tail.
  [
    'M128 111 Q123 94 130 72 Q133 63 140 69 L157 84 Q173 79 190 84 L207 69 Q214 64 217 74 Q224 95 218 111 C229 137 206 152 173 152 C140 152 117 137 128 111',
    'M147 148 Q136 157 135 173 C133 185 145 192 157 189 Q173 193 187 189 C201 193 212 185 211 174 Q210 157 199 148',
    'M143 116 q7 -9 14 0 M189 116 q7 -9 14 0',
    'M169 122 q4 -3 8 0 l-4 4 Z M173 126 q-5 8 -12 3 M173 126 q5 8 12 3',
    'M142 126 l-17 -3 M142 132 l-16 3 M203 126 l17 -3 M203 132 l16 3 M153 176 q-4 6 -2 12 M193 176 q4 6 2 12',
    'M210 177 C232 181 254 172 258 154 C261 142 250 137 245 145',
  ],
  // Dog: oversized floppy ears, a round nose, and a little tongue.
  [
    'M133 108 C133 87 147 76 173 76 C200 76 215 90 215 112 C222 136 200 153 174 153 C145 153 126 137 133 108',
    'M137 90 C123 85 109 102 107 122 C105 135 113 141 122 134 Q133 127 138 106 M207 89 C222 84 237 102 240 122 C242 135 233 141 224 134 Q213 126 209 106',
    'M149 148 Q137 158 138 176 C139 188 149 194 161 190 Q174 194 190 190 C203 194 215 185 213 175 Q211 158 199 148',
    'M148 113 q5 -7 11 0 M188 113 q5 -7 11 0 M165 121 C165 116 182 116 182 121 Q181 127 174 127 Q166 127 165 121 Z M174 127 q-5 8 -12 4 M174 127 q5 8 12 4 M168 134 C168 145 181 145 181 134',
    'M155 177 q-4 6 -2 12 M195 177 q4 6 2 12 M142 125 l4 2 M202 127 l4 -2',
    'M212 175 C231 173 241 161 245 149 Q249 142 255 149 C263 164 241 186 214 184',
  ],
]

// Color regions sit beneath the ink strokes. Colors are ordered spring, summer, autumn, winter.
const shanghaiMonth = new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'Asia/Shanghai' })

const sketchFills = [
  [
    {
      colors: ['#8b9e76', '#668d90', '#b57557', '#788c9f'],
      path: 'M235 119 C258 109 272 118 270 132 C269 146 251 155 226 155 L230 146 C248 146 262 139 262 131 C262 124 251 121 233 128 Z',
    },
    {
      colors: ['#b0bc8b', '#82aa9b', '#c48662', '#a6b8c8'],
      path: 'M117 107 C121 129 125 154 137 170 C151 184 205 184 219 170 C230 153 234 128 238 106 C232 117 207 122 177 121 C143 121 121 116 117 107 Z',
    },
    { colors: ['#d2c2a5', '#b1bfb1', '#bca79b', '#ccd8df'], path: sketches[0][0] },
    {
      colors: ['#926546', '#926546', '#926546', '#926546'],
      path: 'M131 106 C152 99 201 98 224 106 C216 112 198 116 177 115 C154 115 137 112 131 106 Z',
    },
  ],
  [
    {
      colors: ['#7ba881', '#589783', '#b88959', '#749b9b'],
      path: 'M137 166 C115 111 164 61 259 53 C237 68 218 79 195 106 C173 132 152 153 137 166 Z',
    },
    {
      colors: ['#a7b873', '#82ac71', '#cdaa6e', '#aabcc0'],
      path: 'M137 166 C152 153 173 132 195 106 C218 79 237 68 259 53 C257 98 236 147 198 163 C177 172 156 170 137 166 Z',
    },
  ],
  [
    { colors: ['#c5b5d5', '#96bcd4', '#c8a580', '#a4b8ce'], path: 'M100 108 L278 60 L155 124 Z' },
    {
      colors: ['#998ab9', '#7290bd', '#a37e69', '#6d86ac'],
      path: 'M155 124 L278 60 L179 133 L153 162 Z',
    },
    { colors: ['#b494b1', '#a3a4c8', '#b89480', '#95a6bf'], path: 'M153 162 L179 133 L191 139 Z' },
    { colors: ['#ead8df', '#becedb', '#e3c6a2', '#d9e2ed'], path: 'M179 133 L278 60 L229 159 Z' },
  ],
  [
    {
      colors: ['#ce8c91', '#d3a96c', '#cda46a', '#a5b5d6'],
      path: 'M191 48 Q170 78 135 101 Q161 115 183 153 Q184 97 191 48 Z',
    },
    {
      colors: ['#9e9ac2', '#6f9f98', '#b37f6d', '#7d8eb0'],
      path: 'M191 48 Q207 72 250 100 Q215 122 183 153 Q184 97 191 48 Z',
    },
    {
      colors: ['#ad82a6', '#83a4be', '#a597b9', '#b0a8c6'],
      path: 'M191 169 l-13 -4 l3 10 Z M174 190 l-11 2 l9 5 Z',
    },
  ],
  [
    {
      colors: ['#c39aa6', '#94b7c8', '#d2ac7e', '#c7d5e5'],
      path: 'M178 74 Q150 116 131 136 L177 135 Z',
    },
    {
      colors: ['#d6c294', '#cba66c', '#9d826d', '#a4adcb'],
      path: 'M190 91 Q210 118 231 136 L190 136 Z',
    },
    { colors: ['#7c9e90', '#628e9c', '#9f7970', '#6a8b9e'], path: sketches[4][3] },
  ],
  [
    {
      colors: ['#ae7997', '#7f8eb6', '#bc7c78', '#9387ad'],
      path: 'M175 98 Q184 77 205 89 Z M180 140 Q190 157 207 141 Z',
    },
    {
      colors: ['#c8a181', '#7a9eaa', '#c08c66', '#829ab7'],
      path: 'M151 109 L119 92 Q127 117 119 139 L151 124 Z',
    },
    {
      colors: ['#dbb89f', '#92b7af', '#dfa46c', '#b0c4d6'],
      path: 'M251 116 C230 82 180 84 151 109 L151 124 C183 151 227 146 251 116 Z',
    },
  ],
  [
    {
      colors: ['#829fbd', '#77a596', '#b19778', '#8fabc7'],
      path: 'M116 119 Q137 67 188 64 Q172 81 165 119 Q139 104 116 119 Z',
    },
    {
      colors: ['#b59bcc', '#dec18c', '#cca383', '#b7b8d1'],
      path: 'M188 64 Q206 84 213 119 Q187 104 165 119 Q172 81 188 64 Z',
    },
    {
      colors: ['#8b8bb9', '#65918d', '#a27b70', '#7789a9'],
      path: 'M188 64 Q237 67 260 119 Q236 104 213 119 Q206 84 188 64 Z',
    },
  ],
  [
    {
      colors: ['#c8ad90', '#d4bc8d', '#c3a174', '#a0a1ac'],
      path: `${sketches[7][0]} Z ${sketches[7][1]} Z`,
    },
    {
      colors: ['#cd8893', '#cb938e', '#b17e73', '#ae8299'],
      path: 'M133 92 Q132 78 137 75 L149 86 Z M197 86 L210 75 Q215 80 214 94 Z M169 122 q4 -3 8 0 l-4 4 Z',
    },
    {
      colors: ['#cb8990', '#d2a496', '#ca9282', '#c896a1'],
      path: 'M139 126 a7 3 0 1 0 14 0 a7 3 0 1 0 -14 0 Z M193 126 a7 3 0 1 0 14 0 a7 3 0 1 0 -14 0 Z',
    },
  ],
  [
    {
      colors: ['#c2b6a5', '#cbba90', '#c1a07e', '#b7b9c0'],
      path: `${sketches[8][0]} Z ${sketches[8][2]} Z`,
    },
    {
      colors: ['#8f7567', '#8c846c', '#976b56', '#7e6e62'],
      path: 'M137 90 C123 85 109 102 107 122 C105 135 113 141 122 134 Q133 127 138 106 Z M207 89 C222 84 237 102 240 122 C242 135 233 141 224 134 Q213 126 209 106 Z',
    },
    {
      colors: ['#c98892', '#c9939a', '#b87b88', '#b5869b'],
      path: 'M168 134 C168 145 181 145 181 134 Q175 137 168 134 Z',
    },
  ],
]

// Timings follow the sketches: cup, leaf, plane, kite, boat, fish, umbrella, cat, dog.
const motionTiming = [
  { rest: 380, duration: 1680, settle: 280 },
  { rest: 420, duration: 1650, settle: 430 },
  { rest: 230, duration: 1740, settle: 240 },
  { rest: 290, duration: 1840, settle: 400 },
  { rest: 340, duration: 2050, settle: 460 },
  { rest: 230, duration: 1630, settle: 340 },
  { rest: 320, duration: 1450, settle: 420 },
  { rest: 620, duration: 960, settle: 550 },
  { rest: 140, duration: 1350, settle: 550 },
]

function strokeKeyframes(path: SVGPathElement, length: number) {
  const intervals = 24
  const positions = Array.from({ length: intervals + 1 }, (_, index) =>
    path.getPointAtLength((index / intervals) * length),
  )
  const offsets = [0]
  let elapsed = 0

  for (let index = 1; index <= intervals; index++) {
    const previous = positions[Math.max(0, index - 2)]
    const point = positions[index - 1]
    const next = positions[index]
    const before = Math.atan2(point.y - previous.y, point.x - previous.x)
    const after = Math.atan2(next.y - point.y, next.x - point.x)
    const turn = index === 1 ? 0 : 1 - Math.cos(after - before)
    const progress = (index - 0.5) / intervals
    const edge = Math.pow(Math.abs(progress * 2 - 1), 4)

    elapsed += 1 + turn * 0.8 + edge * 0.9
    offsets.push(elapsed)
  }

  return offsets.map((offset, index) => ({
    offset: offset / elapsed,
    strokeDashoffset: `${length * (1 - index / intervals)}`,
  }))
}

export function HomeInk() {
  const ink = useRef<SVGGElement>(null)

  useEffect(() => {
    const group = ink.current
    if (!group) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setTimeout>
    let animation: Animation | undefined
    const objectAnimations: Animation[] = []

    function reset() {
      clearTimeout(timer)
      if (animation) {
        animation.onfinish = null
        animation.cancel()
        animation = undefined
      }
      objectAnimations.splice(0).forEach((effect) => effect.cancel())
      group?.replaceChildren()
    }

    let previousSketch = -1

    function drawRound() {
      const available = sketches
        .map((_, index) => index)
        .filter((index) => index !== previousSketch)
      const sketch = available[Math.floor(between(0, available.length))]
      const strokes = sketches[sketch]
      const month = Number(shanghaiMonth.format())
      const season = Math.floor(((month + 9) % 12) / 3)
      previousSketch = sketch
      const angle = between(-5, 5)
      group?.setAttribute('transform', `rotate(${angle} 190 120)`)

      const body = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      body.style.transformOrigin =
        sketch === 1 ? '119px 184px' : sketch === 3 ? '183px 153px' : '190px 116px'
      group?.append(body)

      const color = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      color.classList.add('home-index-ink-fill')
      for (const region of sketchFills[sketch]) {
        const patch = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        patch.setAttribute('d', region.path)
        patch.style.setProperty('--ink-fill', region.colors[season])
        color.append(patch)
      }
      body.append(color)

      const isCat = sketch === 7
      const isDog = sketch === 8
      const { rest, duration, settle } = motionTiming[sketch]

      function animateObject() {
        const animate = (target: Element, frames: Keyframe[], delay = 0) => {
          objectAnimations.push(target.animate(frames, { duration, delay, fill: 'forwards' }))
        }

        if (sketch === 0) {
          Array.from(body.children)
            .slice(-2)
            .forEach((steam, index) => {
              const drift = index === 0 ? -8 : 7
              animate(
                steam,
                [
                  { transform: 'translate(0, 0)', opacity: 0.42 },
                  { transform: `translate(${drift * 0.25}px, -8px)`, opacity: 0.33, offset: 0.42 },
                  { transform: `translate(${drift}px, -23px)`, opacity: 0 },
                ],
                index * 160,
              )
            })
        } else if (sketch === 1) {
          animate(body, [
            { transform: 'rotate(0deg)', easing: 'ease-out' },
            { transform: 'rotate(5deg)', offset: 0.36, easing: 'ease-in-out' },
            { transform: 'rotate(-1.5deg)', offset: 0.77, easing: 'ease-in-out' },
            { transform: 'rotate(0deg)' },
          ])
        } else if (sketch === 2) {
          animate(body, [
            { transform: 'translate(0, 0) rotate(0deg)', easing: 'ease-in' },
            { transform: 'translate(14px, -5px) rotate(-1deg)', offset: 0.38 },
            { transform: 'translate(48px, -22px) rotate(-3deg)', offset: 0.78 },
            { transform: 'translate(74px, -34px) rotate(-4deg)' },
          ])
        } else if (isCat || isDog) {
          const tail = body.lastElementChild
          if (tail) {
            const origin = isCat ? '210px 177px' : '213px 179px'
            const swings = isCat
              ? [
                  [0, 0],
                  [0.4, -7],
                  [0.68, 2],
                  [1, 0],
                ]
              : [
                  [0, 0],
                  [0.11, -13],
                  [0.25, 12],
                  [0.42, -9],
                  [0.63, 7],
                  [0.82, -3],
                  [1, 0],
                ]
            animate(
              tail,
              swings.map(([offset, angle]) => ({
                offset,
                transformOrigin: origin,
                transform: `rotate(${angle}deg)`,
                easing: 'ease-in-out',
              })),
            )
          }
        } else {
          const motions = [
            [
              'translateY(0) rotate(0deg)',
              'translateY(-6px) rotate(-4deg)',
              'translateY(-3px) rotate(1deg)',
              'translateY(0) rotate(0deg)',
            ],
            [
              'translateY(0) rotate(0deg)',
              'translateY(-2px) rotate(2deg)',
              'translateY(1px) rotate(-1deg)',
              'translateY(0) rotate(0deg)',
            ],
            [
              'translate(0, 0)',
              'translate(9px, -3px)',
              'translate(24px, 1px)',
              'translate(40px, -4px)',
            ],
            ['rotate(0deg)', 'rotate(-3deg)', 'rotate(2deg)', 'rotate(0deg)'],
          ]
          animate(
            body,
            motions[sketch - 3].map((transform, index) => ({
              transform,
              easing:
                sketch !== 5 ? 'ease-in-out' : ['ease-in', 'linear', 'ease-out', 'linear'][index],
            })),
          )
        }

        const current = objectAnimations[0]
        Promise.all(objectAnimations.map((effect) => effect.finished)).then(
          () => {
            if (!current || objectAnimations[0] !== current) return
            timer = setTimeout(() => {
              reset()
              timer = setTimeout(drawRound, between(380, 620))
            }, settle)
          },
          () => {
            // Reset cancels the motion when the page or motion preference changes.
          },
        )
      }

      function drawStroke(index: number) {
        if (!group) return

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        const detail = sketch >= 7 ? index === 3 || index === 4 : index >= strokes.length - 2
        path.setAttribute('d', strokes[index])
        path.style.strokeWidth = (detail ? between(0.8, 1.25) : between(1.25, 1.85)).toFixed(2)
        if (detail) path.style.opacity = '0.42'
        const scenery = (sketch === 2 || sketch === 4 || sketch === 5) && detail
        const layer = scenery || (sketch === 6 && index >= 3) ? group : body
        layer.append(path)

        if (motion.matches) {
          if (index + 1 < strokes.length) drawStroke(index + 1)
          else color.style.opacity = '1'
          return
        }

        const length = path.getTotalLength()
        path.style.strokeDasharray = `${length} ${length}`
        const strokeDuration = 390 + length * between(6.75, 10.5)
        const longOutline = !detail && length >= 160
        animation = path.animate(
          strokeKeyframes(path, length),
          longOutline ? strokeDuration * 0.85 : strokeDuration,
        )
        animation.onfinish = () => {
          if (index + 1 < strokes.length) {
            if (Math.random() < 0.3) {
              timer = setTimeout(() => drawStroke(index + 1), between(120, 360))
            } else {
              drawStroke(index + 1)
            }
          } else {
            animation = color.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 360,
              easing: 'ease-out',
            })
            animation.onfinish = () => {
              color.style.opacity = '1'
              timer = setTimeout(animateObject, rest)
            }
          }
        }
      }

      drawStroke(0)
    }

    function restart() {
      reset()
      drawRound()
    }

    restart()
    motion.addEventListener('change', restart)
    return () => {
      motion.removeEventListener('change', restart)
      reset()
    }
  }, [])

  return (
    <svg
      className="home-index-ink"
      viewBox="0 0 380 240"
      width="380"
      height="240"
      aria-hidden="true"
      focusable="false"
    >
      <g ref={ink} />
    </svg>
  )
}
