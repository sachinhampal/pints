import collections as _coll
import datetime as _dt
import pandas as _pd
import typing as _t


def compute_pints_data(input_pints_df: _pd.DataFrame) -> _t.Dict[str, _t.Any]:
    """
    Compute pints-related data using the input data provided.

    :param input_pints_df: Input pints data frame.
    :return: Pints-related data which will be used for visualisation.
    """
    return {
        "total_pint_count": _compute_total_pint_count(input_pints_df),
        "pint_info": _compute_pint_info(input_pints_df),
        "leaderboard": _compute_company_leaderboard(input_pints_df),
        "location_info": _compute_location_info(input_pints_df),
        "date_info": _compute_date_info(input_pints_df),
    }


# ==============================================================================
# Private helpers
# ==============================================================================


def _compute_company_leaderboard(
    input_pints_df: _pd.DataFrame,
) -> _t.List[_t.Dict[str, _t.Any]]:
    """
    Compute a leaderboard consisting of how many pints people have had.

    :param input_pints_df: Input pints data frame.
    :return: Sorted leaderboard in descending order.
    """
    # Create a mapping from name to pint count
    name_2_pint_count = _coll.defaultdict(int)
    for _, row in input_pints_df.iterrows():
        for name in row["company_list"]:
            name_2_pint_count[name] += row["Number"]

    # A data frame is only used here to leverage the `sort_values` functionality
    name_and_pint_count_df = _pd.DataFrame(
        data={
            "name": name_2_pint_count.keys(),
            "number_of_pints": name_2_pint_count.values(),
        }
    ).sort_values(by="number_of_pints", ascending=False)
    sorted_name_and_pint_count_list = name_and_pint_count_df.to_records(index=False)

    leaderboard = []
    for name, pint_count in sorted_name_and_pint_count_list:
        leaderboard_item = {
            "name": name,
            "pint_count": float(pint_count),
            "icon": "&#x1F37A",
        }
        leaderboard.append(leaderboard_item)

    return leaderboard


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

    return date_info_dict


def _compute_location_info(
    input_pints_df: _pd.DataFrame,
) -> _t.List[_t.Dict[str, _t.Any]]:
    """
    Compute pints-related data about each location visited.

    :param input_pints_df: Input pints data frame.
    :return: Pints-related data as a list of dictionaries.
    """
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
    )
    df = (
        df.rename(columns={"date": "number_of_visits"})
        .reset_index()
        .sort_values("number_of_pints", ascending=False)
    )

    return df.to_dict("records")


def _compute_pint_info(input_pints_df: _pd.DataFrame) -> _pd.DataFrame:
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
