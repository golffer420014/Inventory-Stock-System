# Client — Inventory & Stock System (Frontend)

Frontend ของระบบ Inventory & Stock System (Mini ERP) พัฒนาด้วย Vue 3 + TypeScript

รายละเอียดภาพรวมของทั้งระบบ (Business Workflow, Role Permission, Tech Stack) ดูได้ที่ [README หลักของโปรเจกต์](../README.md)

---

## Stack

- Vue 3 (`<script setup lang="ts">`)
- TypeScript
- Vue Router
- Pinia (Option Store)
- Tailwind CSS v4
- Lucide Vue (icons)
- Vite

## รูปแบบโครงสร้าง (Structure Pattern)

โปรเจกต์นี้ใช้ **Feature-based folder ผสม Layered structure** กล่าวคือแบ่งโฟลเดอร์หลักตามหน้าที่ (layer) ก่อน เช่น `views`, `components`, `stores`, `services` แล้วค่อยแบ่งย่อยตาม feature/domain ภายใน layer นั้นอีกชั้น (เช่น `inventory`, `product`, `sales`, `dashboard`, `report`)

Flow การทำงานของข้อมูลในหน้าจอทั่วไป:

```
View (.vue)
  → เรียก Store (Pinia)
    → เรียก Service (services/*.service.ts)
      → เรียก API ผ่าน http.ts (axios/fetch wrapper)
        → Backend
```

ดูรายละเอียดรูปแบบการเขียนโค้ดในไฟล์ `.vue` (ลำดับ import / store / props / ref / computed / action / event / watch / onMounted) และกฎการตั้งชื่อ interface/type ได้ที่ [CLAUDE.md](./CLAUDE.md)

## โครงสร้างโฟลเดอร์ (Folder Structure)

```txt
client/
├── public/                  # Static asset ที่ไม่ผ่าน build (favicon, ฯลฯ)
└── src/
    ├── components/          # Vue component ที่ใช้ซ้ำได้ (ไม่ใช่ทั้งหน้า)
    │   ├── common/           # Component กลางของทั้งระบบ
    │   │   ├── BaseButton.vue        # รองรับ variant primary/secondary/ghost/danger
    │   │   ├── BaseInput.vue         # มี prop `error` แสดงกรอบแดง + ข้อความใต้ช่อง
    │   │   ├── BaseInputNumber.vue   # เหมือน BaseInput แต่ format ตัวเลขมี comma อัตโนมัติ
    │   │   ├── BaseCombobox.vue      # dropdown ค้นหาได้ รองรับ prop `error` เหมือนกัน
    │   │   ├── BaseDialog.vue        # modal กลาง มี focus trap + คืน focus ให้ trigger ตอนปิด
    │   │   ├── BaseConfirmDialog.vue # confirm dialog แบบ imperative (ผ่าน useConfirmStore) แทน window.confirm
    │   │   ├── BaseToastStack.vue    # แสดง toast รวมทั้งแจ้งเตือนสต๊อกใกล้หมดและผลลัพธ์ action ทั่วไป
    │   │   ├── BaseCard.vue, BaseAlert.vue, BaseBadge.vue, BaseSpinner.vue, BaseAsyncState.vue, BaseChart.vue
    │   │
    │   ├── dashboard/        # Component เฉพาะโดเมน Dashboard (การ์ดสรุปยอด, กราฟ ฯลฯ)
    │   ├── inventory/        # Component เฉพาะโดเมน Inventory (ฟอร์ม Stock In/Out, ตารางการเคลื่อนไหว ฯลฯ)
    │   ├── product/          # Component เฉพาะโดเมน Product
    │   ├── sales/            # Component เฉพาะโดเมน Sales Order / Invoice
    │   ├── AppSidebar.vue    # เมนูนำทางหลักของระบบ
    │   ├── AppBreadcrumb.vue # Breadcrumb แสดงตำแหน่งหน้าปัจจุบัน
    │   └── ThemeToggle.vue   # ปุ่มสลับ Light/Dark theme
    │
    ├── layouts/              # โครงหน้าหลัก (Layout) ที่ view ต่าง ๆ ถูกห่อด้วย
    │   └── DefaultLayout.vue # Layout หลักของระบบ (Sidebar + Breadcrumb + เนื้อหา)
    │
    ├── views/                # หน้าจอที่ผูกกับ route โดยตรง (1 ไฟล์ = 1 หน้า)
    │   ├── dashboard/         # หน้า Dashboard ภาพรวม
    │   ├── inventory/         # หน้า Stock In, Stock Out, Stock Adjustment, Inventory Movement
    │   ├── product/           # หน้ารายการสินค้า
    │   ├── report/            # หน้ารายงาน (Sales Report, Inventory Report)
    │   ├── sales/              # หน้า Sales Order (list/form) และ Invoice
    │   └── HomeView.vue        # หน้าแรกของระบบ
    │
    ├── router/               # การตั้งค่า Vue Router (กำหนด route, meta title, group เมนู)
    │   └── index.ts
    │
    ├── stores/               # Pinia store (Option Store) แยกตามโดเมน — เก็บ state กลาง, getter, action ที่เรียก service
    │   ├── dashboard.ts
    │   ├── inventory.ts
    │   ├── invoice.ts
    │   ├── product.ts
    │   ├── category.ts
    │   ├── report.ts
    │   ├── notification.ts    # เก็บ toast แจ้งเตือนสินค้าใกล้หมด รับข้อมูลจาก useNotificationStream (SSE)
    │   ├── toast.ts            # toast ทั่วไป (สำเร็จ/ล้มเหลว) — เรียกผ่าน useToastStore().push(message, variant)
    │   ├── confirm.ts          # confirm dialog แบบ imperative — เรียกผ่าน useConfirmStore().ask({...}) ได้ Promise<boolean>
    │   ├── role.ts             # เก็บ role ปัจจุบันของผู้ใช้ (Demo Role สำหรับสลับสิทธิ์ทดสอบ)
    │   ├── salesOrder.ts
    │   └── theme.ts            # เก็บสถานะ Light/Dark theme
    │
    ├── services/             # ชั้นเรียก API (HTTP layer) แยกตามโดเมน ไม่มี state, ไม่ผูกกับ Vue
    │   ├── http.ts             # ตัวกลางเรียก HTTP (base URL, header, error handling ร่วม)
    │   ├── dashboard.service.ts
    │   ├── inventory.service.ts
    │   ├── invoice.service.ts
    │   ├── product.service.ts
    │   ├── category.service.ts
    │   ├── report.service.ts
    │   ├── upload.service.ts   # อัปโหลดไฟล์ (รูปสินค้า/สลิป) ไปที่ POST /api/uploads
    │   └── salesOrder.service.ts
    │
    ├── composables/          # Composition function ที่ใช้ร่วมกันข้าม component
    │   ├── usePermission.ts         # ตรวจสอบสิทธิ์ของ role ปัจจุบันตาม Permission Matrix
    │   └── useNotificationStream.ts # เปิด SSE connection ไปที่ /api/notifications/stream แล้ว push เข้า notification store
    │
    ├── directives/           # Custom Vue directive
    │   └── numberFormat.ts    # v-number-format จัดรูปแบบตัวเลขใส่ comma อัตโนมัติใน input
    │
    ├── types/                # Type / Interface กลางที่ใช้ร่วมกันหลายไฟล์ในแต่ละโดเมน (prefix `i` = interface, prefix `t` = type alias)
    │   ├── dashboard.types.ts
    │   ├── inventory.types.ts
    │   ├── product.types.ts
    │   ├── report.types.ts
    │   ├── notification.types.ts
    │   ├── role.types.ts
    │   └── salesOrder.types.ts
    │
    ├── App.vue                # Root component
    ├── main.ts                 # Entry point — สร้าง app, ติดตั้ง Pinia, Router, directive
    └── style.css               # Global style / Tailwind entry
```

## แนวทาง UI/UX ที่ใช้ร่วมกันทั้งระบบ

- **แจ้งผลลัพธ์ action ด้วย toast เสมอ** — เรียก `useToastStore().push(message, 'success' | 'destructive')` หลัง action สำเร็จ อย่าปิด dialog เงียบ ๆ โดยไม่บอกผล
- **ยืนยัน action ที่ทำลายข้อมูลด้วย `useConfirmStore().ask({ title, message, confirmText, danger })`** (คืน `Promise<boolean>`) แทน `window.confirm` เพื่อให้ตรงธีมแอปและบอก impact ได้ (เช่น จำนวนสินค้าที่ผูกกับหมวดหมู่ที่จะลบ)
- **ฟอร์มที่ต้อง validate ให้ใช้ prop `error` ของ `BaseInput` / `BaseInputNumber` / `BaseCombobox`** เพื่อชี้ผิดเป็นรายช่อง แทนข้อความ error รวมช่องเดียว
- **ลิสต์ที่ยาว (สินค้า, Sales Order, Invoice, Inventory Movement) มีช่องค้นหาแบบ client-side** (`searchKeyword` + computed `filteredXList`) เพราะข้อมูลถูกโหลดมาทั้งหมดอยู่แล้ว ไม่ต้องยิง API ซ้ำ
- **`BaseDialog` มี focus trap ในตัว** — เปิดแล้ว focus จะเข้าไปใน dialog อัตโนมัติ และคืน focus ให้ปุ่มที่เปิดตอนปิด ไม่ต้องจัดการเอง

## Scripts

```sh
npm install
npm run dev        # start dev server (Vite)
npm run build       # type-check (vue-tsc) แล้ว build
npm run preview     # preview production build
```

## Environment

ตั้งค่า `VITE_API_BASE_URL` ผ่านไฟล์ `.env` (ยังไม่มีไฟล์ `.env.example` ในโปรเจกต์) ถ้าไม่ตั้งค่า ระบบจะ fallback ไปที่ `http://localhost:4000/api`
