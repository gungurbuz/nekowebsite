const WORKER_URL = "https://trias-check.gunguneypro.workers.dev";

const display = document.getElementById("display");
const ticker = document.getElementById("ticker");
const tickerText = document.getElementById("ticker-text");
const sched = document.getElementById("sched");
const delayBox = document.getElementById("delay");

// "07:45" + 4 minutes -> "07:49"
function addMinutes(hm, mins) {
	const [h, m] = hm.split(":").map(Number);
	const t = (h * 60 + m + mins) % 1440;
	return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
}

// Scroll the strip only if the text is wider than it
function fitTicker() {
	ticker.classList.remove("scroll");
	if (tickerText.scrollWidth > ticker.clientWidth) {
		ticker.classList.add("scroll");
	}
}

function render(data) {
	let state = "unknown";
	let text = "+++ can't tell right now +++";
	delayBox.hidden = true;

	if (data.status === "ok") {
		state = "ok";
		text = data.final ? "+++ made it +++" : "+++ on track so far +++";
	} else if (data.status === "late") {
		state = "late";
		text = "+++ late by +" + data.minutes + " min +++";
		const expected = addMinutes(sched.dataset.time, data.minutes);
		delayBox.textContent = expected;
		delayBox.setAttribute("aria-label", "expected " + expected);
		delayBox.hidden = false;
	} else if (data.status === "idle") {
		state = "idle";
		text = "+++ not commuting right now +++";
	}

	display.className = "display state-" + state;
	tickerText.textContent = text;
	fitTicker();
}

async function refresh() {
	try {
		const res = await fetch(WORKER_URL);
		if (!res.ok) throw new Error("HTTP " + res.status);
		render(await res.json());
	} catch (e) {
		render({ status: "unknown" });
	}
}

window.addEventListener("resize", fitTicker);
refresh();
setInterval(refresh, 60000);
