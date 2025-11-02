import models as _m
import schemas as _sch
import repositories.sql as _rs


class RecordService:
    """
    Service for managing pint-related records.
    """

    # IMPORTANT NOTE: The repository should be an abstract class, as *any* repository type can be used here
    def __init__(self, repository: _rs.SQLRepository):
        """
        Initialise service.

        :param repository: Repository.
        """
        self.__repository = repository

    async def create(self, record_create: _sch.RecordCreate) -> _m.PintRecord:
        """
        Create a full record.

        :param record_create: Record input data.
        :return: Pint record.
        """
        repository = self.__repository

        friend_names = record_create.friend_names
        number = record_create.number
        pint_cost = record_create.pint_cost
        total_cost = number * pint_cost if pint_cost is not None else None

        # Create a pint record
        pint_record_dict = {
            "comment": record_create.comment,
            "date": record_create.date,
            "location": record_create.location,
            "number": record_create.number,
            "pint_brand": record_create.pint_brand,
            "pint_cost": record_create.pint_cost,
            "total_cost": total_cost,
        }
        pint_record = _m.PintRecord(**pint_record_dict)
        try:
            pint_record_obj = await repository.create_pint_record(pint_record)
            for friend_name in friend_names:
                # Create a record linking pint to friend
                await repository.create_friend_pint_record(
                    pint_record_obj.id_, friend_name
                )

                # Create or update how many pints a friend has had
                await repository.create_or_update_friend_record(
                    friend_name, pint_record_obj.number
                )

            await repository.commit()
            return pint_record

        except Exception:
            await repository.rollback()
            raise

    async def get_all(self) -> list[_m.PintRecord]:
        """
        Get all records.

        :return: All records.
        """
        repository = self.__repository

        pint_records = await repository.get_all_records()

        # TODO Can the following be done via a pydantic API, rather than constructing the object ourselves?
        return pint_records


# ================================================================================
# Private helpers
# ================================================================================
