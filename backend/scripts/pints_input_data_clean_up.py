import pandas as _pd


def clean_up_input_pints_data(input_data_df: _pd.DataFrame) -> _pd.DataFrame:
    """
    Clean up input data.

    :param input_data_df: Input data frame.
    :return: Cleaned-up data frame.
    """
    # Remove empty entries
    date_series = input_data_df["Date"]
    df = input_data_df.loc[date_series.notnull()]

    # Force data types is required becasue the data polled from the Google Sheets API results in string data types when we expect floats
    # TODO Check that the columns names in `_COLUMN_NAME_TO_DTYPE` match the raw data's column names
    df = df.astype(_COLUMN_NAME_TO_DTYPE)

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
_COLUMN_NAME_TO_DTYPE = {
    "Date": str,
    "Location": str,
    "Pint": str,
    "Number": float,
    "Cost (per pint)": str,
    "Company": str,
    "Comments": str,
    "Spend": str,
}
