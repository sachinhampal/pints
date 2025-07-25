import pandas as _pd
import typing as _t


def clean_up_input_pints_data(input_data_df: _pd.DataFrame) -> _pd.DataFrame:
    """
    Clean

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
    # TODO Finish once spreadsheet is up to date


_FRIENDS_REMAP =   {
    "Roisin": "Róisín",
    "Stan": "Stanley"
}