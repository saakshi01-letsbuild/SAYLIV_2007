from datetime import datetime, timedelta
from pathlib import Path
import csv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml.freight_forecast import forecast_freight

from engines.vessel_engine import rank_vessels, check_vessel
from engines.pooling_engine import calculate_pooling
from engines.port_engine import check_port
from engines.risk_engine import calculate_risk
from engines.idle_engine import estimate_idle
from engines.recommendation_engine import calculate_recommendation

from engines.carbon_engine import calculate_carbon
from engines.intermodal_engine import calculate_intermodal
from engines.whatif_engine import calculate_whatif
from engines.ocean_engine import scan_ocean
from engines.planner_engine import build_planner
from engines.weather_engine import get_weather


# ---------------------------------------------------------
# APP
# ---------------------------------------------------------

app = FastAPI(
    title="SAYLIV API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class AnalysisRequest(BaseModel):
    commodity: str
    cargo: float
    origin: str
    loadingPort: str
    destination: str
    arrivalDate: str
    vessel: str
    contract: str


# ---------------------------------------------------------
# DATA LOADING
# ---------------------------------------------------------

def load_csv(filename):
    path = DATA_DIR / filename

    if not path.exists():
        return []

    with open(
        path,
        newline="",
        encoding="utf-8"
    ) as file:
        return list(csv.DictReader(file))


vessels = load_csv("vessels.csv")
ports = load_csv("ports.csv")
freight_data = load_csv("freight.csv")


def number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


# ---------------------------------------------------------
# ROUTE MATCHING
# ---------------------------------------------------------

COUNTRY_ROUTE_PREFIX = {
    "australia": "AUS",
    "indonesia": "IDN",
    "south africa": "ZAF",
}


def find_route_rates(
    origin_country,
    loading_port,
    destination
):
    def destination_match(row):
        return (
            row.get("destination", "").lower()
            == destination.lower()
        )

    # 1. Exact loading-port match
    exact = [
        row
        for row in freight_data
        if destination_match(row)
        and (
            loading_port.lower()
            in row.get("origin", "").lower()
            or
            row.get("origin", "").lower()
            in loading_port.lower()
        )
    ]

    if exact:
        return exact, "route-specific"

    # 2. Same origin country
    prefix = COUNTRY_ROUTE_PREFIX.get(
        origin_country.strip().lower()
    )

    if prefix:
        country_rows = [
            row
            for row in freight_data
            if destination_match(row)
            and row.get(
                "route",
                ""
            ).upper().startswith(prefix)
        ]

        if country_rows:
            return country_rows, "country-average"

    # 3. Same destination
    destination_rows = [
        row
        for row in freight_data
        if destination_match(row)
    ]

    if destination_rows:
        return destination_rows, "destination-average"

    # 4. Overall market
    return freight_data, "market-average"


FORECAST_NOTES = {
    "route-specific":
        "Based on historical observations matching the selected route.",

    "country-average":
        "No exact loading-port history was found; the model used observations from the same origin country.",

    "destination-average":
        "No route-specific history was found; the model used broader observations into the selected destination.",

    "market-average":
        "No matching destination history was found; the model used the available market observations."
}


# ---------------------------------------------------------
# ENTRY WINDOW
# ---------------------------------------------------------

def calculate_entry_window(arrival_date):

    try:
        date = datetime.strptime(
            arrival_date,
            "%Y-%m-%d"
        )
    except ValueError:
        return "Not available"

    start = date - timedelta(days=5)

    if start.month == date.month:
        return (
            f"{start.day}–{date.day} "
            f"{date.strftime('%b')}"
        )

    return (
        f"{start.day} {start.strftime('%b')} – "
        f"{date.day} {date.strftime('%b')}"
    )


# ---------------------------------------------------------
# REPRESENTATIVE INTELLIGENCE
# ---------------------------------------------------------

def intelligence_layers(
    cargo,
    congestion,
    arrival_date
):

    try:
        month = datetime.strptime(
            arrival_date,
            "%Y-%m-%d"
        ).month

    except ValueError:
        month = None

    if month in [6, 7, 8, 9]:
        weather = (
            "Monsoon season – representative elevated condition"
        )
    else:
        weather = (
            "Fair-season indicator – representative"
        )

    if congestion == "High":
        ocean = "Elevated route activity"
    else:
        ocean = "Normal route activity"

    carbon = round(
        cargo * 0.012,
        2
    )

    return {
        "pooling":
            "Compatible cargo matching available for simulation",

        "carbon":
            carbon,

        "intermodal":
            "Rail / Road comparison available",

        "ocean":
            ocean,

        "planner":
            "Cargo → Charter → Loading → Voyage → Discharge",

        "weather":
            weather
    }


# ---------------------------------------------------------
# RISK BREAKDOWN
# ---------------------------------------------------------

def build_risk_breakdown(
    freight_trend,
    congestion,
    idle_hours,
    vessel_available
):

    if freight_trend == "Rising":
        market = "Medium"

    elif freight_trend == "Favourable":
        market = "Low"

    else:
        market = "Low"

    if idle_hours >= 20:
        delay = "High"

    elif idle_hours >= 14:
        delay = "Medium"

    else:
        delay = "Low"

    availability = (
        "Low"
        if vessel_available
        else "High"
    )

    return {
        "market_volatility":
            market,

        "port_congestion":
            congestion,

        "delay_exposure":
            delay,

        "vessel_availability":
            availability
    }


# ---------------------------------------------------------
# MAIN ANALYSIS ENGINE
# ---------------------------------------------------------

def run_analysis(data: AnalysisRequest):

    # ---------------------------------------------
    # 1. Destination port
    # ---------------------------------------------

    selected_port = None

    for port in ports:

        if (
            port.get("port", "").lower()
            == data.destination.lower()
        ):
            selected_port = port
            break

    if selected_port is None and ports:
        selected_port = ports[0]

    if selected_port is None:
        return {
            "error": "No port data available."
        }

    selected_port = {
        "port":
            selected_port["port"],

        "max_loa_m":
            number(
                selected_port["max_loa_m"]
            ),

        "max_beam_m":
            number(
                selected_port["max_beam_m"]
            ),

        "max_draft_m":
            number(
                selected_port["max_draft_m"]
            ),

        "congestion_level":
            selected_port.get(
                "congestion_level",
                "Unknown"
            )
    }

    # ---------------------------------------------
    # 2. Vessel data
    # ---------------------------------------------

    vessel_list = []

    for vessel in vessels:

        vessel_list.append({
            "vessel_type":
                vessel["vessel_type"],

            "capacity_mt":
                number(
                    vessel["capacity_mt"]
                ),

            "loa_m":
                number(
                    vessel["loa_m"]
                ),

            "beam_m":
                number(
                    vessel["beam_m"]
                ),

            "draft_m":
                number(
                    vessel["draft_m"]
                )
        })

    # ---------------------------------------------
    # 3. Freight forecasting
    # ---------------------------------------------

    matched_rows, match_tier = find_route_rates(
        data.origin,
        data.loadingPort,
        data.destination
    )

    matched_rows = sorted(
        matched_rows,
        key=lambda row: row.get(
            "date",
            ""
        )
    )

    rates = []

    for row in matched_rows:

        try:
            rates.append(
                float(
                    row["freight_rate"]
                )
            )

        except (
            ValueError,
            KeyError
        ):
            pass

    forecast = forecast_freight(
        rates
    )

    forecast["message"] = (
        FORECAST_NOTES.get(
            match_tier,
            "Representative historical data."
        )
    )

    forecast["match_tier"] = match_tier

    # ---------------------------------------------
    # 4. Vessel ranking
    # ---------------------------------------------

    ranked_vessels = rank_vessels(
        vessel_list,
        data.cargo,
        selected_port
    )

    # ---------------------------------------------
    # 5. Recommended vessel
    # ---------------------------------------------

    recommended_vessel = None
    vessel_score = 0

    if data.vessel != "Any":

        for vessel in vessel_list:

            if (
                vessel["vessel_type"]
                != data.vessel
            ):
                continue

            result = check_vessel(
                vessel,
                data.cargo,
                selected_port
            )

            if result["compatible"]:

                recommended_vessel = (
                    vessel["vessel_type"]
                )

                vessel_score = (
                    result["utilization"]
                )

            break

    else:

        if ranked_vessels:

            best = ranked_vessels[0]

            recommended_vessel = (
                best["vessel_type"]
            )

            vessel_score = (
                best["score"]
            )

    if recommended_vessel is None:

        recommended_vessel = (
            "No compatible vessel"
        )

    # ---------------------------------------------
    # 6. Port compatibility
    # ---------------------------------------------

    port_compatible = False

    port_checks = {
        "draft": False,
        "loa": False,
        "beam": False
    }

    selected_vessel_data = None

    for vessel in vessel_list:

        if (
            vessel["vessel_type"]
            == recommended_vessel
        ):

            selected_vessel_data = vessel

            result = check_port(
                selected_port,
                vessel
            )

            port_compatible = (
                result["compatible"]
            )

            port_checks = {
                "draft":
                    vessel["draft_m"]
                    <= selected_port[
                        "max_draft_m"
                    ],

                "loa":
                    vessel["loa_m"]
                    <= selected_port[
                        "max_loa_m"
                    ],

                "beam":
                    vessel["beam_m"]
                    <= selected_port[
                        "max_beam_m"
                    ]
            }

            break

    # ---------------------------------------------
    # 7. Risk
    # ---------------------------------------------

    risk_result = calculate_risk(
        forecast["trend"],
        selected_port[
            "congestion_level"
        ],
        vessel_available=(
            recommended_vessel
            != "No compatible vessel"
        )
    )

    # ---------------------------------------------
    # 8. Idle
    # ---------------------------------------------

    idle_result = estimate_idle(
        selected_port[
            "congestion_level"
        ],
        port_compatible
    )

    # ---------------------------------------------
    # 9. Recommendation
    # ---------------------------------------------

    recommendation = calculate_recommendation(
        vessel_score,
        risk_result["risk"],
        idle_result[
            "expected_idle_hours"
        ],
        forecast["trend"]
    )

    recommendation_score = (
        recommendation[
            "recommendation_score"
        ]
    )

    # ---------------------------------------------
    # 10. Freight pooling
    # ---------------------------------------------

    pooling = calculate_pooling(
        cargo_1=data.cargo,
        cargo_2=20000,
        vessel_capacity=82500
    )

    # ---------------------------------------------
    # 11. Carbon planning
    # ---------------------------------------------

    carbon = calculate_carbon(
        cargo=data.cargo,
        origin=data.origin,
        loading_port=data.loadingPort,
        destination=data.destination,
        vessel=recommended_vessel
    )

    # ---------------------------------------------
    # 12. Intermodal optimization
    # ---------------------------------------------

    intermodal = calculate_intermodal(
        cargo=data.cargo,
        origin=data.origin,
        destination=data.destination
    )

    # ---------------------------------------------
    # 13. Ocean Scanner
    # ---------------------------------------------

    ocean = scan_ocean(
        destination=data.destination,
        congestion=selected_port[
            "congestion_level"
        ],
        freight_trend=forecast["trend"]
    )

    # ---------------------------------------------
    # 14. Planner
    # ---------------------------------------------

    planner = build_planner(
        origin=data.origin,
        loading_port=data.loadingPort,
        destination=data.destination,
        arrival_date=data.arrivalDate,
        vessel=recommended_vessel,
        contract=data.contract
    )

    # ---------------------------------------------
    # 15. Weather
    # ---------------------------------------------

    weather = get_weather(
        arrival_date=data.arrivalDate,
        destination=data.destination
    )

    # ---------------------------------------------
    # 16. What-if simulator
    # ---------------------------------------------

    whatif = calculate_whatif(
        current_cargo=data.cargo,
        new_cargo=round(
            data.cargo * 1.2
        ),
        vessel_capacity=82500,
        freight_rate=forecast[
            "forecast_rate"
        ],
        risk=risk_result["risk"],
        idle_hours=idle_result[
            "expected_idle_hours"
        ]
    )

    # ---------------------------------------------
    # 17. Risk breakdown
    # ---------------------------------------------

    risk_breakdown = build_risk_breakdown(
        forecast["trend"],
        selected_port[
            "congestion_level"
        ],
        idle_result[
            "expected_idle_hours"
        ],
        recommended_vessel
        != "No compatible vessel"
    )

    # ---------------------------------------------
    # 18. Recommendation text
    # ---------------------------------------------

    if (
        recommended_vessel
        == "No compatible vessel"
    ):

        recommendation_text = (
            "No feasible vessel was found "
            "for the selected cargo and "
            "port constraints."
        )

    else:

        recommendation_text = (
            f"{recommended_vessel} is recommended "
            f"with {round(vessel_score)}% cargo "
            f"utilization, "
            f"{risk_result['risk'].lower()} "
            f"operational risk and approximately "
            f"{idle_result['expected_idle_hours']} "
            f"hours of estimated waiting."
        )

    # ---------------------------------------------
    # 19. Intelligence layers
    # ---------------------------------------------

    intelligence = intelligence_layers(
        data.cargo,
        selected_port[
            "congestion_level"
        ],
        data.arrivalDate
    )

    # ---------------------------------------------
    # 20. Contract strategy
    # ---------------------------------------------

    if data.contract == "Short-term":

        contract_strategy = (
            "Short-term / multiple-voyage planning view"
        )

    elif data.contract == "Medium-term":

        contract_strategy = (
            "Medium-term / multiple-voyage planning view"
        )

    else:

        contract_strategy = (
            "Spot charter comparison"
        )

    # ---------------------------------------------
    # 21. FINAL RESPONSE
    # ---------------------------------------------

    return {

        "status":
            "success",

        "commodity":
            data.commodity,

        "cargo":
            data.cargo,

        "origin":
            data.origin,

        "loading_port":
            data.loadingPort,

        "destination":
            selected_port["port"],

        "arrival_date":
            data.arrivalDate,

        "contract":
            data.contract,

        "freight_trend":
            forecast["trend"],

        "forecast_rate":
            forecast["forecast_rate"],

        "forecast_message":
            forecast["message"],

        "forecast_match":
            forecast["match_tier"],

        "forecast_model":
            forecast.get(
                "model",
                "Historical forecast"
            ),

        "forecast_confidence":
            forecast.get(
                "confidence",
                0
            ),

        "training_points":
            forecast.get(
                "training_points",
                len(rates)
            ),

        "entry_window":
            calculate_entry_window(
                data.arrivalDate
            ),

        "recommended_vessel":
            recommended_vessel,

        "vessel_score":
            round(
                vessel_score
            ),

        "recommendation_score":
            recommendation_score,

        "recommendation_text":
            recommendation_text,

        "port_status":
            (
                "Compatible"
                if port_compatible
                else "Not Compatible"
            ),

        "port_checks":
            port_checks,

        "risk":
            risk_result["risk"],

        "risk_points":
            risk_result["risk_points"],

        "risk_breakdown":
            risk_breakdown,

        "expected_idle":
            idle_result[
                "expected_idle_hours"
            ],

        "congestion":
            selected_port[
                "congestion_level"
            ],

        "alternatives":
            ranked_vessels[:4],

        "pooling":
            pooling,

        "carbon":
            carbon,

        "intermodal":
            intermodal,

        "whatif":
            whatif,

        "ocean":
            ocean,

        "planner":
            planner,

        "weather":
            weather,

        "intelligence":
            intelligence,

        "contract_strategy":
            contract_strategy
    }


# ---------------------------------------------------------
# API
# ---------------------------------------------------------

@app.get("/")
def home():

    return {
        "status":
            "SAYLIV API is running",

        "version":
            "1.0"
    }


@app.get("/health")
def health():

    return {
        "status":
            "healthy"
    }


@app.post("/analyze")
def analyze(
    data: AnalysisRequest
):

    return run_analysis(
        data
    )


@app.post("/whatif")
def whatif(
    data: AnalysisRequest
):

    return run_analysis(
        data
    )