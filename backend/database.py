from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from settings import settings

# Create the async engine
async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    echo=True, # Set to False in production
)

# Create a session-maker
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# This is the base class our database models will inherit from
Base = declarative_base()

# This is a "dependency" that FastAPI will use
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()