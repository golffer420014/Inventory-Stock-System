# Server — Inventory & Stock System (Backend)

Backend API ของระบบ Inventory & Stock System (Mini ERP) พัฒนาด้วย Node.js + Express + TypeScript

รายละเอียดภาพรวมของทั้งระบบ (Business Workflow, Role Permission, Tech Stack) ดูได้ที่ [README หลักของโปรเจกต์](../README.md)

---

## Stack

- Node.js
- Express
- TypeScript (รันตรงด้วย `tsx` ระหว่าง dev)
- PostgreSQL (วางแผนต่อผ่าน pg / Knex / Prisma — ยังไม่ได้เลือก client)
- Redis (สำหรับ cache — ยังไม่ได้ต่อ client จริง)
- Handlebars (สร้าง template เอกสาร เช่น Invoice)

## รูปแบบโครงสร้าง (Structure Pattern)

โปรเจกต์นี้ใช้ **Layered Architecture** แบบ **Route → Controller → Service → Repository** โดยแยกความรับผิดชอบแต่ละชั้นให้ชัดเจน:

```
Route            รับ request, ผูก path กับ controller, คุม middleware/permission
  → Controller    รับ request/response, แปลง input/output, ไม่มี business logic
    → Service      ตรรกะทางธุรกิจ (business logic), คำนวณ, validation, workflow
      → Repository  เข้าถึงข้อมูล (query database) เท่านั้น ไม่มี business logic
```

แยกโฟลเดอร์ตาม **layer ก่อน แล้วแบ่งไฟล์ย่อยตาม domain** ภายใน layer นั้น (เช่น `product`, `inventory`, `salesOrder`, `invoice`, `dashboard`)

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
    │   ├── inventory.routes.ts
    │   ├── salesOrder.routes.ts
    │   ├── invoice.routes.ts
    │   └── dashboard.routes.ts
    │
    ├── controllers/        # รับ request/response โดยตรง เรียก service แล้วส่งผลลัพธ์กลับเป็น JSON
    │   ├── product.controller.ts
    │   ├── inventory.controller.ts
    │   ├── salesOrder.controller.ts
    │   ├── invoice.controller.ts
    │   └── dashboard.controller.ts
    │
    ├── services/           # Business logic หลักของระบบ เช่น คำนวณยอดขาย, สร้าง Invoice, อัปเดต Stock, workflow ต่าง ๆ
    │   ├── product.service.ts
    │   ├── inventory.service.ts
    │   ├── salesOrder.service.ts
    │   ├── invoice.service.ts
    │   └── dashboard.service.ts
    │
    ├── repositories/       # ชั้นเข้าถึงข้อมูล (data access) คุยกับฐานข้อมูลโดยตรง ไม่มี business logic
    │   ├── product.repository.ts
    │   ├── inventory.repository.ts
    │   ├── salesOrder.repository.ts
    │   └── invoice.repository.ts
    │
    ├── middlewares/        # Express middleware
    │   ├── auth.middleware.ts        # Demo auth — อ่าน role จาก header `x-demo-role` (ยังไม่มีระบบ login จริง)
    │   ├── role.middleware.ts        # requireRole(...roles) ตรวจสิทธิ์ตาม Permission Matrix ก่อนเข้าถึง route
    │   └── errorHandler.middleware.ts # ดักจับ error กลางของแอปแล้วตอบกลับเป็น response ที่เหมาะสม
    │
    ├── config/              # ค่าตั้งต้นของระบบ อ่านจาก environment variable
    │   ├── env.ts             # รวมค่า env ทั้งหมด (PORT, CLIENT_ORIGIN, DATABASE_URL, REDIS_URL)
    │   └── database.ts        # ตั้งค่าการเชื่อมต่อฐานข้อมูล
    │
    ├── cache/               # การเชื่อมต่อและใช้งาน cache
    │   └── redis.client.ts    # Redis client
    │
    ├── templates/           # Template สำหรับสร้างเอกสาร
    │   └── invoice.hbs        # Handlebars template ของ Invoice (ใช้ร่วมกับ Puppeteer เพื่อ generate PDF)
    │
    ├── types/               # Type / Interface กลางที่ใช้ร่วมกันหลายไฟล์ในแต่ละโดเมน
    │   ├── product.types.ts
    │   ├── inventory.types.ts
    │   ├── salesOrder.types.ts
    │   ├── dashboard.types.ts
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

Copy `.env.example` เป็น `.env` แล้วปรับค่าตามการใช้งาน:

```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_stock_system
REDIS_URL=redis://localhost:6379
```

## API

ทุก endpoint ถูก mount อยู่ใต้ `/api` (เช่น `/api/products`, `/api/inventory`, `/api/sales-orders`, `/api/invoices`, `/api/dashboard`)

มี `GET /health` สำหรับตรวจสอบสถานะ server

Request ต้องส่ง header `x-demo-role` เพื่อจำลอง role ของผู้ใช้งาน (ระบบยังไม่มี authentication จริง) โดย role และสิทธิ์การเข้าถึงแต่ละ endpoint เป็นไปตาม Permission Matrix ใน [README หลักของโปรเจกต์](../README.md#5-demo-role--permission-matrix)
