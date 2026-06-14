import json
from typing import List, Dict, Any
import google.generativeai as genai
from core.config import settings

class CharterAgent:
    """Generates project charters based on core elements."""
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def generate_charter(self, core_elements: str) -> Dict[str, Any]:
        prompt = f"""
        You are an expert NGO Project Manager. Based on the following core elements provided by the user, 
        create a formal, comprehensive Project Charter. 
        
        CRITICAL INSTRUCTION: If any field, information, or specification is missing from the user's input, YOU MUST generate your own logical and realistic data to fill it out. Do not leave any field empty or 'TBD'.
        
        Core Elements provided:
        {core_elements}
        
        Output the charter strictly in the following JSON format matching the standard Project Charter template:
        {{
            "project_name": "Name of the project",
            "project_sponsor": "Name or title of sponsor",
            "project_manager": "Name of PM",
            "date_of_project_approval": "YYYY-MM-DD",
            "last_revision_date": "YYYY-MM-DD",
            "project_description": "Detailed description of the project",
            "scope": "In-scope and out-of-scope details",
            "business_case": "Why we are doing this, expected ROI or impact",
            "constraints": {{
                "time": "Time constraints",
                "budget": "Budget constraints",
                "scope": "Scope constraints",
                "quality": "Quality constraints"
            }},
            "project_deliverables": "List of deliverables",
            "benefits": [
                {{
                    "kpi": "Metric name",
                    "baseline": "Current state",
                    "goal": "Target state"
                }}
            ],
            "steering_committee": ["Member 1", "Member 2"],
            "key_stakeholders": [
                {{
                    "name": "Stakeholder name",
                    "success_criteria": "What success looks like for them"
                }}
            ],
            "risks": "List of risks and mitigation strategies"
        }}
        """
        response = self.model.generate_content(prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].strip()
            
        try:
            return json.loads(text)
        except Exception:
            # Fallback if json parsing fails
            return {
                "project_name": "Error Parsing Charter",
                "project_description": text
            }

class ProcurementAgent:
    """Simulates web search and email curation for quotations."""
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def fetch_quotations(self, product_requirements: str) -> List[Dict[str, Any]]:
        # In a real app, this would use a web scraping tool and email APIs.
        # For the MVP, we simulate the curation of quotes using LLM.
        prompt = f"""
        You are a Procurement AI Agent for an NGO.
        The Project Manager needs quotations for the following products:
        {product_requirements}
        
        Simulate reaching out to 3 top vendors for these products. Generate 3 realistic quotations.
        Output strictly in JSON list format:
        [
            {{
                "vendor_name": "Vendor A",
                "amount": 15000,
                "details": "Includes delivery and basic warranty.",
                "contact_email": "sales@vendora.com"
            }},
            ...
        ]
        """
        response = self.model.generate_content(prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].strip()
            
        return json.loads(text)

class DispatchAgent:
    """Matches field agents to tasks based on location."""
    
    def assign_agents(self, tasks: List[dict], available_agents: List[dict]) -> List[dict]:
        """
        tasks: list of dict with 'task_desc', 'target_lat', 'target_lng'
        available_agents: list of dict with 'agent_id', 'name', 'lat', 'lng'
        Returns list of assignments.
        """
        import math
        assignments = []
        # Simple greedy assignment based on euclidean distance for MVP
        for task in tasks:
            best_agent = None
            min_dist = float('inf')
            for agent in available_agents:
                if not agent.get('is_available', True): continue
                
                dist = math.hypot(
                    task['target_lat'] - agent['lat'], 
                    task['target_lng'] - agent['lng']
                )
                if dist < min_dist:
                    min_dist = dist
                    best_agent = agent
            
            if best_agent:
                assignments.append({
                    "task": task,
                    "agent": best_agent
                })
                # mark unavailable
                best_agent['is_available'] = False
                
        return assignments
