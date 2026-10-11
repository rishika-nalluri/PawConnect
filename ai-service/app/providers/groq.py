from .openai_compat import OpenAICompatibleProvider

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqProvider(OpenAICompatibleProvider):
    def __init__(self, api_key: str, model: str) -> None:
        super().__init__("groq", GROQ_URL, api_key, model)
