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
Sales Order

↓

System Generate Invoice

↓

Warehouse Process

↓

Stock Movement
```


ความสามารถ:

- สร้าง Sales Order
- เพิ่มรายการสินค้า
- คำนวณยอดรวมอัตโนมัติ
- สร้าง Invoice อัตโนมัติ
- ติดตามสถานะ Order


---

## 4. Dashboard & Reporting

ระบบแสดงข้อมูลภาพรวม


ความสามารถ:

- ยอดขาย
- จำนวนสินค้า
- Stock คงเหลือ
- สินค้าใกล้หมด
- รายงานข้อมูล


---

# 4. Features


## Sales Management

- สร้าง Sales Order
- เพิ่มรายการสินค้า
- คำนวณยอดรวม
- Generate Invoice อัตโนมัติ
- ตรวจสอบสถานะ Order


---

## Inventory Management

- Stock In
- Stock Out
- Stock Adjustment
- Inventory Movement History
- ตรวจสอบ Stock คงเหลือ


---

## Product Management

- แสดงข้อมูลสินค้า
- ค้นหาและ Filter สินค้า


---

## Reporting

- Dashboard
- Sales Report
- Inventory Report
- Export Data
- Generate PDF


---

# 5. Demo Role & Permission Matrix


ระบบใช้ Demo Role เพื่อจำลองการทำงานของแต่ละฝ่าย

ผู้ใช้งานสามารถเปลี่ยน Role เพื่อทดลองสิทธิ์ของแต่ละตำแหน่งได้


| Feature | Admin | Sales | Warehouse | Viewer |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| ดูสินค้า | ✅ | ✅ | ✅ | ✅ |
| จัดการสินค้า | ✅ | ❌ | ❌ | ❌ |
| สร้าง Sales Order | ✅ | ✅ | ❌ | ❌ |
| ดู Invoice | ✅ | ✅ | 👁️ | 👁️ |
| Stock In | ✅ | ❌ | ✅ | ❌ |
| Stock Out | ✅ | ❌ | ✅ | ❌ |
| Stock Adjustment | ✅ | ❌ | ✅ | ❌ |
| Inventory Movement | ✅ | 👁️ | ✅ | 👁️ |
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

Create Sales Order

↓

Generate Invoice

↓

Warehouse Process

↓

Update Stock

↓

Create Inventory Movement

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

Invoice

InvoiceItem

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


กำลังพัฒนา


## Completed

- Project Planning
- System Scope
- Business Workflow Design
- Role Permission Design


## In Progress

- Database Design
- Backend API Development
- Frontend Development


---

# 12. Future Improvements


- Authentication System
- Purchase Order
- Supplier Management
- Accounting Module
- Payment Management
- Notification System
- Audit Log
