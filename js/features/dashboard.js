import { store, ITEMS_PER_PAGE } from '../state/store.js';
import { renderBookingsTable } from './bookings-table.js';
import { renderManageTable } from './manage.js';
import { renderTimeline } from './timeline.js';
import { renderUsageTable } from './usage.js';
import { updateNotifications } from './notifications.js';
import { toggleView } from '../core/navigation.js';

export function refreshDashboard() {
    if (!store.currentUser) return;
    let total = 0, pending = 0, processed = 0;
    store.dataBookings.forEach(b => {
        if (b.status !== 'rejected') total++;
        const isOwnerOrAdmin = store.currentUser.role === 'admin' || b.requesterId === store.currentUser.id;
        if (isOwnerOrAdmin) {
            if (b.status === 'pending') pending++;
            else if (b.status === 'approved' || b.status === 'rejected') processed++;
        }
    });

    document.getElementById('count-all').innerText = total;
    document.getElementById('count-pending').innerText = pending;
    document.getElementById('count-processed').innerText = processed;

    if (document.getElementById('mob-count-all')) {
        document.getElementById('mob-count-all').innerText = total;
        document.getElementById('mob-count-pending').innerText = pending;
        document.getElementById('mob-count-processed').innerText = processed;
    }

    document.getElementById('count-vehicles').innerText = store.dataVehicles.length;
    document.getElementById('count-drivers').innerText = store.dataDrivers.length;
    document.getElementById('count-teachers').innerText = store.dataUsers.length;

    updateNotifications();

    if (!document.getElementById('view-home').classList.contains('hidden-section')) {
        filterBookings(store.currentFilter, true);
        if (!document.getElementById('view-mode-timeline').classList.contains('hidden-section')) renderTimeline();
        if (!document.getElementById('view-mode-usage').classList.contains('hidden-section')) renderUsageTable();
    }
    if (!document.getElementById('view-manage').classList.contains('hidden-section')) {
        renderManageTable(store.manageMode, true);
    }
}

export function filterBookings(status, keepPage = false) {
    store.currentFilter = status;
    if (!keepPage) store.curPageBookings = 1;

    const titles = { all: 'รายการทั้งหมด', pending: 'รออนุมัติ', processed: 'ตอบรับแล้ว' };
    document.getElementById('table-title').innerText = titles[status];

    const titleBar = document.getElementById('table-title-bar');
    if (status === 'all') titleBar.className = "w-1.5 sm:w-2 h-6 sm:h-8 rounded-full bg-blue-500";
    else if (status === 'pending') titleBar.className = "w-1.5 sm:w-2 h-6 sm:h-8 rounded-full bg-yellow-500";
    else if (status === 'processed') titleBar.className = "w-1.5 sm:w-2 h-6 sm:h-8 rounded-full bg-green-500";

    const toggleContainer = document.getElementById('view-toggle-container');
    if (status === 'all') toggleContainer.classList.remove('hidden-section');
    else {
        toggleContainer.classList.add('hidden-section');
        if (!document.getElementById('view-mode-list').classList.contains('hidden-section') === false) toggleView('list');
    }

    const statusMap = { 'all': 'card-dash-all', 'pending': 'card-dash-pending', 'processed': 'card-dash-processed' };
    Object.keys(statusMap).forEach(key => {
        const el = document.getElementById(statusMap[key]);
        if (el) {
            if (key === status) { el.classList.add('dash-active'); el.classList.remove('dash-inactive'); }
            else { el.classList.remove('dash-active'); el.classList.add('dash-inactive'); }
        }
    });

    const mobTabs = { 'all': 'mob-btn-all', 'pending': 'mob-btn-pending', 'processed': 'mob-btn-processed' };
    Object.keys(mobTabs).forEach(key => {
        const btn = document.getElementById(mobTabs[key]);
        if (btn) {
            btn.className = `px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border border-gray-200 bg-white text-gray-500`;
            if (key === status) {
                if (key === 'all') btn.className = `px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border border-blue-500 bg-blue-50 text-blue-600 shadow-sm`;
                if (key === 'pending') btn.className = `px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border border-yellow-500 bg-yellow-50 text-yellow-600 shadow-sm`;
                if (key === 'processed') btn.className = `px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border border-green-500 bg-green-50 text-green-600 shadow-sm`;
            }
        }
    });

    const btnPrint = document.getElementById('btn-print-summary');
    if (store.currentUser.role === 'admin') btnPrint.classList.remove('hidden-section');
    else btnPrint.classList.add('hidden-section');

    let filtered = store.dataBookings.filter(b => {
        if (status === 'all') return true;
        if (store.currentUser.role === 'teacher' && b.requesterId !== store.currentUser.id) return false;
        if (status === 'pending') return b.status === 'pending';
        if (status === 'processed') return b.status !== 'pending';
        return true;
    });
    if (status === 'all') filtered = filtered.filter(b => b.status !== 'rejected');

    store.curBookingsData = filtered;
    renderBookingsTable();
}

export function changePageBookings(page) {
    store.curPageBookings = page;
    renderBookingsTable();
}
