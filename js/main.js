import { db, auth } from './config/firebase.js';
import { store } from './state/store.js';
import { initDateSelectors } from './utils/date.js';
import { debouncedRefresh } from './utils/debounce.js';
import { loadView, appendView, showPage } from './core/router.js';
import { handleLogin, handleLogout, switchRole } from './core/auth.js';
import { toggleView } from './core/navigation.js';
import { filterBookings, changePageBookings } from './features/dashboard.js';
import { renderManageTable, changePageManage, addNewData, editItem, deleteItem, resetPassword, addTeacherSingle, addTeacherBulk } from './features/manage.js';
import { openApproval, showImage } from './features/approval.js';
import { toggleSigInput, previewUploadSig, togglePassword, changePassword, uploadProfileSig } from './features/profile.js';
import { submitRequest, checkVehicleAvailability } from './features/request.js';
import { changeTimelineDate, renderTimeline } from './features/timeline.js';
import { showVehicleTrips, renderUsageTable } from './features/usage.js';
import { toggleNotifDropdown, setupNotifOutsideClick } from './features/notifications.js';
import { printSinglePDF, showSummaryPrintOptions, printSummaryPDF } from './exports/pdf.js';
import { exportSummaryExcel } from './exports/excel.js';

// === Attach inline-handler functions to window (for onclick="..." in HTML) ===
window.switchRole = switchRole;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.showPage = showPage;
window.toggleView = toggleView;
window.filterBookings = filterBookings;
window.changePageBookings = changePageBookings;
window.renderManageTable = renderManageTable;
window.changePageManage = changePageManage;
window.addNewData = addNewData;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.resetPassword = resetPassword;
window.addTeacherSingle = addTeacherSingle;
window.addTeacherBulk = addTeacherBulk;
window.openApproval = openApproval;
window.showImage = showImage;
window.toggleSigInput = toggleSigInput;
window.previewUploadSig = previewUploadSig;
window.togglePassword = togglePassword;
window.changePassword = changePassword;
window.uploadProfileSig = uploadProfileSig;
window.submitRequest = submitRequest;
window.checkVehicleAvailability = checkVehicleAvailability;
window.changeTimelineDate = changeTimelineDate;
window.renderTimeline = renderTimeline;
window.showVehicleTrips = showVehicleTrips;
window.renderUsageTable = renderUsageTable;
window.toggleNotifDropdown = toggleNotifDropdown;
window.printSinglePDF = printSinglePDF;
window.showSummaryPrintOptions = showSummaryPrintOptions;
window.printSummaryPDF = printSummaryPDF;
window.exportSummaryExcel = exportSummaryExcel;

// === App Bootstrap ===
async function bootstrap() {
    // Step 1: Load all HTML fragments into the app shell
    const app = document.getElementById('app');

    const [loginHtml, dashboardHtml, mobileNavHtml, pdfHtml] = await Promise.all([
        fetch('views/login.html').then(r => r.text()),
        fetch('views/dashboard.html').then(r => r.text()),
        fetch('views/partials/mobile-nav.html').then(r => r.text()),
        fetch('views/partials/pdf-templates.html').then(r => r.text())
    ]);

    app.innerHTML = loginHtml + dashboardHtml + mobileNavHtml + pdfHtml;

    // Step 2: Load views into the views-container
    const [homeHtml, requestHtml, profileHtml, manageHtml] = await Promise.all([
        fetch('views/home.html').then(r => r.text()),
        fetch('views/request.html').then(r => r.text()),
        fetch('views/profile.html').then(r => r.text()),
        fetch('views/manage.html').then(r => r.text())
    ]);

    document.getElementById('views-container').innerHTML = homeHtml + requestHtml + profileHtml + manageHtml;

    // Step 3: Init Firebase listeners + state
    auth.signInAnonymously().catch(e => console.error(e));
    const setupListener = (ref) => {
        db.ref(ref).on('value', snap => {
            const val = snap.val();
            if (ref === 'bookings') store.dataBookings = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : [];
            else if (ref === 'vehicles') store.dataVehicles = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : [];
            else if (ref === 'drivers') store.dataDrivers = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : [];
            else if (ref === 'users') store.dataUsers = val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : [];

            if (ref === 'bookings') store.dataBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            debouncedRefresh();
        });
    };

    ['bookings', 'vehicles', 'drivers', 'users'].forEach(setupListener);
    initDateSelectors();

    // Step 4: Initialize Flatpickr (now that DOM elements exist)
    flatpickr("#req-start", { locale: "th", enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true });
    flatpickr("#req-end", { locale: "th", enableTime: true, dateFormat: "Y-m-d H:i", time_24hr: true });
    store.fpTimeline = flatpickr("#timeline-date", {
        locale: "th",
        dateFormat: "Y-m-d",
        defaultDate: "today",
        onChange: function() { renderTimeline(); }
    });

    // Step 5: Setup global notification dropdown click-outside handler
    setupNotifOutsideClick();
}

bootstrap().catch(err => {
    console.error('Bootstrap failed:', err);
    document.getElementById('app').innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif"><h2 style="color:#EF4444">เกิดข้อผิดพลาดในการโหลดแอปพลิเคชัน</h2><p style="color:#6B7280;margin-top:10px">โปรดเปิดผ่าน HTTP server (เช่น <code>python3 -m http.server 8000</code>) แทนการเปิดไฟล์ตรง ๆ</p><pre style="background:#f9fafb;padding:10px;margin-top:20px;text-align:left;border-radius:8px;color:#1F2937">${err.message}</pre></div>`;
});
