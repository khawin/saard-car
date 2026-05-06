import { store, ITEMS_PER_PAGE } from '../state/store.js';
import { formatDate } from '../utils/date.js';
import { getBookingFullName, createPaginationHTML } from '../utils/format.js';

export function renderBookingsTable() {
    const tbody = document.getElementById('table-body');
    const mobileContainer = document.getElementById('mobile-card-container');
    const pagContainer = document.getElementById('bookings-pagination');

    tbody.innerHTML = ''; mobileContainer.innerHTML = ''; pagContainer.innerHTML = '';

    if (store.curBookingsData.length === 0) {
        const msg = `<div class="text-center py-10 text-gray-400">ไม่มีข้อมูลรายการ</div>`;
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400 bg-white/50">ไม่มีข้อมูลรายการ</td></tr>`;
        mobileContainer.innerHTML = msg;
        return;
    }

    const startIndex = (store.curPageBookings - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayData = store.curBookingsData.slice(startIndex, endIndex);

    displayData.forEach(b => {
        let statusBadge = '', actionBtn = '';
        if (b.status === 'pending') {
            statusBadge = `<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">รออนุมัติ</span>`;
            actionBtn = store.currentUser.role === 'admin' ? `<button onclick="openApproval('${b.id}')" class="text-white bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-lg text-sm shadow-md transition">พิจารณา</button>` : `<span class="text-gray-400 text-sm">-</span>`;
        } else if (b.status === 'approved') {
            statusBadge = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">อนุมัติ</span>`;
            actionBtn = `<div class="flex gap-1 justify-center"><button onclick="printSinglePDF('${b.id}')" class="text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 text-xs font-bold shadow-sm transition">PDF</button>${store.currentUser.role === 'admin' ? `<button onclick="openApproval('${b.id}')" class="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded border text-xs transition">แก้ไข</button>` : ''}</div>`;
        } else {
            statusBadge = `<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">ไม่อนุมัติ</span>`;
            actionBtn = `<div class="flex gap-1 justify-center"><button onclick="printSinglePDF('${b.id}')" class="text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 text-xs font-bold shadow-sm transition">PDF</button>${store.currentUser.role === 'admin' ? `<button onclick="openApproval('${b.id}')" class="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded border text-xs transition">แก้ไข</button>` : ''}</div>`;
        }

        const startStr = `${formatDate(b.startDateTime)} ${new Date(b.startDateTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}`;
        const endStr = `${formatDate(b.endDateTime)} ${new Date(b.endDateTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}`;
        const fullName = getBookingFullName(b);

        tbody.insertAdjacentHTML('beforeend', `
        <tr class="transition hover:bg-blue-50/30 border-b border-gray-50">
            <td class="text-left text-gray-700 rounded-l-lg">${formatDate(b.created_at)}</td>
            <td class="text-left font-medium text-gray-800">${fullName}</td>
            <td class="text-left">
                <div class="text-gray-800">${b.location}</div>
                <div class="text-xs text-gray-500 truncate w-48">${b.purpose}</div>
            </td>
            <td class="text-left text-gray-700">${b.requestedType}</td>
            <td class="text-left text-sm">
                <div class="flex flex-col"><span class="text-gray-800">${startStr}</span><span class="text-gray-500 text-xs">ถึง ${endStr}</span></div>
            </td>
            <td class="text-center">${statusBadge}</td>
            <td class="text-center rounded-r-lg">${actionBtn}</td>
        </tr>`);

        mobileContainer.insertAdjacentHTML('beforeend', `<div class="mobile-card"><div class="flex justify-between items-start mb-3"><div class="text-xs text-gray-500">${formatDate(b.created_at)}</div><div>${statusBadge}</div></div><div class="mobile-card-row"><span class="mobile-card-label">ผู้ขอ:</span><span class="mobile-card-value">${fullName}</span></div><div class="mobile-card-row"><span class="mobile-card-label">สถานที่:</span><span class="mobile-card-value">${b.location}</span></div><div class="mobile-card-row"><span class="mobile-card-label">ประเภท:</span><span class="mobile-card-value text-gray-700">${b.requestedType}</span></div><div class="mobile-card-row"><span class="mobile-card-label">เวลา:</span><span class="mobile-card-value text-xs text-right">${startStr}<br>ถึง ${endStr}</span></div><div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">${actionBtn}</div></div>`);
    });

    pagContainer.innerHTML = createPaginationHTML(store.curBookingsData.length, store.curPageBookings, ITEMS_PER_PAGE, 'changePageBookings');
}
