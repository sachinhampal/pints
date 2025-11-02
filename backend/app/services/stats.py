import collections as _coll
import models as _m
import schemas as _sch
import repositories.sql as _rs


class StatsService:
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

    async def get_friends_stats(self) -> _sch.FriendsStatsResponse:
        """
        Get friends stats.

        :return: Friend stats.
        """
        repository = self.__repository

        friend_pint_count = await repository.get_friend_pint_count()
        friend_pub_frequency = await repository.get_friend_pub_frequency()

        friend_2_pub_2_frequency = {}
        for entry in friend_pub_frequency:
            friend = entry.friend_name
            pub_2_frequency = {entry.location: entry.pints_at_location}
            friend_2_pub_2_frequency.setdefault(friend, {}).update(pub_2_frequency)

        response_dict = {}
        for rank, entry in enumerate(friend_pint_count, start=1):
            friend = entry.name
            pint_count = entry.pint_count
            response_dict[friend] = _sch.FriendStats(
                pint_count=pint_count,
                pint_count_rank=rank,
                pub_2_frequency=friend_2_pub_2_frequency.get(friend, {}),
            )

        return _sch.FriendsStatsResponse(friends_info=response_dict)

    async def get_location_stats(self) -> _sch.LocationStatsResponse:
        """
        Get location stats.

        :return: Location stats.
        """
        repository = self.__repository

        location_stats = await repository.get_location_stats()
        response_dict = {}
        for rank, location_info_row in enumerate(location_stats, start=1):
            location_name = location_info_row.location
            response_dict[location_name] = _sch.LocationStats(
                number_of_visits=location_info_row.number_of_visits,
                number_of_pints=float(location_info_row.number_of_pints),
                number_of_pints_rank=rank,
            )

        return _sch.LocationStatsResponse(location_info=response_dict)
