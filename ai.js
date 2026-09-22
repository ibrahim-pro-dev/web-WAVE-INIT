const { generatePlan } = require('./workout-planner');

const AI_TIMEOUT_MS = 20000;

// Generate a workout plan. Calls the configured AI API when a key is present;
// otherwise (or on any API failure) transparently falls back to local templates.
async function generateWorkoutPlan({ goal, level, days }) {
  const local = generatePlan(goal, level, days);

  if (!process.env.AI_API_KEY) {
    console.log('[AI] No AI_API_KEY configured — using local coach templates.');
    return { source: 'local', ...local };
  }

  try {
    const plan = await callAI({ goal, level, days });
    plan.schedule = (plan.schedule || []).slice(0, days);
    return { source: 'ai', ...plan };
  } catch (err) {
    console.error('[AI] Failed, falling back to local templates:', err.message);
    return { source: 'local', ...local };
  }
}

async function callAI({ goal, level, days }) {
  const base = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const key = process.env.AI_API_KEY;

  const system = 'You are a professional fitness coach. Reply ONLY with valid JSON. No markdown, no comments, no extra text.';
  const user = `Create a ${days}-day weekly workout plan.
- Fitness goal: ${goal}
- Experience level: ${level}
- Training days per week: ${days}

Return JSON in exactly this shape:
{
  "goal": "<short display name of the goal>",
  "level": "<short display name of the level>",
  "days": ${days},
  "schedule": [
    {
      "day": "Day 1",
      "focus": "<muscle group or training focus>",
      "exercises": ["<exercise 1>", "<exercise 2>", "<exercise 3>", "<exercise 4>"],
      "setsReps": "<concise sets and repetitions guidance>"
    }
  ],
  "note": "<one short tip about warm-up, hydration or rest>"
}
Keep every field short. Use up to 4 exercises per day.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI API responded ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error('AI API returned an empty response.');

  const parsed = extractJSON(content);
  return validate(parsed);
}

function extractJSON(content) {
  try {
    return JSON.parse(content);
  } catch (_) {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response was not valid JSON.');
  }
}

function validate(parsed) {
  const schedule = Array.isArray(parsed.schedule) ? parsed.schedule.slice(0, 7) : [];
  if (schedule.length < 3) throw new Error('AI plan did not include a full weekly schedule.');

  const clean = schedule.map((d, i) => ({
    day: (typeof d.day === 'string' && d.day.trim()) ? String(d.day).trim() : `Day ${i + 1}`,
    focus: (typeof d.focus === 'string' && d.focus.trim()) ? String(d.focus).trim() : 'Full Body',
    exercises: (Array.isArray(d.exercises) ? d.exercises : []).map(String).filter((x) => x.trim()).slice(0, 4),
    setsReps: (typeof d.setsReps === 'string' && d.setsReps.trim()) ? String(d.setsReps).trim() : '3 sets x 10 reps'
  }));

  if (clean.some((d) => d.exercises.length === 0)) throw new Error('AI plan is missing exercises.');

  return {
    goal: (typeof parsed.goal === 'string' && parsed.goal.trim()) ? String(parsed.goal).trim() : 'Fitness',
    level: (typeof parsed.level === 'string' && parsed.level.trim()) ? String(parsed.level).trim() : 'Intermediate',
    days: clean.length,
    planName: 'AI Generated',
    schedule: clean,
    note: (typeof parsed.note === 'string' && parsed.note.trim()) ? String(parsed.note).trim() : 'Warm up 5–10 min and stay hydrated.'
  };
}

module.exports = { generateWorkoutPlan };