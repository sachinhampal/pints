import pandas as _pd


def clean_up_input_pints_data(input_data_df: _pd.DataFrame) -> _pd.DataFrame:
    """
    Clean up input data.

    :param input_data_df: Input data frame.
    :return: Cleaned-up data frame.
    """
    # Remove empty entries
    df = input_data_df.loc[input_data_df["Date"].notnull()]

    # Add column "company_list" to data frame
    company_list_series = df["Company"].map(
        lambda x: x.split(",") if _pd.notnull(x) else []
    )
    company_list_series = company_list_series.map(lambda x: [y.lstrip() for y in x])
    # - There is probably a much more efficient way of doing this
    df["company_list"] = company_list_series.map(
        lambda x: [_FRIENDS_RENAME_MAP.get(y, y) for y in x]
    )

    return df


_FRIENDS_RENAME_MAP = {"Roisin": "Róisín", "Stan": "Stanley"}
