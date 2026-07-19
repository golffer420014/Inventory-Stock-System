# Inventory & Stock System

ระบบบริหารจัดการการขายและคลังสินค้า (Mini ERP)

---

# 1. ภาพรวมโครงการ (Project Overview)

เป็นระบบจำลองการทำงานของธุรกิจที่มีการขายสินค้าและจัดการคลังสินค้า

ระบบออกแบบตาม Workflow โดยครอบคลุมกระบวนการตั้งแต่

- ฝ่ายขายสร้าง Sales Order
- ระบบสร้าง Invoice อัตโนมัติ
- คลังสินค้าดำเนินการจัดการ Stock
- ข้อมูลถูกนำไปแสดงผลผ่าน Dashboard และ Report

โปรเจกต์นี้จัดทำขึ้นเพื่อแสดงความสามารถด้าน Full Stack Development, Database Design และ Business Logic Design


---

# 2. วัตถุประสงค์ (Objective)

- สร้างระบบ Business Application ที่มี Workflow ใกล้เคียงระบบ ERP
- จำลองการทำงานของแต่ละฝ่ายภายในองค์กรผ่าน Role Permission
- แสดงแนวคิดการออกแบบระบบที่สามารถต่อยอดได้ในอนาคต


---

# 3. ขอบเขตระบบ (System Scope)

ระบบประกอบด้วย 4 ส่วนหลัก


## 1. Product Management (Sales)

ระบบจัดการข้อมูลสินค้าสำหรับฝ่ายขาย

ความสามารถ:

- ดูข้อมูลสินค้า, ค้นหาสินค้า (ชื่อ/ยี่ห้อ/SKU)
- ตรวจสอบราคาสินค้าและจำนวน Stock คงเหลือ
- จัดการหมวดหมู่สินค้า (เพิ่ม/ลบ) — ใช้สร้างเลข SKU อัตโนมัติตาม prefix ของหมวดหมู่
- เพิ่ม/แก้ไขสินค้า พร้อมอัปโหลดรูปภาพสินค้า (preview ขนาดเต็ม, คลิกดูรูปจริงได้)


---

## 2. Inventory Management (Warehouse)

ระบบจัดการคลังสินค้า

ความสามารถ:

- รับสินค้าเข้า (Stock In)
- เบิกสินค้าออก (Stock Out)
- ปรับปรุงจำนวนสินค้า (Stock Adjustment)
- ดูประวัติการเคลื่อนไหวของสินค้า (Inventory Movement)


ตัวอย่าง:

```
Product A

+100 Stock In

-20 Stock Out

+5 Adjustment
```


---

## 3. Sales Order & Invoice

ระบบจัดการคำสั่งขายและเอกสารทางการขาย


Workflow:

```
Create Sales Order (DRAFT)

↓

Confirm → System Generate Invoice (CONFIRMED)

↓

แนบไฟล์หลักฐานการชำระเงิน (อย่างน้อย 1 ไฟล์)

↓

Warehouse Process → Update Stock (FULFILLED)

↓

Stock Movement
```


ความสามารถ:

- สร้าง Sales Order ผ่าน Dialog พร้อมเพิ่มรายการสินค้าได้หลายบรรทัด (กันเลือกสินค้าซ้ำกันคนละบรรทัดในออเดอร์เดียว)
- คำนวณยอดรวมอัตโนมัติ
- ยืนยันคำสั่งขาย (Confirm) → สร้าง Invoice อัตโนมัติ
- แนบไฟล์หลักฐานการชำระเงิน (ต้องมีอย่างน้อย 1 ไฟล์ก่อนคลังจะดำเนินการตัดสต๊อกได้)
- คลังดำเนินการตัดสต๊อก (Fulfill) เมื่อมีหลักฐานการชำระเงินแล้วเท่านั้น
- ยกเลิกคำสั่งขาย (Cancel) — มี dialog ยืนยันก่อนทุกครั้ง
- ติดตามสถานะ Order (DRAFT / CONFIRMED / FULFILLED / CANCELLED)
- ค้นหา Sales Order / Invoice ได้จากเลขที่ออเดอร์หรือชื่อสินค้า
- พิมพ์/ดาวน์โหลด Invoice เป็น PDF รายใบ


---

## 4. Dashboard & Reporting

ระบบแสดงข้อมูลภาพรวม


ความสามารถ:

- ยอดขาย, จำนวนสินค้า, Stock คงเหลือ, สินค้าใกล้หมด (แสดงเป็น KPI Card)
- กราฟ Stock คงเหลือแยกตามสินค้า และกราฟสรุปการเคลื่อนไหวสต๊อก (ECharts)
- รายงานยอดขาย (Sales Report) และรายงานคลังสินค้า (Inventory Report) พร้อม filter ช่วงวันที่
- Export ข้อมูลเป็น CSV
- สร้าง/พรีวิว Report เป็น PDF
- แจ้งเตือนสินค้าใกล้หมดแบบ Real-time (Server-Sent Events) ทันทีที่สต๊อกตัดข้ามเกณฑ์ต่ำ


---

# 4. Features


## Sales Management

- สร้าง Sales Order ผ่าน Dialog
- เพิ่มรายการสินค้าได้หลายบรรทัด
- คำนวณยอดรวมอัตโนมัติ
- Generate Invoice อัตโนมัติตอนยืนยันคำสั่งขาย
- แนบไฟล์หลักฐานการชำระเงิน (บังคับก่อนตัดสต๊อก)
- ตรวจสอบสถานะ Order
- พิมพ์/ดาวน์โหลด Invoice เป็น PDF


---

## Inventory Management

- Stock In / Stock Out / Stock Adjustment (Dialog เดียว)
- Inventory Movement History พร้อมค้นหาจากชื่อสินค้า/SKU/หมายเหตุ
- ตรวจสอบ Stock คงเหลือ
- แจ้งเตือนสินค้าใกล้หมดแบบ Real-time (Toast Notification)


---

## Product Management

- แสดงข้อมูลสินค้า
- ค้นหาและ Filter สินค้า
- อัปโหลด/เปลี่ยน/ลบรูปภาพสินค้า พร้อม preview


---

## Usability

- หน้าแรก (Home) แนะนำขั้นตอนการใช้งานระบบทั้งหมดแบบ step-by-step ให้ผู้ใช้ใหม่เริ่มได้ทันที
- Toast แจ้งผลลัพธ์ทุกครั้งที่บันทึก/ยืนยัน/ลบข้อมูลสำเร็จ ไม่ปิดหน้าต่างเงียบ ๆ
- Dialog ยืนยันก่อน action ที่ทำลายข้อมูล (ลบสินค้า/หมวดหมู่, ยกเลิกคำสั่งขาย) แทน browser confirm
- แจ้ง error เป็นรายช่องในฟอร์ม (ไม่ใช่ข้อความรวมช่องเดียว)
- Dialog รองรับ keyboard เต็มรูปแบบ (focus trap, Escape ปิดได้, คืน focus ให้ปุ่มเดิม)


---

## Reporting

- Dashboard พร้อม KPI Card และกราฟสรุปข้อมูล
- Sales Report
- Inventory Report
- Export Data เป็น CSV
- Generate/Preview PDF (Report และ Invoice)


---

# 5. Demo Role & Permission Matrix


ระบบใช้ Demo Role เพื่อจำลองการทำงานของแต่ละฝ่าย

ผู้ใช้งานสามารถเปลี่ยน Role เพื่อทดลองสิทธิ์ของแต่ละตำแหน่งได้


| Feature | Admin | Sales | Warehouse | Viewer |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| ดูสินค้า | ✅ | ✅ | ✅ | ✅ |
| จัดการสินค้า | ✅ | ❌ | ❌ | ❌ |
| สร้าง / ยืนยัน / ยกเลิก Sales Order | ✅ | ✅ | ❌ | ❌ |
| แนบไฟล์หลักฐานการชำระเงิน | ✅ | ✅ | ❌ | ❌ |
| ดำเนินการตัดสต๊อก (Fulfill) | ✅ | ❌ | ✅ | ❌ |
| ดู Invoice / พิมพ์ PDF | ✅ | ✅ | 👁️ | 👁️ |
| Stock In | ✅ | ❌ | ✅ | ❌ |
| Stock Out | ✅ | ❌ | ✅ | ❌ |
| Stock Adjustment | ✅ | ❌ | ✅ | ❌ |
| Inventory Movement | ✅ | 👁️ | ✅ | 👁️ |
| แจ้งเตือนสินค้าใกล้หมด (Real-time) | ✅ | ✅ | ✅ | ✅ |
| Report | ✅ | ✅ | ✅ | ✅ |


เครื่องหมาย:

- ✅ สามารถใช้งานได้
- 👁️ ดูข้อมูลได้อย่างเดียว
- ❌ ไม่มีสิทธิ์


---

# 6. Business Workflow


Workflow หลักของระบบ


```
Sales

↓

Create Sales Order (DRAFT)

↓

Confirm → Generate Invoice (CONFIRMED)

↓

แนบไฟล์หลักฐานการชำระเงิน

↓

Warehouse Process (ตรวจสอบว่ามีหลักฐานการชำระเงินแล้ว)

↓

Update Stock (FULFILLED)

↓

Create Inventory Movement

↓

ตัดข้ามเกณฑ์สต๊อกต่ำ? → แจ้งเตือน Real-time

↓

Dashboard / Report
```


---

# 7. Tech Stack


## Frontend

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS


## Backend

- Node.js
- Express
- TypeScript


## Database

- PostgreSQL ผ่าน Supabase (ต่อผ่าน `pg` โดยตรง ไม่ใช้ ORM)


## Other Technologies

- Puppeteer + Handlebars — generate PDF (Invoice, Sales/Inventory Report)
- Multer — รับไฟล์อัปโหลด (รูปสินค้า, สลิปหลักฐานการชำระเงิน) เก็บไว้ในดิสก์ของ server
- ECharts
- Server-Sent Events (SSE) — แจ้งเตือนสินค้าใกล้หมดแบบ Real-time
- Redis — เตรียม config ไว้สำหรับ cache ในอนาคต ยังไม่ได้เชื่อมต่อใช้งานจริง


## Deployment

- Vercel (Frontend)
- Supabase (Database)


---

# 8. Database Entities


Entity หลักของระบบ


```
Product

Category

SalesOrder

SalesOrderItem

SalesOrderPayment

Invoice

InventoryMovement
```


---

# 9. System Architecture


```
User

 |

 |

Frontend

Vue 3 + TypeScript

(Vercel)

 |

 |

Backend API

Node.js + Express

 |

 |

Database

PostgreSQL

(Supabase)
```


---

# 10. Project Structure

```
Inventory-Stock-System/
├── client/          # Frontend — Vue 3 + TypeScript (ดูรายละเอียดที่ client/README.md)
└── server/          # Backend — Node.js + Express + TypeScript (ดูรายละเอียดที่ server/README.md)
    └── database/     # migrations/ และ seeds/ ของ PostgreSQL (Supabase)
```


---

# 11. Project Status


MVP ครบ 4 module หลักตาม System Scope แล้ว กำลังขัดเกลาและทดสอบเพิ่มเติม


## Completed

- Project Planning / System Scope / Business Workflow Design / Role Permission Design
- Database Design (PostgreSQL, ผ่าน Supabase)
- Backend API (Node.js + Express + TypeScript) ครบทั้ง 4 module
- Frontend (Vue 3 + TypeScript + Pinia) ครบทั้ง 4 module
- Sales Order & Invoice workflow แบบเต็ม (Create → Confirm → แนบไฟล์การชำระเงิน → Fulfill → ตัดสต๊อก)
- Invoice PDF generation รายใบ
- Product/Category management พร้อมอัปโหลดรูปภาพสินค้า
- Dashboard พร้อมกราฟ (ECharts) และ KPI Card
- Sales/Inventory Report พร้อม Export CSV และ PDF
- แจ้งเตือนสินค้าใกล้หมดแบบ Real-time (Server-Sent Events)
- หน้าแรก (Home) แนะนำ workflow การใช้งานแบบ step-by-step สำหรับผู้ใช้ใหม่
- Usability pass ทั่วระบบ: toast แจ้งผลลัพธ์ทุก action, confirm dialog แทน browser confirm, ค้นหาในลิสต์ยาว, validation รายช่องในฟอร์ม, dialog รองรับ keyboard เต็มรูปแบบ (focus trap)


## In Progress

- ทดสอบสิทธิ์การใช้งานตาม Role ให้ครบทุก Role (ทดสอบหลักด้วย Admin เป็นส่วนใหญ่)
- Commit และจัดระเบียบ git history


---

# 12. Future Improvements


- Authentication System (ระบบ Login จริง แทน Demo Role)
- Purchase Order
- Supplier Management
- Accounting Module
- Payment Gateway Integration / การกระทบยอดชำระเงินแบบเต็มรูปแบบ
- Audit Log
