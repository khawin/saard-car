# ระบบขออนุญาตใช้ยานพาหนะ - โรงเรียนสอาดเผดิมวิทยา

ระบบบริหารจัดการการขอใช้ยานพาหนะของโรงเรียน รองรับทั้งบุคลากรครู และผู้ดูแล (หัวหน้างาน) พร้อม export PDF/Excel

## ภาพรวมเทคโนโลยี

- **Frontend:** Plain HTML5 + ES6 Modules + Tailwind CSS (CDN)
- **Database:** Firebase Realtime Database (Compat SDK v8.10.1)
- **Auth:** Firebase Anonymous Auth + Login matching จาก Realtime DB
- **Libraries:** SweetAlert2, Font Awesome, html2pdf.js, SheetJS (xlsx), Flatpickr (locale: th)
- **Hosting:** GitHub Pages (Static — ไม่ต้องมี build step)

## โครงสร้างโปรเจกต์

```
saard-car/
├── index.html                  # Shell หลัก โหลด CSS/JS modules
├── README.md
│
├── css/
│   ├── main.css                # Base, glass-effect, buttons, custom-input
│   ├── components.css          # Dashboard cards, mobile cards, timeline
│   └── pdf.css                 # PDF export styles
│
├── views/
│   ├── login.html              # หน้า login
│   ├── dashboard.html          # Shell ของ dashboard (nav + container)
│   ├── home.html               # หน้าหลัก (cards + table + timeline + usage)
│   ├── request.html            # ฟอร์มขอใช้รถ
│   ├── profile.html            # โปรไฟล์ + ลายเซ็น + เปลี่ยนรหัสผ่าน
│   ├── manage.html             # จัดการ vehicles/drivers/teachers
│   └── partials/
│       ├── mobile-nav.html     # Mobile bottom nav
│       └── pdf-templates.html  # Template สำหรับ export PDF
│
└── js/
    ├── main.js                 # Entry point - import + window bindings + bootstrap
    ├── config/
    │   └── firebase.js         # Firebase init + export db, auth
    ├── state/
    │   └── store.js            # Global state (data arrays, currentUser, ฯลฯ)
    ├── core/
    │   ├── auth.js             # handleLogin, handleLogout, switchRole
    │   ├── router.js           # showPage, fetch helpers
    │   └── navigation.js       # updateNavState, toggleView
    ├── features/
    │   ├── dashboard.js        # refreshDashboard, filterBookings
    │   ├── bookings-table.js   # renderBookingsTable
    │   ├── request.js          # submitRequest, checkVehicleAvailability
    │   ├── approval.js         # openApproval, showImage
    │   ├── profile.js          # changePassword, uploadProfileSig, ฯลฯ
    │   ├── manage.js           # CRUD vehicles/drivers/teachers
    │   ├── timeline.js         # renderTimeline
    │   ├── usage.js            # renderUsageTable, showVehicleTrips
    │   └── notifications.js    # updateNotifications, dropdown
    ├── exports/
    │   ├── pdf.js              # printSinglePDF, printSummaryPDF
    │   └── excel.js            # exportSummaryExcel
    └── utils/
        ├── date.js             # formatDate, getDateParts, initDateSelectors
        ├── format.js           # getVehicleIcon, getBookingFullName, pagination
        └── debounce.js         # debouncedRefresh
```

## การรันแบบ Local (สำหรับทดสอบก่อน push)

> ⚠️ **สำคัญ:** ไม่สามารถดับเบิลคลิกเปิด `index.html` ได้ เพราะ ES6 modules + fetch ต้องใช้ HTTP server

### วิธีที่ 1: Python (มีติดตั้งใน macOS อยู่แล้ว)

```bash
cd /Users/ufund/Documents/project/saard-car
python3 -m http.server 8000
```

แล้วเปิดเบราว์เซอร์ที่ `http://localhost:8000`

### วิธีที่ 2: VS Code Live Server

ติดตั้ง extension "Live Server" (Ritwick Dey) → คลิกขวาที่ `index.html` → "Open with Live Server"

## การ Deploy ไปยัง GitHub Pages

ไฟล์ทั้งหมดเป็น static — push ขึ้น repo แล้วเปิดใช้ GitHub Pages ได้ทันที

```bash
cd /Users/ufund/Documents/project/saard-car
git add .
git commit -m "Refactor: split monolithic index.html into modules"
git push
```

หาก repo ยังไม่ enable GitHub Pages: ไปที่ **Settings → Pages → Branch: main / (root) → Save**

## การใช้งาน

### Role: บุคลากรครู (teacher)
- Login ด้วยเลขบัตรประชาชน 13 หลัก (รหัสผ่านเริ่มต้น: `sateacher`)
- ส่งคำขอใช้รถ + แนบหนังสืออนุญาตไปราชการ + ลายเซ็น
- ดูสถานะคำขอของตัวเอง + พิมพ์ PDF
- อัปเดตลายเซ็น + เปลี่ยนรหัสผ่าน

### Role: หัวหน้างาน (admin)
- Login: username `admin` / password `saadmin`
- พิจารณาคำขอ (อนุมัติ/ไม่อนุมัติ) + assign รถและคนขับ
- จัดการ vehicles, drivers, teachers (CRUD)
- ดู Timeline + สถิติการใช้รถ
- ส่งออกรายงาน PDF/Excel

## Firebase Database Schema

```
- /bookings/{id}      # คำขอใช้รถ
- /vehicles/{id}      # ข้อมูลรถ (name, plate, type)
- /drivers/{id}       # ข้อมูลคนขับ (name, phone)
- /users/{id}         # ข้อมูลบุคลากรครู (prefix, name, surname, cardId, password, signature)
```

## ไฟล์ Backup

ไฟล์ monolithic เดิมถูกเก็บไว้ที่ `index.html.backup` หากต้องการ rollback ให้ rename กลับเป็น `index.html`
