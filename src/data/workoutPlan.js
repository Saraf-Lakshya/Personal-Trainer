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
        alternatives: [
          {
            id: 'cable-chest-fly',
            name: 'Cable Chest Fly',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Chest'],
            cues: [
              'Set cables at shoulder height, slight forward lean',
              'Bring handles together in a wide arc — squeeze chest hard at the centre',
            ],
            videoSearch: 'cable chest fly proper form tutorial',
          },
          {
            id: 'incline-db-press',
            name: 'Incline DB Press',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Upper Chest', 'Front Delt', 'Triceps'],
            cues: [
              'Bench at 30–45°, lower dumbbells to upper chest',
              'Press up and slightly inward — don\'t let elbows flare past 75°',
            ],
            videoSearch: 'incline dumbbell press proper form upper chest tutorial',
          },
          {
            id: 'machine-chest-press',
            name: 'Machine Chest Press',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Chest', 'Front Delt', 'Triceps'],
            cues: [
              'Adjust seat so handles align with mid-chest',
              'Press to full extension, control the return — don\'t let the stack slam',
            ],
            videoSearch: 'machine chest press proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'db-shoulder-press',
            name: 'DB Shoulder Press',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Front Delt', 'Lateral Delt', 'Triceps'],
            cues: [
              'Press straight overhead from ear height, palms facing forward',
              'Don\'t lock out aggressively at the top — keep tension on the delts',
            ],
            videoSearch: 'dumbbell shoulder press proper form tutorial',
          },
          {
            id: 'machine-shoulder-press',
            name: 'Machine Shoulder Press',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Front Delt', 'Lateral Delt', 'Triceps'],
            cues: [
              'Adjust seat so handles start at ear height',
              'Press smoothly — machine keeps the path stable, focus on squeezing the delts',
            ],
            videoSearch: 'machine shoulder press proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'close-grip-bench-press',
            name: 'Close-Grip Bench Press',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Triceps', 'Chest'],
            cues: [
              'Grip shoulder-width (not ultra-narrow), elbows tucked close to body',
              'Lower bar to lower chest, press up — feel the triceps doing the work',
            ],
            videoSearch: 'close grip bench press proper form triceps tutorial',
          },
          {
            id: 'cable-crossover',
            name: 'Cable Crossover',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Chest'],
            cues: [
              'Set cables high, step forward slightly, cross hands at the bottom',
              'Control the return — don\'t let cables snap arms back open',
            ],
            videoSearch: 'cable crossover proper form chest tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'cable-lateral-raise',
            name: 'Cable Lateral Raise',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Lateral Delt'],
            cues: [
              'Cable at lowest setting, pull across body and up — constant tension throughout',
              'Stop at shoulder height; elbow leads the movement, not the wrist',
            ],
            videoSearch: 'cable lateral raise proper form deltoid tutorial',
          },
          {
            id: 'machine-lateral-raise',
            name: 'Machine Lateral Raise',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Lateral Delt'],
            cues: [
              'Adjust so pivot point aligns with your shoulder joint',
              'Push with the elbow/forearm, not the hand — isolates the lateral delt',
            ],
            videoSearch: 'machine lateral raise proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'tricep-pushdown',
            name: 'Tricep Pushdown',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Triceps'],
            cues: [
              'Elbows pinned to sides throughout — only the forearms move',
              'Push to full extension and squeeze; control the return',
            ],
            videoSearch: 'tricep pushdown cable proper form tutorial',
          },
          {
            id: 'overhead-db-tricep-extension',
            name: 'Overhead DB Tricep Extension',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Triceps'],
            cues: [
              'Hold one dumbbell with both hands overhead, elbows close to head',
              'Lower behind head until elbows are at 90°, extend back up',
            ],
            videoSearch: 'overhead dumbbell tricep extension proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'pull-ups',
            name: 'Pull-Ups',
            sets: 3, reps: 8, rest: 90,
            muscles: ['Lats', 'Biceps', 'Rear Delt'],
            cues: [
              'Dead hang to start — full lat stretch at the bottom',
              'Drive elbows down and back; chin clears the bar at the top',
            ],
            videoSearch: 'pull ups proper form lat activation tutorial',
          },
          {
            id: 'cable-straight-arm-pulldown',
            name: 'Straight-Arm Cable Pulldown',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Lats'],
            cues: [
              'Arms straight throughout, hinge forward slightly at the hips',
              'Pull bar to thighs in a wide arc — feel the lat stretch at the top',
            ],
            videoSearch: 'straight arm cable pulldown lat isolation tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'machine-row',
            name: 'Machine Seated Row',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Mid Back', 'Lats', 'Biceps'],
            cues: [
              'Chest against pad, pull handles to torso — squeeze shoulder blades at the end',
              'Control the return — don\'t let the stack pull you forward',
            ],
            videoSearch: 'machine seated row proper form back tutorial',
          },
          {
            id: 'bent-over-db-row',
            name: 'Bent-Over DB Row',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Mid Back', 'Lats', 'Biceps'],
            cues: [
              'Hinge at hips ~45°, neutral spine — brace core hard',
              'Row elbows up and back, squeeze shoulder blades at the top',
            ],
            videoSearch: 'bent over dumbbell row proper form back tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'single-arm-db-row',
            name: 'Single-Arm DB Row',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Mid Back', 'Lats', 'Rear Delt'],
            note: 'Each side',
            cues: [
              'Brace knee and hand on bench, torso parallel to floor',
              'Row elbow up and back — think about pulling your elbow to the ceiling',
            ],
            videoSearch: 'single arm dumbbell row proper form back tutorial',
          },
          {
            id: 't-bar-row',
            name: 'T-Bar Row',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Mid Back', 'Lats', 'Biceps'],
            cues: [
              'Hinge forward, chest against pad (if supported version)',
              'Pull to lower chest, drive elbows back — squeeze hard at the top',
            ],
            videoSearch: 't bar row proper form back tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'reverse-pec-deck',
            name: 'Reverse Pec Deck',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Rear Delt', 'Traps'],
            cues: [
              'Face the pad, arms slightly bent, pull handles back in a wide arc',
              'Squeeze rear delts hard at full extension — hold for 1 second',
            ],
            videoSearch: 'reverse pec deck rear delt proper form tutorial',
          },
          {
            id: 'band-pull-aparts',
            name: 'Band Pull-Aparts',
            sets: 3, reps: 15, rest: 45,
            muscles: ['Rear Delt', 'Rotator Cuff'],
            cues: [
              'Hold band at shoulder width, arms straight in front at shoulder height',
              'Pull band apart to chest, squeezing shoulder blades — control the return',
            ],
            videoSearch: 'band pull aparts rear delt rotator cuff tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'dumbbell-bicep-curl',
            name: 'Dumbbell Bicep Curl',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Biceps', 'Brachialis'],
            cues: [
              'Stand tall, curl with a slight supination — pinky rotates up at the top',
              'Elbows stay pinned at sides — no swinging, no momentum',
            ],
            videoSearch: 'dumbbell bicep curl proper form tutorial',
          },
          {
            id: 'ez-bar-curl',
            name: 'EZ Bar Curl',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Biceps', 'Brachialis'],
            cues: [
              'Angled grip reduces wrist strain — easier to go heavier',
              'Curl to chin height, elbows fixed — lower slowly over 3 seconds',
            ],
            videoSearch: 'ez bar curl proper form biceps tutorial',
          },
          {
            id: 'cable-curl',
            name: 'Cable Curl',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Biceps'],
            cues: [
              'Low cable pulley, curl bar or rope — constant tension throughout the rep',
              'Squeeze at the top, resist on the way down',
            ],
            videoSearch: 'cable curl biceps proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'leg-press',
            name: 'Leg Press',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Quads', 'Glutes', 'Hamstrings'],
            note: 'High foot placement for glutes',
            cues: [
              'Feet shoulder-width, high on platform for more glute/hamstring',
              'Lower to 90° knee bend — don\'t let lower back peel off the pad',
            ],
            videoSearch: 'leg press proper form quads glutes tutorial',
          },
          {
            id: 'goblet-squat',
            name: 'Goblet Squat',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Quads', 'Glutes', 'Core'],
            cues: [
              'Hold dumbbell or kettlebell at chest, squat deep with upright torso',
              'Elbows track inside knees at the bottom — drives knees out',
            ],
            videoSearch: 'goblet squat proper form tutorial',
          },
          {
            id: 'step-ups',
            name: 'Step-Ups with Dumbbells',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Quads', 'Glutes'],
            note: 'Each leg',
            cues: [
              'Step onto a bench with one foot, drive through the heel to stand',
              'Don\'t push off the back foot — make the working leg do all the effort',
            ],
            videoSearch: 'step ups dumbbell proper form glutes quads tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'glute-bridge',
            name: 'Glute Bridge',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Glutes', 'Hamstrings'],
            note: 'Dumbbell across hips',
            cues: [
              'Lie on the floor, feet flat, dumbbell on hip crease — drive hips up',
              'Squeeze glutes at the top; don\'t hyperextend the lower back',
            ],
            videoSearch: 'glute bridge proper form tutorial',
          },
          {
            id: 'cable-pull-through',
            name: 'Cable Pull-Through',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Glutes', 'Hamstrings'],
            cues: [
              'Face away from low cable, rope between legs — hinge at hips, soft knees',
              'Drive hips forward to stand, squeezing glutes hard at lockout',
            ],
            videoSearch: 'cable pull through glutes hamstrings proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'seated-leg-curl',
            name: 'Seated Leg Curl',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Hamstrings'],
            note: 'Machine',
            cues: [
              'Seated version puts hamstrings under stretch at the hip — more range',
              'Curl to full contraction, hold 1 second, lower over 3 seconds',
            ],
            videoSearch: 'seated leg curl machine proper form hamstrings tutorial',
          },
          {
            id: 'swiss-ball-hamstring-curl',
            name: 'Swiss Ball Hamstring Curl',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Hamstrings', 'Glutes', 'Core'],
            cues: [
              'Lie on back, heels on ball, hips bridged — curl ball toward glutes',
              'Keep hips high throughout; lower slowly back to start',
            ],
            videoSearch: 'swiss ball hamstring curl proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'hack-squat',
            name: 'Hack Squat',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Quads', 'Glutes'],
            cues: [
              'Feet shoulder-width, low on the platform — emphasises quads',
              'Descend until thighs are parallel; drive through heels to stand',
            ],
            videoSearch: 'hack squat machine proper form quads tutorial',
          },
          {
            id: 'wall-sit',
            name: 'Wall Sit',
            sets: 3, reps: null, duration: 45, rest: 60,
            isTime: true,
            muscles: ['Quads'],
            cues: [
              'Back flat against wall, thighs parallel to floor — hold the position',
              'Don\'t slide down; push back into the wall with your lower back',
            ],
            videoSearch: 'wall sit isometric quad exercise tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'seated-calf-raise',
            name: 'Seated Calf Raise',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Soleus'],
            note: 'Machine or dumbbell on knee',
            cues: [
              'Seated version targets the soleus (deeper calf muscle) — knees at 90°',
              'Full stretch at the bottom, pause and squeeze at the top',
            ],
            videoSearch: 'seated calf raise soleus proper form tutorial',
          },
          {
            id: 'leg-press-calf-raise',
            name: 'Leg Press Calf Raise',
            sets: 3, reps: 15, rest: 60,
            muscles: ['Gastrocnemius', 'Soleus'],
            cues: [
              'Feet at the bottom of the leg press plate, push through the balls of feet',
              'Full range — deep stretch at the bottom, full extension at the top',
            ],
            videoSearch: 'leg press calf raise proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'ab-wheel-rollout',
            name: 'Ab Wheel Rollout',
            sets: 3, reps: 8, rest: 60,
            muscles: ['Core', 'Transverse Abdominis', 'Lats'],
            cues: [
              'Kneel, roll out until body is nearly parallel — don\'t let hips sag',
              'Pull back with your abs and lats together — don\'t use momentum',
            ],
            videoSearch: 'ab wheel rollout proper form core tutorial',
          },
          {
            id: 'rkc-plank',
            name: 'RKC Plank',
            sets: 3, reps: null, duration: 30, rest: 60,
            isTime: true,
            muscles: ['Core', 'Glutes', 'Quads'],
            cues: [
              'Standard plank position but actively try to pull elbows to toes (without moving)',
              'Squeeze every muscle simultaneously — it should feel very hard even for 20 seconds',
            ],
            videoSearch: 'RKC plank harder plank variation tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'hollow-body-hold',
            name: 'Hollow Body Hold',
            sets: 3, reps: null, duration: 30, rest: 60,
            isTime: true,
            muscles: ['Core', 'Transverse Abdominis'],
            cues: [
              'Lie flat, lower back pressed to floor, arms overhead, legs slightly raised',
              'Everything is tensed — if lower back lifts, raise legs higher until it doesn\'t',
            ],
            videoSearch: 'hollow body hold core exercise proper form tutorial',
          },
          {
            id: 'flutter-kicks',
            name: 'Flutter Kicks',
            sets: 3, reps: null, duration: 30, rest: 60,
            isTime: true,
            muscles: ['Core', 'Hip Flexors'],
            cues: [
              'Hands under glutes, lower back pressed flat — small alternating kicks',
              'The lower the legs, the harder it is — keep lower back flat as the priority',
            ],
            videoSearch: 'flutter kicks core exercise proper form tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'superman-hold',
            name: 'Superman Hold',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Lower Back', 'Glutes', 'Traps'],
            cues: [
              'Lie face down, lift arms and legs off the floor simultaneously',
              'Hold for 2 seconds at the top, lower slowly — squeeze glutes throughout',
            ],
            videoSearch: 'superman hold back extension exercise tutorial',
          },
          {
            id: 'quadruped-hip-extension',
            name: 'Quadruped Hip Extension',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Glutes', 'Core'],
            note: 'Each side',
            cues: [
              'On all fours, extend one leg straight back — squeeze the glute at the top',
              'Keep hips square to the floor; don\'t let them tilt',
            ],
            videoSearch: 'quadruped hip extension glute activation tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'half-kneeling-pallof-press',
            name: 'Half-Kneeling Pallof Press',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Core', 'Obliques', 'Hip Flexors'],
            note: 'Each side',
            cues: [
              'Same as Pallof press but one knee on the ground — removes leg drive',
              'Harder anti-rotation challenge; also stretches the hip flexor of the down leg',
            ],
            videoSearch: 'half kneeling pallof press core tutorial',
          },
          {
            id: 'landmine-rotation',
            name: 'Landmine Rotation',
            sets: 3, reps: 10, rest: 60,
            muscles: ['Obliques', 'Core', 'Shoulders'],
            note: 'Each side',
            cues: [
              'Hold barbell end at chest, rotate it arc-style from one side to the other',
              'Power comes from the core rotation, not the arms — keep arms relatively straight',
            ],
            videoSearch: 'landmine rotation core obliques tutorial',
          },
        ],
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
        alternatives: [
          {
            id: 'russian-twists',
            name: 'Russian Twists',
            sets: 3, reps: 20, rest: 60,
            muscles: ['Obliques', 'Core'],
            note: 'With plate or dumbbell',
            cues: [
              'Sit at 45°, feet off floor, rotate plate side to side from the torso',
              'Don\'t just swing arms — drive the rotation from the obliques',
            ],
            videoSearch: 'russian twists obliques proper form tutorial',
          },
          {
            id: 'medicine-ball-slam',
            name: 'Medicine Ball Slam',
            sets: 3, reps: 12, rest: 60,
            muscles: ['Core', 'Shoulders', 'Lats'],
            cues: [
              'Raise ball overhead, slam down hard — use your whole body',
              'Catch on the bounce and go straight into the next rep',
            ],
            videoSearch: 'medicine ball slam core power tutorial',
          },
        ],
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

// Every exercise that can appear in a session — base exercises plus their
// alternatives — deduped by id. Used by the progress tracker so swapped-in or
// added alternatives are selectable too.
export const ALL_TRACKABLE_EXERCISES = (() => {
  const seen = new Map()
  for (const s of Object.values(SESSIONS)) {
    for (const ex of s.exercises) {
      if (!seen.has(ex.id)) seen.set(ex.id, ex)
      for (const alt of ex.alternatives ?? []) {
        if (!seen.has(alt.id)) seen.set(alt.id, alt)
      }
    }
  }
  return [...seen.values()]
})()

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
