def check_port(port, vessel):

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

    return {
        "compatible": True,
        "reason": "Port constraints are satisfied.",
        "congestion": port.get("congestion_level", "Unknown")
    }