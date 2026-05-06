import { store } from '../state/store.js';
import { showPage } from './router.js';
import { debouncedRefresh } from '../utils/debounce.js';
import { toggleSigInput } from '../features/profile.js';

export function switchRole(role) {
    store.currentRole = role;
    const indicator = document.getElementById('role-indicator');
    const btnTeacher = document.getElementById('btn-login-teacher');
    const btnAdmin = document.getElementById('btn-login-admin');
    const hint = document.getElementById('first-login-hint');
    if (role === 'teacher') {
        indicator.style.transform = 'translateX(0)';
        btnTeacher.classList.replace('text-gray-400', 'text-blue-600');
        btnAdmin.classList.replace('text-blue-600', 'text-gray-400');
        document.getElementById('username').placeholder = "เลขบัตรประชาชน 13 หลัก";
        hint.classList.remove('hidden-section');
    } else {
        indicator.style.transform = 'translateX(100%)';
        btnTeacher.classList.replace('text-blue-600', 'text-gray-400');
        btnAdmin.classList.replace('text-gray-400', 'text-blue-600');
        document.getElementById('username').placeholder = "ชื่อผู้ใช้";
        hint.classList.add('hidden-section');
    }
}

export function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    let success = false, userObj = null;

    if (store.currentRole === 'admin' && u === 'admin' && p === 'saadmin') {
        success = true;
        userObj = { role: 'admin', name: "หัวหน้างานยานพาหนะ", id: 'admin' };
    } else if (store.currentRole === 'teacher') {
        const foundUser = store.dataUsers.find(user => user.cardId === u && user.password === p);
        if (foundUser) {
            success = true;
            userObj = { ...foundUser, role: 'teacher', uid: foundUser.id };
        }
    }

    if (success) {
        store.currentUser = userObj;
        document.getElementById('login-section').classList.add('hidden-section');
        document.getElementById('dashboard-section').classList.remove('hidden-section');
        document.getElementById('mobile-bottom-nav').classList.remove('hidden-section');

        let displayName = store.currentUser.name;
        if (store.currentUser.role === 'teacher') displayName = `${store.currentUser.prefix}${store.currentUser.name} ${store.currentUser.surname}`;
        document.getElementById('user-role-display').innerText = displayName;

        document.getElementById('nav-menu-teacher').classList.toggle('hidden-section', store.currentRole === 'admin');
        document.getElementById('nav-menu-admin').classList.toggle('hidden-section', store.currentRole !== 'admin');
        document.getElementById('mob-nav-teacher').classList.toggle('hidden-section', store.currentRole === 'admin');
        document.getElementById('mob-nav-admin').classList.toggle('hidden-section', store.currentRole !== 'admin');

        if (store.currentRole === 'teacher') {
            document.getElementById('profile-name').innerText = displayName;
            document.getElementById('profile-id').innerText = `เลขบัตรประชาชน: ${store.currentUser.cardId || store.currentUser.id}`;
            document.getElementById('current-password-display').value = store.currentUser.password;
            document.getElementById('req-name-display').value = displayName;
            document.getElementById('profile-sig-preview').innerHTML = store.currentUser.signature ? `<img src="${store.currentUser.signature}" class="h-20 object-contain">` : `<span class="text-gray-400 text-sm">ยังไม่มีลายเซ็น</span>`;
            toggleSigInput();
            document.getElementById('label-pending').innerText = "รายการรออนุมัติของคุณ";
            document.getElementById('label-processed').innerText = "รายการตอบรับแล้วของคุณ";
        } else {
            document.getElementById('label-pending').innerText = "รออนุมัติ";
            document.getElementById('label-processed').innerText = "ตอบรับแล้ว";
        }
        showPage('home');
        debouncedRefresh();
        Swal.fire({ icon: 'success', title: 'ยินดีต้อนรับ', showConfirmButton: false, timer: 1500 });
    } else {
        Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', text: 'ข้อมูลไม่ถูกต้อง', confirmButtonColor: '#3B82F6' });
    }
}

export function handleLogout() {
    Swal.fire({
        title: 'ออกจากระบบ?', icon: 'question', showCancelButton: true,
        confirmButtonText: 'ยืนยัน', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#EF4444'
    }).then((result) => { if (result.isConfirmed) location.reload(); });
}
