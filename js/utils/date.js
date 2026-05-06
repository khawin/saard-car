export function formatDate(dateString) {
    const date = new Date(dateString);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear() + 543;
    return `${d}/${m}/${y}`;
}

export function getDateParts(dateString) {
    const date = new Date(dateString);
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return {
        d: date.getDate(),
        m: thaiMonths[date.getMonth()],
        y: date.getFullYear() + 543,
        t: `${date.getHours().toString().padStart(2,'0')}.${date.getMinutes().toString().padStart(2,'0')}`
    };
}

export function initDateSelectors() {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const startYearCE = 2026;
    const endYearCE = 2037;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthOpts = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    let yearOpts = '';
    for (let i = startYearCE; i <= endYearCE; i++) yearOpts += `<option value="${i}">${i + 543}</option>`;

    const mSel = document.getElementById('usage-month');
    const ySel = document.getElementById('usage-year');
    if (mSel && ySel) {
        mSel.innerHTML = monthOpts;
        ySel.innerHTML = yearOpts;
        mSel.value = currentMonth;
        ySel.value = (currentYear >= startYearCE && currentYear <= endYearCE) ? currentYear : startYearCE;
    }
}
