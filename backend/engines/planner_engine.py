def build_planner(
    origin,
    loading_port,
    destination,
    arrival_date,
    vessel,
    contract
):
    if contract == "Short-term":
        strategy = "Multiple-voyage short-term planning"
    elif contract == "Medium-term":
        strategy = "Medium-term charter planning"
    else:
        strategy = "Spot charter comparison"

    steps = [
        {
            "step": 1,
            "stage": "Cargo",
            "description": "Validate cargo quantity and commodity."
        },
        {
            "step": 2,
            "stage": "Market",
            "description": "Review freight forecast and entry window."
        },
        {
            "step": 3,
            "stage": "Charter",
            "description": f"Evaluate {vessel} vessel suitability."
        },
        {
            "step": 4,
            "stage": "Loading",
            "description": f"Plan loading through {loading_port}."
        },
        {
            "step": 5,
            "stage": "Voyage",
            "description": f"Monitor route towards {destination}."
        },
        {
            "step": 6,
            "stage": "Arrival",
            "description": f"Target arrival: {arrival_date}."
        }
    ]

    return {
        "origin": origin,
        "loading_port": loading_port,
        "destination": destination,
        "arrival_date": arrival_date,
        "vessel": vessel,
        "contract": contract,
        "strategy": strategy,
        "steps": steps,
        "status": "Planning sequence generated"
    }