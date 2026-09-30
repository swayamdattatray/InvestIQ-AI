from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "InvestIQ-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    ALPHA_VANTAGE_API_KEY: str = ""
    TWELVEDATA_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file="app/core/.env",
        extra="ignore"
    )

settings = Settings()