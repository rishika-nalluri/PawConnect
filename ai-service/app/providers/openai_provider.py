from .openai_compat import OpenAICompatibleProvider

OPENAI_URL = "https://api.openai.com/v1/chat/completions"


class OpenAIProvider(OpenAICompatibleProvider):
    def __init__(self, api_key: str, model: str) -> None:
        super().__init__("openai", OPENAI_URL, api_key, model)
