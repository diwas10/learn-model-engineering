import os

class Settings:
    PROJECT_NAME: str = "AI Model Engineering Mastery Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]
    DATA_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "courseData.json")
    EXECUTION_TIMEOUT_SECONDS: float = 8.0
    MAX_OUTPUT_LENGTH: int = 10000

settings = Settings()
