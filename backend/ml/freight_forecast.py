import numpy as np
from sklearn.ensemble import RandomForestRegressor


def _build_training_data(rates):
    """
    Convert historical freight rates into lag-based
    training samples for the forecasting model.
    """

    values = np.array(
        [float(rate) for rate in rates],
        dtype=float
    )

    if len(values) < 6:
        return None, None

    X = []
    y = []

    # Use previous 5 observations to predict the next one.
    for i in range(5, len(values)):
        X.append(values[i - 5:i])
        y.append(values[i])

    return np.array(X), np.array(y)


def _trend_from_rates(rates):
    if len(rates) < 3:
        return "Stable"

    recent = np.mean(rates[-3:])
    previous = np.mean(rates[-6:-3]) if len(rates) >= 6 else np.mean(rates[:-3])

    if previous == 0:
        return "Stable"

    change = ((recent - previous) / previous) * 100

    if change >= 5:
        return "Rising"

    if change <= -5:
        return "Falling"

    return "Stable"


def forecast_freight(rates):
    """
    ML-based freight forecasting.

    Input:
        Historical freight rates.

    Output:
        Forecast rate + market trend + model information.
    """

    clean_rates = []

    for rate in rates:
        try:
            value = float(rate)

            if value > 0:
                clean_rates.append(value)

        except (TypeError, ValueError):
            continue

    if not clean_rates:
        return {
            "forecast_rate": 0,
            "trend": "Stable",
            "model": "Random Forest",
            "training_points": 0,
            "confidence": 0,
            "message": "No historical freight data available."
        }

    X, y = _build_training_data(clean_rates)

    # Not enough observations for proper ML training.
    if X is None:
        average_rate = round(
            float(np.mean(clean_rates)),
            2
        )

        return {
            "forecast_rate": average_rate,
            "trend": _trend_from_rates(clean_rates),
            "model": "Historical fallback",
            "training_points": len(clean_rates),
            "confidence": 45,
            "message": (
                "Limited historical observations; "
                "forecast uses the available market history."
            )
        }

    # Random Forest regression model.
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=6,
        random_state=42
    )

    model.fit(X, y)

    latest_window = np.array(
        clean_rates[-5:]
    ).reshape(1, -1)

    prediction = model.predict(
        latest_window
    )[0]

    # Keep prediction within a sensible historical range.
    minimum = min(clean_rates) * 0.85
    maximum = max(clean_rates) * 1.15

    prediction = max(
        minimum,
        min(prediction, maximum)
    )

    prediction = round(
        float(prediction),
        2
    )

    trend = _trend_from_rates(
        clean_rates
    )

    # Simple prototype confidence indicator.
    volatility = np.std(clean_rates)

    mean_rate = np.mean(clean_rates)

    if mean_rate == 0:
        confidence = 50
    else:
        coefficient = volatility / mean_rate

        confidence = round(
            max(
                40,
                min(
                    90,
                    90 - coefficient * 100
                )
            )
        )

    return {
        "forecast_rate": prediction,
        "trend": trend,
        "model": "Random Forest Regression",
        "training_points": len(clean_rates),
        "confidence": confidence,
        "message": (
            "Forecast generated using historical freight "
            "rate patterns and lag-based ML features."
        )
    }