import { filterBookings } from '../features/dashboard.js';
import { renderManageTable } from '../features/manage.js';
import { updateNavState } from './navigation.js';

export function showPage(page) {
    ['view-home', 'view-request', 'view-manage', 'view-profile'].forEach(id => document.getElementById(id).classList.add('hidden-section'));
    document.getElementById('view-' + page).classList.remove('hidden-section');

    const mobFilterNav = document.getElementById('mobile-filter-nav');
    if (mobFilterNav) {
        if (page === 'home') mobFilterNav.classList.remove('hidden-section');
        else mobFilterNav.classList.add('hidden-section');
    }

    if (page === 'home') filterBookings('all');
    if (page === 'manage') renderManageTable('vehicle');
    updateNavState(page);
}

export async function loadView(path, targetEl) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const html = await res.text();
    if (typeof targetEl === 'string') {
        document.getElementById(targetEl).innerHTML = html;
    } else {
        targetEl.innerHTML = html;
    }
}

export async function appendView(path, targetEl) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const html = await res.text();
    const target = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
    target.insertAdjacentHTML('beforeend', html);
}
