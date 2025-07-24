import collections as _coll
import json as _json
import pandas as _pd
import os as _os
import requests as _req
import typing as _t


def compute_pints_info(input_pints_df):
    return {
        "total_pint_count": _compute_total_pint_count(input_pints_df),
        "leaderboard": _compute_people_leaderboard(input_pints_df),
        "location_info": _compute_location_info(input_pints_df),
    }


# ==============================================================================
# Private helpers
# ==============================================================================


def _compute_location_info(
    input_pints_df: _pd.DataFrame,
) -> _t.List[_t.Dict[str, _t.Any]]:
    """
    Compute pints-related information about each location visited.

    :param input_pints_df: Input pints data frame.
    :return: Pints-related information as a list of dictionaries.
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


def _compute_people_leaderboard(
    input_pints_df: _pd.DataFrame,
) -> _t.List[_t.Dict[str, _t.Any]]:
    """
    Compute the leaderboard consisting of how many pints people have had.

    :param input_pints_df: Input pints data frame.
    :return: Sorted leaderboard in descending order.
    """
    name_2_pint_count = _get_name_2_pint_count(input_pints_df)

    # A data frame is only here to leverage the `sort_values` functionality
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


def _compute_total_pint_count(input_pints_df: _pd.DataFrame) -> float:
    """
    Get the total number of pints consumed

    :param input_pints_df: Input pints data frame.
    :return: The total number of pints consumed.
    """
    return sum(input_pints_df["Number"])


def _get_name_2_pint_count(df) -> _t.Dict[str, float]:
    df = df.loc[df["Date"].notnull()]
    company_list_series = df["Company"].map(
        lambda x: x.split(",") if _pd.notnull(x) else []
    )
    company_list_series = company_list_series.map(lambda x: [y.lstrip() for y in x])
    df = df.assign(**{"_company_list_": company_list_series})
    name_2_pint_count = _coll.defaultdict(int)
    for _, row in df.iterrows():
        for name in row["_company_list_"]:
            name_2_pint_count[name] += row["Number"]

    return name_2_pint_count
