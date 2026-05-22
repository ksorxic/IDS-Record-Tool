from scapy.all import sniff, IP, TCP, UDP
import requests
import json
import time

# Η διεύθυνση του Next.js API σου
API_URL = "http://localhost:3000/api/logs"

def process_packet(packet):
    if IP in packet:
        # Βασικά στοιχεία πακέτου
        packet_data = {
            "src_ip": packet[IP].src,
            "dst_ip": packet[IP].dst,
            "protocol": packet[IP].proto,
            "size": len(packet),
            "timestamp": time.time()
        }

        # Αν είναι TCP ή UDP, παίρνουμε και τις θύρες
        if packet.haslayer(TCP):
            packet_data["src_port"] = packet[TCP].sport
            packet_data["dst_port"] = packet[TCP].dport
        elif packet.haslayer(UDP):
            packet_data["src_port"] = packet[UDP].sport
            packet_data["dst_port"] = packet[UDP].dport

        # Αποστολή στο Next.js Dashboard
        try:
            response = requests.post(API_URL, json=packet_data, timeout=1)
            if response.status_code == 201:
                print(f"[*] Log sent: {packet_data['src_ip']} -> {packet_data['dst_ip']}")
        except Exception as e:
            print(f"[!] Error sending log: {e}")

print("[+] IDS Sniffer started... Press Ctrl+C to stop.")

# Φίλτρο: Πιάνουμε μόνο IP κίνηση, αγνοώντας το δικό μας traffic προς το API (προαιρετικά)
sniff(filter="ip", prn=process_packet, store=0)