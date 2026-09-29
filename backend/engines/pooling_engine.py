def calculate_pooling(cargo_1, cargo_2, vessel_capacity):
    combined_cargo = cargo_1 + cargo_2

    if combined_cargo <= vessel_capacity:
        utilization = round((combined_cargo / vessel_capacity) * 100)

        return {
            "pooling_possible": True,
            "cargo_1": cargo_1,
            "cargo_2": cargo_2,
            "combined_cargo": combined_cargo,
            "vessel_capacity": vessel_capacity,
            "utilization": utilization,
            "message": "Pooling opportunity identified. Combined cargo can be handled by the selected vessel."
        }

    return {
        "pooling_possible": False,
        "cargo_1": cargo_1,
        "cargo_2": cargo_2,
        "combined_cargo": combined_cargo,
        "vessel_capacity": vessel_capacity,
        "utilization": 0,
        "message": "Pooling is not feasible for the selected vessel capacity."
    }