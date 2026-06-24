import httpx
from typing import Optional
from app.core.config import settings


class OpenRouterClient:
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
    ) -> dict:
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
            return response.json()
    
    async def list_models(self) -> list:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/models",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()["data"]


openrouter_client = OpenRouterClient()
