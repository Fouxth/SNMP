import socket
from scapy.all import ARP, Ether, srp, conf
import sys

def get_local_network():
    """ฟังก์ชันหา IP เครื่องตัวเองและสร้างวง LAN (Subnet)"""
    try:
        # เชื่อมต่อ socket หลอกๆ เพื่อดูว่าเราใช้ IP ไหนออกเน็ต
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        
        # แปลง 192.168.1.5 เป็น 192.168.1.0/24
        ip_parts = local_ip.split('.')
        network_range = f"{ip_parts[0]}.{ip_parts[1]}.{ip_parts[2]}.0/24"
        return local_ip, network_range
    except Exception as e:
        print(f"[-] ไม่สามารถระบุ IP ของเครื่องได้: {e}")
        return None, None

def scan(ip_range):
    print(f"[*] เริ่มสแกนวงเครือข่าย: {ip_range}")
    print("[*] กรุณารอสักครู่ (Timeout ตั้งไว้ที่ 3 วินาที)...")
    
    try:
        # สร้าง ARP Request
        # Ether(dst="ff:ff:ff:ff:ff:ff") คือการทำ Broadcast ไปทุกเครื่อง
        arp_request = ARP(pdst=ip_range)
        broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
        packet = broadcast / arp_request

        # ส่งแพ็กเกจ (srp = Send and Receive packets at layer 2)
        # inter=0.1 ช่วยให้ไม่ยิงเร็วเกินไปจนโดน Firewall บล็อก
        result = srp(packet, timeout=3, verbose=True, inter=0.1)[0]

        devices = []
        for sent, received in result:
            # พยายามหา Hostname
            try:
                hostname = socket.gethostbyaddr(received.psrc)[0]
            except:
                hostname = "Unknown"
            
            devices.append({'ip': received.psrc, 'mac': received.hwsrc, 'name': hostname})
        
        return devices

    except Exception as e:
        print(f"\n[!] เกิดข้อผิดพลาดขณะสแกน: {e}")
        if "Npcap" in str(e) or "WinPcap" in str(e):
            print("[!] ตรวจพบปัญหาเกี่ยวกับ Driver: คุณได้ติดตั้ง Npcap หรือยัง?")
        return []

if __name__ == "__main__":
    print("=== โปรแกรมทดสอบ SNMP Network Scanner ===")
    
    # 1. เช็ค Local IP
    my_ip, my_net = get_local_network()
    if not my_ip:
        sys.exit()
        
    print(f"[+] IP ของเครื่องคุณ: {my_ip}")
    print(f"[+] วง Network ที่จะสแกน: {my_net}")
    print("-" * 40)

    # 2. รันการสแกน
    found_devices = scan(my_net)

    # 3. แสดงผลลัพธ์
    print("\n" + "=" * 40)
    print(f"สแกนเสร็จสิ้น! พบทั้งหมด {len(found_devices)} อุปกรณ์")
    print("=" * 40)
    
    if found_devices:
        for dev in found_devices:
            print(f"IP: {dev['ip']:15} | MAC: {dev['mac']:18} | Hostname: {dev['name']}")
    else:
        print("[!] ไม่พบอุปกรณ์ใดๆ เลย")
        print("\nข้อแนะนำในการแก้ไข:")
        print("1. คลิกขวาที่ Terminal/VS Code แล้วเลือก 'Run as Administrator'")
        print("2. ตรวจสอบว่าติดตั้ง Npcap (npcap.com) แล้วหรือยัง")
        print("3. ลองปิด Firewall ของ Windows ชั่วคราวแล้วรันใหม่")