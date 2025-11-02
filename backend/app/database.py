import contextlib as _cl
import fastapi as _fa
import sqlalchemy.ext.asyncio as _sa
import sqlalchemy.orm as _so
import typing as _t


Engine = _sa.create_async_engine(
    "sqlite+aiosqlite:///./test.db", echo=False, future=True
)

AsyncSessionLocal = _sa.async_sessionmaker(bind=Engine, expire_on_commit=False)

# SQL Alchemy Base model
Base = _so.declarative_base()


@_cl.asynccontextmanager
async def lifespan(app: _fa.FastAPI) -> _t.AsyncGenerator[None]:
    """
    Create database and tables.
    """
    async with Engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await Engine.dispose()


async def get_session() -> _t.AsyncGenerator[_sa.AsyncSession, None]:
    """
    Yield an asynchronous SQLAlchemy session.

    :return: An instance of AsyncSession.
    """
    async with AsyncSessionLocal() as session:
        yield session
