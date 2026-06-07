// Rotation (8-session cycle): A → B → E → D → A → B → C → D → repeat
// Week A: Mon / Tue / Thu / Sat  |  Week B: Mon / Wed / Fri / Sat
// Duration: ~45-50 min, fasted 9-10am

export const SESSION_META = {
  A: { label: 'Push',        color: 'orange', emoji: '💪', muscles: 'Chest · Shoulders · Triceps' },
  B: { label: 'Pull',        color: 'blue',   emoji: '🦾', muscles: 'Back · Biceps · Rear Delts' },
  C: { label: 'Legs',        color: 'green',  emoji: '🦵', muscles: 'Quads · Hamstrings · Calves' },
  D: { label: 'Core — Gym',  color: 'purple', emoji: '🫀', muscles: 'Core · Anti-Rotation · Stability' },
  E: { label: 'Core — Home', color: 'pink',   emoji: '🏠', muscles: 'Full Core · Cardio · Mobility' },
}

export const WEEKS = {
  A: { days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'], count: 4 },
  B: { days: ['Monday', 'Wednesday', 'Friday', 'Saturday'], count: 4 },
}

// Week A reference: Monday 18 May 2026
const WEEK_A_REF = new Date('2026-05-18T00:00:00')

export const WEEK_WORKOUT_DAYS = {
  A: [1, 2, 4, 6], // Mon, Tue, Thu, Sat
  B: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
}

// 8-session rotation — index by history.length % 8
export const FULL_ROTATION = ['A', 'B', 'E', 'D', 'A', 'B', 'C', 'D']

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getCurrentWeekType() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weeksSinceRef = Math.round((monday - WEEK_A_REF) / (7 * 24 * 60 * 60 * 1000))
  return weeksSinceRef % 2 === 0 ? 'A' : 'B'
}

export function getTodayScheduleInfo() {
  const weekType = getCurrentWeekType()
  const now = new Date()
  const dow = now.getDay()
  const isWorkout = WEEK_WORKOUT_DAYS[weekType].includes(dow)
  const todayName = DAY_NAMES[dow]

  let nextWorkoutDay = null
  if (!isWorkout) {
    for (let i = 1; i <= 7; i++) {
      const next = (dow + i) % 7
      if (WEEK_WORKOUT_DAYS[weekType].includes(next) ||
          WEEK_WORKOUT_DAYS[weekType === 'A' ? 'B' : 'A'].includes(next)) {
        nextWorkoutDay = DAY_NAMES[next]
        break
      }
    }
  }

  return { weekType, isWorkout, todayName, nextWorkoutDay, dow }
}

export const SESSIONS = {
  // ─── SESSION A: PUSH ───────────────────────────────────────────────────────
  A: {
    ...SESSION_META.A,
    sessionKey: 'A',
    exercises: [
      {
        id: 'db-bench-press',
        name: 'Dumbbell Bench Press',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Chest', 'Front Delt', 'Triceps'],
        cues: [
          'Retract and depress shoulder blades into bench',
          'Lower to chest level, elbows ~75° from body',
          'Press in a slight arc — dumbbells converge at the top',
          'Keep feet flat, maintain a slight natural lower-back arch',
        ],
        videoSearch: 'dumbbell bench press proper form tutorial',
      },
      {
        id: 'arnold-press',
        name: 'Arnold Press',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Front Delt', 'Lateral Delt', 'Triceps'],
        cues: [
          'Start with dumbbells at chin height, palms facing you',
          'As you press up, rotate palms forward — finish palms facing away',
          'Lower slowly, rotating palms back toward you at the bottom',
          'Sit upright with back fully supported — do not arch',
        ],
        videoSearch: 'arnold press proper form all three deltoid heads',
      },
      {
        id: 'weighted-dips',
        name: 'Weighted Dips',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Chest', 'Triceps', 'Front Delt'],
        cues: [
          'Lean torso slightly forward to bias chest over triceps',
          'Lower until upper arms are parallel to the ground — no deeper',
          'Elbows slightly flared (30–40°), not locked to sides',
          'Add weight via belt or hold a dumbbell between your legs',
        ],
        videoSearch: 'weighted dips proper form chest triceps tutorial',
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Lateral Delt'],
        cues: [
          'Slight bend in elbows throughout — soft lock',
          'Lead with elbows, not wrists — "pour a jug" motion',
          'Stop at shoulder height, not higher',
          'Control the descent — resist gravity on the way down',
        ],
        videoSearch: 'lateral raises proper form side deltoid',
      },
      {
        id: 'cable-overhead-tricep-extension',
        name: 'Seated Cable Overhead Extension',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Triceps'],
        cues: [
          'Sit facing away from the cable with pulley at low/mid height',
          'Grip the rope with both hands behind your head, elbows forward',
          'Extend arms overhead until fully straight — don\'t flare elbows',
          'Control the descent to feel the stretch in the long head',
        ],
        videoSearch: 'seated cable overhead tricep extension rope long head',
      },
    ],
  },

  // ─── SESSION B: PULL ───────────────────────────────────────────────────────
  B: {
    ...SESSION_META.B,
    sessionKey: 'B',
    exercises: [
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Lats', 'Biceps', 'Rear Delt'],
        cues: [
          'Grip slightly wider than shoulder width, overhand',
          'Lean back slightly (10–15°), chest up',
          'Drive elbows to hips — think "elbows to back pockets"',
          'Full hang at the top — let lats fully stretch',
        ],
        videoSearch: 'lat pulldown proper form technique tutorial',
      },
      {
        id: 'seated-cable-row',
        name: 'Seated Cable Row',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Mid Back', 'Lats', 'Biceps'],
        cues: [
          'Sit tall — don\'t round your lower back',
          'Pull to lower sternum, not your abs',
          'Squeeze shoulder blades together at the end position',
          'Control the extension — don\'t let the weight jerk you forward',
        ],
        videoSearch: 'seated cable row proper form back tutorial',
      },
      {
        id: 'chest-supported-db-row',
        name: 'Chest-Supported DB Row',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Mid Back', 'Lats', 'Rear Delt'],
        cues: [
          'Lie prone on an incline bench (30–45°) — chest fully on the pad',
          'Let arms hang fully for a complete stretch at the bottom',
          'Row elbows back and up, squeezing shoulder blades together',
          'Lower back is completely uninvolved — all tension stays in the back',
        ],
        videoSearch: 'chest supported dumbbell row proper form back tutorial',
      },
      {
        id: 'face-pulls',
        name: 'Face Pulls',
        sets: 3, reps: 15, rest: 60,
        muscles: ['Rear Delt', 'Rotator Cuff', 'Traps'],
        cues: [
          'Set cable at face height or slightly above',
          'Pull to forehead, thumbs pointing toward ears',
          'Externally rotate at end — elbows should be above wrists',
          'Pause at full contraction — this is a health exercise, not ego',
        ],
        videoSearch: 'face pulls proper form rear delt tutorial',
      },
      {
        id: 'preacher-curl-machine',
        name: 'Preacher Curl Machine',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Biceps', 'Brachialis'],
        note: 'Machine',
        cues: [
          'Adjust seat so upper arms rest flat on the pad — armpits at the top edge',
          'Full stretch at the bottom — don\'t cut the range short',
          'Curl smoothly to full contraction, squeeze at the top',
          'Lower slowly — 3 seconds down — the eccentric is where growth happens',
        ],
        videoSearch: 'preacher curl machine proper form biceps tutorial',
      },
    ],
  },

  // ─── SESSION C: LEGS ───────────────────────────────────────────────────────
  C: {
    ...SESSION_META.C,
    sessionKey: 'C',
    exercises: [
      {
        id: 'walking-weighted-lunge',
        name: 'Walking Weighted Lunges',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Quads', 'Glutes', 'Hamstrings'],
        note: 'Each leg — dumbbells at sides',
        cues: [
          'Take a long stride forward, lower the back knee toward the floor',
          'Front knee stays over toes and behind the ankle — don\'t let it cave in',
          'Torso upright, core braced — don\'t lean forward onto the front leg',
          'Push off the front foot to step through into the next lunge',
        ],
        videoSearch: 'walking dumbbell lunges proper form quads glutes tutorial',
      },
      {
        id: 'hip-thrust',
        name: 'Dumbbell Hip Thrust',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Glutes', 'Hamstrings'],
        note: 'Start ~20–25 kg dumbbell across hip crease',
        cues: [
          'Sit on the floor with upper back against a bench, dumbbell on hip crease',
          'Drive hips up until body forms a straight line — knees to shoulders',
          'Squeeze glutes hard at the top for 1 full second',
          'Chin tucked, core braced — lower back should not arch at the top',
        ],
        videoSearch: 'dumbbell hip thrust proper form glutes tutorial',
      },
      {
        id: 'leg-curls',
        name: 'Leg Curls',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Hamstrings'],
        note: 'Machine',
        cues: [
          'Lie flat, pad positioned just above the heels',
          'Squeeze glutes to stabilise pelvis — prevents hip flexor compensation',
          'Curl until hamstrings are fully contracted',
          'Lower slowly — 3 seconds on the way down',
        ],
        videoSearch: 'lying leg curl machine proper form hamstrings',
      },
      {
        id: 'leg-extensions',
        name: 'Leg Extensions',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Quads'],
        note: 'Machine',
        cues: [
          'Sit back fully in the seat, pad against lower shin',
          'Extend slowly — 2 seconds on the way up',
          'Pause at the top and squeeze quads hard',
          'Don\'t let the weight stack slam down on descent',
        ],
        videoSearch: 'leg extension machine proper form quadriceps',
      },
      {
        id: 'calf-raises',
        name: 'Calf Raises',
        sets: 3, reps: 15, rest: 60,
        muscles: ['Gastrocnemius', 'Soleus'],
        cues: [
          'Full range — all the way up AND all the way down',
          'Pause for 1–2 seconds at the very top',
          'Slow descent — 3 seconds down for maximum stretch',
          'Keep legs straight to emphasise the gastrocnemius',
        ],
        videoSearch: 'calf raises proper form standing gastrocnemius tutorial',
      },
    ],
  },

  // ─── SESSION D: CORE — GYM ─────────────────────────────────────────────────
  D: {
    ...SESSION_META.D,
    sessionKey: 'D',
    exercises: [
      {
        id: 'plank',
        name: 'Plank',
        sets: 3, reps: null, duration: 45, rest: 60,
        isTime: true,
        muscles: ['Core', 'Transverse Abdominis'],
        cues: [
          'Elbows directly under shoulders, forearms flat',
          'Maintain neutral spine — don\'t let hips sag or pike',
          'Squeeze glutes and core simultaneously',
          'Breathe steadily — don\'t hold your breath',
        ],
        videoSearch: 'plank proper form core activation tutorial',
      },
      {
        id: 'dead-bug',
        name: 'Dead Bug',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Core', 'Transverse Abdominis'],
        note: 'Each side',
        cues: [
          'Lower back pressed flat to floor throughout — this is the whole point',
          'Move opposite arm and leg simultaneously',
          'Exhale slowly as you lower limbs toward the floor',
          'Never let lower back arch off the mat',
        ],
        videoSearch: 'dead bug exercise proper form lower back tutorial',
      },
      {
        id: 'bird-dog',
        name: 'Bird Dog',
        sets: 3, reps: 10, rest: 60,
        muscles: ['Core', 'Glutes', 'Lower Back'],
        note: 'Each side',
        cues: [
          'Keep hips level — don\'t rotate or tilt',
          'Extend arm and opposite leg simultaneously and slowly',
          'Hold for 1–2 seconds at full extension',
          'Think about making your body as long as possible',
        ],
        videoSearch: 'bird dog exercise proper form core stability',
      },
      {
        id: 'pallof-press',
        name: 'Pallof Press',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Core', 'Obliques', 'Transverse Abdominis'],
        note: 'Each side',
        cues: [
          'Stand perpendicular to cable, feet hip-width apart',
          'Hold handle at chest, then press straight out in front',
          'Resist rotation — your core fights the cable\'s pull',
          'Pause at full extension, then return controlled',
        ],
        videoSearch: 'pallof press anti rotation core cable tutorial',
      },
      {
        id: 'cable-woodchops',
        name: 'Cable Woodchops',
        sets: 3, reps: 12, rest: 60,
        muscles: ['Obliques', 'Core'],
        note: 'Each side',
        cues: [
          'Stand side-on to the cable set at shoulder height',
          'Pull the handle diagonally down and across your body',
          'Rotation comes from the trunk — don\'t just use your arms',
          'Control the return; brace core throughout',
        ],
        videoSearch: 'cable woodchops obliques core rotation tutorial',
      },
    ],
  },

  // ─── SESSION E: CORE — HOME ────────────────────────────────────────────────
  E: {
    ...SESSION_META.E,
    sessionKey: 'E',
    isHomeSession: true,
    videoUrl: 'https://youtu.be/k3aFE02BdLE?si=VtE8eolv3hOxreGa',
    exercises: [],
  },
}

export const ALL_EXERCISES = Object.values(SESSIONS).flatMap(s => s.exercises)

export function getYouTubeSearchUrl(searchQuery) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
}

export function getSessionColor(sessionKey) {
  const colors = {
    A: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', light: 'bg-orange-500/10' },
    B: { bg: 'bg-blue-500',   text: 'text-blue-400',   border: 'border-blue-500/30',   light: 'bg-blue-500/10'   },
    C: { bg: 'bg-green-500',  text: 'text-green-400',  border: 'border-green-500/30',  light: 'bg-green-500/10'  },
    D: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', light: 'bg-purple-500/10' },
    E: { bg: 'bg-pink-500',   text: 'text-pink-400',   border: 'border-pink-500/30',   light: 'bg-pink-500/10'   },
  }
  return colors[sessionKey] || colors.A
}
