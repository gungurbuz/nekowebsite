const WORKER_URL = "https://trias-check.gunguneypro.workers.dev";
const statusEl = document.getElementById("status");

function render(data) {
    if (data.status === "ok") {
        statusEl.textContent = data.final ? "made it!" : "on track so far";
    } else if (data.status === "late") {
        statusEl.textContent = "late by +" + data.minutes + " min";
    } else if (data.status === "idle") {
        statusEl.textContent = "not commuting right now";
    } else {
        statusEl.textContent = "can't tell right now";
    }
}

async function refresh() {
    try {
        const res = await fetch(WORKER_URL);
        if (!res.ok) throw new Error("HTTP " + res.status);
        render(await res.json());
    } catch (e) {
        statusEl.textContent = "can't tell right now";
    }
}

refresh();
setInterval(refresh, 60000);