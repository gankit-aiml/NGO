import json
from groq import Groq
from core.config import settings
from schemas.request_models import ExtractedImpactData

class ImpactAgent:
    """
    Handles unstructured WhatsApp input, routes intent, and extracts JSON using Groq (Llama-3).
    """
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key)

    async def transcribe_audio(self, audio_filepath: str) -> str:
        """
        Transcribes voice note to English using Groq Whisper.
        """
        try:
            with open(audio_filepath, "rb") as file:
                transcription = self.client.audio.transcriptions.create(
                  file=(audio_filepath, file.read()),
                  model="whisper-large-v3-turbo",
                  response_format="text"
                )
            return transcription
        except Exception as e:
            print(f"ImpactAgent Whisper Error: {e}")
            return ""

    async def extract_impact_data(self, masked_text: str) -> ExtractedImpactData:
        """
        Uses Llama-3 to extract structured JSON from the masked text via Pydantic validator.
        """
        prompt = f"""
        Extract the event details from this text and return it as JSON with this exact structure:
        {{
            "item": "String (what was distributed/done)",
            "qty": Integer (quantity),
            "location": "String (where)"
        }}
        Text: '{masked_text}'
        Return ONLY valid JSON.
        """
        
        try:
            completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            
            return ExtractedImpactData(
                item=data.get("item", "Unknown"),
                qty=data.get("qty", 0),
                location=data.get("location", "Unknown")
            )
        except Exception as e:
            print(f"ImpactAgent Extraction Error: {e}")
            return ExtractedImpactData(item="Error", qty=0, location="Error")
