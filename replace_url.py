import os
import glob

directory = r"c:\Users\pc\Desktop\NGO\frontend"
old_url = "http://127.0.0.1:8000"
new_url = "https://ngo-fjwc.vercel.app"

for filepath in glob.glob(os.path.join(directory, "**", "*.tsx"), recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if old_url in content:
        content = content.replace(old_url, new_url)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
