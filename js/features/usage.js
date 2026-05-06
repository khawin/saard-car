import { store } from '../state/store.js';
import { getVehicleIcon, getBookingFullName } from '../utils/format.js';

export function showVehicleTrips(vId, m, y) {
    const v = store.dataVehicles.find(x => x.id === vId);
    if (!v) return;
    let filtered = store.dataBookings.filter(b => b.status === 'approved' && b.vehicleId === vId);
    filtered = filtered.filter(b => {
        const d = new Date(b.startDateTime);
        return d.getMonth() === m && d.getFullYear() === y;
    });

    if (filtered.length === 0) return Swal.fire({ title: 'ไม่มีข้อมูล', text: 'ไม่มีการใช้งานในเดือนที่เลือก', icon: 'info', confirmButtonColor: '#3B82F6' });

    let listHtml = '<div class="space-y-3 text-left max-h-[60vh] overflow-y-auto pr-2">';
    filtered.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)).forEach((b) => {
        const sd = new Date(b.startDateTime);
        const ed = new Date(b.endDateTime);
        const dateStr = `${sd.getDate().toString().padStart(2,'0')}/${(sd.getMonth()+1).toString().padStart(2,'0')}/${sd.getFullYear()+543}`;
        const timeStr = `${sd.getHours().toString().padStart(2,'0')}:${sd.getMinutes().toString().padStart(2,'0')} - ${ed.getHours().toString().padStart(2,'0')}:${ed.getMinutes().toString().padStart(2,'0')} น.`;

        listHtml += `
        <div class="p-4 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 text-sm transition flex flex-col gap-1.5 shadow-sm">
            <div class="flex justify-between border-b border-gray-200 pb-2 mb-1 items-center">
                <span class="font-bold text-blue-600 bg-blue-100/50 px-2 py-1 rounded"><i class="far fa-calendar-alt mr-1"></i> ${dateStr}</span>
                <span class="text-gray-600 font-medium bg-white px-2 py-1 rounded border border-gray-200"><i class="far fa-clock mr-1"></i> ${timeStr}</span>
            </div>
            <div><span class="text-gray-500 text-xs w-12 inline-block">ผู้ขอ:</span> <span class="text-gray-800 font-medium">${getBookingFullName(b)}</span></div>
            <div><span class="text-gray-500 text-xs w-12 inline-block">สถานที่:</span> <span class="text-gray-800">${b.location}</span></div>
            ${b.driverId ? `<div><span class="text-gray-500 text-xs w-12 inline-block">คนขับ:</span> <span class="text-gray-800">${store.dataDrivers.find(d => d.id === b.driverId)?.name || '-'}</span></div>` : ''}
        </div>`;
    });
    listHtml += '</div>';

    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    Swal.fire({
        title: `<div class="text-xl font-bold text-gray-800">รายละเอียดการใช้รถ<br><span class="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">${v.name} (${v.plate}) • ${thaiMonths[m]} ${y+543}</span></div>`,
        html: listHtml,
        showConfirmButton: true,
        confirmButtonText: 'ปิดหน้าต่าง',
        confirmButtonColor: '#3B82F6',
        customClass: { popup: 'rounded-[2rem]' }
    });
}

export function renderUsageTable() {
    const m = parseInt(document.getElementById('usage-month').value);
    const y = parseInt(document.getElementById('usage-year').value);
    const filterType = document.getElementById('usage-filter-type').value;
    const container = document.getElementById('usage-container');
    container.innerHTML = '';

    let filteredBookings = store.dataBookings.filter(b => b.status === 'approved');
    filteredBookings = filteredBookings.filter(b => {
        const d = new Date(b.startDateTime);
        return d.getMonth() === m && d.getFullYear() === y;
    });

    let displayVehicles = store.dataVehicles;
    if (filterType !== 'all') {
        displayVehicles = displayVehicles.filter(v => v.type === filterType);
    }

    if (displayVehicles.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm"><i class="fas fa-car-side text-4xl mb-3 text-gray-300 block"></i><p>ไม่มีข้อมูลรถในระบบ</p></div>`;
        return;
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    let totalTripsMonth = 0;

    displayVehicles.forEach(v => {
        const vBookings = filteredBookings.filter(b => b.vehicleId === v.id);
        const tripCount = vBookings.length;
        totalTripsMonth += tripCount;

        let bgClass = tripCount > 0 ? 'bg-white cursor-pointer' : 'bg-gray-50/70 opacity-80 cursor-pointer';
        let borderClass = tripCount > 5 ? 'border-blue-400 shadow-md' : 'border-gray-200 shadow-sm';
        let iconColor = tripCount > 0 ? 'text-blue-500' : 'text-gray-400';
        let iconClass = getVehicleIcon(v.type);

        html += `
        <div onclick="showVehicleTrips('${v.id}', ${m}, ${y})" class="${bgClass} rounded-2xl p-5 border ${borderClass} flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-md relative overflow-hidden group min-h-[140px]">
            <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-blue-50 flex justify-center items-center flex-shrink-0 group-hover:bg-blue-100 transition">
                    <i class="fas ${iconClass} ${iconColor} text-xl"></i>
                </div>
                <div class="flex-grow pt-1">
                    <h4 class="font-bold text-gray-800 text-base lg:text-lg leading-tight">${v.name}</h4>
                    <div class="text-xs text-gray-500 mt-1">${v.plate} • ${v.type}</div>
                </div>
            </div>
            <div class="flex justify-between items-end mt-auto pt-3 border-t border-gray-100">
                <div class="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    ดูรายละเอียด <i class="fas fa-arrow-right ml-0.5"></i>
                </div>
                <div class="text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg text-sm md:text-base ml-auto transition group-hover:bg-blue-600 group-hover:text-white">
                    <i class="fas fa-route mr-1"></i> ${tripCount} เที่ยว
                </div>
            </div>
        </div>`;
    });

    html += '</div>';

    if (totalTripsMonth === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm"><i class="fas fa-car-side text-4xl mb-3 text-gray-300 block"></i><p>ไม่มีการใช้งานรถในเดือนนี้</p></div>`;
    } else {
        container.innerHTML = `
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-md flex justify-between items-center relative overflow-hidden">
            <div class="absolute right-0 top-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-10 -mt-10"></div>
            <div class="relative z-10">
                <h3 class="text-base sm:text-lg font-medium opacity-90">รวมการใช้งานทั้งหมด (เดือนที่เลือก)</h3>
                <div class="text-4xl sm:text-5xl font-bold mt-1">${totalTripsMonth} <span class="text-xl font-medium opacity-80">เที่ยว</span></div>
            </div>
            <i class="fas fa-chart-line text-6xl opacity-20 relative z-10"></i>
        </div>
        ${html}`;
    }
}
