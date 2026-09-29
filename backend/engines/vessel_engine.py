def check_vessel(vessel, cargo, port):

    if vessel["capacity_mt"] < cargo:
        return {
            "compatible": False,
            "reason": "Vessel capacity is insufficient."
        }

    if vessel["draft_m"] > port["max_draft_m"]:
        return {
            "compatible": False,
            "reason": "Vessel draft exceeds port limit."
        }

    if vessel["loa_m"] > port["max_loa_m"]:
        return {
            "compatible": False,
            "reason": "Vessel LOA exceeds port limit."
        }

    if vessel["beam_m"] > port["max_beam_m"]:
        return {
            "compatible": False,
            "reason": "Vessel beam exceeds port limit."
        }

    utilization = round((cargo / vessel["capacity_mt"]) * 100)

    return {
        "compatible": True,
        "reason": "Vessel is compatible with the selected cargo and port.",
        "utilization": utilization
    }


def rank_vessels(vessels, cargo, port):

    results = []

    for vessel in vessels:

        result = check_vessel(vessel, cargo, port)

        if result["compatible"]:

            score = result["utilization"]

            results.append({
                "vessel_type": vessel["vessel_type"],
                "score": score,
                "utilization": result["utilization"],
                "compatible": True
            })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results