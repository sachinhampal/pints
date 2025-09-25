import collections as _coll
import datetime as _dt
import os as _os
import pandas as _pd
import requests as _req
import typing as _t


def compute_pints_data(
    input_pints_df: _pd.DataFrame,
    *,
    visited_locations_2_coordinates: _t.Optional[dict[str, _t.Iterable[str]]] = None,
) -> _t.Dict[str, _t.Any]:
    """
    Compute pints-related data using the input data provided.

    :param input_pints_df: Input pints data frame.
    :param visited_locations_2_coordinates: Locations and their coordinates that have already been visited. This is used to avoid unneccessary calls to the Google Maps API. Defaults to None
    :return: Pints-related data which will be used for visualisation.
    """
    return {
        "total_pint_count": _compute_total_pint_count(input_pints_df),
        "pint_info": _compute_pint_info(input_pints_df),
        "location_info": _compute_location_info(
            input_pints_df, visited_locations_2_coordinates
        ),
        "date_info": _compute_date_info(input_pints_df),
        "friends_info": _compute_friends_info(input_pints_df),
    }


# ==============================================================================
# Private helpers
# ==============================================================================


def _compute_friends_info(
    input_pints_df: _pd.DataFrame,
) -> dict[_t.Any, _t.Any]:
    """
    Compute friend pint-related information.

    :param input_pints_df: Input pints data frame.
    :return: Sorted leaderboard in descending order.
    """
    # Create a mapping from name to pint count
    name_2_pint_info = _coll.defaultdict(dict)
    for _, row in input_pints_df.iterrows():
        for name in row["company_list"]:
            pint_info = name_2_pint_info[name]
            number = row["Number"]
            location = row["Location"]
            if not bool(pint_info):
                pint_info["pint_count"] = number
                pint_info["pub_2_frequency"] = _coll.defaultdict(
                    int, **{location: number}
                )
                pint_info["icon"] = "&#x1F37A"
            else:
                pint_info["pint_count"] += number
                pint_info["pub_2_frequency"][location] += number

    # NOTE: We only use a data frame here to leverage the `rank` and `sort_values` functionality
    df = _pd.DataFrame(
        index=list(name_2_pint_info.keys()), data=name_2_pint_info.values()
    )
    df["pint_count_rank"] = df["pint_count"].rank(method="min", ascending=False)
    df = df.sort_values("pint_count_rank", ascending=True)
    name_2_rank = df.to_dict("index")

    return name_2_rank


def _compute_date_info(input_pints_df: _pd.DataFrame) -> _t.Dict[str, _t.Any]:
    """
    Compute pints-related data.

    :param input_pints_df: Input pints data frame.
    :return: Pints-related date data.
    """
    date_info_dict = {}
    date_series = input_pints_df["Date"]
    df = input_pints_df.assign(
        **{
            "_datetime_date_": date_series.map(
                lambda x: _dt.datetime.strptime(x, "%d/%m/%Y").date()
            )
        }
    )

    # TODO Sort each entry chronologically
    for date_col_name, output_str, time_format_str in [
        ("day", "pints_per_day_of_the_week", "%A"),
        ("week", "pints_per_week_of_the_year", "%U"),
        ("month", "pints_per_month_of_the_year", "%B"),
    ]:
        df[date_col_name] = df["_datetime_date_"].map(
            lambda x: x.strftime(time_format_str)
        )
        date_info_dict[output_str] = (
            df.groupby(date_col_name)
            .agg({"Number": "sum", "Pint": lambda x: x.mode().iloc[0]})
            .reset_index()
            .rename(
                columns={
                    "Number": "number_of_pints",
                    "Pint": "most_popular_drink",
                }
            )
            .to_dict("records")
        )

    # Compute pints stats per entry; which is essentially grouping data by date and company
    stats_per_entry_df = input_pints_df.assign(
        **{
            "company": input_pints_df["company_list"].apply(lambda x: tuple(sorted(x))),
            "_datetime_date_": date_series.map(
                lambda x: _dt.datetime.strptime(x, "%d/%m/%Y").date()
            ),
        }
    )
    stats_per_entry_df = stats_per_entry_df.groupby(
        ["_datetime_date_", "company"], as_index=False
    ).agg({"Number": "sum", "Pint": lambda x: x.mode().iloc[0]})
    stats_per_entry_df["_datetime_date_"] = stats_per_entry_df["_datetime_date_"].apply(
        str
    )
    stats_per_entry_df["company"] = stats_per_entry_df["company"].apply(
        lambda x: list(set(x))
    )
    stats_per_entry_df["cumulative_number"] = stats_per_entry_df["Number"].cumsum()
    stats_per_entry_dict = stats_per_entry_df.to_dict(orient="index")
    date_info_dict["time_series_entry_info"] = stats_per_entry_dict

    # Stats per day
    stats_per_date_df = stats_per_entry_df.groupby("_datetime_date_").agg(
        {
            "Number": "sum",
            "cumulative_number": "max",
            "company": "sum",  # Does this entry make sense?
        }
    )
    stats_per_date_dict = stats_per_date_df.to_dict(orient="index")
    date_info_dict["time_series_date_info"] = stats_per_date_dict

    return date_info_dict


def _compute_location_info(
    input_pints_df: _pd.DataFrame,
    visited_locations_2_coordinates: _t.Optional[dict[str, _t.Iterable[str]]] = None,
) -> dict[_t.Any, dict[_t.Any, _t.Any]]:
    """
    Compute pints-related data about each location visited.

    :param input_pints_df: Input pints data frame.
    :param visited_locations_2_coordinates: Locations and their coordinates that have already been visited. This is used to avoid unneccessary calls to the Google Maps API. Defaults to None
    :return: Pints-related data as a list of dictionaries.
    """
    if visited_locations_2_coordinates is None:
        visited_locations_2_coordinates = {}

    df = (
        _pd.DataFrame(
            data={
                "name": input_pints_df["Location"],
                "date": input_pints_df["Date"],
                "number_of_pints": input_pints_df["Number"],
            }
        )
        .groupby("name")
        .agg({"date": "nunique", "number_of_pints": "sum"})
        .rename(columns={"date": "number_of_visits"})
        .sort_values("number_of_pints", ascending=False)
    )
    df["number_of_pints_rank"] = df["number_of_pints"].rank(
        method="min", ascending=False
    )

    # t = dict[_t.Hashable, dict[, _t.Any]]
    location_name_2_info_dict = df.to_dict(orient="index")

    # Add location coordinates if necessary
    api_key = _os.getenv("GOOGLE_MAPS_API_KEY")
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    for name, info_dict in location_name_2_info_dict.items():
        name_str = str(name)  # Adding this comment as Pylance complains
        if name in visited_locations_2_coordinates:
            info_dict["coordinates"] = visited_locations_2_coordinates[name_str]
            continue

        params = {
            "address": name,
            "key": api_key,
        }
        print(f"Making Google API request for {name}'s coordinates...")
        response = _req.get(url, params=params)
        data = response.json()
        if data["status"] == "OK":
            geo_location = data["results"][0]["geometry"]["location"]
            coordinates = (geo_location["lng"], geo_location["lat"])
            info_dict["coordinates"] = coordinates
        else:
            print(f"{name} coordinates cannot be found, defaulting to null")
            info_dict["coordinates"] = None

    return location_name_2_info_dict


def _compute_pint_info(input_pints_df: _pd.DataFrame) -> list[dict[_t.Any, _t.Any]]:
    """
    Compute pints-related data about the brand/type of drink.

    :param input_pints_df: Input pints data frame.
    :return: Pints-related information.
    """
    # TODO Add pints related information
    return (
        input_pints_df.groupby("Pint")["Number"]
        .sum()
        .reset_index()
        .sort_values("Number", ascending=False)
        .rename(columns={"Pint": "name", "Number": "count"})
        .to_dict("records")
    )


def _compute_total_pint_count(input_pints_df: _pd.DataFrame) -> float:
    """
    Get the total number of pints consumed

    :param input_pints_df: Input pints data frame.
    :return: The total number of pints consumed.
    """
    return sum(input_pints_df["Number"])
