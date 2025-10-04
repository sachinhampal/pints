import json as _json
import pints_input_data_clean_up as _idc
import pints_input_data_service as _ids
import pints_data as _pi
import pathlib as _pth


def update_pints_data(output_file_name: str) -> None:
    # TODO Change from (incorrectly) directly writing to the "ui" package and use a symlink instead
    output_file_path = _pth.Path(f"./ui/data/{output_file_name}.json")
    with open(output_file_path, mode="r", encoding="utf-8") as file:
        existing_pints_info = _json.load(file)

    # Cache already visited locations from the existing information to avoid unnecessary extra calls to the Google Maps API
    visited_locations_2_coordinates = {
        k: v["coordinates"] for k, v in existing_pints_info["location_info"].items()
    }

    # Load and clean the data
    input_pints_df = _ids.get_pints_input_data()
    input_pints_df = _idc.clean_up_input_pints_data(input_pints_df)

    # Create updated pints information and write to output file
    pints_info = _pi.compute_pints_data(
        input_pints_df, visited_locations_2_coordinates=visited_locations_2_coordinates
    )
    with open(output_file_path, mode="w", encoding="utf-8") as file:
        _json.dump(pints_info, file)


if __name__ == "__main__":
    output_file_name = "pints_info"
    update_pints_data(output_file_name)
