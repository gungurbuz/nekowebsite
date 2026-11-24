// The clock and the last row's time are live; the menu itself is plain HTML links.
const timeFmt = new Intl.DateTimeFormat("de-DE", {
	timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false,
});

const LAST_ROW_OFFSET_MIN = 12; // the last row always shows "now + this many minutes"

function renderClock() {
	const [h, m] = timeFmt.format(new Date()).split(":");
	const clock = document.getElementById("clock");
	clock.textContent = "";
	const colon = document.createElement("span");
	colon.className = "colon";
	colon.textContent = ":";
	clock.append(h, colon, m);

	const last = document.getElementById("last-when");
	if (last) {
		last.textContent = timeFmt.format(new Date(Date.now() + LAST_ROW_OFFSET_MIN * 60000));
	}
}

renderClock();
setInterval(renderClock, 1000);
