import pydantic as _pyd


class FriendStats(_pyd.BaseModel):
    pint_count: float
    pub_2_frequency: dict[str, float]
    icon: str = "&#x1F37A"
    pint_count_rank: int


class FriendsStatsResponse(_pyd.BaseModel):
    friends_info: dict[str, FriendStats]


class LocationStats(_pyd.BaseModel):
    number_of_visits: int
    number_of_pints: float
    number_of_pints_rank: int


class LocationStatsResponse(_pyd.BaseModel):
    location_info: dict[str, LocationStats]


class RecordCreate(_pyd.BaseModel):
    date: str
    location: str
    number: float
    friend_names: list[str]
    comment: str | None
    pint_brand: str | None
    pint_cost: float | None


class RecordResponse(RecordCreate):
    total_cost: float | None
