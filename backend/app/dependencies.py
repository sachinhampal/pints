import database as _db
import fastapi as _fa
import repositories.sql as _rs
import sqlalchemy.ext.asyncio as _sea


def get_sql_repository(
    session: _sea.AsyncSession = _fa.Depends(_db.get_session),
) -> _rs.SQLRepository:
    """
    Get a repository instance.

    :param session: An async session for database operations.
    :return: A repository instance.
    """
    # IMPORTANT NOTE: The repository should be an abstract class, as *any* repository type can be used here
    return _rs.SQLRepository(session=session)
