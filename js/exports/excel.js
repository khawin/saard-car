import { store } from '../state/store.js';
import { formatDate } from '../utils/date.js';
import { getBookingFullName } from '../utils/format.js';

export function exportSummaryExcel(filter) {
    let count = 1;
    let exportList = store.dataBookings.filter(b => b.status === 'approved').sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let titleText = "รายงานสรุปการใช้งานยานพาหนะ โรงเรียนสอาดเผดิมวิทยา";
    let filename = "รายงานสรุปการใช้รถ";

    if (filter.type === 'month') {
        const m = parseInt(filter.m);
        const y = parseInt(filter.y);
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        titleText += ` ประจำเดือน ${thaiMonths[m]} พ.ศ. ${y + 543}`;
        filename += `_${thaiMonths[m]}_${y + 543}`;
        exportList = exportList.filter(b => { const d = new Date(b.startDateTime); return d.getMonth() === m && d.getFullYear() === y; });
    } else {
        titleText += " (ข้อมูลทั้งหมด)";
        filename += "_ทั้งหมด";
    }

    if (exportList.length === 0) {
        Swal.fire('ไม่พบข้อมูล', 'ไม่มีข้อมูลการใช้รถในเดือนที่เลือก', 'info');
        return;
    }

    const aoa = [];
    aoa.push([titleText]);
    aoa.push([]);
    aoa.push(['ที่', 'ชื่อรถ', 'ทะเบียนรถ', 'ประเภท', 'วันที่ขออนุญาต', 'ผู้ขอใช้', 'สถานที่ที่ไป', 'วันเวลาเริ่มต้น', 'วันเวลาสิ้นสุด', 'พนักงานขับรถ', 'จำนวนผู้โดยสาร (คน)']);

    exportList.forEach(b => {
        const v = store.dataVehicles.find(x => x.id === b.vehicleId) || {};
        const d = store.dataDrivers.find(x => x.id === b.driverId) || {};
        const driverName = d.name || '-';
        const fullName = getBookingFullName(b);

        const startDate = new Date(b.startDateTime);
        const endDate = new Date(b.endDateTime);
        const startStr = `${startDate.getDate().toString().padStart(2,'0')}/${(startDate.getMonth()+1).toString().padStart(2,'0')}/${startDate.getFullYear()+543} ${startDate.getHours().toString().padStart(2,'0')}:${startDate.getMinutes().toString().padStart(2,'0')} น.`;
        const endStr = `${endDate.getDate().toString().padStart(2,'0')}/${(endDate.getMonth()+1).toString().padStart(2,'0')}/${endDate.getFullYear()+543} ${endDate.getHours().toString().padStart(2,'0')}:${endDate.getMinutes().toString().padStart(2,'0')} น.`;
        const createDateStr = formatDate(b.created_at);

        aoa.push([
            count++,
            v.name || '-',
            v.plate || '-',
            v.type || b.requestedType,
            createDateStr,
            fullName,
            b.location,
            startStr,
            endStr,
            driverName,
            b.passengers
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const wscols = [{ wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 15 }];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "ข้อมูลการใช้รถ");

    Swal.fire({ title: 'ดาวน์โหลด Excel สำเร็จ', text: 'ไฟล์จะถูกดาวน์โหลดลงในเครื่องของคุณ', icon: 'success', showConfirmButton: false, timer: 1500 });
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
