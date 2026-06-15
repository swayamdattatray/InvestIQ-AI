from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "InvestIQ-AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ALPHA_VANTAGE_API_KEY: str = "demo"

    class Config:
        case_sensitive = True

settings = Settings()
