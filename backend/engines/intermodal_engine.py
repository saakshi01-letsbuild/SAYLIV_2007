def calculate_intermodal(
    cargo,
    origin,
    destination
):
    """
    Prototype comparison of inland transport modes.
    Values are planning indices, not live quotations.
    """

    cargo = float(cargo)

    road_factor = 1.00
    rail_factor = 0.72

    road_index = round(
        cargo * road_factor / 1000,
        2
    )

    rail_index = round(
        cargo * rail_factor / 1000,
        2
    )

    if rail_index < road_index:
        recommended_mode = "Rail"
        reason = (
            "Rail shows a lower prototype planning index "
            "for the selected cargo volume."
        )
    else:
        recommended_mode = "Road"
        reason = (
            "Road shows a lower prototype planning index "
            "for the selected cargo volume."
        )

    return {
        "origin": origin,
        "destination": destination,
        "cargo_mt": cargo,
        "road_index": road_index,
        "rail_index": rail_index,
        "recommended_mode": recommended_mode,
        "reason": reason,
        "status": "Prototype comparison",
        "note": (
            "Final planning should use live route distance, "
            "availability, cost and infrastructure data."
        )
    }