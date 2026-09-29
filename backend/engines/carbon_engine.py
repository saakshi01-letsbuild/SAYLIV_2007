def calculate_carbon(
    cargo,
    origin,
    loading_port,
    destination,
    vessel
):
    """
    Prototype carbon estimation layer.

    This is a representative estimate for the prototype,
    not an audited emissions calculation.
    """

    cargo = float(cargo)

    # Prototype baseline factor.
    # Final SIH version can replace this with validated
    # vessel fuel-consumption / distance data.
    baseline_factor = 0.012

    estimated_emissions = round(
        cargo * baseline_factor,
        2
    )

    if vessel in ["Capesize", "Panamax"]:
        efficiency_note = (
            "Higher-capacity vessel selected; utilization "
            "should be monitored to avoid carrying excess capacity."
        )
    elif vessel == "Supramax":
        efficiency_note = (
            "Balanced capacity option for the selected cargo."
        )
    elif vessel == "Handysize":
        efficiency_note = (
            "Smaller vessel option; utilization should be checked."
        )
    else:
        efficiency_note = (
            "Vessel-specific carbon optimization will be refined "
            "when validated operational data is available."
        )

    return {
        "estimated_emissions_tco2": estimated_emissions,
        "baseline_factor": baseline_factor,
        "origin": origin,
        "loading_port": loading_port,
        "destination": destination,
        "vessel": vessel,
        "efficiency_note": efficiency_note,
        "status": "Prototype estimate",
        "note": (
            "Representative estimate for decision support; "
            "replace with validated emission factors for production use."
        )
    }