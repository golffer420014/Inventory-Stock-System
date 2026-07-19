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

- ดูข้อมูลสินค้า
- ค้นหาสินค้า
- ตรวจสอบราคาสินค้า
- ตรวจสอบจำนวน Stock คงเหลือ


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

- สร้าง Sales Order ผ่าน Dialog พร้อมเพิ่มรายการสินค้าได้หลายบรรทัด
- คำนวณยอดรวมอัตโนมัติ
- ยืนยันคำสั่งขาย (Confirm) → สร้าง Invoice อัตโนมัติ
- แนบไฟล์หลักฐานการชำระเงิน (ต้องมีอย่างน้อย 1 ไฟล์ก่อนคลังจะดำเนินการตัดสต๊อกได้)
- คลังดำเนินการตัดสต๊อก (Fulfill) เมื่อมีหลักฐานการชำระเงินแล้วเท่านั้น
- ยกเลิกคำสั่งขาย (Cancel)
- ติดตามสถานะ Order (DRAFT / CONFIRMED / FULFILLED / CANCELLED)
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
- Inventory Movement History
- ตรวจสอบ Stock คงเหลือ
- แจ้งเตือนสินค้าใกล้หมดแบบ Real-time (Toast Notification)


---

## Product Management

- แสดงข้อมูลสินค้า
- ค้นหาและ Filter สินค้า


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

- PostgreSQL
- NeonDB / Supabase


## Other Technologies

- Redis
- Puppeteer
- Handlebars
- ECharts
- Server-Sent Events (SSE) — แจ้งเตือนสินค้าใกล้หมดแบบ Real-time


## Deployment

- Vercel (Frontend)
- Cloud Database (NeonDB / Supabase)


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

(NeonDB / Supabase)

 |

 |

Redis Cache
```


---

# 10. Project Structure


```
inventory-system

├── frontend

├── backend

├── database

└── docs
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
- Dashboard พร้อมกราฟ (ECharts) และ KPI Card
- Sales/Inventory Report พร้อม Export CSV และ PDF
- แจ้งเตือนสินค้าใกล้หมดแบบ Real-time (Server-Sent Events)


## In Progress

- ทดสอบสิทธิ์การใช้งานตาม Role ให้ครบทุก Role (ทดสอบหลักด้วย Admin เป็นส่วนใหญ่)
- ปรับปรุง UI/UX เพิ่มเติม (Product/Category management)
- Commit และจัดระเบียบ git history


---

# 12. Future Improvements


- Authentication System (ระบบ Login จริง แทน Demo Role)
- Purchase Order
- Supplier Management
- Accounting Module
- Payment Gateway Integration / การกระทบยอดชำระเงินแบบเต็มรูปแบบ
- Audit Log
