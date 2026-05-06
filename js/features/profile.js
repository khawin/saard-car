import { db } from '../config/firebase.js';
import { store } from '../state/store.js';

export function toggleSigInput() {
    const option = document.querySelector('input[name="sig-option"]:checked').value;
    const container = document.getElementById('sig-preview-container');
    const fileInput = document.getElementById('req-sig-file');
    if (option === 'saved') {
        fileInput.classList.add('hidden-section');
        if (store.currentUser && store.currentUser.signature) {
            container.innerHTML = `<img src="${store.currentUser.signature}" class="h-20 object-contain">`;
        } else {
            container.innerHTML = `<span class="text-red-400 text-sm">ยังไม่มีลายเซ็นที่บันทึกไว้ในหน้าส่วนตัว</span>`;
        }
    } else {
        fileInput.classList.remove('hidden-section');
        container.innerHTML = `<span class="text-gray-400 text-sm">อัปโหลดภาพใหม่ด้านล่าง</span>`;
    }
}

export function previewUploadSig() {
    const file = document.getElementById('req-sig-file').files[0];
    const container = document.getElementById('sig-preview-container');
    if (file) {
        if (file.type !== 'image/png') {
            Swal.fire('รูปแบบไฟล์ผิด', 'กรุณาอัปโหลดไฟล์ลายเซ็นนามสกุล .png เท่านั้น', 'error');
            document.getElementById('req-sig-file').value = '';
            container.innerHTML = '<span class="text-gray-400 text-sm">ลายเซ็นจะปรากฏที่นี่</span>';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => container.innerHTML = `<img src="${e.target.result}" class="h-20 object-contain">`;
        reader.readAsDataURL(file);
    }
}

export function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
    else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
}

export function changePassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-password').value;
    if (store.currentUser && store.currentUser.uid) {
        db.ref(`users/${store.currentUser.uid}`).update({ password: newPass });
        Swal.fire('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
        document.getElementById('new-password').value = '';
        document.getElementById('current-password-display').value = newPass;
    }
}

export function uploadProfileSig() {
    const file = document.getElementById('profile-sig-upload').files[0];
    if (file) {
        if (file.type !== 'image/png') return Swal.fire('รูปแบบไฟล์ผิด', 'กรุณาอัปโหลดไฟล์ลายเซ็นนามสกุล .png เท่านั้น', 'error');
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            db.ref(`users/${store.currentUser.uid}`).update({ signature: base64 });
            store.currentUser.signature = base64;
            document.getElementById('profile-sig-preview').innerHTML = `<img src="${base64}" class="h-20 object-contain">`;
            Swal.fire('สำเร็จ', 'บันทึกลายเซ็นเรียบร้อย', 'success');
        };
        reader.readAsDataURL(file);
    }
}
