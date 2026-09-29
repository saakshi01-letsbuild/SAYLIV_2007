def estimate_idle(congestion, port_compatible=True):

    if not port_compatible:
        idle_hours = 24
    elif congestion == "High":
        idle_hours = 24
    elif congestion == "Medium":
        idle_hours = 14
    else:
        idle_hours = 8

    return {
        "expected_idle_hours": idle_hours
    }