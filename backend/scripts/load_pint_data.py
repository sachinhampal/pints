import datetime as dt
import numpy as np
import pandas as pd
import pints_input_data_clean_up as _pcu
import requests as req


def main():
    """
    Load raw pint data from a CSV and populate the test database via a REST API service.
    """
    url = "http://127.0.0.1:8000/api/records/"
    df = pd.read_csv("../../Pints_raw_data_2.csv")
    df = _pcu.clean_up_input_pints_data(df)
    df = df.replace({np.nan: None})

    for _, row in df.iterrows():
        date = dt.datetime.strptime(row["Date"], "%d/%m/%Y").date()
        payload = {
            "comment": row["Comments"],
            "date": str(date),
            "location": row["Location"],
            "number": row["Number"],
            "pint_brand": row["Pint"],
            "pint_cost": _get_cost_float(row["Cost (per pint)"]),
            "total_cost": _get_cost_float(row["Spend"]),
            "friend_names": (
                row["Company"].split(", ") if row["Company"] is not None else []
            ),
        }
        print(f"Sending request: {payload}")
        _ = req.post(url, json=payload)


def _get_cost_float(cost_str: str) -> float:
    return float(cost_str[1:])


if __name__ == "__main__":
    main()
