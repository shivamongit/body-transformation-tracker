// ============================================================
//  Body Transformation - Daily Log App (Supabase + Chart.js)
// ============================================================

(function () {
  "use strict";

  const URL = window.SUPABASE_URL;
  const KEY = window.SUPABASE_ANON_KEY;
  const GOAL = window.GOAL_WEIGHT || 80;

  const configured =
    URL && KEY && URL.indexOf("YOUR_SUPABASE") === -1 && KEY.indexOf("YOUR_SUPABASE") === -1;

  // --- Element helpers ---
  const $ = (id) => document.getElementById(id);
  const CHECK_KEYS = ["workout", "protein", "steps", "posture", "diet", "sleep"];

  // --- State ---
  let supabase = null;
  let user = null;
  let isSignup = false;
  let chart = null;
  let logs = []; // all logs, newest first

  // --- Init ---
  function init() {
    if (!configured) {
      $("configWarn").classList.remove("hidden");
      $("authView").classList.add("hidden");
      return;
    }
    supabase = window.supabase.createClient(URL, KEY);
    wireEvents();
    refreshAuthState();

    supabase.auth.onAuthStateChange((_event, session) => {
      user = session ? session.user : null;
      renderAuthOrDash();
    });
  }

  async function refreshAuthState() {
    const { data } = await supabase.auth.getSession();
    user = data.session ? data.session.user : null;
    renderAuthOrDash();
  }

  function renderAuthOrDash() {
    if (user) {
      $("authView").classList.add("hidden");
      $("dashView").classList.remove("hidden");
      $("userEmail").textContent = user.email;
      loadLogs();
    } else {
      $("authView").classList.remove("hidden");
      $("dashView").classList.add("hidden");
    }
  }

  // --- Auth ---
  function wireEvents() {
    $("authToggle").addEventListener("click", () => {
      isSignup = !isSignup;
      $("authTitle").textContent = isSignup ? "📝 Sign Up" : "🔐 Log In";
      $("authSubmit").textContent = isSignup ? "Create Account" : "Log In";
      $("authToggleText").textContent = isSignup ? "Already have an account?" : "No account yet?";
      $("authToggle").textContent = isSignup ? "Log In" : "Sign Up";
      clearMsg("authMsg");
    });

    $("authSubmit").addEventListener("click", handleAuth);
    $("authPassword").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAuth();
    });
    $("logoutBtn").addEventListener("click", async () => {
      await supabase.auth.signOut();
    });
    $("saveLogBtn").addEventListener("click", saveLog);

    // checkbox row toggles
    document.querySelectorAll(".check-item").forEach((item) => {
      const cb = item.querySelector("input[type=checkbox]");
      item.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") cb.checked = !cb.checked;
        item.classList.toggle("done", cb.checked);
      });
      cb.addEventListener("change", () => item.classList.toggle("done", cb.checked));
    });

    $("todayDate").textContent = todayStr();
  }

  async function handleAuth() {
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    if (!email || !password) return msg("authMsg", "Enter email and password.", "error");
    setBtn("authSubmit", true);
    clearMsg("authMsg");

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        msg("authMsg", "Account created! If email confirmation is on, check your inbox. Otherwise you're logged in.", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      msg("authMsg", err.message || "Authentication failed.", "error");
    } finally {
      setBtn("authSubmit", false);
    }
  }

  // --- Data ---
  async function loadLogs() {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .order("log_date", { ascending: false });

    if (error) {
      msg("logMsg", "Could not load logs: " + error.message, "error");
      return;
    }
    logs = data || [];
    fillTodayForm();
    renderStats();
    renderChart();
    renderHistory();
  }

  function fillTodayForm() {
    const today = todayStr();
    const t = logs.find((l) => l.log_date === today);
    $("inWeight").value = t && t.weight != null ? t.weight : "";
    $("inWaist").value = t && t.waist != null ? t.waist : "";
    $("inWorkout").value = t && t.workout_name ? t.workout_name : "";
    $("inNotes").value = t && t.notes ? t.notes : "";
    const checks = (t && t.checks) || {};
    CHECK_KEYS.forEach((k) => {
      const cb = $("ck" + cap(k));
      const item = cb.closest(".check-item");
      cb.checked = !!checks[k];
      item.classList.toggle("done", cb.checked);
    });
  }

  async function saveLog() {
    if (!user) return;
    setBtn("saveLogBtn", true);
    clearMsg("logMsg");

    const checks = {};
    CHECK_KEYS.forEach((k) => (checks[k] = $("ck" + cap(k)).checked));

    const row = {
      user_id: user.id,
      log_date: todayStr(),
      weight: numOrNull($("inWeight").value),
      waist: numOrNull($("inWaist").value),
      workout_name: $("inWorkout").value || null,
      notes: $("inNotes").value || null,
      checks: checks,
    };

    const { error } = await supabase
      .from("daily_logs")
      .upsert(row, { onConflict: "user_id,log_date" });

    if (error) {
      msg("logMsg", "Save failed: " + error.message, "error");
    } else {
      msg("logMsg", "✅ Saved! Keep the streak alive.", "success");
      await loadLogs();
    }
    setBtn("saveLogBtn", false);
  }

  // --- Render ---
  function renderStats() {
    const withWeight = logs.filter((l) => l.weight != null);
    // logs are newest first
    const current = withWeight.length ? withWeight[0].weight : null;
    const start = withWeight.length ? withWeight[withWeight.length - 1].weight : null;

    $("statCurrent").textContent = current != null ? current.toFixed(1) + " kg" : "—";

    if (current != null && start != null) {
      const diff = current - start;
      const el = $("statLost");
      el.textContent = (diff <= 0 ? "" : "+") + diff.toFixed(1) + " kg";
      el.className = "v " + (diff <= 0 ? "" : "warn");
    } else {
      $("statLost").textContent = "—";
    }

    $("statToGoal").textContent =
      current != null ? Math.max(0, current - GOAL).toFixed(1) + " kg" : "—";

    $("statStreak").textContent = workoutStreak();
    $("statWeekWorkouts").textContent = workoutsThisWeek();
  }

  function workoutStreak() {
    // consecutive days (ending today or yesterday) with workout check true
    const done = new Set(
      logs.filter((l) => l.checks && l.checks.workout).map((l) => l.log_date)
    );
    let streak = 0;
    let d = new Date();
    // allow streak to count from today; if today not done, start from yesterday
    if (!done.has(fmt(d))) d.setDate(d.getDate() - 1);
    while (done.has(fmt(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function workoutsThisWeek() {
    const monday = new Date();
    const day = (monday.getDay() + 6) % 7; // 0 = Monday
    monday.setDate(monday.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return logs.filter(
      (l) => l.checks && l.checks.workout && new Date(l.log_date) >= monday
    ).length;
  }

  function renderChart() {
    const data = logs
      .filter((l) => l.weight != null)
      .slice()
      .reverse(); // oldest first for chart
    const labels = data.map((l) => l.log_date.slice(5)); // MM-DD
    const points = data.map((l) => l.weight);

    if (chart) chart.destroy();
    if (!data.length) return;

    const ctx = $("weightChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Weight (kg)",
            data: points,
            borderColor: "#4ade80",
            backgroundColor: "rgba(74,222,128,0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: "#4ade80",
          },
          {
            label: "Goal",
            data: points.map(() => GOAL),
            borderColor: "#60a5fa",
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#888" } } },
        scales: {
          x: { ticks: { color: "#888" }, grid: { color: "#222" } },
          y: { ticks: { color: "#888" }, grid: { color: "#222" } },
        },
      },
    });
  }

  function renderHistory() {
    const body = $("historyBody");
    body.innerHTML = "";
    if (!logs.length) {
      $("noHistory").style.display = "block";
      $("historyTable").style.display = "none";
      return;
    }
    $("noHistory").style.display = "none";
    $("historyTable").style.display = "table";

    logs.slice(0, 30).forEach((l) => {
      const checks = l.checks || {};
      const score = CHECK_KEYS.filter((k) => checks[k]).length;
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + l.log_date + "</td>" +
        "<td>" + (l.weight != null ? l.weight + " kg" : "—") + "</td>" +
        "<td>" + (l.waist != null ? l.waist + " cm" : "—") + "</td>" +
        "<td>" + (l.workout_name || "—") + "</td>" +
        "<td>" + (checks.workout ? "✅" : "—") + "</td>" +
        "<td>" + score + "/6</td>";
      body.appendChild(tr);
    });
  }

  // --- Utils ---
  function todayStr() {
    return fmt(new Date());
  }
  function fmt(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }
  function numOrNull(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }
  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function msg(id, text, type) {
    const el = $(id);
    el.textContent = text;
    el.className = "msg " + type;
  }
  function clearMsg(id) {
    const el = $(id);
    el.textContent = "";
    el.className = "msg";
  }
  function setBtn(id, loading) {
    const el = $(id);
    el.disabled = loading;
    if (loading) {
      el.dataset.text = el.textContent;
      el.textContent = "…";
    } else if (el.dataset.text) {
      el.textContent = el.dataset.text;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
