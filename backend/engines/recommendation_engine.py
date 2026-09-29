def calculate_recommendation(
    vessel_score,
    risk,
    idle_hours,
    freight_trend
):

    score = vessel_score

    if freight_trend == "Favourable":
        score += 3
    elif freight_trend == "Rising":
        score -= 3

    if risk == "Low":
        score += 3
    elif risk == "High":
        score -= 6
    else:
        score -= 2

    if idle_hours <= 8:
        score += 2
    elif idle_hours >= 20:
        score -= 4

    score = max(0, min(100, score))

    return {
        "recommendation_score": score
    }