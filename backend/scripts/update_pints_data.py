import json as _json
import pints_input_data_clean_up as _idc
import pints_input_data_service as _ids
import pints_data as _pi
import pathlib as _pth


def update_pints_data(output_file_name: str) -> None:
    # TODO Change from (incorrectly) directly writing to the "ui" package and use a symlink instead
    output_file_path = _pth.Path(f"./ui/data/{output_file_name}.json")

    # Load and clean the data
    input_pints_df = _ids.get_pints_input_data()
    input_pints_df = _idc.clean_up_input_pints_data(input_pints_df)

    # Create pint-related data used for generating leaderboards and tracking pints
    pints_info = _pi.compute_pints_data(input_pints_df)

    # Write the data to the output file path and chosen file name
    with open(output_file_path, mode="w", encoding="utf-8") as file:
        _json.dump(pints_info, file)


if __name__ == "__main__":
    output_file_name = "pints_info"
    update_pints_data(output_file_name)
