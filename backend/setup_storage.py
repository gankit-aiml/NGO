import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("c:\\Users\\pc\\Desktop\\NGO\\backend\\.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Environment variables missing")
    exit(1)

supabase: Client = create_client(url, key)

bucket_name = "field_proofs"

try:
    buckets = supabase.storage.list_buckets()
    bucket_exists = any(b.name == bucket_name for b in buckets)
    
    if not bucket_exists:
        supabase.storage.create_bucket(bucket_name, options={"public": True})
        print(f"Bucket '{bucket_name}' created successfully.")
    else:
        print(f"Bucket '{bucket_name}' already exists.")
        
    # Ensure it's public
    supabase.storage.update_bucket(bucket_name, options={"public": True})
    print("Bucket configured as public.")
    
except Exception as e:
    print(f"Error: {e}")
