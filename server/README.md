# Server — Inventory & Stock System (Backend)

Backend API ของระบบ Inventory & Stock System (Mini ERP) พัฒนาด้วย Node.js + Express + TypeScript

รายละเอียดภาพรวมของทั้งระบบ (Business Workflow, Role Permission, Tech Stack) ดูได้ที่ [README หลักของโปรเจกต์](../README.md)

---

## Stack

- Node.js
- Express
- TypeScript (รันตรงด้วย `tsx` ระหว่าง dev)
- PostgreSQL ผ่าน [`pg`](https://node-postgres.com/) (`Pool`) — เชื่อมต่อ Supabase Postgres โดยตรง ไม่ใช้ ORM
- Puppeteer (generate PDF จาก HTML — ใช้ร่วมกับ Handlebars template)
- Handlebars (สร้าง template เอกสาร เช่น Invoice, Report)
- Multer (รับไฟล์อัปโหลด — เก็บลงดิสก์ในเครื่อง server)
- Redis (เตรียม config ไว้สำหรับ cache ในอนาคต — ยังไม่ได้ต่อ client จริง มีแค่ `REDIS_URL` เก็บไว้)

## รูปแบบโครงสร้าง (Structure Pattern)

โปรเจกต์นี้ใช้ **Layered Architecture** แบบ **Route → Controller → Service → Repository** โดยแยกความรับผิดชอบแต่ละชั้นให้ชัดเจน:

```
Route            รับ request, ผูก path กับ controller, คุม middleware/permission
  → Controller    รับ request/response, แปลง input/output, ไม่มี business logic
    → Service      ตรรกะทางธุรกิจ (business logic), คำนวณ, validation, workflow
      → Repository  เข้าถึงข้อมูล (query database) เท่านั้น ไม่มี business logic
```

แยกโฟลเดอร์ตาม **layer ก่อน แล้วแบ่งไฟล์ย่อยตาม domain** ภายใน layer นั้น (เช่น `product`, `inventory`, `salesOrder`, `invoice`, `dashboard`)

Domain ที่เป็น CRUD ตรงไปตรงมา ไม่มี transaction/join ซับซ้อน (`product`, `category`, `inventory`) ให้ repository เรียกผ่าน **Active Record base (`models/`)** แทนการเขียน SQL mapRow เอง — ส่วน domain ที่มี transaction หลายตาราง/workflow ซับซ้อน (`salesOrder`, `invoice`, `dashboard`, `report`) repository ยังคุย SQL ตรงผ่าน `pg` Pool/PoolClient เหมือนเดิม

## โครงสร้างโฟลเดอร์ (Folder Structure)

```txt
server/
├── database/
│   ├── migrations/        # ไฟล์ migration สำหรับสร้าง/แก้ไข schema ของฐานข้อมูล
│   └── seeds/              # ไฟล์ seed สำหรับเติมข้อมูลตั้งต้น/ข้อมูลทดสอบ
│
└── src/
    ├── routes/             # กำหนดเส้นทาง API และผูกกับ controller + middleware (เช่น requireRole)
    │   ├── index.ts          # รวมทุก route ย่อยเข้า apiRouter หลัก (mount ที่ /api)
    │   ├── product.routes.ts
    │   ├── category.routes.ts
    │   ├── upload.routes.ts     # POST /api/uploads — รับไฟล์รูปสินค้า/หลักฐานการชำระเงิน
    │   ├── inventory.routes.ts
    │   ├── salesOrder.routes.ts
    │   ├── invoice.routes.ts
    │   ├── dashboard.routes.ts
    │   ├── report.routes.ts
    │   └── notification.routes.ts # GET /api/notifications/stream — SSE แจ้งเตือนสินค้าใกล้หมด
    │
    ├── controllers/        # รับ request/response โดยตรง เรียก service แล้วส่งผลลัพธ์กลับเป็น JSON
    │   ├── product.controller.ts
    │   ├── category.controller.ts
    │   ├── upload.controller.ts
    │   ├── inventory.controller.ts
    │   ├── salesOrder.controller.ts
    │   ├── invoice.controller.ts
    │   ├── dashboard.controller.ts
    │   ├── report.controller.ts
    │   └── notification.controller.ts
    │
    ├── services/           # Business logic หลักของระบบ เช่น คำนวณยอดขาย, สร้าง Invoice, อัปเดต Stock, workflow ต่าง ๆ
    │   ├── product.service.ts
    │   ├── category.service.ts
    │   ├── inventory.service.ts
    │   ├── salesOrder.service.ts
    │   ├── invoice.service.ts
    │   ├── dashboard.service.ts
    │   └── report.service.ts    # คำนวณ Sales/Inventory Report + สร้างไฟล์ CSV และ PDF (ผ่าน Puppeteer)
    │
    ├── repositories/       # ชั้นเข้าถึงข้อมูล (data access) คุยกับฐานข้อมูลโดยตรง ไม่มี business logic
    │   ├── product.repository.ts
    │   ├── category.repository.ts
    │   ├── inventory.repository.ts
    │   ├── salesOrder.repository.ts
    │   ├── invoice.repository.ts
    │   ├── dashboard.repository.ts
    │   └── report.repository.ts
    │
    ├── models/              # Active Record base (Model) — ใช้แล้วใน product/category/inventory repository ปัจจุบัน
    │   ├── base.model.ts      # Model abstract class กลาง: findAll/findById/findOneBy/findManyBy/create/updateById/deleteById/save
    │   │                      # (แปลง camelCase <-> snake_case ให้อัตโนมัติ ไม่ต้องเขียน mapRow เอง)
    │   ├── product.model.ts
    │   ├── category.model.ts
    │   └── inventoryMovement.model.ts
    │   # invoice.model.ts, salesOrder.model.ts, salesOrderItem.model.ts มีไฟล์ไว้แล้วแต่ยังไม่ได้เอามาใช้จริง (repository ยังเป็น SQL ตรง)
    │
    ├── middlewares/        # Express middleware
    │   ├── auth.middleware.ts        # Demo auth — อ่าน role จาก header `x-demo-role` (ยังไม่มีระบบ login จริง)
    │   ├── role.middleware.ts        # requireRole(...roles) ตรวจสิทธิ์ตาม Permission Matrix ก่อนเข้าถึง route
    │   ├── upload.middleware.ts      # Multer — เก็บไฟล์อัปโหลด (รูปสินค้า/สลิป) ลง public/uploads
    │   └── errorHandler.middleware.ts # ดักจับ error กลางของแอปแล้วตอบกลับเป็น response ที่เหมาะสม
    │
    ├── config/              # ค่าตั้งต้นของระบบ อ่านจาก environment variable
    │   ├── env.ts             # รวมค่า env ทั้งหมด (PORT, CLIENT_ORIGIN, DATABASE_URL, REDIS_URL)
    │   └── database.ts        # ตั้งค่าการเชื่อมต่อฐานข้อมูล
    │
    ├── cache/               # การเชื่อมต่อและใช้งาน cache
    │   └── redis.client.ts    # Redis client
    │
    ├── templates/           # Template สำหรับสร้างเอกสาร PDF (Handlebars ใช้ร่วมกับ Puppeteer) — จัดเป็นเอกสารทางการ (header บริษัท/content/footer)
    │   ├── invoice.hbs             # Invoice — มีช่องทางการชำระเงิน + ยอดเงินเป็นตัวอักษรภาษาไทยที่ footer
    │   ├── salesReport.hbs         # Sales Report — ยอดขายรวมเป็นตัวอักษรภาษาไทยที่ footer
    │   └── inventoryReport.hbs     # Inventory Report — สรุปรายงานที่ footer (ไม่มียอดเงิน)
    │
    ├── types/               # Type / Interface กลางที่ใช้ร่วมกันหลายไฟล์ในแต่ละโดเมน
    │   ├── product.types.ts
    │   ├── inventory.types.ts
    │   ├── salesOrder.types.ts
    │   ├── dashboard.types.ts
    │   ├── report.types.ts
    │   └── role.types.ts
    │
    ├── utils/               # Utility function ที่ใช้ร่วมกันหลาย layer/domain
    │
    ├── app.ts                # ประกอบ Express app (middleware, route, error handler) — ไม่ start server
    └── server.ts              # Entry point — สั่ง app.listen() ตาม PORT ที่ตั้งค่าไว้
```

## Scripts

```sh
npm install
npm run dev      # start dev server ด้วย tsx watch (auto-reload)
npm run build     # compile TypeScript เป็น dist/
npm run start     # รัน production build จาก dist/server.js
```

## Environment

Copy `.env.example` เป็น `.env` แล้วปรับค่าตามการใช้งาน — โปรเจกต์นี้ต่อกับ **Supabase Postgres** โดยตรง (ไม่มี local DB setup):

```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Supabase Dashboard > Project Settings > Database > Connection pooling (Session mode)
DATABASE_URL=postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres

REDIS_URL=redis://localhost:6379   # เก็บไว้เผื่ออนาคต ยังไม่ได้ใช้งานจริง

# Supabase Dashboard > Settings > API — เผื่อใช้ตอนต่อ authentication จริงในอนาคต
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_JWKS_URL=https://<ref>.supabase.co/auth/v1/.well-known/jwks.json
```

## API

ทุก endpoint ถูก mount อยู่ใต้ `/api` (เช่น `/api/products`, `/api/categories`, `/api/uploads`, `/api/inventory`, `/api/sales-orders`, `/api/invoices`, `/api/dashboard`, `/api/reports`, `/api/notifications`)

มี `GET /health` สำหรับตรวจสอบสถานะ server

ไฟล์ที่อัปโหลดผ่าน `POST /api/uploads` (รูปสินค้า, สลิปหลักฐานการชำระเงิน) ถูกเก็บไว้ในดิสก์ของ server เอง (`server/public/uploads`, ผ่าน Multer) แล้ว serve กลับผ่าน `express.static` ที่ path `/uploads/<filename>` — ไม่ได้ใช้ Supabase Storage

`GET /api/notifications/stream` เปิด Server-Sent Events connection ค้างไว้ ใช้ push แจ้งเตือนสินค้าใกล้หมดแบบ real-time ไปที่ client (ไม่ต้อง poll)

Request ต้องส่ง header `x-demo-role` เพื่อจำลอง role ของผู้ใช้งาน (ระบบยังไม่มี authentication จริง) โดย role และสิทธิ์การเข้าถึงแต่ละ endpoint เป็นไปตาม Permission Matrix ใน [README หลักของโปรเจกต์](../README.md#5-demo-role--permission-matrix)
