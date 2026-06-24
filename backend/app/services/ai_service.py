from typing import Optional
import httpx
from app.core.config import settings


class AIService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://legal-saas.com",
            "X-Title": "Legal SaaS Colombia"
        }
    
    async def chat_completion(
        self,
        messages: list,
        model: str = "openai/gpt-4o",
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def analyze_case(
        self,
        case_context: str,
        question: str,
        jurisdiction: str = "CGP"
    ) -> str:
        messages = [
            {
                "role": "system",
                "content":                 f"""Eres un asistente jurídico experto en legislación colombiana, 
                especializado en {jurisdiction}. Analiza el caso proporcionado y responde 
                con fundamento legal. Cita artículos de ley y jurisprudencia cuando sea posible.
                
                Escribe en texto simple. NO uses asteriscos, numerales, guiones para formato, ni ningún símbolo de Markdown. Para separar secciones usa líneas en blanco. Para enumerar usa números seguidos de punto (1. 2. 3.).
                """
            },
            {
                "role": "user",
                "content": f"""
                CONTEXTO DEL CASO:
                {case_context}
                
                PREGUNTA:
                {question}
                """
            }
        ]
        return await self.chat_completion(messages, max_tokens=3000)
    
    async def draft_memorial(
        self,
        case_context: str,
        memorial_type: str,
        jurisdiction: str = "CGP",
        instructions: str = ""
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": """Eres un abogado litigante experto en redacción de escritos 
                judiciales en Colombia. Redacta el memorial siguiendo el formato formal 
                colombiano con encabezado correcto, hechos numerados, fundamentación 
                jurídica, súplicas y notificaciones.
                Escribe en texto simple. NO uses asteriscos, numerales, guiones para formato, ni ningún símbolo de Markdown. Para separar secciones usa líneas en blanco."""
            },
            {
                "role": "user",
                "content": f"""
                TIPO DE MEMORIAL: {memorial_type}
                JURISDICCIÓN: {jurisdiction}
                
                CONTEXTO DEL CASO:
                {case_context}
                
                INSTRUCCIONES ADICIONALES:
                {instructions}
                
                Genera un borrador completo y profesional del memorial.
                """
            }
        ]
        return await self.chat_completion(messages, max_tokens=4000, temperature=0.5)
    
    async def suggest_jurisprudence(
        self,
        legal_topic: str,
        case_context: str
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": """Eres un experto en jurisprudencia colombiana. 
                Sugiere sentencias y fallos relevantes para el tema legal indicado, proporcionando: nombre del caso, referencia, problema juridico, decision y relevancia.
                Escribe en texto simple. NO uses asteriscos, numerales, guiones para formato, ni ningun simbolo de Markdown. Para enumerar usa numeros seguidos de punto (1. 2. 3.).
                """
            },
            {
                "role": "user",
                "content": f"""
                TEMA LEGAL: {legal_topic}
                
                CONTEXTO DEL CASO:
                {case_context}
                
                Proporciona jurisprudencia relevante de la Corte Constitucional, 
                Corte Suprema de Justicia, Consejo de Estado y Tribunales Superiores.
                """
            }
        ]
        return await self.chat_completion(messages, max_tokens=3000)
    
    async def analyze_viability(
        self,
        case_context: str,
        proposed_action: str,
        jurisdiction: str = "CGP"
    ) -> dict:
        messages = [
            {
                "role": "system",
                "content": """Analiza la viabilidad de una actuación procesal en 
                el contexto del caso proporcionado. Evalúa:
                1. Viabilidad (Alta/Media/Baja)
                2. Fundamento legal
                3. Riesgos
                4. Probabilidad de éxito
                5. Alternativas
                
                Responde en formato JSON con la siguiente estructura:
                {
                    "viability": "alta|media|baja",
                    "score": 0-100,
                    "legal_basis": "...",
                    "risks": [...],
                    "success_probability": "...",
                    "alternatives": [...],
                    "recommendation": "..."
                }
                """
            },
            {
                "role": "user",
                "content": f"""
                CONTEXTO DEL CASO:
                {case_context}
                
                ACTUACIÓN PROPUESTA:
                {proposed_action}
                
                JURISDICCIÓN: {jurisdiction}
                """
            }
        ]
        
        response = await self.chat_completion(messages, max_tokens=2000, temperature=0.3)
        
        import json
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"raw_response": response}


ai_service = AIService()
