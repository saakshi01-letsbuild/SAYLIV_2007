// ============================================================
// SAYLIV - DECISION REPORT
// ============================================================

const input = JSON.parse(
    localStorage.getItem("saylivInput") || "{}"
);

const result = JSON.parse(
    localStorage.getItem("saylivResult") || "{}"
);


// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------

function valueOrDash(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "--";
    }

    return value;
}


function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = valueOrDash(value);
    }
}


function formatNumber(value) {

    const number = Number(value);

    if (Number.isNaN(number)) {
        return valueOrDash(value);
    }

    return number.toLocaleString("en-IN");
}


// ------------------------------------------------------------
// Date
// ------------------------------------------------------------

const today = new Date();

setText(
    "reportDate",
    "Generated on " +
    today.toLocaleDateString("en-IN") +
    " • SAYLIV Decision Intelligence"
);


// ------------------------------------------------------------
// OBJECTIVE
// ------------------------------------------------------------

setText(
    "objectiveCommodity",
    input.commodity
);

setText(
    "objectiveCargo",
    input.cargo
        ? formatNumber(input.cargo) + " MT"
        : "--"
);

setText(
    "objectiveOrigin",
    input.origin
);

setText(
    "objectiveLoadingPort",
    input.loadingPort
);

setText(
    "objectiveDestination",
    input.destination
);

setText(
    "objectiveArrival",
    input.arrivalDate
);


// ------------------------------------------------------------
// FINAL RECOMMENDATION
// ------------------------------------------------------------

setText(
    "finalRecommendation",
    result.recommendation ||
    result.recommended_vessel ||
    "Recommendation unavailable"
);

setText(
    "finalRecommendationText",
    result.recommendation_text ||
    result.recommendationText ||
    "SAYLIV generated a decision based on the available analysis."
);

setText(
    "recommendationScore",
    result.recommendation_score !== undefined
        ? result.recommendation_score
        : "--"
);


// ------------------------------------------------------------
// DECISION SNAPSHOT
// ------------------------------------------------------------

setText(
    "snapshotFreight",
    result.freight_trend ||
    result.forecast_match ||
    "--"
);

setText(
    "snapshotEntry",
    result.entry_window ||
    "--"
);

setText(
    "snapshotVessel",
    result.recommended_vessel ||
    "--"
);

setText(
    "snapshotVesselScore",
    result.vessel_score !== undefined
        ? result.vessel_score
        : "--"
);

setText(
    "snapshotRisk",
    result.risk ||
    "--"
);

setText(
    "snapshotIdle",
    result.expected_idle !== undefined
        ? result.expected_idle + " hours"
        : "--"
);


// ------------------------------------------------------------
// FREIGHT FORECAST
// ------------------------------------------------------------

setText(
    "freightHeading",
    result.freight_trend
        ? "Freight Outlook: " + result.freight_trend
        : "Freight Forecast"
);

setText(
    "freightExplanation",
    result.forecast_message ||
    "SAYLIV evaluates historical freight patterns using the implemented forecasting model."
);

setText(
    "freightRate",
    result.forecast_rate !== undefined
        ? "$" + result.forecast_rate + " / MT"
        : "--"
);

setText(
    "freightTrend",
    result.freight_trend ||
    "--"
);

setText(
    "freightModel",
    result.forecast_model ||
    "Random Forest Regression"
);

setText(
    "freightConfidence",
    result.forecast_confidence !== undefined
        ? result.forecast_confidence + "%"
        : "--"
);

setText(
    "trainingPoints",
    result.training_points !== undefined
        ? result.training_points
        : "--"
);


// ------------------------------------------------------------
// VESSEL
// ------------------------------------------------------------

setText(
    "vesselHeading",
    result.recommended_vessel
        ? "Recommended Vessel: " +
          result.recommended_vessel
        : "Vessel Evaluation"
);

setText(
    "vesselExplanation",
    "The vessel recommendation is based on cargo suitability, vessel constraints, port compatibility and the overall decision logic."
);

setText(
    "vesselResult",
    result.recommended_vessel ||
    "--"
);

setText(
    "vesselScore",
    result.vessel_score !== undefined
        ? result.vessel_score
        : "--"
);

setText(
    "contractStrategy",
    result.contract_strategy ||
    input.contract ||
    "--"
);


// ------------------------------------------------------------
// PORT
// ------------------------------------------------------------

setText(
    "portHeading",
    "Destination Port: " +
    valueOrDash(input.destination)
);

setText(
    "portExplanation",
    "SAYLIV checks destination-port compatibility before finalizing the recommendation."
);

const portChecksElement =
    document.getElementById("portChecks");

if (portChecksElement) {

    const checks = result.port_checks;

    if (Array.isArray(checks)) {

        portChecksElement.innerHTML =
            "<ul>" +
            checks.map(function (item) {

                if (typeof item === "object") {

                    return `
                        <li>
                            <strong>${valueOrDash(item.name || item.factor)}</strong>
                            :
                            ${valueOrDash(item.status || item.result || item.message)}
                        </li>
                    `;
                }

                return `<li>${item}</li>`;

            }).join("") +
            "</ul>";

    } else {

        portChecksElement.textContent =
            valueOrDash(result.port_status);

    }
}


// ------------------------------------------------------------
// RISK
// ------------------------------------------------------------

setText(
    "riskResult",
    result.risk ||
    "--"
);

setText(
    "riskPoints",
    result.risk_points !== undefined
        ? result.risk_points
        : "--"
);

setText(
    "idleResult",
    result.expected_idle !== undefined
        ? result.expected_idle + " hours"
        : "--"
);

setText(
    "congestionResult",
    result.congestion ||
    "--"
);


// ------------------------------------------------------------
// OPTIMIZATION LAYERS
// ------------------------------------------------------------


// Freight Pooling

if (result.pooling) {

    if (result.pooling.pooling_possible) {

        setText(
            "poolingResult",
            "Possible • " +
            result.pooling.utilization +
            "% utilization"
        );

    } else {

        setText(
            "poolingResult",
            "Not feasible"
        );
    }
}


// Carbon

if (result.carbon) {

    setText(
        "carbonResult",
        result.carbon.estimated_emissions_tco2 !== undefined
            ? result.carbon.estimated_emissions_tco2 +
              " tCO₂ estimated"
            : "Prototype estimate"
    );
}


// Intermodal

if (result.intermodal) {

    setText(
        "intermodalResult",
        result.intermodal.recommended_mode
            ? result.intermodal.recommended_mode
            : "Prototype comparison"
    );
}


// Ocean Scanner

if (result.ocean) {

    setText(
        "oceanResult",
        result.ocean.market_signal ||
        result.ocean.congestion ||
        "Representative route scan"
    );
}


// Planner

if (result.planner) {

    setText(
        "plannerResult",
        result.planner.strategy ||
        "Planning sequence generated"
    );
}


// Weather

if (result.weather) {

    setText(
        "weatherResult",
        result.weather.condition ||
        "Seasonal prototype indicator"
    );
}


// ------------------------------------------------------------
// WHY RECOMMENDATION
// ------------------------------------------------------------

const reasons = [];

if (result.forecast_rate !== undefined) {

    reasons.push(
        "Freight forecast indicates a " +
        valueOrDash(result.freight_trend).toLowerCase() +
        " market signal."
    );
}


if (result.entry_window) {

    reasons.push(
        "The model identified an entry window of " +
        result.entry_window +
        "."
    );
}


if (result.recommended_vessel) {

    reasons.push(
        result.recommended_vessel +
        " was selected based on vessel suitability and operational constraints."
    );
}


if (result.port_status) {

    reasons.push(
        "Destination-port compatibility was included before the recommendation was finalized."
    );
}


if (result.risk) {

    reasons.push(
        "Risk level was incorporated into the final decision."
    );
}


if (result.expected_idle !== undefined) {

    reasons.push(
        "Expected idle time was considered to reduce avoidable operational delay."
    );
}


if (
    result.pooling ||
    result.carbon ||
    result.intermodal
) {

    reasons.push(
        "Additional optimization layers were evaluated to provide a broader decision context."
    );
}


const reasonList =
    document.getElementById("reasonList");

if (reasonList) {

    reasonList.innerHTML =
        reasons.map(function (reason) {

            return `<li>${reason}</li>`;

        }).join("");
}


setText(
    "whyRecommendation",
    "The recommendation is not based on a single parameter. SAYLIV combines freight outlook, vessel suitability, port compatibility, operational risk and optimization signals to form the final decision."
);


// ------------------------------------------------------------
// BOOKING DATA
// ------------------------------------------------------------

/*
    Different versions of the booking flow may store the
    booking object under different localStorage names.

    We check the common possibilities.
*/

let booking = null;

const bookingKeys = [
    "saylivBooking",
    "saylivBookingData",
    "bookingData",
    "booking"
];

for (const key of bookingKeys) {

    const stored =
        localStorage.getItem(key);

    if (stored) {

        try {

            booking =
                JSON.parse(stored);

            if (booking) {
                break;
            }

        } catch (error) {

            console.log(
                "Could not parse booking data:",
                key
            );

        }
    }
}


// ------------------------------------------------------------
// BOOKING DISPLAY
// ------------------------------------------------------------

if (booking) {

    setText(
        "bookingStatus",
        booking.status ||
        booking.bookingStatus ||
        "Confirmed"
    );

    setText(
        "bookingId",
        booking.bookingId ||
        booking.id ||
        booking.bookingID ||
        "--"
    );

    setText(
        "bookingCompany",
        booking.company ||
        booking.companyName ||
        booking.charterer ||
        "--"
    );

    setText(
        "bookingVessel",
        booking.vessel ||
        result.recommended_vessel ||
        "--"
    );

    setText(
        "bookingRoute",
        booking.route ||
        (
            valueOrDash(input.origin) +
            " → " +
            valueOrDash(input.destination)
        )
    );

    setText(
        "bookingCargo",
        booking.cargo
            ? booking.cargo + " MT"
            : (
                input.cargo
                    ? input.cargo + " MT"
                    : "--"
            )
    );

    setText(
        "bookingContract",
        booking.contract ||
        input.contract ||
        "--"
    );

    setText(
        "bookingDate",
        booking.bookingDate ||
        booking.date ||
        "--"
    );

} else {

    setText(
        "bookingStatus",
        "Not booked yet"
    );

    setText(
        "bookingId",
        "--"
    );

    setText(
        "bookingCompany",
        "--"
    );

    setText(
        "bookingVessel",
        result.recommended_vessel ||
        "--"
    );

    setText(
        "bookingRoute",
        valueOrDash(input.origin) +
        " → " +
        valueOrDash(input.destination)
    );

    setText(
        "bookingCargo",
        input.cargo
            ? input.cargo + " MT"
            : "--"
    );

    setText(
        "bookingContract",
        input.contract ||
        "--"
    );

    setText(
        "bookingDate",
        "--"
    );
}


// ------------------------------------------------------------
// FINAL CONCLUSION
// ------------------------------------------------------------

const finalConclusion =
    document.getElementById("finalConclusion");

if (finalConclusion) {

    finalConclusion.textContent =
        "For the selected " +
        valueOrDash(input.commodity) +
        " cargo movement from " +
        valueOrDash(input.origin) +
        " through " +
        valueOrDash(input.loadingPort) +
        " to " +
        valueOrDash(input.destination) +
        ", SAYLIV evaluated freight trends, vessel suitability, port compatibility, risk, idle time and additional optimization layers before generating the final recommendation of " +
        valueOrDash(result.recommended_vessel) +
        ".";
}


// ============================================================
// DOWNLOAD PDF
// ============================================================

function downloadPDF() {

    const element =
        document.getElementById("reportContent");

    if (!element) {

        alert(
            "Report content could not be found."
        );

        return;
    }


    const fileName =
        "SAYLIV_Decision_Report_" +
        (
            input.destination ||
            "Analysis"
        ).replace(/\s+/g, "_") +
        ".pdf";


    const options = {

        margin: 0,

        filename: fileName,

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        },

        pagebreak: {
            mode: [
                "css",
                "legacy"
            ]
        }

    };


    html2pdf()
        .set(options)
        .from(element)
        .save();

}