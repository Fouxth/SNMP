# Cyber Pulse NMS

ระบบ Network Monitoring System (NMS) สำหรับจัดการและตรวจสอบอุปกรณ์เครือข่าย โดยใช้ SNMP

![Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 📋 Overview

Cyber Pulse NMS เป็นแดชบอร์ดสำหรับ Network Administrator ใช้ในการ:
- ตรวจสอบสถานะอุปกรณ์เครือข่าย (Routers, Switches, Servers, Firewalls, Access Points)
- ดู metrics แบบ real-time (CPU, Memory, Traffic)
- จัดการ SNMP Traps และ Logs
- แสดง Network Topology แบบ visual

---

## 🖥️ หน้าต่างๆ ในระบบ

### 1. Dashboard (หน้าหลัก)
**Path:** `/`

หน้าแดชบอร์ดหลักแสดงภาพรวมของระบบเครือข่าย

**Features:**
- **KPI Cards** - แสดงสถิติสำคัญ 4 การ์ด:
  - Total Devices: จำนวนอุปกรณ์ทั้งหมดที่ monitor
  - Status Overview: สถานะ Online/Offline พร้อม availability %
  - Active Alerts: จำนวน critical alerts
  - Avg Latency: ค่า latency เฉลี่ยของเครือข่าย
- **Real-time Traffic Chart** - กราฟ traffic Inbound/Outbound แบบ real-time (อัพเดททุก 3 วินาที)
- **Top CPU Usage** - แสดง 5 อุปกรณ์ที่ใช้ CPU สูงสุด
- **Monitored Devices Table** - ตารางแสดงอุปกรณ์ทั้งหมดพร้อม actions

**Actions ที่ใช้งานได้:**
- คลิก KPI Cards เพื่อไปหน้าที่เกี่ยวข้อง
- คลิกแถวในตาราง เพื่อดู Device Details
- เมนู Actions: Ping, Reboot, Details

---

### 2. Device Inventory (จัดการอุปกรณ์)
**Path:** `/devices`

หน้าสำหรับจัดการอุปกรณ์ทั้งหมดในระบบ

**Features:**
- แสดงรายการอุปกรณ์ทั้งหมดในตาราง
- ค้นหาอุปกรณ์ตาม Name, IP, หรือ Vendor
- เพิ่มอุปกรณ์ใหม่ (Add Device)
- แก้ไขข้อมูลอุปกรณ์ (Edit)
- ลบอุปกรณ์ (Delete) พร้อม confirmation

**Fields:**
- Device Name: ชื่ออุปกรณ์
- IP Address: IP ของอุปกรณ์
- Type: ประเภท (Router, Switch, Server, Firewall, AP)
- Vendor: ผู้ผลิต
- Status: สถานะ Online/Offline/Warning
- Uptime: ระยะเวลาที่ทำงาน

---

### 3. Network Topology (แผนผังเครือข่าย)
**Path:** `/topology`

แสดงโครงสร้างเครือข่ายแบบ visual

**Features:**
- แสดง nodes และ connections ระหว่างอุปกรณ์
- Color coding ตามสถานะ:
  - 🟢 สีเขียว: Online
  - 🟡 สีส้ม: Warning
  - 🔴 สีแดง: Offline
- เส้น connection เป็น dashed line เมื่ออุปกรณ์ offline
- Zoom in/out ปรับขนาดแผนผัง
- คลิก node เพื่อดูรายละเอียดใน panel ด้านขวา
- Refresh เพื่ออัพเดทข้อมูล

**Node Details Panel แสดง:**
- ชื่อและ IP ของอุปกรณ์
- สถานะและประเภท
- จำนวน connections
- CPU Load, Memory, Uptime (สำหรับ online devices)

---

### 4. SNMP Traps & Logs (บันทึกเหตุการณ์)
**Path:** `/logs`

ระบบจัดการ SNMP Traps และ Logs

**Features:**
- **Summary Cards** - แสดงจำนวน traps แยกตาม severity:
  - Critical: เหตุการณ์วิกฤต
  - Warning: คำเตือน
  - Info: ข้อมูลทั่วไป
- ค้นหา logs ตาม message, source, หรือ OID
- Filter ตาม severity level
- Acknowledge trap ทีละรายการหรือทั้งหมด
- Export เป็น CSV file
- Refresh เพื่อโหลดข้อมูลใหม่

**ข้อมูลที่แสดง:**
- Timestamp: เวลาที่เกิดเหตุการณ์
- Severity: ระดับความรุนแรง
- Source: อุปกรณ์ต้นทาง
- OID: SNMP Object Identifier
- Message: รายละเอียดเหตุการณ์
- Status: สถานะ ACK/NEW

---

### 5. Settings (ตั้งค่าระบบ)
**Path:** `/settings`

หน้าตั้งค่าระบบทั้งหมด

**Tabs:**

#### SNMP Configuration
- SNMP Version: v1, v2c, v3
- Community String: รหัสผ่าน SNMP
- Polling Interval: ช่วงเวลา poll (10-300 วินาที)
- Timeout: เวลา timeout (1-30 วินาที)
- Retries: จำนวนครั้งที่ลองใหม่ (1-10)

#### Alert Notifications
- Email Notifications: เปิด/ปิดการแจ้งเตือนทาง email
- Critical/Warning/Info Alerts: เลือก severity ที่ต้องการแจ้งเตือน
- Alert Email: email สำหรับรับการแจ้งเตือน

#### Data Management
- Data Retention: ระยะเวลาเก็บข้อมูล (7-365 วัน)
- Auto Backup: เปิด/ปิด backup อัตโนมัติ
- Backup Time: เวลาที่ทำ backup

#### Appearance
- Theme: Dark/Light/System
- Compact Mode: โหมด compact
- Show Animations: เปิด/ปิด animations

---

## 🎯 Common Features (ใช้ได้ทุกหน้า)

### Header
- **Search** - ค้นหาอุปกรณ์ตาม IP หรือ hostname (dropdown แสดงผลลัพธ์)
- **System Status** - แสดงสถานะระบบ (คลิกไปหน้า Logs)
- **Notifications** - Bell icon แสดง alerts ล่าสุด (dropdown)
- **User Menu** - Profile, Settings, Logout

### Sidebar Navigation
- Dashboard icon → หน้า Dashboard
- Server icon → Device Inventory
- Network icon → Topology Map
- Warning icon → SNMP Logs
- Settings icon → Settings

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm หรือ bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd cyber-pulse-nms

# Install dependencies
npm install

# Start development server
npm run dev
```

เปิด browser ไปที่ `http://localhost:8080`

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui, Radix UI
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** React Query
- **Routing:** React Router DOM
- **Icons:** Lucide React

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/        # Dashboard components
│   │   ├── CPUGaugeChart.tsx
│   │   ├── DeviceTable.tsx
│   │   ├── Header.tsx
│   │   ├── KPICards.tsx
│   │   ├── Sidebar.tsx
│   │   └── TrafficChart.tsx
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── mockData.ts       # Mock data for demo
│   └── utils.ts          # Utility functions
├── pages/
│   ├── Index.tsx         # Dashboard page
│   ├── DeviceInventory.tsx
│   ├── TopologyMap.tsx
│   ├── SNMPLogs.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point
```

---

## 📝 Notes

- ระบบนี้ใช้ **Mock Data** สำหรับ demo
- ข้อมูลจะ reset เมื่อ refresh หน้า
- Traffic chart อัพเดท real-time ทุก 3 วินาที

---

## 📄 License

This project is for educational and demonstration purposes.
