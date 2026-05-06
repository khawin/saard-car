import { db } from '../config/firebase.js';
import { store } from '../state/store.js';
import { formatDate } from '../utils/date.js';
import { showPage } from '../core/router.js';

export function checkVehicleAvailability() {
    const start = document.getElementById('req-start').value;
    const end = document.getElementById('req-end').value;
    const type = document.getElementById('req-type').value;

    if (!start || !end || !type) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกประเภทรถ, วันเวลาเริ่มต้น และสิ้นสุด', 'warning');

    const sDate = new Date(start);
    const eDate = new Date(end);

    if (eDate <= sDate) return Swal.fire('ข้อมูลไม่ถูกต้อง', 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น', 'error');

    const targetVehicles = store.dataVehicles.filter(v => v.type === type);
    if (targetVehicles.length === 0) return Swal.fire('ไม่พบรถ', `ไม่มีรถประเภท ${type} ในระบบ`, 'info');

    const busyVehicleIds = new Set();
    store.dataBookings.forEach(b => {
        if (b.status === 'approved') {
            const bs = new Date(b.startDateTime);
            const be = new Date(b.endDateTime);
            if (sDate < be && eDate > bs && b.vehicleId) busyVehicleIds.add(b.vehicleId);
        }
    });

    const freeVehicles = targetVehicles.filter(v => !busyVehicleIds.has(v.id));

    if (freeVehicles.length > 0) {
        const listHtml = freeVehicles.map(v => `<li class="text-left text-green-600 mb-1"><i class="fas fa-check-circle"></i> ${v.name} (${v.plate})</li>`).join('');
        Swal.fire({ title: 'รถว่าง', html: `<div class="text-center mb-2 font-bold text-gray-700">มีรถประเภท ${type} ว่าง ${freeVehicles.length} คัน</div><ul class="list-none pl-0 inline-block">${listHtml}</ul>`, icon: 'success' });
    } else {
        Swal.fire({ title: 'รถไม่ว่าง', text: `รถประเภท ${type} ถูกจองเต็มแล้วในช่วงเวลานี้`, icon: 'error' });
    }
}

export function submitRequest(e) {
    e.preventDefault();
    const docFile = document.getElementById('req-doc').files[0];
    if (!docFile) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาแนบหนังสืออนุญาตไปราชการ', 'warning');

    const start = document.getElementById('req-start').value;
    const end = document.getElementById('req-end').value;
    const type = document.getElementById('req-type').value;
    if (!type) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกประเภทรถ', 'warning');

    const sDate = new Date(start); const eDate = new Date(end); const now = new Date();
    if (sDate < now.setHours(0, 0, 0, 0)) return Swal.fire('ผิดพลาด', 'ไม่สามารถจองย้อนหลังได้', 'error');
    if (eDate < sDate) return Swal.fire('ผิดพลาด', 'วันสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น', 'error');

    const sigOption = document.querySelector('input[name="sig-option"]:checked').value;
    let sigData = null;

    if (sigOption === 'saved') {
        if (!store.currentUser.signature) return Swal.fire('ไม่พบลายเซ็น', 'กรุณาบันทึกลายเซ็นในหน้าส่วนตัว หรือเลือกอัปโหลดใหม่', 'warning');
        sigData = store.currentUser.signature;
    } else {
        const file = document.getElementById('req-sig-file').files[0];
        if (!file) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาอัปโหลดลายเซ็น', 'warning');
        if (file.type !== 'image/png') return Swal.fire('รูปแบบไฟล์ผิด', 'กรุณาอัปโหลดไฟล์ลายเซ็นนามสกุล .png เท่านั้น', 'error');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            sigData = e.target.result;
            processSubmission(start, end, type, sigData, docFile);
        };
        return;
    }
    processSubmission(start, end, type, sigData, docFile);
}

function processSubmission(start, end, type, sigData, docFile) {
    const sTime = new Date(start).getTime();
    const eTime = new Date(end).getTime();
    const totalVehiclesOfType = store.dataVehicles.filter(v => v.type === type);
    if (totalVehiclesOfType.length === 0) return Swal.fire('ไม่พบข้อมูล', `ไม่มีข้อมูลรถประเภท ${type}`, 'error');

    const busyVehicleIds = new Set();
    store.dataBookings.forEach(b => {
        if (b.status === 'approved') {
            const bs = new Date(b.startDateTime).getTime();
            const be = new Date(b.endDateTime).getTime();
            if (sTime < be && eTime > bs) busyVehicleIds.add(b.vehicleId);
        }
    });
    let busyCountForType = 0;
    totalVehiclesOfType.forEach(v => { if (busyVehicleIds.has(v.id)) busyCountForType++; });

    if (busyCountForType >= totalVehiclesOfType.length) {
        return Swal.fire({ icon: 'error', title: 'รถเต็ม', text: `รถประเภท ${type} ไม่ว่างในช่วงเวลาที่เลือก`, confirmButtonText: 'ตกลง', confirmButtonColor: '#EF4444' });
    }

    const saveData = (docBase64) => {
        Swal.fire({
            title: 'ยืนยันการส่งคำขอ', text: 'ตรวจสอบข้อมูลถูกต้องครบถ้วนแล้ว', icon: 'question',
            showCancelButton: true, confirmButtonText: 'ยืนยัน', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#3B82F6'
        }).then((result) => {
            if (result.isConfirmed) {
                const reqFullName = store.currentUser.role === 'admin' ? store.currentUser.name : `${store.currentUser.prefix}${store.currentUser.name} ${store.currentUser.surname}`;

                const data = {
                    requesterId: store.currentUser.id, requesterName: reqFullName, requesterPhone: document.getElementById('req-phone').value,
                    startDateTime: start, endDateTime: end, location: document.getElementById('req-location').value,
                    purpose: document.getElementById('req-purpose').value, passengers: document.getElementById('req-passengers').value,
                    requestedType: type, status: 'pending', created_at: new Date().toISOString(), signature: sigData, attachment: docBase64
                };
                db.ref('bookings').push(data);

                // ===== เริ่ม: โค้ดส่งแจ้งเตือนเข้า LINE =====
                const sTimeFmt = `${formatDate(start)} ${new Date(start).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.`;
                const eTimeFmt = `${formatDate(end)} ${new Date(end).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.`;
                const createDateFmt = formatDate(data.created_at);

                fetch("https://script.google.com/macros/s/AKfycbywuWvbSCryYObR67o355OOHCOU8GPyACwFqA9y4LkQaY4qLD7G1LRsFZuHwKtZPgN-/exec", {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify({
                        createDate: createDateFmt,
                        name: reqFullName,
                        vehicleType: type,
                        location: data.location,
                        purpose: data.purpose,
                        passengers: data.passengers,
                        startTime: sTimeFmt,
                        endTime: eTimeFmt
                    })
                }).catch(err => console.error("LINE Notify Error: ", err));
                // ===== จบ: โค้ดส่งแจ้งเตือนเข้า LINE =====

                Swal.fire({ icon: 'success', title: 'ส่งคำขอเรียบร้อย', showConfirmButton: false, timer: 1500 });
                document.querySelector('form').reset();
                const displayName = store.currentUser.role === 'admin' ? store.currentUser.name : `${store.currentUser.prefix}${store.currentUser.name} ${store.currentUser.surname}`;
                document.getElementById('req-name-display').value = displayName;
                showPage('home');
            }
        });
    };
    const reader = new FileReader();
    reader.onload = (e) => saveData(e.target.result);
    reader.readAsDataURL(docFile);
}
