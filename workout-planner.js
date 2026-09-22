const LABELS = {
  goal: { strength: 'Strength', 'fat-loss': 'Fat Loss', muscle: 'Muscle Gain', fitness: 'General Fitness' },
  level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
};

const GUIDANCE = {
  beginner: '2–3 sets x 10–15 reps x rest 60s',
  intermediate: '3–4 sets x 8–12 reps x rest 60–90s',
  advanced: '4–5 sets x 5–8 reps x rest 90–120s'
};

const ROUTINES = {
  strength: {
    label: 'Power & Strength',
    days: [
      { focus: 'Legs — Squat Focus', exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunges'] },
      { focus: 'Chest & Shoulders (Push)', exercises: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Dips'] },
      { focus: 'Back & Deadlift (Pull)', exercises: ['Deadlift', 'Barbell Row', 'Pull-ups', 'Cable Row'] },
      { focus: 'Full Body Power', exercises: ['Power Clean', 'Front Squat', 'Kettlebell Swings', 'Farmer Carries'] },
      { focus: 'Accessory Strength', exercises: ['Hip Thrusts', 'Tricep Extensions', 'Bicep Curls', 'Plank Hold'] },
      { focus: 'Conditioning & Mobility', exercises: ['Light Rowing', 'Battle Ropes', 'Mobility Flow', 'Foam Rolling'] }
    ]
  },
  'fat-loss': {
    label: 'Full Body Burn',
    days: [
      { focus: 'Full Body Circuit', exercises: ['Kettlebell Swings', 'Goblet Squats', 'Push-ups', 'Mountain Climbers'] },
      { focus: 'HIIT Cardio', exercises: ['Sprint Intervals (30s on / 60s off)', 'Jump Rope', 'Burpees', 'Plank Hold'] },
      { focus: 'Lower Body', exercises: ['Bodyweight Squats', 'Reverse Lunges', 'Glute Bridges', 'Box Step-ups'] },
      { focus: 'Upper Body', exercises: ['Push-ups', 'Bent-over Rows', 'Shoulder Press', 'Tricep Dips'] },
      { focus: 'Core & Conditioning', exercises: ['Russian Twists', 'Leg Raises', 'Bike Sprints', 'Pallof Press'] },
      { focus: 'Active Recovery', exercises: ['Brisk Walk (30 min)', 'Full Body Stretching', 'Light Swimming'] }
    ]
  },
  muscle: {
    label: 'Hypertrophy Split',
    days: [
      { focus: 'Chest & Triceps', exercises: ['Incline Press', 'Flat Dumbbell Press', 'Cable Fly', 'Tricep Pushdown'] },
      { focus: 'Back & Biceps', exercises: ['Lat Pulldown', 'Single-Arm Row', 'Face Pull', 'Bicep Curls'] },
      { focus: 'Legs', exercises: ['Leg Press', 'Walking Lunges', 'Leg Curl', 'Calf Raises'] },
      { focus: 'Shoulders & Arms', exercises: ['Shoulder Press', 'Lateral Raises', 'Skull Crushers', 'Hammer Curls'] },
      { focus: 'Chest & Back', exercises: ['Bench Press', 'Barbell Row', 'Incline Fly', 'Seated Row'] },
      { focus: 'Pump & Core', exercises: ['Cable Crossovers', 'Preacher Curl', 'Hanging Leg Raises', 'Pallof Press'] }
    ]
  },
  fitness: {
    label: 'Balanced Fitness',
    days: [
      { focus: 'Full Body', exercises: ['Goblet Squats', 'Bent-over Rows', 'Shoulder Press', 'Plank'] },
      { focus: 'Lower Body', exercises: ['Back Squats', 'Reverse Lunges', 'Romanian Deadlifts', 'Box Step-ups'] },
      { focus: 'Upper Body', exercises: ['Push-ups', 'Pull-ups', 'Dumbbell Press', 'Lateral Raises'] },
      { focus: 'Cardio & Core', exercises: ['Rowing (15 min)', 'Kettlebell Swings', 'Russian Twists', 'Bicycle Crunches'] },
      { focus: 'Full Body', exercises: ['Kettlebell Circuit', 'Battle Ropes', 'Box Jumps', 'Farmer Carries'] },
      { focus: 'Mobility & Recovery', exercises: ['Yoga Flow', 'Foam Rolling', 'Light Walk'] }
    ]
  }
};

function generatePlan(goal, level, days) {
  const r = ROUTINES[goal];
  const guidance = GUIDANCE[level];
  const schedule = r.days.slice(0, days).map((d, i) => ({
    day: `Day ${i + 1}`,
    focus: d.focus,
    exercises: d.exercises,
    setsReps: guidance
  }));

  return {
    goal: LABELS.goal[goal],
    level: LABELS.level[level],
    days,
    planName: r.label,
    schedule,
    note: 'Warm up 5–10 min each session. Stay hydrated and aim for 7–8 hours of sleep.'
  };
}

module.exports = { generatePlan };