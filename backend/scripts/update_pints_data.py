import json as _json
import clean_up_input_data as _cpd
import pints_data as _pi
import pandas as _pd
import pathlib as _pth


def update_pints_data(output_file_name) -> None:
    raw_data_file_path = _pth.Path("./Pints_raw_data.csv")

    # TODO Change from (incorrectly) directly writing to the "ui" package and use a symlink instead
    output_file_path = _pth.Path(f"./ui/data/{output_file_name}.json")

    # Load and clean the data
    input_pints_df = _pd.read_csv(raw_data_file_path)
    input_pints_df = _cpd.clean_up_input_pints_data(input_pints_df)

    # Create pint-related data used for generating leaderboards and tracking pints
    pints_info = _pi.compute_pints_data(input_pints_df)

    # Write the data to the output file path and chosen file name
    with open(output_file_path, mode="w", encoding="utf-8") as file:
        _json.dump(pints_info, file)

if __name__ == "__main__":
    output_file_name = "pints_info"
    update_pints_data(output_file_name)
