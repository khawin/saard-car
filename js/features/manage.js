import { db } from '../config/firebase.js';
import { store, ITEMS_PER_PAGE } from '../state/store.js';
import { createPaginationHTML } from '../utils/format.js';

export function renderManageTable(type, keepPage = false) {
    store.manageMode = type;
    if (!keepPage) store.curPageManage = 1;

    const titles = { vehicle: 'ข้อมูลยานพาหนะ', driver: 'ข้อมูลพนักงานขับรถ', teacher: 'ข้อมูลบุคลากรครู' };
    document.getElementById('manage-title').innerText = titles[type];

    document.getElementById('manage-title-bar').className = "w-1.5 sm:w-2 h-6 sm:h-8 rounded-full bg-pink-500";

    ['vehicle', 'driver', 'teacher'].forEach(t => {
        const card = document.getElementById(`card-manage-${t}`);
        if (t === type) { card.classList.add('manage-card-active'); card.classList.remove('manage-card-inactive'); }
        else { card.classList.remove('manage-card-active'); card.classList.add('manage-card-inactive'); }
    });

    store.curManageData = type === 'vehicle' ? store.dataVehicles : (type === 'driver' ? store.dataDrivers : store.dataUsers);
    renderManageDataRows();
}

export function changePageManage(page) {
    store.curPageManage = page;
    renderManageDataRows();
}

function renderManageDataRows() {
    const type = store.manageMode;
    const thead = document.getElementById('manage-table-head');
    const tbody = document.getElementById('manage-table-body');
    const mobileContainer = document.getElementById('manage-mobile-container');
    const pagContainer = document.getElementById('manage-pagination');

    tbody.innerHTML = ''; mobileContainer.innerHTML = ''; pagContainer.innerHTML = '';

    const startIndex = (store.curPageManage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayData = store.curManageData.slice(startIndex, endIndex);

    if (type === 'vehicle') {
        thead.innerHTML = `<tr><th class="text-left rounded-tl-xl w-1/3">ชื่อรถ</th><th class="text-center w-1/4">ทะเบียน</th><th class="text-center w-1/4">ประเภท</th><th class="text-center rounded-tr-xl w-24">จัดการ</th></tr>`;
        displayData.forEach(item => {
            tbody.insertAdjacentHTML('beforeend', `<tr class="border-b border-gray-50"><td class="text-left font-medium text-gray-800">${item.name}</td><td class="text-center text-gray-700">${item.plate}</td><td class="text-center text-gray-700">${item.type}</td><td class="text-center"><div class="flex justify-center gap-2"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 hover:bg-blue-50 w-8 h-8 rounded-lg"><i class="fas fa-edit"></i></button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg"><i class="fas fa-trash"></i></button></div></td></tr>`);
            mobileContainer.insertAdjacentHTML('beforeend', `<div class="mobile-card"><div class="flex justify-between items-start mb-2"><h4 class="font-medium text-gray-800">${item.name}</h4><span class="text-gray-600 text-sm">${item.plate}</span></div><div class="text-sm text-gray-600 mb-2">${item.type}</div><div class="flex justify-end pt-2 border-t border-gray-100 gap-3"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-edit"></i> แก้ไข</button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-trash"></i> ลบ</button></div></div>`);
        });
    } else if (type === 'driver') {
        thead.innerHTML = `<tr><th class="text-left rounded-tl-xl w-1/2">ชื่อ-สกุล</th><th class="text-center w-1/3">เบอร์โทร</th><th class="text-center rounded-tr-xl w-24">จัดการ</th></tr>`;
        displayData.forEach(item => {
            tbody.insertAdjacentHTML('beforeend', `<tr class="border-b border-gray-50"><td class="text-left font-medium text-gray-800">${item.name}</td><td class="text-center text-gray-700">${item.phone}</td><td class="text-center"><div class="flex justify-center gap-2"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 hover:bg-blue-50 w-8 h-8 rounded-lg"><i class="fas fa-edit"></i></button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg"><i class="fas fa-trash"></i></button></div></td></tr>`);
            mobileContainer.insertAdjacentHTML('beforeend', `<div class="mobile-card"><div class="flex justify-between items-start mb-2"><h4 class="font-medium text-gray-800">${item.name}</h4></div><div class="text-sm text-gray-700 mb-2"><i class="fas fa-phone mr-1"></i> ${item.phone}</div><div class="flex justify-end pt-2 border-t border-gray-100 gap-3"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-edit"></i> แก้ไข</button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-trash"></i> ลบ</button></div></div>`);
        });
    } else {
        thead.innerHTML = `<tr><th class="text-left rounded-tl-xl w-2/5">ชื่อ-สกุล</th><th class="text-center w-1/4">เลขบัตรฯ</th><th class="text-center w-1/4">รหัสผ่าน</th><th class="text-center rounded-tr-xl w-32">จัดการ</th></tr>`;
        displayData.forEach(item => {
            tbody.insertAdjacentHTML('beforeend', `<tr class="border-b border-gray-50"><td class="text-left font-medium text-gray-800">${item.prefix}${item.name} ${item.surname}</td><td class="text-center text-sm text-gray-700">${item.cardId}</td><td class="text-center text-sm text-gray-700">${item.password}</td><td class="text-center flex justify-center gap-1"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 hover:bg-blue-50 w-8 h-8 rounded-lg"><i class="fas fa-edit"></i></button><button onclick="resetPassword('${item.id}')" class="text-yellow-500 hover:bg-yellow-50 w-8 h-8 rounded-lg" title="รีเซ็ตรหัสผ่าน"><i class="fas fa-key"></i></button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg"><i class="fas fa-trash"></i></button></td></tr>`);
            mobileContainer.insertAdjacentHTML('beforeend', `<div class="mobile-card"><div class="flex justify-between items-start mb-2"><h4 class="font-medium text-gray-800">${item.prefix}${item.name} ${item.surname}</h4></div><div class="mobile-card-row"><span class="mobile-card-label">เลขบัตรฯ:</span> <span class="mobile-card-value text-gray-700">${item.cardId}</span></div><div class="mobile-card-row"><span class="mobile-card-label">รหัสผ่าน:</span> <span class="mobile-card-value text-gray-700">${item.password}</span></div><div class="flex justify-end gap-3 pt-2 border-t border-gray-100"><button onclick="editItem('${type}', '${item.id}')" class="text-blue-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-edit"></i> แก้ไข</button><button onclick="resetPassword('${item.id}')" class="text-yellow-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-key"></i> รีเซ็ต</button><button onclick="deleteItem('${type}', '${item.id}')" class="text-red-500 text-sm font-bold flex items-center gap-1"><i class="fas fa-trash"></i> ลบ</button></div></div>`);
        });
    }

    pagContainer.innerHTML = createPaginationHTML(store.curManageData.length, store.curPageManage, ITEMS_PER_PAGE, 'changePageManage');
}

export function addNewData() {
    if (store.manageMode === 'vehicle') {
        Swal.fire({
            title: 'เพิ่มยานพาหนะ',
            html: `<div class="space-y-4 text-left font-sans mt-2">
                    <div><input id="new-v-name" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition" placeholder="ชื่อรถ"></div>
                    <div><input id="new-v-plate" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition" placeholder="ทะเบียน"></div>
                    <div><select id="new-v-type" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition bg-white"><option>รถตู้</option><option>รถกระบะ</option><option>รถบรรทุก</option><option>รถยนต์ส่วนบุคคล</option></select></div>
                   </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', customClass: { popup: 'rounded-3xl' }
        }).then((res) => {
            if (res.isConfirmed) {
                db.ref('vehicles').push({ name: document.getElementById('new-v-name').value, plate: document.getElementById('new-v-plate').value, type: document.getElementById('new-v-type').value });
                Swal.fire('สำเร็จ', '', 'success');
            }
        });
    } else if (store.manageMode === 'driver') {
        Swal.fire({
            title: 'เพิ่มพนักงานขับรถ',
            html: `<div class="space-y-4 text-left font-sans mt-2">
                    <div><input id="new-d-name" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition" placeholder="ชื่อ-สกุล"></div>
                    <div><input id="new-d-phone" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition" placeholder="เบอร์โทร"></div>
                   </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', customClass: { popup: 'rounded-3xl' }
        }).then((res) => {
            if (res.isConfirmed) {
                db.ref('drivers').push({ name: document.getElementById('new-d-name').value, phone: document.getElementById('new-d-phone').value });
                Swal.fire('สำเร็จ', '', 'success');
            }
        });
    } else {
        Swal.fire({
            title: '<span class="text-gray-800 font-bold text-2xl">เพิ่มบุคลากรครู</span>',
            width: '700px',
            html: `
            <div class="space-y-6 text-left font-sans mt-4">
                <div class="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <h4 class="font-bold text-blue-600 mb-4 text-lg">วิธีที่ 1: เพิ่มทีละคน</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <select id="new-t-prefix" class="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition w-full bg-white"><option>นาย</option><option>นาง</option><option>นางสาว</option></select>
                        <input id="new-t-name" class="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition w-full" placeholder="ชื่อ">
                        <input id="new-t-surname" class="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition w-full" placeholder="นามสกุล">
                        <input id="new-t-card" class="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition w-full" placeholder="เลขบัตรฯ 13 หลัก">
                    </div>
                    <button onclick="addTeacherSingle()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm w-full transition shadow-sm">บันทึก 1 คน</button>
                </div>
                <div class="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <h4 class="font-bold text-blue-600 mb-1 text-lg">วิธีที่ 2: เพิ่มหลายคน (Copy Paste)</h4>
                    <p class="text-xs text-gray-500 mb-3">รูปแบบ: คำนำหน้า ชื่อ นามสกุล เลขบัตรฯ (1 คนต่อ 1 บรรทัด)</p>
                    <textarea id="new-t-bulk" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition h-32 text-sm font-mono bg-white resize-none" placeholder="นาย สมชาย ใจดี 1234567890123&#10;นางสาว มีนา รักเรียน 1234567890124"></textarea>
                    <button type="button" onclick="addTeacherBulk()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm w-full transition shadow-sm">บันทึกหลายคน</button>
                </div>
            </div>`,
            showCancelButton: true, showConfirmButton: false, cancelButtonText: 'ปิด',
            customClass: { popup: 'rounded-3xl' }
        });
    }
}

export function editItem(type, id) {
    if (type === 'vehicle') {
        const item = store.dataVehicles.find(v => v.id === id);
        if (!item) return;
        Swal.fire({
            title: 'แก้ไขยานพาหนะ',
            html: `<div class="space-y-4 text-left font-sans mt-2">
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">ชื่อรถ</label><input id="edit-v-name" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.name}"></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">ทะเบียน</label><input id="edit-v-plate" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.plate}"></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">ประเภท</label><select id="edit-v-type" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"><option ${item.type === 'รถตู้' ? 'selected' : ''}>รถตู้</option><option ${item.type === 'รถกระบะ' ? 'selected' : ''}>รถกระบะ</option><option ${item.type === 'รถบรรทุก' ? 'selected' : ''}>รถบรรทุก</option><option ${item.type === 'รถยนต์ส่วนบุคคล' ? 'selected' : ''}>รถยนต์ส่วนบุคคล</option></select></div>
                   </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#3B82F6', customClass: { popup: 'rounded-3xl' },
            preConfirm: () => { return { name: document.getElementById('edit-v-name').value, plate: document.getElementById('edit-v-plate').value, type: document.getElementById('edit-v-type').value } }
        }).then((res) => { if (res.isConfirmed) { db.ref(`vehicles/${id}`).update(res.value); Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success'); } });
    } else if (type === 'driver') {
        const item = store.dataDrivers.find(d => d.id === id);
        if (!item) return;
        Swal.fire({
            title: 'แก้ไขพนักงานขับรถ',
            html: `<div class="space-y-4 text-left font-sans mt-2">
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">ชื่อ-สกุล</label><input id="edit-d-name" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.name}"></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">เบอร์โทร</label><input id="edit-d-phone" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.phone}"></div>
                   </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#3B82F6', customClass: { popup: 'rounded-3xl' },
            preConfirm: () => { return { name: document.getElementById('edit-d-name').value, phone: document.getElementById('edit-d-phone').value } }
        }).then((res) => { if (res.isConfirmed) { db.ref(`drivers/${id}`).update(res.value); Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success'); } });
    } else if (type === 'teacher') {
        const item = store.dataUsers.find(u => u.id === id);
        if (!item) return;
        Swal.fire({
            title: 'แก้ไขบุคลากรครู',
            html: `<div class="space-y-4 text-left font-sans mt-2">
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">คำนำหน้า</label>
                    <select id="edit-t-prefix" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"><option ${item.prefix === 'นาย' ? 'selected' : ''}>นาย</option><option ${item.prefix === 'นาง' ? 'selected' : ''}>นาง</option><option ${item.prefix === 'นางสาว' ? 'selected' : ''}>นางสาว</option></select></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">ชื่อ</label><input id="edit-t-name" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.name}"></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">นามสกุล</label><input id="edit-t-surname" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.surname}"></div>
                    <div><label class="block text-sm font-bold text-gray-700 mb-1">เลขบัตรประชาชน (Login)</label><input id="edit-t-card" class="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition" value="${item.cardId}"></div>
                   </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#3B82F6', customClass: { popup: 'rounded-3xl' },
            preConfirm: () => { return { prefix: document.getElementById('edit-t-prefix').value, name: document.getElementById('edit-t-name').value, surname: document.getElementById('edit-t-surname').value, cardId: document.getElementById('edit-t-card').value } }
        }).then((res) => {
            if (res.isConfirmed) {
                if (res.value.cardId !== item.cardId && store.dataUsers.some(u => u.cardId === res.value.cardId)) { return Swal.fire('ข้อมูลซ้ำ', 'เลขบัตรประชาชนนี้มีในระบบแล้ว', 'error'); }
                db.ref(`users/${id}`).update(res.value); Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success');
            }
        });
    }
}

export function resetPassword(uid) {
    Swal.fire({
        title: 'รีเซ็ตรหัสผ่าน?', text: "รหัสผ่านจะกลับเป็น 'sateacher'", icon: 'warning',
        showCancelButton: true, confirmButtonText: 'รีเซ็ต', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#F59E0B'
    }).then((res) => {
        if (res.isConfirmed) {
            db.ref(`users/${uid}`).update({ password: 'sateacher' });
            Swal.fire('สำเร็จ', 'รีเซ็ตรหัสผ่านแล้ว', 'success');
        }
    });
}

export function deleteItem(type, id) {
    Swal.fire({
        title: 'ยืนยันการลบ?', text: "ข้อมูลจะหายไปอย่างถาวร", icon: 'warning',
        showCancelButton: true, confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#EF4444'
    }).then((res) => {
        if (res.isConfirmed) {
            const collection = type === 'vehicle' ? 'vehicles' : (type === 'driver' ? 'drivers' : 'users');
            db.ref(`${collection}/${id}`).remove();
            Swal.fire({ icon: 'success', title: 'ลบข้อมูลสำเร็จ', showConfirmButton: false, timer: 1000 });
        }
    });
}

export function addTeacherSingle() {
    const prefix = document.getElementById('new-t-prefix').value;
    const name = document.getElementById('new-t-name').value;
    const surname = document.getElementById('new-t-surname').value;
    const card = document.getElementById('new-t-card').value;
    if (!name || !surname || !card) return Swal.fire('ผิดพลาด', 'กรอกข้อมูลให้ครบ', 'error');
    if (store.dataUsers.some(u => u.cardId === card)) return Swal.fire('ข้อมูลซ้ำ', `มีเลขบัตรประชาชน ${card}ในระบบแล้ว`, 'warning');
    db.ref('users').push({ prefix, name, surname, cardId: card, password: 'sateacher', role: 'teacher' });
    Swal.fire('สำเร็จ', 'เพิ่มข้อมูลเรียบร้อย', 'success');
}

export function addTeacherBulk() {
    const bulk = document.getElementById('new-t-bulk').value;
    if (!bulk) return Swal.fire('ผิดพลาด', 'กรุณากรอกข้อมูล', 'error');
    const lines = bulk.split('\n');
    let count = 0, duplicates = 0;
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
            const cardId = parts[parts.length - 1];
            const prefix = parts[0];
            const name = parts[1];
            const surname = parts.slice(2, parts.length - 1).join(' ');
            if (store.dataUsers.some(u => u.cardId === cardId)) duplicates++;
            else { db.ref('users').push({ prefix, name, surname, cardId, password: 'sateacher', role: 'teacher' }); count++; }
        }
    });
    Swal.fire('ผลการทำงาน', `เพิ่มสำเร็จ ${count} รายการ${duplicates > 0 ? `<br>ข้อมูลซ้ำ ${duplicates} รายการ` : ''}`, 'success');
}
