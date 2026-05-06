import { store } from '../state/store.js';
import { formatDate, getDateParts } from '../utils/date.js';
import { getBookingFullName } from '../utils/format.js';

export function printSinglePDF(id) {
    const b = store.dataBookings.find(x => x.id === id);
    const v = store.dataVehicles.find(x => x.id === b.vehicleId) || {};
    const d = store.dataDrivers.find(x => x.id === b.driverId) || {};

    const createdParts = getDateParts(b.created_at);
    document.getElementById('pdf-day').innerText = createdParts.d;
    document.getElementById('pdf-month').innerText = createdParts.m;
    document.getElementById('pdf-year').innerText = createdParts.y;

    const bYear = new Date(b.created_at).getFullYear();
    const yearBookings = store.dataBookings
        .filter(x => new Date(x.created_at).getFullYear() === bYear)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const runIndex = yearBookings.findIndex(x => x.id === b.id) + 1;

    document.getElementById('pdf-run-num').innerText = runIndex;
    document.getElementById('pdf-run-year').innerText = bYear + 543;

    const fullName = getBookingFullName(b);
    document.getElementById('pdf-name').innerText = fullName;
    document.getElementById('pdf-sign-name').innerText = fullName;

    document.getElementById('pdf-location').innerText = b.location;
    document.getElementById('pdf-purpose').innerText = b.purpose;
    document.getElementById('pdf-pax').innerText = b.passengers;

    const s = getDateParts(b.startDateTime);
    const e = getDateParts(b.endDateTime);

    document.getElementById('pdf-s-d').innerText = s.d;
    document.getElementById('pdf-s-m').innerText = s.m;
    document.getElementById('pdf-s-y').innerText = s.y;
    document.getElementById('pdf-s-t').innerText = s.t;

    document.getElementById('pdf-e-d').innerText = e.d;
    document.getElementById('pdf-e-m').innerText = e.m;
    document.getElementById('pdf-e-y').innerText = e.y;
    document.getElementById('pdf-e-t').innerText = e.t;

    document.getElementById('pdf-phone').innerText = b.requesterPhone;
    document.getElementById('pdf-plate').innerText = v.plate || '-';
    document.getElementById('pdf-driver').innerText = d.name || '-';
    document.getElementById('pdf-driver-sign').innerText = d.name || '-';

    const sigImg = document.getElementById('pdf-sig-img');
    if (b.signature) { sigImg.src = b.signature; sigImg.style.display = 'block'; }
    else { sigImg.style.display = 'none'; }

    document.querySelectorAll('.checkbox-box').forEach(el => el.classList.remove('checkbox-checked'));

    if (b.requestedType === 'รถตู้') document.getElementById('chk-van').classList.add('checkbox-checked');
    else if (b.requestedType === 'รถกระบะ') document.getElementById('chk-pickup').classList.add('checkbox-checked');
    else if (b.requestedType === 'รถบรรทุก') document.getElementById('chk-truck').classList.add('checkbox-checked');
    else if (b.requestedType === 'รถยนต์ส่วนบุคคล') document.getElementById('chk-car').classList.add('checkbox-checked');

    document.getElementById('chk-approve').classList.remove('checkbox-checked');
    document.getElementById('chk-reject').classList.remove('checkbox-checked');
    document.getElementById('pdf-reject-reason').innerText = "";

    const driverRow = document.getElementById('pdf-driver-row');
    const driverSignRow = document.getElementById('pdf-driver-sign-row');

    if (b.status === 'approved') {
        document.getElementById('chk-approve').classList.add('checkbox-checked');
        driverRow.style.display = 'flex';
        driverSignRow.style.display = 'flex';
    } else if (b.status === 'rejected') {
        document.getElementById('chk-reject').classList.add('checkbox-checked');
        document.getElementById('pdf-reject-reason').innerText = b.rejectReason || "";
        driverRow.style.display = 'none';
        driverSignRow.style.display = 'none';
    }

    const attPage = document.getElementById('pdf-attachment-template');
    const attImg = document.getElementById('pdf-att-img');

    if (b.attachment) {
        attImg.src = b.attachment;
        attPage.style.display = 'block';
    } else {
        attPage.style.display = 'none';
    }

    const element = document.getElementById('pdf-print-wrapper');
    const opt = {
        margin: 0,
        filename: `ใบขออนุญาต_${b.requesterName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, logging: false, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

export function showSummaryPrintOptions() {
    Swal.fire({
        title: 'ส่งออกรายงานสรุปการใช้รถ',
        html: `
        <div class="text-left space-y-4 font-sans mt-2">
            <div class="flex items-center gap-2">
                <input type="radio" name="print-opt" id="print-month" value="month" checked onclick="document.getElementById('print-selectors').style.display='flex'">
                <label for="print-month" class="font-bold text-gray-700">รายงานประจำเดือน</label>
            </div>
            <div id="print-selectors" class="flex gap-2 ml-6">
                <select id="swal-month" class="border p-2 rounded w-1/2 custom-input" style="padding: 0.5rem;">${document.getElementById('usage-month').innerHTML}</select>
                <select id="swal-year" class="border p-2 rounded w-1/2 custom-input" style="padding: 0.5rem;">${document.getElementById('usage-year').innerHTML}</select>
            </div>
            <div class="flex items-center gap-2">
                <input type="radio" name="print-opt" id="print-all" value="all" onclick="document.getElementById('print-selectors').style.display='none'">
                <label for="print-all" class="font-bold text-gray-700">รายงานทั้งหมด (ทุกรายการ)</label>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                <label class="block text-sm font-bold text-gray-700 mb-3">เลือกรูปแบบไฟล์ที่ต้องการ:</label>
                <div class="flex flex-col gap-3">
                    <label class="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-red-300 transition shadow-sm">
                        <input type="radio" name="export-format" value="pdf" checked class="w-4 h-4 text-blue-600">
                        <i class="fas fa-file-pdf text-red-500 text-2xl w-8 text-center"></i>
                        <div>
                            <div class="font-bold text-gray-700 text-sm">ไฟล์เอกสาร PDF</div>
                            <div class="text-xs text-gray-500">สำหรับพิมพ์เอกสารเพื่อลงนาม</div>
                        </div>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-green-300 transition shadow-sm">
                        <input type="radio" name="export-format" value="excel" class="w-4 h-4 text-blue-600">
                        <i class="fas fa-file-excel text-green-600 text-2xl w-8 text-center"></i>
                        <div>
                            <div class="font-bold text-gray-700 text-sm">ไฟล์ตาราง Excel</div>
                            <div class="text-xs text-gray-500">สำหรับนำข้อมูลไปจัดเรียงและสรุปผลต่อ</div>
                        </div>
                    </label>
                </div>
            </div>
        </div>`,
        showCancelButton: true, confirmButtonText: '<i class="fas fa-download mr-1"></i> ดาวน์โหลด', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#3B82F6', customClass: { popup: 'rounded-3xl' },
        preConfirm: () => {
            const type = document.querySelector('input[name="print-opt"]:checked').value;
            const m = document.getElementById('swal-month').value;
            const y = document.getElementById('swal-year').value;
            const format = document.querySelector('input[name="export-format"]:checked').value;
            return { type, m, y, format };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.value.format === 'pdf') {
                printSummaryPDF(result.value);
            } else {
                window.exportSummaryExcel(result.value);
            }
        }
    });
}

export function printSummaryPDF(filter) {
    const body = document.getElementById('pdf-summary-body');
    body.innerHTML = '';
    let count = 1;
    let approvedList = store.dataBookings.filter(b => b.status === 'approved').sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let titleText = "รายงานสรุปการใช้งานยานพาหนะ";
    if (filter.type === 'month') {
        const m = parseInt(filter.m);
        const y = parseInt(filter.y);
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        titleText += ` ประจำเดือน ${thaiMonths[m]} พ.ศ. ${y + 543}`;
        approvedList = approvedList.filter(b => { const d = new Date(b.startDateTime); return d.getMonth() === m && d.getFullYear() === y; });
    } else {
        titleText += " (ข้อมูลทั้งหมด)";
    }
    document.getElementById('summary-title').innerText = titleText;

    if (approvedList.length === 0) {
        const row = document.createElement('div');
        row.className = 'div-row';
        row.innerHTML = `<div class="div-cell" style="width:100%; border-right:none; padding:20px;">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</div>`;
        body.appendChild(row);
        Swal.fire('ไม่พบข้อมูล', 'ไม่มีข้อมูลการใช้รถในเดือนที่เลือก', 'info');
        return;
    } else {
        approvedList.forEach(b => {
            const v = store.dataVehicles.find(x => x.id === b.vehicleId) || {};
            const d = store.dataDrivers.find(x => x.id === b.driverId) || {};
            const driverName = d.name || '-';

            let rawName = getBookingFullName(b);
            let formattedName = rawName;

            if (rawName.length > 25 && rawName.includes(' ')) {
                const lastSpace = rawName.lastIndexOf(' ');
                if (lastSpace !== -1) {
                    formattedName = rawName.substring(0, lastSpace) + '<br>' + rawName.substring(lastSpace + 1);
                }
            }

            const row = document.createElement('div');
            row.className = 'div-row';
            row.innerHTML = `
                <div class="div-cell col-1"><span class="cell-text">${count++}</span></div>
                <div class="div-cell col-2"><span class="cell-text">${v.plate || '-'}</span></div>
                <div class="div-cell col-3"><span class="cell-text">${formatDate(b.created_at)}</span></div>
                <div class="div-cell col-4"><span class="cell-text">${formattedName}</span></div>
                <div class="div-cell col-5"><span class="cell-text">${b.location}</span></div>
                <div class="div-cell col-6"><span class="cell-text">${formatDate(b.startDateTime)}<br>- ${formatDate(b.endDateTime)}</span></div>
                <div class="div-cell col-7"><span class="cell-text">${driverName}</span></div>
                <div class="div-cell col-8" style="border-right:none;"></div>
            `;
            body.appendChild(row);
        });
    }

    const element = document.getElementById('pdf-summary-template');
    const opt = {
        margin: 0,
        filename: `รายงานสรุปการใช้รถ.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 4, logging: false, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    Swal.fire({ title: 'กำลังสร้างไฟล์ PDF...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    html2pdf().set(opt).from(element).save().then(() => { Swal.close(); });
}
