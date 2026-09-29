def calculate_whatif(
    current_cargo,
    new_cargo,
    vessel_capacity,
    freight_rate,
    risk,
    idle_hours
):
    current_cargo = float(current_cargo)
    new_cargo = float(new_cargo)
    vessel_capacity = float(vessel_capacity)

    if vessel_capacity <= 0:
        vessel_capacity = 1

    current_utilization = round(
        (current_cargo / vessel_capacity) * 100
    )

    new_utilization = round(
        (new_cargo / vessel_capacity) * 100
    )

    if new_utilization > 100:
        feasibility = "Not feasible"
        message = (
            "The simulated cargo exceeds the selected "
            "vessel capacity."
        )
    elif new_utilization >= 85:
        feasibility = "High utilization"
        message = (
            "The simulated cargo improves vessel utilization "
            "but leaves limited capacity buffer."
        )
    elif new_utilization >= 60:
        feasibility = "Feasible"
        message = (
            "The simulated cargo remains within a practical "
            "vessel utilization range."
        )
    else:
        feasibility = "Low utilization"
        message = (
            "The simulated cargo is feasible but leaves "
            "significant unused vessel capacity."
        )

    return {
        "current_cargo": current_cargo,
        "new_cargo": new_cargo,
        "vessel_capacity": vessel_capacity,
        "current_utilization": current_utilization,
        "new_utilization": new_utilization,
        "freight_rate": freight_rate,
        "risk": risk,
        "idle_hours": idle_hours,
        "feasibility": feasibility,
        "message": message
    }