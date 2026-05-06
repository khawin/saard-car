import { db } from '../config/firebase.js';
import { store } from '../state/store.js';
import { getDateParts } from '../utils/date.js';
import { getBookingFullName } from '../utils/format.js';

export function openApproval(id) {
    const booking = store.dataBookings.find(b => b.id === id);
    const sTime = new Date(booking.startDateTime).getTime();
    const eTime = new Date(booking.endDateTime).getTime();
    const busyCars = new Set();
    const busyDrivers = new Set();

    store.dataBookings.forEach(b => {
        if (b.status === 'approved' && b.id !== id) {
            const bs = new Date(b.startDateTime).getTime();
            const be = new Date(b.endDateTime).getTime();
            if (sTime < be && eTime > bs) { busyCars.add(b.vehicleId); busyDrivers.add(b.driverId); }
        }
    });

    const freeCars = store.dataVehicles.filter(v => !busyCars.has(v.id) && v.type === booking.requestedType);
    const freeDrivers = store.dataDrivers.filter(d => !busyDrivers.has(d.id));

    let carOptions = freeCars.length ? freeCars.map(c => `<option value="${c.id}" ${c.id === booking.vehicleId ? 'selected' : ''}>${c.name} (${c.plate})</option>`).join('') : '<option value="">ไม่มีรถว่าง</option>';
    let driverOptions = freeDrivers.length ? freeDrivers.map(d => `<option value="${d.id}" ${d.id === booking.driverId ? 'selected' : ''}>${d.name}</option>`).join('') : '<option value="">ไม่มีคนขับว่าง</option>';

    if (booking.vehicleId && !freeCars.find(c => c.id === booking.vehicleId)) {
        const v = store.dataVehicles.find(c => c.id === booking.vehicleId);
        if (v) carOptions = `<option value="${v.id}" selected>${v.name} (ปัจจุบัน)</option>` + carOptions;
    }
    if (booking.driverId && !freeDrivers.find(d => d.id === booking.driverId)) {
        const d = store.dataDrivers.find(x => x.id === booking.driverId);
        if (d) driverOptions = `<option value="${d.id}" selected>${d.name} (ปัจจุบัน)</option>` + driverOptions;
    }

    const docBtn = booking.attachment ? `<a href="#" onclick="showImage('${booking.attachment}')" class="text-blue-600 underline text-sm inline-block mt-1"><i class="fas fa-file-image mr-1"></i>ดูหนังสือขออนุญาต</a>` : '<span class="text-gray-400 text-sm mt-1 block">ไม่แนบไฟล์</span>';

    const sParts = getDateParts(booking.startDateTime);
    const eParts = getDateParts(booking.endDateTime);
    const startFull = `วันที่ ${sParts.d} ${sParts.m} พ.ศ. ${sParts.y} เวลา ${sParts.t} น.`;
    const endFull = `วันที่ ${eParts.d} ${eParts.m} พ.ศ. ${eParts.y} เวลา ${eParts.t} น.`;

    Swal.fire({
        title: 'พิจารณาคำขอ',
        width: '750px',
        html: `
        <div class="text-left mb-5 font-sans">
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                <div class="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fas fa-info"></i></div>
                    <h4 class="font-bold text-gray-800 text-lg">รายละเอียดคำขอ</h4>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-base">
                    <div><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">ผู้ขอ</span><span class="font-medium text-gray-900">${getBookingFullName(booking)}</span></div>
                    <div><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">เบอร์โทร</span><span class="font-medium text-gray-900">${booking.requesterPhone}</span></div>

                    <div><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">ประเภทรถที่ต้องการ</span><span class="font-medium text-gray-900">${booking.requestedType}</span></div>
                    <div><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">จำนวนผู้โดยสาร</span><span class="font-medium text-gray-900">${booking.passengers} คน</span></div>

                    <div class="sm:col-span-2 bg-white p-3 rounded-xl border border-gray-100">
                        <span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">วันที่-เวลาเดินทาง</span>
                        <div class="font-medium text-gray-900 flex flex-col gap-1.5">
                            <span><i class="far fa-calendar text-blue-500 w-4"></i> ${startFull}</span>
                            <span><i class="far fa-calendar-check text-blue-500 w-4"></i> ถึง ${endFull}</span>
                        </div>
                    </div>

                    <div class="sm:col-span-2"><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">สถานที่ที่ไป</span><span class="font-medium text-gray-900">${booking.location}</span></div>
                    <div class="sm:col-span-2"><span class="text-gray-500 block text-xs font-bold mb-1 uppercase tracking-wider">เพื่อวัตถุประสงค์</span><span class="font-medium text-gray-900">${booking.purpose}</span></div>

                    <div class="sm:col-span-2 mt-2 pt-4 border-t border-gray-200"><span class="text-gray-500 block text-xs font-bold mb-2 uppercase tracking-wider">เอกสารแนบ</span>${docBtn}</div>
                </div>
            </div>
            <div class="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                    <label class="block text-sm font-bold text-gray-800 mb-2"><i class="fas fa-car-side text-blue-500 mr-1"></i> เลือกรถว่าง (${booking.requestedType})</label>
                    <select id="swal-car" class="w-full border-2 border-gray-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white text-base">${carOptions}</select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-800 mb-2"><i class="fas fa-user-tie text-blue-500 mr-1"></i> เลือกพนักงานขับรถว่าง</label>
                    <select id="swal-driver" class="w-full border-2 border-gray-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white text-base">${driverOptions}</select>
                </div>
            </div>
        </div>`,
        showCancelButton: true, showDenyButton: true, confirmButtonText: 'อนุมัติ / บันทึก', denyButtonText: 'ไม่อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10B981', denyButtonColor: '#EF4444', customClass: { popup: 'rounded-3xl' },
        preConfirm: () => { return { vehicleId: document.getElementById('swal-car').value, driverId: document.getElementById('swal-driver').value } }
    }).then((result) => {
        if (result.isConfirmed) {
            const vId = result.value.vehicleId;
            const dId = result.value.driverId;
            if (!vId || !dId) return Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกรถและคนขับ', 'error');
            db.ref(`bookings/${id}`).update({ status: 'approved', vehicleId: vId, driverId: dId, approver: store.currentUser.name, approveDate: new Date().toISOString(), rejectReason: null });
            Swal.fire({ icon: 'success', title: 'บันทึกสถานะ: อนุมัติ', showConfirmButton: false, timer: 1500 });
        } else if (result.isDenied) {
            Swal.fire({
                title: 'ระบุเหตุผล', input: 'text', inputValue: booking.rejectReason || '',
                showCancelButton: true, confirmButtonText: 'ยืนยันไม่อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#EF4444'
            }).then((res) => {
                if (res.isConfirmed) {
                    db.ref(`bookings/${id}`).update({ status: 'rejected', rejectReason: res.value || 'ไม่ระบุ', approver: store.currentUser.name, vehicleId: null, driverId: null });
                    Swal.fire({ icon: 'success', title: 'บันทึกสถานะ: ไม่อนุมัติ', showConfirmButton: false, timer: 1500 });
                }
            });
        }
    });
}

export function showImage(base64) {
    Swal.fire({ imageUrl: base64, imageAlt: 'Attachment', width: '80%', showConfirmButton: false, showCloseButton: true });
}
