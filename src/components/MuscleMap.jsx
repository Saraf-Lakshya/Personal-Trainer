// Front/back body SVG with highlighted muscle groups
// ViewBox: 0 0 150 178  (front body centered at x=35, back at x=115, offset=80)

const BODY_SHAPES = [
  { t: 'e', cx: 35, cy: 13, rx: 9, ry: 10 },
  { t: 'r', x: 31, y: 23, w: 8, h: 6, rx: 2 },
  { t: 'e', cx: 18, cy: 36, rx: 11, ry: 7 },
  { t: 'e', cx: 52, cy: 36, rx: 11, ry: 7 },
  { t: 'r', x: 23, y: 29, w: 24, h: 57, rx: 4 },
  { t: 'r', x: 8, y: 32, w: 9, h: 33, rx: 5 },
  { t: 'r', x: 53, y: 32, w: 9, h: 33, rx: 5 },
  { t: 'r', x: 9, y: 65, w: 8, h: 27, rx: 4 },
  { t: 'r', x: 53, y: 65, w: 8, h: 27, rx: 4 },
  { t: 'e', cx: 13, cy: 95, rx: 5, ry: 4 },
  { t: 'e', cx: 57, cy: 95, rx: 5, ry: 4 },
  { t: 'r', x: 22, y: 86, w: 26, h: 11, rx: 5 },
  { t: 'r', x: 22, y: 97, w: 12, h: 37, rx: 6 },
  { t: 'r', x: 36, y: 97, w: 12, h: 37, rx: 6 },
  { t: 'r', x: 23, y: 134, w: 10, h: 30, rx: 5 },
  { t: 'r', x: 37, y: 134, w: 10, h: 30, rx: 5 },
  { t: 'e', cx: 28, cy: 165, rx: 8, ry: 4 },
  { t: 'e', cx: 42, cy: 165, rx: 8, ry: 4 },
]

// Back body = front body offset by +80 on x axis
const BODY_BACK_SHAPES = BODY_SHAPES.map(s =>
  s.t === 'e' ? { ...s, cx: s.cx + 80 } : { ...s, x: s.x + 80 }
)

const MUSCLE_REGIONS = {
  // Front view muscles
  'Chest':                [{ t: 'r', x: 24, y: 36, w: 22, h: 14, rx: 3 }],
  'Front Delt':           [{ t: 'e', cx: 15, cy: 36, rx: 8, ry: 8 }, { t: 'e', cx: 55, cy: 36, rx: 8, ry: 8 }],
  'Lateral Delt':         [{ t: 'e', cx: 9, cy: 40, rx: 5, ry: 6 }, { t: 'e', cx: 61, cy: 40, rx: 5, ry: 6 }],
  'Biceps':               [{ t: 'r', x: 8, y: 45, w: 9, h: 18, rx: 4 }, { t: 'r', x: 53, y: 45, w: 9, h: 18, rx: 4 }],
  'Brachialis':           [{ t: 'r', x: 8, y: 57, w: 9, h: 9, rx: 4 }, { t: 'r', x: 53, y: 57, w: 9, h: 9, rx: 4 }],
  'Core':                 [{ t: 'r', x: 26, y: 56, w: 18, h: 19, rx: 3 }],
  'Transverse Abdominis': [{ t: 'r', x: 26, y: 56, w: 18, h: 19, rx: 3 }],
  'Lower Abs':            [{ t: 'r', x: 26, y: 68, w: 18, h: 10, rx: 3 }],
  'Obliques':             [{ t: 'r', x: 20, y: 57, w: 6, h: 16, rx: 3 }, { t: 'r', x: 44, y: 57, w: 6, h: 16, rx: 3 }],
  'Quads':                [{ t: 'r', x: 22, y: 99, w: 11, h: 32, rx: 5 }, { t: 'r', x: 37, y: 99, w: 11, h: 32, rx: 5 }],

  // Back view muscles (x offset +80)
  'Traps':          [{ t: 'r', x: 103, y: 30, w: 24, h: 13, rx: 3 }],
  'Rear Delt':      [{ t: 'e', cx: 96, cy: 38, rx: 8, ry: 8 }, { t: 'e', cx: 134, cy: 38, rx: 8, ry: 8 }],
  'Lats':           [{ t: 'r', x: 90, y: 47, w: 14, h: 24, rx: 4 }, { t: 'r', x: 126, y: 47, w: 14, h: 24, rx: 4 }],
  'Mid Back':       [{ t: 'r', x: 103, y: 47, w: 24, h: 18, rx: 3 }],
  'Lower Back':     [{ t: 'r', x: 104, y: 65, w: 22, h: 14, rx: 3 }],
  'Triceps':        [{ t: 'r', x: 88, y: 43, w: 9, h: 20, rx: 4 }, { t: 'r', x: 133, y: 43, w: 9, h: 20, rx: 4 }],
  'Glutes':         [{ t: 'e', cx: 107, cy: 98, rx: 10, ry: 9 }, { t: 'e', cx: 123, cy: 98, rx: 10, ry: 9 }],
  'Hamstrings':     [{ t: 'r', x: 102, y: 106, w: 12, h: 26, rx: 5 }, { t: 'r', x: 116, y: 106, w: 12, h: 26, rx: 5 }],
  'Gastrocnemius':  [{ t: 'r', x: 103, y: 137, w: 10, h: 22, rx: 5 }, { t: 'r', x: 117, y: 137, w: 10, h: 22, rx: 5 }],
  'Soleus':         [{ t: 'r', x: 103, y: 150, w: 10, h: 12, rx: 5 }, { t: 'r', x: 117, y: 150, w: 10, h: 12, rx: 5 }],
  'Rotator Cuff':   [{ t: 'e', cx: 96, cy: 38, rx: 8, ry: 8 }, { t: 'e', cx: 134, cy: 38, rx: 8, ry: 8 }],
  'Cardiovascular': [],
}

function S({ s, fill, opacity }) {
  const style = { fill, opacity }
  if (s.t === 'r') return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} style={style} />
  if (s.t === 'e') return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} style={style} />
  return null
}

export default function MuscleMap({ muscles }) {
  const activeSet = new Set(muscles ?? [])
  const activeShapes = []
  for (const m of activeSet) {
    if (MUSCLE_REGIONS[m]) activeShapes.push(...MUSCLE_REGIONS[m])
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 150 178" className="w-full max-w-[200px]" aria-hidden="true">
        {/* Front body background */}
        {BODY_SHAPES.map((s, i) => <S key={`f${i}`} s={s} fill="#1f2937" opacity={0.9} />)}
        {/* Back body background */}
        {BODY_BACK_SHAPES.map((s, i) => <S key={`b${i}`} s={s} fill="#1f2937" opacity={0.9} />)}

        {/* Active muscle highlights */}
        {activeShapes.map((s, i) => <S key={`a${i}`} s={s} fill="#f97316" opacity={0.75} />)}

        {/* View labels */}
        <text x="35" y="175" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="sans-serif">FRONT</text>
        <text x="115" y="175" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="sans-serif">BACK</text>

        {/* Divider */}
        <line x1="75" y1="8" x2="75" y2="168" stroke="#374151" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    </div>
  )
}
