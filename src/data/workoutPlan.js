// Week A: Tue / Thu / Sat (3 sessions)
// Week B: Mon / Wed / Fri / Sat (4 sessions)
// Sessions rotate A → B → C → D → A ...
// Duration: ~45-50 min, fasted 9-10am

export const SESSION_META = {
  A: { label: 'Push', color: 'orange', emoji: '💪', muscles: 'Chest · Shoulders · Triceps' },
  B: { label: 'Pull', color: 'blue', emoji: '🔙', muscles: 'Back · Biceps · Rear Delts' },
  C: { label: 'Legs', color: 'green', emoji: '🦵', muscles: 'Quads · Hamstrings · Calves' },
  D: { label: 'Core + Cardio', color: 'purple', emoji: '🫀', muscles: 'Core · Cardiovascular' },
}

export const WEEKS = {
  A: { days: ['Tuesday', 'Thursday', 'Saturday'], count: 3 },
  B: { days: ['Monday', 'Wednesday', 'Friday', 'Saturday'], count: 4 },
}

export const SESSIONS = {
  A: {
    ...SESSION_META.A,
    sessionKey: 'A',
    exercises: [
      {
        id: 'db-bench-press',
        name: 'Dumbbell Bench Press',
        sets: 3,
        reps: 10,
        rest: 90,
        muscles: ['Chest', 'Front Delt', 'Triceps'],
        cues: [
          'Retract and depress shoulder blades into bench',
          'Lower to chest level, elbows ~75° from body',
          'Press in slight arc — converge at the top',
          'Keep feet flat, maintain slight lower back arch',
        ],
        videoSearch: 'dumbbell bench press proper form tutorial',
      },
      {
        id: 'db-shoulder-press',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: 10,
        rest: 90,
        muscles: ['Front Delt', 'Lateral Delt', 'Triceps'],
        cues: [
          'Sit upright, dumbbells at ear level, palms forward',
          'Press straight up without letting elbows flare forward',
          'Stop just before full lockout to keep tension on delts',
          'Control the descent — 2 seconds down',
        ],
        videoSearch: 'dumbbell shoulder press seated proper form',
      },
      {
        id: 'incline-db-press',
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 10,
        rest: 90,
        muscles: ['Upper Chest', 'Front Delt', 'Triceps'],
        cues: [
          'Set bench to 30–45° — steeper hits more shoulder',
          'Lower to upper chest, not toward neck',
          'Keep lower back in contact with the pad',
          'Drive through palms, squeeze chest at the top',
        ],
        videoSearch: 'incline dumbbell press proper form upper chest',
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        sets: 3,
        reps: 12,
        rest: 60,
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
        id: 'tricep-pushdowns',
        name: 'Tricep Pushdowns',
        sets: 3,
        reps: 12,
        rest: 60,
        muscles: ['Triceps'],
        cues: [
          'Keep elbows pinned to sides throughout the movement',
          'Full extension at the bottom — brief pause',
          'Control the upward phase — don\'t let the stack drop',
          'Lean slightly forward at the cable for stability',
        ],
        videoSearch: 'cable tricep pushdown proper form tutorial',
      },
    ],
  },

  B: {
    ...SESSION_META.B,
    sessionKey: 'B',
    exercises: [
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        reps: 10,
        rest: 90,
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
        sets: 3,
        reps: 10,
        rest: 90,
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
        id: 'single-arm-db-row',
        name: 'Single Arm Dumbbell Row',
        sets: 3,
        reps: 10,
        rest: 60,
        muscles: ['Lats', 'Mid Back', 'Biceps'],
        note: 'Each side',
        cues: [
          'Support with free hand on bench, keep spine neutral',
          'Pull elbow straight back — not out to the side',
          'Full stretch at the bottom, full contraction at top',
          'Think "elbow to hip pocket" to engage lats properly',
        ],
        videoSearch: 'single arm dumbbell row proper form tutorial',
      },
      {
        id: 'face-pulls',
        name: 'Face Pulls',
        sets: 3,
        reps: 15,
        rest: 60,
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
        id: 'bicep-curls',
        name: 'Dumbbell Bicep Curls',
        sets: 3,
        reps: 12,
        rest: 60,
        muscles: ['Biceps', 'Brachialis'],
        cues: [
          'Elbows stay pinned at sides — they are the hinge',
          'Supinate wrist as you curl (rotate palm up at top)',
          'Full range — achieve full extension at the bottom',
          'If you\'re swinging, reduce the weight',
        ],
        videoSearch: 'dumbbell bicep curl proper form supination tutorial',
      },
    ],
  },

  C: {
    ...SESSION_META.C,
    sessionKey: 'C',
    exercises: [
      {
        id: 'leg-press',
        name: 'Leg Press',
        sets: 3,
        reps: 12,
        rest: 90,
        muscles: ['Quads', 'Glutes', 'Hamstrings'],
        cues: [
          'Feet hip-width apart, mid to upper portion of platform',
          'Don\'t lock out knees at the top — keep slight bend',
          'Lower until hips just begin to round — stop there',
          'Push through whole foot evenly, not just the toes',
        ],
        videoSearch: 'leg press proper form tutorial feet position',
      },
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift',
        sets: 3,
        reps: 10,
        rest: 90,
        muscles: ['Hamstrings', 'Glutes', 'Lower Back'],
        note: 'Dumbbells',
        cues: [
          'Maintain a soft (not locked) knee throughout',
          'Hinge at hips — push them backward as weights descend',
          'Keep dumbbells close to your legs at all times',
          'Feel the stretch in hamstrings — stop before lower back rounds',
        ],
        videoSearch: 'romanian deadlift dumbbell proper form tutorial hinge',
      },
      {
        id: 'leg-curls',
        name: 'Leg Curls',
        sets: 3,
        reps: 12,
        rest: 60,
        muscles: ['Hamstrings'],
        note: 'Machine',
        cues: [
          'Lie flat, pad positioned just above the heels',
          'Squeeze glutes to stabilize pelvis — prevents hip flexor compensation',
          'Curl until hamstrings are fully contracted',
          'Lower slowly — 3 seconds on the way down',
        ],
        videoSearch: 'lying leg curl machine proper form hamstrings',
      },
      {
        id: 'leg-extensions',
        name: 'Leg Extensions',
        sets: 3,
        reps: 12,
        rest: 60,
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
        sets: 3,
        reps: 15,
        rest: 60,
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

  D: {
    ...SESSION_META.D,
    sessionKey: 'D',
    exercises: [
      {
        id: 'incline-treadmill-walk',
        name: 'Incline Treadmill Walk',
        sets: 1,
        reps: null,
        duration: 20,
        rest: 0,
        isCardio: true,
        muscles: ['Glutes', 'Calves', 'Cardiovascular'],
        cues: [
          'Set incline to 8–12%, speed 3.5–4.5 km/h',
          'Don\'t hold onto the handles — use natural arm swing',
          'Maintain upright posture with a slight forward lean',
          'Steady Zone 2 heart rate — you can hold a conversation',
        ],
        videoSearch: 'incline treadmill walking technique fat loss',
      },
      {
        id: 'plank',
        name: 'Plank',
        sets: 3,
        reps: null,
        duration: 45,
        rest: 60,
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
        sets: 3,
        reps: 10,
        rest: 60,
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
        sets: 3,
        reps: 10,
        rest: 60,
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
        sets: 3,
        reps: 12,
        rest: 60,
        muscles: ['Core', 'Obliques', 'Transverse Abdominis'],
        cues: [
          'Stand perpendicular to cable, feet hip-width apart',
          'Hold handle at chest, then press straight out in front',
          'Resist rotation — your core fights the cable\'s pull',
          'Pause at full extension, then return controlled',
        ],
        videoSearch: 'pallof press anti rotation core cable tutorial',
      },
      {
        id: 'reverse-crunches',
        name: 'Reverse Crunches',
        sets: 3,
        reps: 15,
        rest: 60,
        muscles: ['Lower Abs', 'Core'],
        cues: [
          'Lie flat, hands under lower back for support if needed',
          'Curl hips up and toward your chest — not just legs',
          'Control the descent — don\'t let legs drop',
          'Exhale as you lift, inhale as you lower',
        ],
        videoSearch: 'reverse crunches proper form lower abs tutorial',
      },
    ],
  },
}

export const ALL_EXERCISES = Object.values(SESSIONS).flatMap(s => s.exercises)

export function getYouTubeSearchUrl(searchQuery) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
}

export function getSessionColor(sessionKey) {
  const colors = {
    A: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', light: 'bg-orange-500/10' },
    B: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', light: 'bg-blue-500/10' },
    C: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', light: 'bg-green-500/10' },
    D: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', light: 'bg-purple-500/10' },
  }
  return colors[sessionKey] || colors.A
}
