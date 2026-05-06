import { store } from '../state/store.js';
import { refreshDashboard } from '../features/dashboard.js';

export function debouncedRefresh() {
    clearTimeout(store.refreshTimer);
    store.refreshTimer = setTimeout(refreshDashboard, 150);
}
