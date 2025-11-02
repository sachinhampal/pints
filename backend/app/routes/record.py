import database as _db
import dependencies as _dp
import fastapi as _fa
import models as _m
import repositories.sql as _rs
import services.record as _sr
import schemas as _sch
import sqlalchemy.ext.asyncio as _sea
import typing as _t


router = _fa.APIRouter()


def get_record_service(
    repository: _rs.SQLRepository = _fa.Depends(_dp.get_sql_repository),
) -> _sr.RecordService:
    """
    Get a service instance.

    :param repository: A repository instance for data access.
    :return: An entry service instance.
    """
    return _sr.RecordService(repository=repository)


record_service = _t.Annotated[_sr.RecordService, _fa.Depends(get_record_service)]


# ================================================================================
# Routes
# ================================================================================


@router.get("/api/records/", status_code=200)
async def get_all(service: record_service) -> list[_sch.RecordResponse]:
    """
    Get all entries from the service.

    :param service: Service.
    :return: Record responses.
    """
    pint_records = await service.get_all()
    return [
        _sch.RecordResponse(
            **p.__dict__,
            friend_names=[x.friend_name for x in p.friend_pint_record],
        )
        for p in pint_records
    ]


@router.post("/api/records/", status_code=201)
async def create(
    data: _sch.RecordCreate, service: record_service
) -> _sch.RecordResponse:
    """
    Create a record.

    :param data: Data.
    :param service: Service.
    :return: Record.
    """
    pint_record = await service.create(data)

    pint_record_dict = pint_record.__dict__
    return _sch.RecordResponse(**pint_record_dict, friend_names=[])
