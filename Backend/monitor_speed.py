import time
from pysnmp.hlapi import SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity, getCmd

TARGET_IP = '127.0.0.1'
COMMUNITY_STRING = 'public'

# --- ใส่เลข ID ของ Interface ที่ต้องการ Monitor ตรงนี้ ---
# จากรูปของคุณ ID 12 ดูเหมือนจะเป็นการ์ด LAN หลัก
INTERFACE_INDEX = 99

# OID สำหรับดึงค่า Traffic ขาเข้า (In) และ ขาออก (Out)
OID_IF_IN = f'1.3.6.1.2.1.2.2.1.10.{INTERFACE_INDEX}'
OID_IF_OUT = f'1.3.6.1.2.1.2.2.1.16.{INTERFACE_INDEX}'

print(f"--- เริ่ม Monitor Traffic ของ Interface ID: {INTERFACE_INDEX} (กด Ctrl+C เพื่อหยุด) ---")

def get_snmp_value(oid):
    errorIndication, errorStatus, errorIndex, varBinds = next(
        getCmd(SnmpEngine(),
               CommunityData(COMMUNITY_STRING, mpModel=1),
               UdpTransportTarget((TARGET_IP, 161)),
               ContextData(),
               ObjectType(ObjectIdentity(oid)))
    )
    if errorIndication or errorStatus:
        return 0
    return int(varBinds[0][1])

# ค่าเริ่มต้น
last_in = get_snmp_value(OID_IF_IN)
last_out = get_snmp_value(OID_IF_OUT)
last_time = time.time()

try:
    while True:
        time.sleep(1) # รอ 1 วินาที
        
        current_in = get_snmp_value(OID_IF_IN)
        current_out = get_snmp_value(OID_IF_OUT)
        current_time = time.time()
        
        # คำนวณส่วนต่าง
        time_diff = current_time - last_time
        in_diff = current_in - last_in
        out_diff = current_out - last_out
        
        # แปลงเป็น Mbps (Bits per second / 1,000,000)
        # * 8 เพราะ 1 Byte = 8 Bits
        speed_in_mbps = (in_diff * 8) / (time_diff * 1000000)
        speed_out_mbps = (out_diff * 8) / (time_diff * 1000000)
        
        print(f"Download: {speed_in_mbps:.2f} Mbps | Upload: {speed_out_mbps:.2f} Mbps")
        
        # อัปเดตค่าเก่า
        last_in = current_in
        last_out = current_out
        last_time = current_time

except KeyboardInterrupt:
    print("\nหยุดการทำงาน")