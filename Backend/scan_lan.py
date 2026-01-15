from pysnmp.hlapi import SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity, getCmd

# --- ตั้งค่า Network ของคุณ ---
# ให้แก้ 3 ตัวแรกให้ตรงกับ IP เครื่องคุณ (ดูจาก ipconfig) เช่น 192.168.1 หรือ 192.168.0
NETWORK_PREFIX = '127.0.0.1' 
COMMUNITY_STRING = 'public'

# OID มาตรฐานสำหรับถาม "รายละเอียดเครื่อง" (System Description)
OID_SYS_DESCR = '1.3.6.1.2.1.1.1.0'

print(f"--- กำลังสแกนหาอุปกรณ์ SNMP ในวง {NETWORK_PREFIX}.1 ถึง .20 ---")
print("อาจใช้เวลาสักพักนะครับ...")

for i in range(1, 21): # ลองสแกนแค่ 20 เลขแรกก่อน (แก้เลข 21 เป็น 255 ถ้าจะเอาทั้งหมด)
    target_ip = f"{NETWORK_PREFIX}.{i}"
    
    # ส่งคำขอไปถาม
    errorIndication, errorStatus, errorIndex, varBinds = next(
        getCmd(SnmpEngine(),
               CommunityData(COMMUNITY_STRING, mpModel=1),
               UdpTransportTarget((target_ip, 161), timeout=0.5, retries=0), # timeout ไวๆ จะได้ไม่รอนาน
               ContextData(),
               ObjectType(ObjectIdentity(OID_SYS_DESCR)))
    )

    if not errorIndication and not errorStatus:
        # ถ้าตอบกลับมา แสดงว่าเจออุปกรณ์!
        device_info = varBinds[0][1].prettyPrint()
        print(f"[เจอ!] IP: {target_ip} | Info: {device_info}")
    else:
        # เงียบ = ไม่เจอ หรือไม่เปิด SNMP
        pass

print("--- จบการสแกน ---")