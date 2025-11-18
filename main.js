let units = [
  { id: 1, name: "Infantry Squad", points: 100, type: "Core" },
  { id: 2, name: "Elite Veterans", points: 180, type: "Elite" },
  { id: 3, name: "Heavy Tank", points: 300, type: "Heavy" },
  { id: 4, name: "Scout Team", points: 70, type: "Core" },
  { id: 5, name: "Artillery Battery", points: 220, type: "Heavy" },
  { id: 6, name: "Commander", points: 150, type: "HQ" }
];

const unitListEl = document.getElementById("unitList");
const rosterListEl = document.getElementById("rosterList");
const totalPointsEl = document.getElementById("totalPoints");
const searchInputEl = document.getElementById("searchInput");
const clearRosterEl = document.getElementById("clearRoster");

let roster = loadRoster();

function loadRoster() {
  const raw = localStorage.getItem("armyRoster");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveRoster() {
  localStorage.setItem("armyRoster", JSON.stringify(roster));
}

async function loadExternalUnits() {
  try {
    const res = await fetch("sources.json", { cache: "no-store" });
    if (!res.ok) return;
    const sources = await res.json();
    if (!Array.isArray(sources) || sources.length === 0) return;
    const lists = await Promise.all(sources.map(async (url) => {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) return [];
        const data = await r.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.units)) return data.units;
        return [];
      } catch { return []; }
    }));
    const merged = lists.flat().map((u, idx) => ({
      id: u.id ?? idx + 1,
      name: u.name ?? u.title ?? "Unit",
      points: u.points ?? u.cost ?? 0,
      type: u.type ?? u.category ?? "Unknown"
    }));
    if (merged.length) units = merged;
  } catch { /* ignore */ }
}

function renderUnits(filter = "") {
  const f = filter.trim().toLowerCase();
  const filtered = f ? units.filter(u => u.name.toLowerCase().includes(f) || u.type.toLowerCase().includes(f)) : units;
  unitListEl.innerHTML = "";
  filtered.forEach(u => {
    const li = document.createElement("li");
    li.className = "item";
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = u.name;
    const pts = document.createElement("span");
    pts.className = "pts";
    pts.textContent = `${u.points} pts`;
    const type = document.createElement("span");
    type.className = "type";
    type.textContent = u.type;
    meta.appendChild(name);
    meta.appendChild(pts);
    meta.appendChild(type);
    const btn = document.createElement("button");
    btn.textContent = "Add";
    btn.onclick = () => addToRoster(u);
    li.appendChild(meta);
    li.appendChild(btn);
    unitListEl.appendChild(li);
  });
}

function renderRoster() {
  rosterListEl.innerHTML = "";
  roster.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.className = "item";
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = entry.name;
    const pts = document.createElement("span");
    pts.className = "pts";
    pts.textContent = `${entry.points} pts`;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `x${entry.qty}`;
    meta.appendChild(name);
    meta.appendChild(pts);
    meta.appendChild(count);
    const btns = document.createElement("div");
    const inc = document.createElement("button");
    inc.textContent = "+";
    inc.onclick = () => changeQty(idx, entry.qty + 1);
    const dec = document.createElement("button");
    dec.textContent = "-";
    dec.onclick = () => changeQty(idx, entry.qty - 1);
    const rm = document.createElement("button");
    rm.textContent = "Remove";
    rm.onclick = () => removeFromRoster(idx);
    btns.appendChild(inc);
    btns.appendChild(dec);
    btns.appendChild(rm);
    li.appendChild(meta);
    li.appendChild(btns);
    rosterListEl.appendChild(li);
  });
  const total = roster.reduce((sum, e) => sum + e.points * e.qty, 0);
  totalPointsEl.textContent = String(total);
}

function addToRoster(unit) {
  const i = roster.findIndex(e => e.id === unit.id);
  if (i >= 0) roster[i].qty += 1;
  else roster.push({ id: unit.id, name: unit.name, points: unit.points, qty: 1 });
  saveRoster();
  renderRoster();
}

function changeQty(idx, qty) {
  if (qty <= 0) { removeFromRoster(idx); return; }
  roster[idx].qty = qty;
  saveRoster();
  renderRoster();
}

function removeFromRoster(idx) {
  roster.splice(idx, 1);
  saveRoster();
  renderRoster();
}

searchInputEl.addEventListener("input", e => renderUnits(e.target.value));
clearRosterEl.addEventListener("click", () => { roster = []; saveRoster(); renderRoster(); });

loadExternalUnits().finally(() => {
  renderUnits("");
  renderRoster();
});