import { store } from '../state/store.js';
import { getVehicleIcon, getBookingFullName } from '../utils/format.js';

export function changeTimelineDate(offset) {
    let currentStr = document.getElementById('timeline-date').value;
    if (!currentStr) return;
    let d = new Date(currentStr);
    d.setDate(d.getDate() + offset);
    store.fpTimeline.setDate(d);
    renderTimeline();
}

export function renderTimeline() {
    const dateInput = document.getElementById('timeline-date').value;
    const filterType = document.getElementById('timeline-filter-type').value;
    if (!dateInput) return;
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';
    const selectedDateStart = new Date(dateInput); selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(dateInput); selectedDateEnd.setHours(23, 59, 59, 999);

    let displayVehicles = store.dataVehicles;
    if (filterType !== 'all') displayVehicles = displayVehicles.filter(v => v.type === filterType);
    if (displayVehicles.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-10 bg-white rounded-xl border border-gray-100"><i class="fas fa-car-side text-4xl mb-3 text-gray-200 block"></i>ไม่มีรถในหมวดหมู่นี้</div>`;
        return;
    }

    displayVehicles.forEach(v => {
        const dayBookings = store.dataBookings.filter(b => {
            const bStart = new Date(b.startDateTime); const bEnd = new Date(b.endDateTime);
            const overlap = (bStart < selectedDateEnd && bEnd > selectedDateStart);
            if (!overlap) return false;
            if (b.status === 'approved' && b.vehicleId === v.id) return true;
            if (b.status === 'pending' && b.requestedType === v.type) return true;
            return false;
        });

        let barsHtml = '';
        dayBookings.forEach(b => {
            const bStart = new Date(b.startDateTime); const bEnd = new Date(b.endDateTime);
            const dayStart = selectedDateStart.getTime(); const dayEnd = selectedDateEnd.getTime(); const totalDay = 24 * 60 * 60 * 1000;
            const actualStart = Math.max(bStart.getTime(), dayStart); const actualEnd = Math.min(bEnd.getTime(), dayEnd);
            const startPct = ((actualStart - dayStart) / totalDay) * 100; const widthPct = ((actualEnd - actualStart) / totalDay) * 100;
            const segClass = b.status === 'pending' ? 'segment-pending' : 'segment-approved';

            const timeRange = `${bStart.getHours().toString().padStart(2,'0')}:${bStart.getMinutes().toString().padStart(2,'0')} - ${bEnd.getHours().toString().padStart(2,'0')}:${bEnd.getMinutes().toString().padStart(2,'0')}`;
            barsHtml += `<div class="timeline-segment ${segClass} rounded-sm" style="left: ${startPct}%; width: ${widthPct}%;" title="${b.status === 'pending' ? 'รออนุมัติ' : 'อนุมัติแล้ว'}&#10;ผู้ขอ: ${getBookingFullName(b)}&#10;เวลา: ${timeRange}"></div>`;
        });

        const iconClass = getVehicleIcon(v.type);
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow";
        card.innerHTML = `<div class="flex justify-between items-center mb-1"><div class="flex items-center gap-2"><i class="fas ${iconClass} text-blue-400"></i><span class="font-bold text-gray-800">${v.name}</span></div><span class="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded">${v.plate}</span></div><div class="timeline-bar">${barsHtml}</div><div class="time-scale font-medium"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>`;
        container.appendChild(card);
    });
}
