import copy as _cpy
import numpy as _np
import pandas as _pd
import shapely as _sh
import os as _os
import requests as _req
import typing as _t

#
# TODO: Currently GEO information isn't persisted in the JSON, we would need to add that
#


def get_geo_pints_info(
    geo_coordinates: _t.Iterable[_t.Tuple[float, float]], geo_dict: _t.Dict[str, _t.Any]
):
    """
    Compute a GEO dictionary with pints information added.
    NOTE: We take a deep copy of the data as we intend to add an extra "pints_info" to the "properties" section of the GEO dictionary.

    :param geo_coordinates: GEO coordinates.
    :param geo_location_names: GEO location names.
    """
    geo_dict = _cpy.deepcopy(geo_dict)
    pints_info_dict = {}

    # "pub_count"
    pub_points = _sh.points(_np.array(geo_coordinates))
    coordinates_list = geo_dict["geometry"]["coordinates"][0]
    polygon = _sh.Polygon(coordinates_list)
    pints_info_dict["pub_count"] = int(polygon.contains(pub_points).sum())

    geo_dict["properties"]["pints_info"] = pints_info_dict

    return geo_dict


def _get_location_name_2_geo_coorindates(
    input_pints_df: _pd.DataFrame,
) -> _t.Dict[str, _t.Tuple]:
    """
    Compute the coordinates of locations that are defined in the input data.
    NOTE: We make multiple calls to a Google REST API in this function, but we are limited daily to the number of requests we can make.
          As a result we should try to avoid making uneccessary calls, and therefore we check if we have seen the pub before

    :param input_pints_df: Input pints data frame.
    :return: Mapping of location name to their respective longitude and lattidute geo coordinates.
    """
    api_key = _os.getenv("GOOGLE_MAPS_API_KEY")
    url = "https://maps.googleapis.com/maps/api/geocode/json"

    input_location_set = set(input_pints_df["Location"])

    location_name_2_geo_coordinates = {}
    for location_str in input_location_set:
        # If we have already encountered this location, simply add the visit count by one
        if location_str in location_name_2_geo_coordinates:
            continue

        params = {
            "address": location_str,
            "key": api_key,
        }
        response = _req.get(url, params=params)
        data = response.json()
        if data["status"] == "OK":
            geo_location = data["results"][0]["geometry"]["location"]
            coordinates = (geo_location["lng"], geo_location["lat"])
            location_name_2_geo_coordinates[location_str] = coordinates
        else:
            location_name_2_geo_coordinates[location_str] = None

    return location_name_2_geo_coordinates


_LOCATION_FILE_NAMES = (
    "camden",
    "city-of-london",
    "city-of-westminster",
    "greenwich",
    "hackney",
    "hammersmith-and-fulham",
    "islington",
    "kensington-and-chelsea",
    "lambeth",
    "lewisham",
    "southwark",
    "tower-hamlets",
    "wandsworth",
)
