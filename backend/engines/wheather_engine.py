from datetime import datetime


def get_weather(
    arrival_date,
    destination
):
    try:
        date = datetime.strptime(
            arrival_date,
            "%Y-%m-%d"
        )
        month = date.month
    except ValueError:
        month = None

    if month in [6, 7, 8, 9]:
        condition = "Monsoon-sensitive period"
        level = "Elevated"
        message = (
            "Representative seasonal condition. "
            "Weather monitoring is recommended."
        )

    elif month in [10, 11]:
        condition = "Post-monsoon transition"
        level = "Moderate"
        message = (
            "Representative seasonal condition for planning."
        )

    elif month in [12, 1, 2]:
        condition = "Winter operating period"
        level = "Normal"
        message = (
            "Representative seasonal condition for planning."
        )

    else:
        condition = "Pre-monsoon / transition period"
        level = "Moderate"
        message = (
            "Representative seasonal condition for planning."
        )

    return {
        "destination": destination,
        "arrival_date": arrival_date,
        "condition": condition,
        "level": level,
        "message": message,
        "status": "Seasonal prototype indicator",
        "note": (
            "Not a live weather feed. Production version "
            "should connect to an authorized weather API."
        )
    }