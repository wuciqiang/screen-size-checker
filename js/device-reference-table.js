(function () {
    'use strict';

    function init(root) {
        const search = root.querySelector('[data-drt-search]');
        const manufacturer = root.querySelector('[data-drt-manufacturer]');
        const reset = root.querySelector('[data-drt-reset]');
        const count = root.querySelector('[data-drt-count]');
        const noResults = root.querySelector('[data-drt-no-results]');
        const rows = Array.from(root.querySelectorAll('[data-device-row]'));

        Array.from(new Set(rows.map(row => {
            const text = row.querySelector('.drt-manufacturer')?.textContent.trim();
            return text || '';
        }).filter(Boolean))).sort((a, b) => a.localeCompare(b)).forEach(name => {
            const option = document.createElement('option');
            option.value = name.toLocaleLowerCase();
            option.textContent = name;
            manufacturer.appendChild(option);
        });

        function applyFilters() {
            const query = search.value.trim().toLocaleLowerCase();
            const selectedManufacturer = manufacturer.value;
            let visible = 0;
            rows.forEach(row => {
                const matches = row.dataset.search.includes(query)
                    && (!selectedManufacturer || row.dataset.search.startsWith(selectedManufacturer));
                row.hidden = !matches;
                if (matches) visible += 1;
            });
            count.textContent = String(visible);
            noResults.hidden = visible !== 0;
        }

        search.addEventListener('input', applyFilters);
        manufacturer.addEventListener('change', applyFilters);
        reset.addEventListener('click', () => {
            search.value = '';
            manufacturer.value = '';
            applyFilters();
            search.focus();
        });
        root.querySelector('.drt-controls').hidden = false;
    }

    document.querySelectorAll('[data-device-reference]').forEach(init);
}());
