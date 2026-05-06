import { store } from '../state/store.js';
import { formatDate } from '../utils/date.js';

export function toggleNotifDropdown(e) {
    if (e) e.stopPropagation();
    document.getElementById('notif-dropdown').classList.toggle('hidden-section');
}

export function updateNotifications() {
    if (!store.currentUser) return;
    let notifs = [];

    if (store.currentUser.role === 'admin') {
        notifs = store.dataBookings.filter(b => b.status === 'pending');
    } else {
        notifs = store.dataBookings.filter(b => b.requesterId === store.currentUser.id && (b.status === 'approved' || b.status === 'rejected'));
    }

    notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-list');
    const countText = document.getElementById('notif-count-text');
    list.innerHTML = '';

    if (notifs.length > 0) {
        badge.classList.remove('hidden-section');
        countText.innerText = `${notifs.length} รายการ`;

        notifs.slice(0, 10).forEach(n => {
            let text = '', icon = '', color = '';
            if (n.status === 'pending') { text = `รออนุมัติ: ${n.location}`; icon = 'fa-clock'; color = 'text-yellow-500'; }
            else if (n.status === 'approved') { text = `อนุมัติแล้ว: ${n.location}`; icon = 'fa-check-circle'; color = 'text-green-500'; }
            else { text = `ไม่อนุมัติ: ${n.location}`; icon = 'fa-times-circle'; color = 'text-red-500'; }

            const clickAction = store.currentUser.role === 'admin' ? `openApproval('${n.id}')` : `filterBookings('processed'); showPage('home');`;

            list.insertAdjacentHTML('beforeend', `
                <div class="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition text-sm flex gap-3 items-start" onclick="toggleNotifDropdown(); ${clickAction}">
                    <i class="fas ${icon} ${color} mt-1 text-lg"></i>
                    <div>
                        <div class="text-gray-800 font-medium">${text}</div>
                        <div class="text-[11px] text-gray-400 mt-0.5"><i class="far fa-calendar-alt"></i> ${formatDate(n.created_at)}</div>
                    </div>
                </div>
            `);
        });
    } else {
        badge.classList.add('hidden-section');
        countText.innerText = `0 รายการ`;
        list.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">ไม่มีการแจ้งเตือนใหม่</div>';
    }
}

export function setupNotifOutsideClick() {
    document.addEventListener('click', function(e) {
        const notifDropdown = document.getElementById('notif-dropdown');
        const notifButton = document.querySelector('[onclick="toggleNotifDropdown(event)"]');
        if (notifDropdown && !notifDropdown.classList.contains('hidden-section')) {
            if (!notifDropdown.contains(e.target) && !notifButton.contains(e.target)) {
                notifDropdown.classList.add('hidden-section');
            }
        }
    });
}
