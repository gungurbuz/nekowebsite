const WORKER_URL = "https://trias-check.gunguneypro.workers.dev";

// Random messages that scroll after the real status. Add, remove or edit as you like.
const MESSAGES = [
	"Dieser Zug hält nicht an Sorgen",
	"Heute im Angebot: Döner mit alles im Bordbistro",
	"Bitte nicht mit dem Zugführer sprechen, er ist auch müde",
    "Fährt heute ohne Halt an Ihrem Bahnhof",
    "Deutschlandticket gilt heute nur unter Vorbehalt",
    "Heute nur Lokomotive – Bitte nicht einsteigen",
    "Heute ohne Triebfahrzeug – Zugkräftige Fahrgäste melden sich bitte beim Zugchef",
    "Heute ohne Zug – Wegbeschreibungen für Fußgänger erhalten Sie an der DB Reisezentrum",
    "Heute ohne Sie – Alle anderen Fahrgäste, bitte einsteigen",
    "Verkehrt heute als S-Bahn Südwest – Haltewünsche bitte beim Zugpersonal anmelden",
    "Verkehrt heute als Leerfahrt – Bitte nicht einsteigen",
    "Abfahrt heute zu unbestimmter Zeit – Bitte informieren Sie sich durch innere Einkehr",
    "Heute von einem Gleis"
];

const SCROLL_SPEED = 80; // pixels per second

// Fake trains. Each destination has its own via points, listed in route order
// (nearest first), so a random pick always makes sense.
// "trains" are the train types that run there, with a number range for each.
const MAX_VIA = 3; // show at most this many via points

const TRAINS = [
	{
		dest: "Stuttgart Hbf",
		via: ["Pforzheim Hbf", "Mühlacker", "Vaihingen (Enz)", "Bietigheim-Bissingen"],
		trains: [{ type: "RE", min: 19000, max: 19999 }],
	},
	{
		dest: "Basel Bad Bf",
		via: ["Rastatt", "Baden-Baden", "Offenburg", "Freiburg(Brsg) Hbf"],
		trains: [{ type: "ICE", min: 100, max: 999 }, { type: "IC", min: 1940, max: 2000 }],
	},
	{
		dest: "Zürich HB",
		via: ["Baden-Baden", "Offenburg", "Freiburg(Brsg) Hbf", "Basel Bad Bf"],
		trains: [{ type: "IC", min: 2000, max: 2999 }, { type: "ICE", min: 100, max: 999 }],
	},
	{
		dest: "Heidelberg Hbf",
		via: ["Bruchsal", "Wiesloch-Walldorf"],
		trains: [{ type: "RE", min: 4000, max: 4999 }, { type: "RB", min: 38000, max: 38999 }],
	},
	{
		dest: "Frankfurt(Main)Hbf",
		via: ["Bruchsal", "Heidelberg Hbf", "Darmstadt Hbf"],
		trains: [{ type: "ICE", min: 100, max: 999 }, { type: "IC", min: 2000, max: 2999 }],
	},
	{
		dest: "Neustadt(Weinstr)Hbf",
		via: ["Wörth(Rhein)", "Winden(Pfalz)", "Landau(Pfalz)Hbf"],
		trains: [{ type: "RE", min: 5000, max: 5999 }, { type: "RB", min: 39000, max: 39999 }],
	},
	{
		dest: "Pforzheim Hbf",
		via: ["Durlach", "Wilferdingen-Singen"],
		trains: [{ type: "RB", min: 31000, max: 31999 }, { type: "RE", min: 19000, max: 19999 }],
	},
    {
        dest: "Karlsruhe Hbf",
        via: ["Durlach", "Wilferdingen-Singen", "Pforzheim Hbf"],
        trains: [{ type: "RB", min: 31000, max: 31999 }, { type: "RE", min: 19000, max: 19999 }],
    },
];

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

// Picks a destination, a train type and number that run there, and
// 1 to MAX_VIA of its via points (kept in route order)
function pickTrain() {
	const t = pick(TRAINS);
	const kind = pick(t.trains);
	const count = Math.min(randInt(1, MAX_VIA), t.via.length);

	const order = t.via.map((_, i) => i);
	for (let i = order.length - 1; i > 0; i--) {          // shuffle
		const j = randInt(0, i);
		[order[i], order[j]] = [order[j], order[i]];
	}
	const chosen = order.slice(0, count).sort((a, b) => a - b); // back into route order

	document.getElementById("dest").textContent = t.dest;
	document.getElementById("train").textContent = kind.type + " " + randInt(kind.min, kind.max);
	document.getElementById("via").textContent = "via " + chosen.map((i) => t.via[i]).join(", ");
}

const display = document.getElementById("display");
const tickerText = document.getElementById("ticker-text");
const statusSr = document.getElementById("status-sr");
const sched = document.getElementById("sched");
const delayBox = document.getElementById("delay");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let statusMsg = "checking...";
let lastMessage = -1;

// "07:45" + 4 minutes -> "07:49"
function addMinutes(hm, mins) {
	const [h, m] = hm.split(":").map(Number);
	const t = (h * 60 + m + mins) % 1440;
	return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
}

// A random message, never the same one twice in a row
function pickMessage() {
	if (MESSAGES.length === 0) return "";
	let i;
	do {
		i = Math.floor(Math.random() * MESSAGES.length);
	} while (MESSAGES.length > 1 && i === lastMessage);
	lastMessage = i;
	return MESSAGES[i];
}

// Builds the ticker text and restarts the scroll with a matching speed
function setTicker() {
	// When idle, only the status scrolls (no random messages)
	const idle = display.classList.contains("state-idle");
	const msg = (reduceMotion.matches || idle) ? "" : pickMessage();
	let text = statusMsg ? "+++ " + statusMsg + " +++" : "+++";
	if (msg) text += " " + msg + " +++";
	if (!statusMsg && !msg) text = "";   // nothing to show: empty strip
	tickerText.textContent = text;

	if (reduceMotion.matches || !text) return;
	tickerText.style.animation = "none";
	void tickerText.offsetWidth;           // restart the animation
	tickerText.style.animation = "";
	tickerText.style.animationDuration = (tickerText.scrollWidth / SCROLL_SPEED) + "s";
}

// After every full pass, show a new random message
tickerText.addEventListener("animationiteration", setTicker);

// The placeholder train is invisible on an empty board, so hide it from screen readers too
function setBoardEmpty(empty) {
	document.querySelectorAll(".time-cell, .via, .platform, .dest").forEach((el) => {
		if (empty) el.setAttribute("aria-hidden", "true");
		else el.removeAttribute("aria-hidden");
	});
}

function render(data) {
	let state = "unknown";
	let msg = "Evtl. Verspätung – Dauer unbestimmt";
	let srMsg = null;   // what screen readers hear, if different from the ticker text
	delayBox.hidden = true;

	if (data.status === "ok") {
		state = "ok";
		msg = "";   // on time: nothing about it in the ticker, only the random messages
		srMsg = data.final ? "on time" : "on track, no delay expected";
	} else if (data.status === "late") {
		state = "late";
		msg = "Verspätet ca. +" + data.minutes + " Min.";
		const expected = addMinutes(sched.dataset.time, data.minutes);
		delayBox.textContent = expected;
		delayBox.setAttribute("aria-label", "expected " + expected);
		delayBox.hidden = false;
	} else if (data.status === "idle") {
		state = "idle";   // platform.css blanks the text on the board for this state
		msg = "Betriebsschluss";
	}

	display.className = "display state-" + state;
	setBoardEmpty(state === "idle");

	if (srMsg === null) srMsg = msg;
	if (statusSr.textContent !== srMsg) statusSr.textContent = srMsg;

	// Only restart the ticker when the status text changed
	if (msg !== statusMsg) {
		statusMsg = msg;
		setTicker();
	}
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

// Keep the board empty until the first answer arrives, so the placeholder
// train doesn't flash up for a moment when the real state is "idle"
display.className = "display state-loading";
setBoardEmpty(true);

pickTrain();
setTicker();
refresh();
setInterval(refresh, 60000);
