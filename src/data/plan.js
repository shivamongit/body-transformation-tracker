// Personalized transformation plan content (structured for the React UI).

export const profile = {
  startWeight: 94,
  goalWeight: 80,
  height: "6'1\" (185 cm)",
  age: 26,
  bmi: 27.5,
  bodyFat: "~26%",
};

export const priorities = [
  { rank: 1, issue: "Central body fat (~26%)", level: "red", why: "Soft midsection, no ab definition. Drives everything visual.", fix: "Calorie deficit + 180-200g protein" },
  { rank: 2, issue: "Anterior pelvic tilt + protruding belly", level: "red", why: "Posture pushes the gut out — part of the 'belly' is fixable fast.", fix: "Glutes, core, hip-flexor stretch" },
  { rank: 3, issue: "Flat / underdeveloped chest", level: "red", why: "Weakest visible muscle. A built chest = athletic look.", fix: "Incline press priority + flyes" },
  { rank: 4, issue: "No back width (no V-taper)", level: "red", why: "Waist & shoulders near same width = blocky.", fix: "Pull-ups + lat pulldowns + rows" },
  { rank: 5, issue: "Rounded shoulders + forward head", level: "yellow", why: "Makes you look smaller. Fast to fix.", fix: "Face pulls + band pull-aparts + chin tucks" },
  { rank: 6, issue: "Narrow delts", level: "yellow", why: "Wide delts make a physique look impressive in clothes.", fix: "Lateral raises, high volume" },
  { rank: 7, issue: "Thin arms (bi + tri)", level: "yellow", why: "Visible in t-shirts. Responds fast.", fix: "Curls + tricep work 2-3x/week" },
];

export const roadmap = [
  { month: "Month 1", target: "90-91 kg", milestone: "Belly visibly flatter (fat + posture). Face leaner. Gym habit locked in." },
  { month: "Month 2", target: "86-88 kg", milestone: "Shoulder/arm definition appearing. Chest firming. V-taper starting." },
  { month: "Month 3", target: "83-85 kg", milestone: "Clear V-taper. Chest/back/arms defined. Upper abs showing." },
  { month: "Month 4", target: "80-82 kg", milestone: "Defined midsection + abs outline. Athletic V-taper. Lean face. Corrected posture." },
];

export const principles = [
  { k: "Weekly volume", v: "10-20 hard sets per muscle/week", why: "Graded dose-response up to ~20 sets (Schoenfeld; Jukic 2024)." },
  { k: "Frequency", v: "Each muscle 2x/week", why: "Twice-weekly ranks highest for hypertrophy (BJSM 2023)." },
  { k: "Intensity", v: "Stop 1-2 reps short of failure; last isolation set to failure", why: "Proximity to failure drives growth." },
  { k: "Rest", v: "2-3 min compounds, 60-90s isolation", why: "Preserves volume/strength per set." },
  { k: "Progression", v: "Double progression: hit top of range → +2.5kg", why: "Progressive overload is THE driver." },
  { k: "Deload", v: "Every 6-8 weeks cut volume ~50% for a week", why: "Manages fatigue, prevents stalls." },
  { k: "Protein (deficit)", v: "2.0-2.2 g/kg (~180-200g)", why: "Longland 2016: +1.2kg lean, -4.8kg fat in 4 wks." },
];

export const workouts = {
  "Month 1 — Upper/Lower (4 days)": [
    { day: "Monday — Upper A (Chest & Back)", items: ["Incline DB Press 4x10", "Lat Pulldown 4x12", "Flat DB Press 3x12", "Seated Cable Row 3x12", "Lateral Raises 4x15", "Face Pulls 3x20", "Cable Crunch 3x15"] },
    { day: "Tuesday — Lower (maintenance)", items: ["Squats 3x10", "Romanian Deadlift 3x10", "Leg Press 3x12", "Leg Curls 3x12", "Hip Thrusts 3x12", "Calf Raises 4x15"] },
    { day: "Thursday — Upper B (Shoulders & Arms)", items: ["DB Shoulder Press 4x10", "Lat Pulldown 4x10", "Lateral Raises 4x15", "Chest-Supported Row 3x12", "Incline Curls 3x12", "Rope Pushdowns 3x15", "Rear Delt Flyes 3x20"] },
    { day: "Friday — Upper C (Chest & Arms)", items: ["Flat Bench 4x8", "Cable Flyes 3x15", "Pull-ups 4x8", "Barbell Curls 4x10", "Close-Grip Bench/Dips 4x10", "Hammer Curls 3x12", "Hanging Leg Raises 3x15"] },
  ],
  "Month 2-4 — Push/Pull/Legs (6 days)": [
    { day: "Monday — Push A (Heavy Chest)", items: ["Incline Barbell 4x6-8", "Flat DB Press 3x8-10", "DB Shoulder Press 3x8-10", "Cable Flyes 3x12-15", "Lateral Raises 4x12-15", "OH Tricep Ext 3x10-12"] },
    { day: "Tuesday — Pull A (Width)", items: ["Pull-ups/Pulldown 4x8-10", "Chest-Supported Row 3x10-12", "Straight-Arm Pulldown 3x12-15", "Face Pulls 3x15-20", "Incline Curls 3x10-12", "Hammer Curls 2x12-15"] },
    { day: "Wednesday — Legs", items: ["Squats 4x8", "Romanian Deadlift 4x10", "Bulgarian Split Squat 3x10", "Hip Thrusts 4x12", "Leg Curls 3x12", "Calf Raises 5x15"] },
    { day: "Thursday — Push B (Delt Focus)", items: ["DB Shoulder Press 4x8-10", "Incline DB Press 3x10-12", "Lateral Raises 5x15-20", "Pec Deck 3x12-15", "Rope Pushdowns 3x12-15", "OH Tricep Ext 3x12"] },
    { day: "Friday — Pull B (Thickness)", items: ["Barbell Row 4x8", "Close-Grip Pulldown 3x10-12", "Single-Arm Row 3x10", "Rear Delt Flyes 3x15-20", "Barbell Curls 3x8-10", "Cable Curls 2x12-15"] },
    { day: "Saturday — Arms + Abs + Finishers", items: ["DB Pullover 2x15 + push-up burnout", "Lateral raise drop-set", "Straight-arm pulldown 3x20", "21s curls + tricep superset", "Hanging leg raises + plank + vacuum"] },
  ],
};

export const diet = {
  macros: [
    { num: "1900-2200", label: "Calories/day (deficit)" },
    { num: "180-200g", label: "Protein (2.0-2.2 g/kg)" },
    { num: "180-220g", label: "Carbs" },
    { num: "50-60g", label: "Fats" },
    { num: "3.5-4L", label: "Water" },
  ],
  meals: [
    { time: "7:30 AM — Breakfast", food: "4 egg whites + 2 whole eggs • oats/2 slices whole-wheat bread • 1 banana • green tea" },
    { time: "11:00 AM — Snack", food: "Whey shake OR Greek yogurt + handful of nuts" },
    { time: "1:30 PM — Lunch", food: "2 roti + 150g chicken/paneer/dal • big bowl of sabzi • salad • curd" },
    { time: "5:00 PM — Pre/Post Snack", food: "Fruit + roasted chana OR sprouts" },
    { time: "8:30 PM — Dinner", food: "150-200g protein • veggies/stir-fry • small portion rice or 1 roti" },
  ],
};
