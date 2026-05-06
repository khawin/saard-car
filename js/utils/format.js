import { store } from '../state/store.js';

export function getVehicleIcon(type) {
    switch (type) {
        case 'รถตู้': return 'fa-van-shuttle';
        case 'รถกระบะ': return 'fa-truck-pickup';
        case 'รถบรรทุก': return 'fa-truck';
        case 'รถยนต์ส่วนบุคคล': return 'fa-car-side';
        default: return 'fa-car';
    }
}

export function getBookingFullName(b) {
    if (b.requesterName && b.requesterName.includes(' ')) return b.requesterName;
    const user = store.dataUsers.find(u => u.id === b.requesterId);
    if (user) return `${user.prefix}${user.name} ${user.surname}`;
    return b.requesterName || '-';
}

export function createPaginationHTML(totalItems, currentPage, itemsPerPage, clickFuncName) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';

    let html = '<div class="flex items-center justify-center gap-1.5 mt-2">';

    html += `<button onclick="${clickFuncName}(${currentPage - 1})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 transition ${currentPage === 1 ? 'opacity-30 pointer-events-none' : ''}"><i class="fas fa-chevron-left text-xs"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="w-8 h-8 rounded-lg bg-blue-500 text-white font-bold shadow-sm text-sm">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button onclick="${clickFuncName}(${i})" class="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-blue-50 transition text-sm">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="text-gray-400 px-1 text-sm">...</span>`;
        }
    }

    html += `<button onclick="${clickFuncName}(${currentPage + 1})" class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 transition ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : ''}"><i class="fas fa-chevron-right text-xs"></i></button>`;
    html += '</div>';
    return html;
}
