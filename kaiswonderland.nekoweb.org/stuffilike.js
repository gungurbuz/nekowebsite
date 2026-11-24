// Shows one enka.network window at a time and hides the others.
// Loaded with `defer`, so the buttons already exist when this runs.
function show(id) {
	document.querySelectorAll('#enkapages .window').forEach(function (w) {
		w.hidden = (w.id !== id);
	});
	document.querySelectorAll('[data-target]').forEach(function (btn) {
		btn.setAttribute('aria-pressed', String(btn.dataset.target === id));
	});
}

document.querySelectorAll('[data-target]').forEach(function (btn) {
	btn.addEventListener('click', function () {
		show(btn.dataset.target);
	});
});
