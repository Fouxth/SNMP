from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from scapy.all import ARP, Ether, srp
from pysnmp.hlapi import *
from snmp_utils import get_cpu_loader, get_ram_usage, get_net_io_counters
from scan_lan_logic import scan, get_local_network
import time
import asyncio
import psutil
import uuid
from datetime import datetime

app = FastAPI(title="NMS Backend API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Data Models ====================

class Device(BaseModel):
    id: str
    name: str
    ip: str
    mac: Optional[str] = None
    type: str = "server"  # router, switch, server, firewall, ap
    status: str = "online"  # online, offline, warning
    vendor: str = "Unknown"
    uptime: str = "0d 0h 0m"
    cpuLoad: int = 0
    memoryUsage: int = 0
    lastResponse: int = 0

class Alert(BaseModel):
    id: str
    timestamp: str
    severity: str  # critical, warning, info
    source: str
    message: str
    acknowledged: bool = False
    oid: Optional[str] = None

class DeviceInput(BaseModel):
    name: str
    ip: str
    type: str = "server"
    vendor: str = "Unknown"

# ==================== In-Memory Storage ====================

devices_store: List[Device] = []
alerts_store: List[Alert] = []

# Global vars for Network Speed calculation (Local)
LAST_NET_BYTES_RECV = 0
LAST_NET_BYTES_SENT = 0
LAST_NET_TIME = 0

# Cache for Remote Network Speed: { ip: (last_recv, last_sent, last_time) }
REMOTE_NET_CACHE = {}

# ==================== Helper Functions ====================

def generate_alert(severity: str, source: str, message: str, oid: str = None):
    """สร้าง Alert ใหม่และเพิ่มลง store"""
    alert = Alert(
        id=str(uuid.uuid4()),
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        severity=severity,
        source=source,
        message=message,
        acknowledged=False,
        oid=oid
    )
    alerts_store.insert(0, alert)  # เพิ่มที่หัวลิสต์
    # เก็บแค่ 100 alerts ล่าสุด
    if len(alerts_store) > 100:
        alerts_store.pop()
    return alert

def get_device_type_from_mac(mac: str) -> str:
    """ประเมิน device type จาก MAC OUI"""
    mac_prefix = mac[:8].upper().replace("-", ":")
    # Common vendor prefixes
    cisco_prefixes = ["00:1A:2B", "00:1B:2C", "00:1C:2D", "00:0C:29"]
    ubiquiti_prefixes = ["FC:EC:DA", "24:5A:4C", "DC:9F:DB"]
    
    if any(mac_prefix.startswith(p) for p in cisco_prefixes):
        return "switch"
    elif any(mac_prefix.startswith(p) for p in ubiquiti_prefixes):
        return "ap"
    return "server"

def get_vendor_from_mac(mac: str) -> str:
    """ประเมิน vendor จาก MAC OUI"""
    mac_prefix = mac[:8].upper().replace("-", ":")
    vendors = {
        "00:1A:2B": "Cisco", "00:1B:2C": "Cisco", "00:0C:29": "VMware",
        "FC:EC:DA": "Ubiquiti", "24:5A:4C": "Ubiquiti",
        "00:50:56": "VMware", "08:00:27": "VirtualBox",
        "B4:2E:99": "HP", "3C:D9:2B": "HP",
        "D4:BE:D9": "Dell", "18:A9:05": "Dell",
    }
    for prefix, vendor in vendors.items():
        if mac_prefix.startswith(prefix):
            return vendor
    return "Unknown"

# ==================== API Endpoints ====================

@app.get("/api/realtime")
async def get_realtime_data(target: str = '127.0.0.1'):
    global LAST_NET_BYTES_RECV, LAST_NET_BYTES_SENT, LAST_NET_TIME, REMOTE_NET_CACHE
    
    is_local = target in ['127.0.0.1', 'localhost']
    
    cpu_usage = 0
    ram_data = {"total": 0, "used": 0, "percent": 0}
    net_in_mbps = 0.0
    net_out_mbps = 0.0
    is_online = True

    if is_local:
        cpu_usage = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        
        mem_used_bytes = mem.total - mem.available
        ram_data = {
            "total": round(mem.total / (1024**3), 2),
            "used": round(mem_used_bytes / (1024**3), 2),
            "percent": round((mem_used_bytes / mem.total) * 100, 1)
        }
        
        net_io_per_nic = psutil.net_io_counters(pernic=True)
        net_stats = psutil.net_if_stats()
        
        current_total_recv = 0
        current_total_sent = 0
        
        for nic, stats in net_stats.items():
            if stats.isup and "loopback" not in nic.lower():
                if nic in net_io_per_nic:
                    io = net_io_per_nic[nic]
                    current_total_recv += io.bytes_recv
                    current_total_sent += io.bytes_sent

        curr_time = time.time()
        
        if LAST_NET_TIME > 0:
            time_diff = curr_time - LAST_NET_TIME
            if time_diff > 0:
                bytes_recv_diff = current_total_recv - LAST_NET_BYTES_RECV
                bytes_sent_diff = current_total_sent - LAST_NET_BYTES_SENT
                
                if bytes_recv_diff < 0: bytes_recv_diff = 0
                if bytes_sent_diff < 0: bytes_sent_diff = 0
                
                net_in_mbps = round((bytes_recv_diff * 8) / (time_diff * 1_000_000), 2)
                net_out_mbps = round((bytes_sent_diff * 8) / (time_diff * 1_000_000), 2)
        
        LAST_NET_BYTES_RECV = current_total_recv
        LAST_NET_BYTES_SENT = current_total_sent
        LAST_NET_TIME = curr_time
        
    else:
        try:
             cpu_usage = await asyncio.to_thread(get_cpu_loader, target)
             ram_data = await asyncio.to_thread(get_ram_usage, target)
             
             # Check if SNMP connection failed (returns None)
             if cpu_usage is None:
                 is_online = False
                 cpu_usage = 0
                 ram_data = {"total": 0, "used": 0, "percent": 0}
             else:
                 # SNMP successful - get network stats
                 curr_recv, curr_sent = await asyncio.to_thread(get_net_io_counters, target)
                 curr_time = time.time()
                 
                 if target in REMOTE_NET_CACHE:
                     last_recv, last_sent, last_time = REMOTE_NET_CACHE[target]
                     time_diff = curr_time - last_time
                     if time_diff > 0:
                         bytes_recv_diff = curr_recv - last_recv
                         bytes_sent_diff = curr_sent - last_sent
                         
                         if bytes_recv_diff < 0: bytes_recv_diff = 0
                         if bytes_sent_diff < 0: bytes_sent_diff = 0
                         
                         net_in_mbps = round((bytes_recv_diff * 8) / (time_diff * 1_000_000), 2)
                         net_out_mbps = round((bytes_sent_diff * 8) / (time_diff * 1_000_000), 2)
                 
                 REMOTE_NET_CACHE[target] = (curr_recv, curr_sent, curr_time)

        except Exception as e:
             print(f"Error getting realtime data for {target}: {e}")
             cpu_usage = 0
             ram_data = {"total": 0, "used": 0, "percent": 0}
             is_online = False

    return {
        "status": "Online" if is_online else "Offline",
        "cpu_usage": cpu_usage,
        "ram_total": ram_data['total'],
        "ram_used": ram_data['used'],
        "ram_usage_percent": ram_data['percent'],
        "net_in_mbps": net_in_mbps,
        "net_out_mbps": net_out_mbps
    }

@app.get("/api/scan-lan")
async def get_lan_devices():
    """Scan LAN และอัพเดท devices_store"""
    global devices_store
    
    def scan_lan_logic():
        _, ip_range = get_local_network()
        if ip_range:
            return scan(ip_range)
        return []
    
    scanned = await asyncio.to_thread(scan_lan_logic)
    
    # อัพเดท devices_store
    for item in scanned:
        ip = item.get('ip', '')
        mac = item.get('mac', '')
        
        # หา existing device
        existing = next((d for d in devices_store if d.ip == ip), None)
        
        if existing:
            existing.status = "online"
            existing.mac = mac
        else:
            # สร้าง device ใหม่
            device = Device(
                id=str(uuid.uuid4()),
                name=f"device-{ip.split('.')[-1]}",
                ip=ip,
                mac=mac,
                type=get_device_type_from_mac(mac) if mac else "server",
                status="online",
                vendor=get_vendor_from_mac(mac) if mac else "Unknown",
                uptime="0d 0h 0m",
                cpuLoad=0,
                memoryUsage=0,
                lastResponse=0
            )
            devices_store.append(device)
    
    # Mark devices not in scan as potentially offline
    scanned_ips = [item.get('ip') for item in scanned]
    for device in devices_store:
        if device.ip not in scanned_ips and device.ip != '127.0.0.1':
            device.status = "offline"
    
    return {"devices": [d.dict() for d in devices_store]}

@app.get("/api/devices")
async def get_devices():
    """ดึงรายการ devices ทั้งหมด พร้อม realtime data"""
    result = []
    
    for device in devices_store:
        # ดึง realtime data สำหรับแต่ละ device
        try:
            realtime = await get_realtime_data(device.ip)
            
            # ตรวจสอบว่า connection สำเร็จหรือไม่ (ดูจาก status เท่านั้น)
            if realtime.get('status') == 'Offline':
                # SNMP/Connection failed - only alert if status changed
                if device.status != "offline":
                    device.status = "offline"
                    device.cpuLoad = 0
                    device.memoryUsage = 0
                    # สร้าง alert สำหรับ device ที่เข้าไม่ถึง
                    generate_alert(
                        "critical", 
                        f"{device.name} ({device.ip})", 
                        "Device unreachable - SNMP/Connection timeout",
                        "1.3.6.1.4.1.9.9.43.1.1.6.1.3"
                    )
            else:
                # Connection successful
                device.cpuLoad = int(realtime.get('cpu_usage', 0))
                device.memoryUsage = int(realtime.get('ram_usage_percent', 0))
                device.status = "online"
                device.lastResponse = 1  # Connected
                
                # ตรวจสอบ warning conditions
                if device.cpuLoad > 80 or device.memoryUsage > 85:
                    device.status = "warning"
                    if device.cpuLoad > 80:
                        generate_alert(
                            "warning", 
                            f"{device.name} ({device.ip})", 
                            f"High CPU utilization ({device.cpuLoad}%)",
                            "1.3.6.1.4.1.9.2.1.56"
                        )
                    if device.memoryUsage > 85:
                        generate_alert(
                            "warning", 
                            f"{device.name} ({device.ip})", 
                            f"High memory usage ({device.memoryUsage}%)",
                            "1.3.6.1.4.1.9.9.48.1.1.1.6"
                        )
                        
        except Exception as e:
            # Connection/SNMP error
            if device.status != "offline":
                device.status = "offline"
                device.cpuLoad = 0
                device.memoryUsage = 0
                generate_alert(
                    "critical", 
                    f"{device.name} ({device.ip})", 
                    f"Device unreachable - {str(e)[:50]}",
                    "1.3.6.1.4.1.9.9.43.1.1.6.1.3"
                )
        
        result.append(device.dict())
    
    return {"devices": result}

@app.post("/api/devices")
async def add_device(device_input: DeviceInput):
    """เพิ่ม device ใหม่"""
    device = Device(
        id=str(uuid.uuid4()),
        name=device_input.name,
        ip=device_input.ip,
        type=device_input.type,
        vendor=device_input.vendor,
        status="online",
        uptime="0d 0h 0m",
        cpuLoad=0,
        memoryUsage=0,
        lastResponse=0
    )
    devices_store.append(device)
    
    generate_alert("info", f"{device.name} ({device.ip})", 
                  "Device added to monitoring", "1.3.6.1.6.3.1.1.5.4")
    
    return device.dict()

@app.put("/api/devices/{device_id}")
async def update_device(device_id: str, device_input: DeviceInput):
    """อัพเดท device"""
    device = next((d for d in devices_store if d.id == device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.name = device_input.name
    device.ip = device_input.ip
    device.type = device_input.type
    device.vendor = device_input.vendor
    
    return device.dict()

@app.delete("/api/devices/{device_id}")
async def delete_device(device_id: str):
    """ลบ device"""
    global devices_store
    device = next((d for d in devices_store if d.id == device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    devices_store = [d for d in devices_store if d.id != device_id]
    
    generate_alert("info", f"{device.name} ({device.ip})", 
                  "Device removed from monitoring", "1.3.6.1.6.3.1.1.5.4")
    
    return {"message": "Device deleted"}

@app.get("/api/alerts")
async def get_alerts():
    """ดึง alerts ทั้งหมด"""
    return {"alerts": [a.dict() for a in alerts_store]}

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge alert"""
    alert = next((a for a in alerts_store if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.acknowledged = True
    return alert.dict()

@app.post("/api/alerts/acknowledge-all")
async def acknowledge_all_alerts():
    """Acknowledge all alerts"""
    for alert in alerts_store:
        alert.acknowledged = True
    return {"message": "All alerts acknowledged"}

@app.get("/api/stats")
async def get_stats():
    """ดึงสถิติรวม"""
    total = len(devices_store)
    online = len([d for d in devices_store if d.status == "online"])
    offline = len([d for d in devices_store if d.status == "offline"])
    warning = len([d for d in devices_store if d.status == "warning"])
    critical_alerts = len([a for a in alerts_store if a.severity == "critical" and not a.acknowledged])
    
    # คำนวณ avg latency (สมมติว่า devices ที่ online มี response time)
    online_devices = [d for d in devices_store if d.status != "offline"]
    avg_latency = round(sum(d.lastResponse for d in online_devices) / len(online_devices), 0) if online_devices else 0
    
    return {
        "total": total,
        "online": online,
        "offline": offline,
        "warning": warning,
        "criticalAlerts": critical_alerts,
        "avgLatency": int(avg_latency)
    }

@app.post("/api/ping/{device_id}")
async def ping_device(device_id: str):
    """Ping device และ return ผลลัพธ์"""
    device = next((d for d in devices_store if d.id == device_id), None)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    import subprocess
    import platform
    
    param = "-n" if platform.system().lower() == "windows" else "-c"
    
    try:
        result = subprocess.run(
            ["ping", param, "4", device.ip],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        lines = result.stdout.strip().split("\n")
        # อัพเดท device response time
        if result.returncode == 0:
            device.status = "online"
            device.lastResponse = 2  # Estimate
        else:
            device.status = "offline"
            
        return {
            "success": result.returncode == 0,
            "output": lines[-5:] if len(lines) > 5 else lines
        }
    except subprocess.TimeoutExpired:
        device.status = "offline"
        generate_alert("critical", f"{device.name} ({device.ip})", 
                      "Device unreachable - ping timeout", "1.3.6.1.4.1.9.9.43.1.1.6.1.3")
        return {"success": False, "output": ["Request timed out."]}

# ==================== Startup Event ====================

@app.on_event("startup")
async def startup_event():
    """เริ่มต้น: เพิ่ม localhost device และสร้าง sample alerts"""
    # เพิ่ม localhost
    localhost = Device(
        id=str(uuid.uuid4()),
        name="localhost",
        ip="127.0.0.1",
        type="server",
        status="online",
        vendor="Local Machine",
        uptime="0d 0h 0m",
        cpuLoad=0,
        memoryUsage=0,
        lastResponse=1
    )
    devices_store.append(localhost)
    
    # สร้าง welcome alert
    generate_alert("info", "NMS System", "Network Monitoring System started", "1.3.6.1.6.3.1.1.5.4")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
