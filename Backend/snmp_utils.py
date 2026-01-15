
from pysnmp.hlapi.v1arch import *

TARGET_IP = '127.0.0.1' 
COMMUNITY = 'dev4th_monitor'

def snmp_walk(oid, target_ip=TARGET_IP, community=COMMUNITY):
    """
    Performs an SNMP WALK operation for the given OID.
    Returns a list of (oid, value) tuples.
    Returns None if connection failed (for offline detection).
    """
    results = []
    connection_failed = False
    
    try:
        snmpDispatcher = SnmpDispatcher()
        
        iterator = nextCmd(
            snmpDispatcher,
            CommunityData(community, mpModel=1),  # SNMPv2c
            UdpTransportTarget((target_ip, 161), timeout=3.0, retries=1),
            ObjectType(ObjectIdentity(oid)),
            lexicographicMode=False
        )

        for errorIndication, errorStatus, errorIndex, varBinds in iterator:
            if errorIndication:
                print(f"SNMP Error for {target_ip}: {errorIndication}")
                connection_failed = True
                break
            elif errorStatus:
                print(f"SNMP Status Error for {target_ip}: {errorStatus.prettyPrint()}")
                break
            else:
                for varBind in varBinds:
                    results.append(varBind)
                    
        snmpDispatcher.transportDispatcher.closeDispatcher()
        
    except Exception as e:
        print(f"SNMP Exception for {target_ip}: {e}")
        connection_failed = True
    
    # Return None if connection failed (no SNMP response)
    if connection_failed and not results:
        return None
        
    return results

def get_cpu_loader(target_ip=TARGET_IP):
    """
    Calculates average CPU load.
    OID: 1.3.6.1.2.1.25.3.3.1.2 (hrProcessorLoad)
    Returns None if SNMP connection failed.
    """
    oid = '1.3.6.1.2.1.25.3.3.1.2'
    results = snmp_walk(oid, target_ip)
    
    # SNMP connection failed
    if results is None:
        return None
        
    if not results:
        return 0

    total_load = 0
    count = 0
    for _, val in results:
        try:
            total_load += int(val)
            count += 1
        except ValueError:
            pass
    
    if count == 0:
        return 0
        
    return round(total_load / count, 2)

def get_ram_usage(target_ip=TARGET_IP):
    """
    Calculates RAM usage.
    Iterates hrStorageTable to find the Physical RAM unit.
    Returns dict with total, used, free (in GB) and percent.
    """
    # 1. Get Storage Types to find RAM
    # hrStorageType: 1.3.6.1.2.1.25.2.3.1.2
    # Standard RAM type OID: 1.3.6.1.2.1.25.2.1.2
    
    ram_indices = []
    
    # Walk hrStorageType
    type_results = snmp_walk('1.3.6.1.2.1.25.2.3.1.2', target_ip)
    
    for var, val in type_results:
        # Check if value matches RAM OID
        # val might be an OID object, convert to str
        if '1.3.6.1.2.1.25.2.1.2' in str(val):
            # Extract index from the OID (last component)
            # var is like 1.3.6.1.2.1.25.2.3.1.2.X
            idx = str(var).split('.')[-1]
            ram_indices.append(idx)
            
    total_bytes = 0
    used_bytes = 0

    if not ram_indices:
        # Fallback or empty
        return {"total": 0, "used": 0, "free": 0, "percent": 0}

    # Usually there's only one Physical RAM, but let's sum if multiple
    for idx in ram_indices:
        # hrStorageAllocationUnits: 1.3.6.1.2.1.25.2.3.1.4.idx
        # hrStorageSize: 1.3.6.1.2.1.25.2.3.1.5.idx
        # hrStorageUsed: 1.3.6.1.2.1.25.2.3.1.6.idx
        
        units_res = snmp_walk(f'1.3.6.1.2.1.25.2.3.1.4.{idx}', target_ip)
        size_res = snmp_walk(f'1.3.6.1.2.1.25.2.3.1.5.{idx}', target_ip)
        used_res = snmp_walk(f'1.3.6.1.2.1.25.2.3.1.6.{idx}', target_ip)
        
        if units_res and size_res and used_res:
            try:
                units = int(units_res[0][1])
                size = int(size_res[0][1])
                used = int(used_res[0][1])
                
                total_bytes += (size * units)
                used_bytes += (used * units)
            except:
                pass

    if total_bytes == 0:
        return {"total": 0, "used": 0, "free": 0, "percent": 0}

    gb_div = 1024 ** 3
    total_gb = round(total_bytes / gb_div, 2)
    used_gb = round(used_bytes / gb_div, 2)
    free_gb = round(total_gb - used_gb, 2)
    percent = round((used_bytes / total_bytes) * 100, 2)

    return {
        "total": total_gb,
        "used": used_gb,
        "free": free_gb,
        "percent": percent
    }

def get_net_io_counters(target_ip=TARGET_IP):
    """
    Returns total bytes received and sent across all UP interfaces.
    Returns: (bytes_recv, bytes_sent)
    """
    total_recv = 0
    total_sent = 0
    
    # 1. Find UP interfaces
    # ifOperStatus: 1.3.6.1.2.1.2.2.1.8
    status_results = snmp_walk('1.3.6.1.2.1.2.2.1.8', target_ip)
    
    up_indices = []
    for var, val in status_results:
        # val=1 means Up
        if val == 1: 
            idx = str(var).split('.')[-1]
            up_indices.append(idx)
            
    if not up_indices:
        return 0, 0
        
    # 2. Sum Octets for UP interfaces
    for idx in up_indices:
        # ifInOctets: 1.3.6.1.2.1.2.2.1.10.idx
        # ifOutOctets: 1.3.6.1.2.1.2.2.1.16.idx
        try:
            in_res = snmp_walk(f'1.3.6.1.2.1.2.2.1.10.{idx}', target_ip)
            out_res = snmp_walk(f'1.3.6.1.2.1.2.2.1.16.{idx}', target_ip)
            
            if in_res: total_recv += int(in_res[0][1])
            if out_res: total_sent += int(out_res[0][1])
        except:
            pass
            
    return total_recv, total_sent
