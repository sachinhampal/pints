import database as _db
import dependencies as _dp
import fastapi as _fa
import models as _m
import repositories.sql as _rs
import services.stats as _st
import schemas as _sch
import sqlalchemy.ext.asyncio as _sea
import typing as _t


router = _fa.APIRouter()


def get_stats_service(
    repository: _rs.SQLRepository = _fa.Depends(_dp.get_sql_repository),
) -> _st.StatsService:
    """
    Get a service instance.

    :param repository: A repository instance for data access.
    :return: An entry service instance.
    """
    return _st.StatsService(repository=repository)


stats_service = _t.Annotated[_st.StatsService, _fa.Depends(get_stats_service)]


# ================================================================================
# Routes
# ================================================================================


@router.get("/stats/friends/", status_code=200)
async def get_friends_stats(service: stats_service) -> _sch.FriendsStatsResponse:
    """
    Get friends stats.

    :param service: Service
    :return: Friends stats response.
    """
    return await service.get_friends_stats()


@router.get("/stats/location/", status_code=200)
async def get_location_stats(service: stats_service) -> _sch.LocationStatsResponse:
    """
    Get all location stats.

    :param service: Service.
    :return: Locations stats response.
    """
    return await service.get_location_stats()
