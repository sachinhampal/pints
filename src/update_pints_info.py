import json as _json
import pandas as _pd
import lib.pints_info as _pi
import typing as _t


def main(output_file_name) -> None:
    raw_data_file_path = "../Pints_raw_data.csv"
    output_file_path = f"../ui/data/{output_file_name}.json"

    # Load and (slightly) clean the data
    input_pints_df = _pd.read_csv(raw_data_file_path)
    input_pints_df = input_pints_df.loc[input_pints_df["Date"].notnull()]

    # Create pint-related data used for generating leaderboards and tracking pints
    pints_info: _t.Dict[str, _t.Any] = _pi.compute_pints_info(input_pints_df)

    # Write the data to the output file path and chosen file name
    with open(output_file_path, mode="w", encoding="utf-8") as file:
        _json.dump(pints_info, file)


_RAW_DATA_FILE_PATH = "../Pints_raw_data.csv"

if __name__ == "__main__":
    output_file_name = "pints_info"
    main(output_file_name)
