import { store } from '../state/store.js';
import { renderTimeline } from '../features/timeline.js';
import { renderUsageTable } from '../features/usage.js';

export function updateNavState(activePage) {
    const updateDesktop = (prefix, items) => {
        items.forEach((item, idx) => {
            const btn = document.getElementById(`${prefix}-${item}`);
            if (btn) {
                if (item === activePage) {
                    btn.classList.replace('text-gray-500', 'text-blue-600');
                    document.getElementById(`${prefix}-indicator`).style.transform = `translateX(${idx * 100}%)`;
                } else btn.classList.replace('text-blue-600', 'text-gray-500');
            }
        });
    };
    const updateMobile = (prefix, items) => {
        items.forEach(item => {
            const btn = document.getElementById(`mob-nav-${prefix}-${item}`);
            if (btn) {
                if (item === activePage) { btn.classList.remove('text-gray-400'); btn.classList.add('text-blue-600'); }
                else { btn.classList.remove('text-blue-600'); btn.classList.add('text-gray-400'); }
            }
        });
    };

    if (store.currentRole === 'teacher') {
        updateDesktop('nav-t', ['home', 'request', 'profile']); updateMobile('t', ['home', 'request', 'profile']);
    } else {
        updateDesktop('nav-a', ['home', 'manage']); updateMobile('a', ['home', 'manage']);
    }
}

export function toggleView(mode) {
    ['list', 'timeline', 'usage'].forEach(m => {
        const btn = document.getElementById(`btn-view-${m}`);
        const view = document.getElementById(`view-mode-${m}`);
        if (m === mode) {
            btn.className = "px-3 sm:px-4 py-1 rounded-md text-[13px] sm:text-sm font-bold bg-white text-blue-600 shadow-sm transition";
            view.classList.remove('hidden-section');
            if (m === 'timeline') renderTimeline();
            if (m === 'usage') renderUsageTable();
        } else {
            btn.className = "px-3 sm:px-4 py-1 rounded-md text-[13px] sm:text-sm font-bold text-gray-500 hover:text-blue-600 transition";
            view.classList.add('hidden-section');
        }
    });
}
