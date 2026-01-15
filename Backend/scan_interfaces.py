from pysnmp.hlapi import SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity, nextCmd

TARGET_IP = '127.0.0.1'
COMMUNITY_STRING = 'public'
OID_IF_DESCR = '1.3.6.1.2.1.2.2.1.2' # OID ชื่อ Interface

print(f"--- กำลังสแกนหา Network Interface ใน {TARGET_IP} ---")

# สร้างตัวดึงข้อมูลแบบ Walk
iterator = nextCmd(
    SnmpEngine(),
    CommunityData(COMMUNITY_STRING, mpModel=1),
    UdpTransportTarget((TARGET_IP, 161)),
    ContextData(),
    ObjectType(ObjectIdentity(OID_IF_DESCR)),
    lexicographicMode=False
)

# --- ส่วน Loop ที่แก้ไขแล้ว (ก๊อปไปวางทับส่วนเดิมได้เลย) ---
for errorIndication, errorStatus, errorIndex, varBinds in iterator:
    if errorIndication:
        print(f"Error: {errorIndication}")
        break
    elif errorStatus:
        print(f"Error: {errorStatus.prettyPrint()}")
        break
    else:
        # Loop ชั้นใน: จัดการแปลงค่า Hex เป็น Text
        for varBind in varBinds:
            oid_str = str(varBind[0])
            val_str = varBind[1].prettyPrint()

            # เช็คและแปลง Hex -> Text
            if val_str.startswith('0x'):
                try:
                    interface_name = bytes.fromhex(val_str[2:]).decode('utf-8', errors='ignore')
                except:
                    interface_name = val_str
            else:
                interface_name = val_str
            
            # แกะเลข Index ตัวสุดท้าย
            interface_index = oid_str.split('.')[-1]
            
            print(f"ID: {interface_index:<5} | Name: {interface_name}")