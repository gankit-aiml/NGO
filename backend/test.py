import urllib.request, json
try:
    reqs = json.loads(urllib.request.urlopen('http://127.0.0.1:4040/api/requests/http').read().decode('utf-8'))['requests']
    if not reqs:
        print("No requests logged by ngrok yet.")
    for r in reqs: 
        print(f"{r['request']['method']} {r['request']['uri']} - {r['response']['status_code']}")
except Exception as e:
    print(f"Error: {e}")
