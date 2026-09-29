def calculate_risk(freight_trend, congestion, vessel_available=True):

    risk_points = 0

    if freight_trend == "Rising":
        risk_points += 2
    elif freight_trend == "Stable":
        risk_points += 1

    if congestion == "High":
        risk_points += 2
    elif congestion == "Medium":
        risk_points += 1

    if not vessel_available:
        risk_points += 2

    if risk_points >= 4:
        level = "High"
    elif risk_points >= 2:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk": level,
        "risk_points": risk_points
    }