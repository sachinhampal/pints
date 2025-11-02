import models as _m
import sqlmodel as _sm
import sqlalchemy.orm as _sao
import sqlalchemy.ext.asyncio as _sea

# GLOBAL TODO: Fix return types


class SQLRepository:
    """
    SQL repository.
    """

    def __init__(self, session: _sea.AsyncSession) -> None:
        """
        Initialise repository.

        :param session: Async session instance.
        """
        self.__session = session

    async def commit(self) -> None:
        """
        Commit operation to database.
        """
        await self.__session.commit()

    async def rollback(self) -> None:
        """
        Rollback database operation.
        """
        await self.__session.rollback()

    async def create_pint_record(self, pint_record: _m.PintRecord) -> _m.PintRecord:
        """
        Create a new pint record. This also involves updating friend related data too.

        :param pint_record: Pint record
        :return: Pint record
        """
        session = self.__session

        session.add(pint_record)
        await session.flush()
        return pint_record

    async def create_friend_pint_record(
        self, pint_record_id: int | None, friend_name: str
    ) -> _m.FriendPintRecord:
        """
        Create a friend pint record.

        :param pint_record_id: Pint record ID.
        :param friend_name: Friend name.
        :return: Friend pint record.
        """
        session = self.__session

        assert pint_record_id is not None

        friend_pint_record = _m.FriendPintRecord(
            pint_record_id=pint_record_id, friend_name=friend_name
        )
        session.add(friend_pint_record)
        return friend_pint_record

    async def create_or_update_friend_record(
        self, friend_name: str, number: float
    ) -> _m.Friend:
        """
        Create or update an existing friend record.

        :param friend_name: Friend name.
        :param number: Number of pints to update the friend record by.
        :return: Friend record.
        """
        session = self.__session

        statement = _sm.select(_m.Friend).where(_m.Friend.name == friend_name)
        result = await session.execute(statement)
        friend_record = result.scalar_one_or_none()
        if friend_record is not None:
            friend_record.total_pint_count = (
                friend_record.total_pint_count or 0
            ) + number
        else:
            friend_record = _m.Friend(name=friend_name, total_pint_count=number)
            session.add(friend_record)

        return friend_record

    async def get_all_records(self) -> list[_m.PintRecord]:
        """
        Get all pint records.

        :return: List of all pint records.
        """
        session = self.__session

        statement = _sm.select(_m.PintRecord).options(
            _sao.selectinload(_m.PintRecord.friend_pint_record).selectinload(
                _m.FriendPintRecord.friend
            )
        )
        result = await session.execute(statement)
        pint_records = result.scalars().all()
        return list(pint_records)

    async def get_friend_pint_count(self) -> ...:
        """
        Get friend stats.

        :return: List of friend stats.
        """
        session = self.__session

        statement = _sm.select(
            _m.Friend.name,
            _m.Friend.total_pint_count.label("pint_count"),
        ).order_by(_sm.desc("pint_count"))
        result = await session.execute(statement)
        return result.all()  # type: ignore

    async def get_friend_pub_frequency(self) -> ...:
        """
        Get pub frequency per friend.

        :return: Pub frequency per friend.
        """
        session = self.__session

        query = (
            _sm.select(
                _m.FriendPintRecord.friend_name,
                _m.PintRecord.location,
                _sm.func.sum(_m.PintRecord.number).label("pints_at_location"),
            )
            .join(
                _m.PintRecord, _m.FriendPintRecord.pint_record_id == _m.PintRecord.id_
            )
            .group_by(_m.FriendPintRecord.friend_name, _m.PintRecord.location)
            .order_by(_m.FriendPintRecord.friend_name, _m.PintRecord.location)
        )
        result = await session.execute(query)
        return result.all()  # type: ignore

    async def get_location_stats(self) -> list[_m.PintRecord]:
        """
        Get location stats.

        :return: List of pint records location stats.
        """
        session = self.__session

        subquery = (
            _sm.select(
                _m.PintRecord.location.label("location"),
                _sm.func.count().label("number_of_visits"),
                _sm.func.sum(_m.PintRecord.number).label("number_of_pints"),
            )
            .group_by(_m.PintRecord.location)
            .order_by(_sm.desc("number_of_pints"))
            .subquery()
        )
        query = _sm.select(subquery)  # type: ignore
        results = await session.execute(query)
        pint_records = results.all()
        return pint_records  # type: ignore
