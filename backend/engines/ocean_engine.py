def scan_ocean(
    destination,
    congestion,
    freight_trend
):
    congestion = str(congestion)
    freight_trend = str(freight_trend)

    if congestion.lower() == "high":
        congestion_score = 80
        congestion_status = "High congestion"
    elif congestion.lower() == "medium":
        congestion_score = 55
        congestion_status = "Moderate congestion"
    else:
        congestion_score = 25
        congestion_status = "Low congestion"

    if freight_trend.lower() == "rising":
        market_signal = "Upward freight pressure"
    elif freight_trend.lower() == "falling":
        market_signal = "Downward freight pressure"
    else:
        market_signal = "Stable freight signal"

    activity_score = round(
        (congestion_score + 50) / 2
    )

    return {
        "destination": destination,
        "congestion": congestion_status,
        "congestion_score": congestion_score,
        "market_signal": market_signal,
        "route_activity_score": activity_score,
        "status": "Representative route scan",
        "message": (
            "Ocean Scanner combines port congestion and "
            "freight-market signals for route awareness."
        )
    }