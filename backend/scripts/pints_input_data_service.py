import google.auth as _ga
import googleapiclient.discovery as _gd
import os as _os
import pandas as _pd


def get_pints_input_data(write_to_file: bool = False) -> _pd.DataFrame:
    """
    Get pints input data from the spreadsheet using Google Sheets API service.
    In order to successfully query the data, authentication is required to use the API and permission is requred to access the spreadsheet.

    :param write_to_file: Flag which determines whether we write to a CSV file, defaults to False
    :return: Raw pints input data frame.
    """
    credentials, _ = _ga.default()
    spreadsheet_id = _os.getenv("GOOGLE_SPREADSHEET_ID")
    cell_range = "A1:H1000"
    with _gd.build("sheets", "v4", credentials=credentials) as service:
        pints_input_data_rows = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=cell_range)
            .execute()
        )["values"]

    input_pints_df = _pd.DataFrame(
        columns=pints_input_data_rows[0], data=pints_input_data_rows[1:]
    )

    if write_to_file:
        # TODO Write to a CSV file
        pass

    return input_pints_df
