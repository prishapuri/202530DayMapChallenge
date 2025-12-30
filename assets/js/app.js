// Vanilla Graphic Wall
// - Loads data/graphics.json
// - Randomizes tile order on load
// - Filters via a single search bar (title/category/tags/year)
// - Click opens interactive URL if present, otherwise the image URL

let ALL = [];

const grid = document.getElementById("grid");
const q = document.getElementById("q");

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function matches(item, query) {
  if (!query) return true;

  const haystack = [
    item.title || "",
    item.category || "",
    String(item.year || ""),
    ...(Array.isArray(item.tags) ? item.tags : [])
  ].join(" ");

  return normalize(haystack).includes(query);
}

function targetUrl(item) {
  return item.interactive || item.image;
}

// Fisher–Yates shuffle (in-place)
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function render() {
  const query = normalize(q.value);
  const items = ALL.filter(d => matches(d, query));

  grid.innerHTML = "";

  for (const d of items) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");

    const label = d.title ? `Open: ${d.title}` : "Open graphic";
    card.setAttribute("aria-label", label);

    const img = document.createElement("img");
    img.src = d.image;
    img.loading = "lazy";
    img.alt = d.alt || d.title || "Graphic";

    img.onerror = () => {
      card.innerHTML = "";
      const box = document.createElement("div");
      box.className = "broken";
      box.textContent = d.title
        ? `Image failed to load: ${d.title}`
        : "Image failed to load";
      card.appendChild(box);
    };

    card.appendChild(img);

    const url = targetUrl(d);

    card.addEventListener("click", () => {
      window.open(url, "_blank", "noopener");
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.open(url, "_blank", "noopener");
      }
    });

    grid.appendChild(card);
  }
}

async function init() {
  const res = await fetch("data/graphics.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load data/graphics.json (${res.status})`);

  const data = await res.json();
  ALL = Array.isArray(data) ? data : [];

  // Randomize once per page load
  shuffleInPlace(ALL);

  render();
}

q.addEventListener("input", render);

init().catch((err) => {
  console.error(err);
  grid.innerHTML = "";
  const msg = document.createElement("div");
  msg.className = "broken";
  msg.textContent = "Could not load graphics.json. Check console and file paths.";
  grid.appendChild(msg);
});
