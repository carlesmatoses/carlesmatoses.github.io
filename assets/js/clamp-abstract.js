// Card abstracts are clamped to 4 lines by CSS (.abstract-text max-height).
// When the text overflows that height, we add `.is-truncated` to the wrapper so
// a separate "…" line appears beneath the 4th line. Runs on load, on resize, and
// when a Bootstrap tab is shown (hidden tab panes measure as zero height until
// they become visible).
(function () {
    function updateOne(text) {
        var container = text.closest('.abstract-content');
        if (!container) return;
        container.classList.remove('is-truncated');
        if (text.scrollHeight - text.clientHeight > 1) {
            container.classList.add('is-truncated');
        }
    }

    function updateAll() {
        document.querySelectorAll('.abstract-text').forEach(updateOne);
    }

    window.addEventListener('load', updateAll);
    window.addEventListener('resize', updateAll);
    // Bootstrap fires this on the tab trigger; it bubbles to document.
    document.addEventListener('shown.bs.tab', updateAll);
})();
