document.addEventListener("DOMContentLoaded", function () {

    const inputRaw = localStorage.getItem("saylivInput");
    const resultRaw = localStorage.getItem("saylivResult");

    if (!inputRaw || !resultRaw) {
        showNoData();
        return;
    }

    let input;
    let result;

    try {
        input = JSON.parse(inputRaw);
        result = JSON.parse(resultRaw);
    } catch (error) {
        console.error("Could not read SAYLIV data:", error);
        showNoData();
        return;
    }


    /* --------------------------------
       BASIC INPUT DATA
    -------------------------------- */

    const cargo = Number(input.cargo || 0);

    const commodity =
        input.commodity ||
        "Selected commodity";

    const origin =
        input.origin ||
        "Selected origin";

    const loadingPort =
        input.loadingPort ||
        "Selected loading port";

    const destination =
        input.destination ||
        "Selected destination";

    const arrivalDate =
        input.arrivalDate ||
        "Not specified";


    /* --------------------------------
       INTERMODAL RESULT
    -------------------------------- */

    const intermodal =
        result.intermodal || {};

    let recommendedMode =
        intermodal.recommended_mode ||
        "Rail";


    /*
       Existing backend returns:
       road_index
       rail_index
       recommended_mode
    */

    let railIndex =
        Number(intermodal.rail_index);

    let roadIndex =
        Number(intermodal.road_index);


    /*
       Safety fallback if older result
       does not contain the values.
    */

    if (!Number.isFinite(railIndex)) {
        railIndex = Math.round(cargo * 0.72 / 1000 * 100) / 100;
    }

    if (!Number.isFinite(roadIndex)) {
        roadIndex = Math.round(cargo * 1.00 / 1000 * 100) / 100;
    }


    /* --------------------------------
       NORMALIZE MODE
    -------------------------------- */

    const modeText =
        String(recommendedMode).toLowerCase();

    if (modeText.includes("road")) {
        recommendedMode = "Road";
    } else {
        recommendedMode = "Rail";
    }


    /* --------------------------------
       VALUES
    -------------------------------- */

    const difference =
        Math.abs(roadIndex - railIndex);

    const lowerIndex =
        Math.min(roadIndex, railIndex);

    const higherIndex =
        Math.max(roadIndex, railIndex);

    let improvement = 0;

    if (higherIndex > 0) {
        improvement =
            ((higherIndex - lowerIndex) / higherIndex) * 100;
    }

    improvement =
        Math.round(improvement * 10) / 10;


    /* --------------------------------
       POPULATE SCENARIO
    -------------------------------- */

    document.getElementById("routeDetails").innerHTML = `

        <div class="route-box">
            <small>Origin</small>
            <strong>${escapeHTML(origin)}</strong>
        </div>

        <div class="arrow">→</div>

        <div class="route-box">
            <small>Loading Port</small>
            <strong>${escapeHTML(loadingPort)}</strong>
        </div>

        <div class="arrow">→</div>

        <div class="route-box">
            <small>Destination</small>
            <strong>${escapeHTML(destination)}</strong>
        </div>

    `;


    /* --------------------------------
       SNAPSHOT
    -------------------------------- */

    document.getElementById("cargoValue").textContent =
        formatNumber(cargo) + " MT";

    document.getElementById("originValue").textContent =
        origin;

    document.getElementById("destinationValue").textContent =
        destination;

    document.getElementById("modeValue").textContent =
        recommendedMode;


    /* --------------------------------
       RECOMMENDATION BANNER
    -------------------------------- */

    document.getElementById("recommendedMode").textContent =
        recommendedMode + " Recommended";

    document.getElementById("recommendationSummary").textContent =
        buildSummary(
            recommendedMode,
            cargo,
            origin,
            loadingPort,
            destination,
            railIndex,
            roadIndex,
            improvement
        );


    /* --------------------------------
       EXPLANATION
    -------------------------------- */

    document.getElementById("mainExplanation").textContent =
        buildMainExplanation(
            recommendedMode,
            cargo,
            commodity,
            origin,
            loadingPort,
            destination,
            railIndex,
            roadIndex,
            improvement
        );


    /* --------------------------------
       FACTOR 1
    -------------------------------- */

    document.getElementById("cargoReason").textContent =
        buildCargoReason(
            cargo,
            commodity,
            recommendedMode
        );


    /* --------------------------------
       FACTOR 2
    -------------------------------- */

    document.getElementById("indexReason").textContent =
        buildIndexReason(
            recommendedMode,
            railIndex,
            roadIndex,
            improvement
        );


    /* --------------------------------
       FACTOR 3
    -------------------------------- */

    document.getElementById("routeReason").textContent =
        buildRouteReason(
            origin,
            loadingPort,
            destination,
            arrivalDate
        );


    /* --------------------------------
       FACTOR 4
    -------------------------------- */

    document.getElementById("logicReason").textContent =
        buildLogicReason(
            recommendedMode,
            railIndex,
            roadIndex
        );


    /* --------------------------------
       FINAL EXPLANATION
    -------------------------------- */

    document.getElementById("finalTitle").textContent =
        recommendedMode +
        " selected for this End-To-End scenario";

    document.getElementById("finalExplanation").textContent =
        buildFinalExplanation(
            recommendedMode,
            cargo,
            commodity,
            origin,
            loadingPort,
            destination,
            railIndex,
            roadIndex,
            improvement
        );


    /* --------------------------------
       CHARTS
    -------------------------------- */

    createIndexChart(
        railIndex,
        roadIndex,
        recommendedMode
    );

    createPieChart(
        railIndex,
        roadIndex
    );

});


/* =====================================================
   SUMMARY
===================================================== */

function buildSummary(
    mode,
    cargo,
    origin,
    loadingPort,
    destination,
    rail,
    road,
    improvement
) {

    const selectedIndex =
        mode === "Rail" ? rail : road;

    return (
        `${mode} was selected for ${formatNumber(cargo)} MT moving ` +
        `from ${origin} through ${loadingPort} to ${destination}. ` +
        `Its planning index is ${selectedIndex.toFixed(2)}, ` +
        `which is lower than the alternative under the current ` +
        `prototype model by approximately ${improvement}%.`
    );
}


/* =====================================================
   MAIN EXPLANATION
===================================================== */

function buildMainExplanation(
    mode,
    cargo,
    commodity,
    origin,
    loadingPort,
    destination,
    rail,
    road,
    improvement
) {

    const selectedIndex =
        mode === "Rail" ? rail : road;

    const otherMode =
        mode === "Rail" ? "Road" : "Rail";

    const otherIndex =
        mode === "Rail" ? road : rail;

    return (
        `For this ${commodity} shipment of ${formatNumber(cargo)} MT, ` +
        `SAYLIV compared the prototype planning indices for Rail and Road ` +
        `using the selected route from ${origin} via ${loadingPort} to ` +
        `${destination}. ${mode} received the lower planning index ` +
        `(${selectedIndex.toFixed(2)}) compared with ${otherMode} ` +
        `(${otherIndex.toFixed(2)}). Because the prototype treats a lower ` +
        `planning index as the more efficient option, ${mode} became the ` +
        `recommended mode. The difference between the two indices is ` +
        `approximately ${improvement}%.`
    );
}


/* =====================================================
   CARGO REASON
===================================================== */

function buildCargoReason(
    cargo,
    commodity,
    mode
) {

    let quantityText;

    if (cargo >= 100000) {
        quantityText =
            "The shipment is very large, so transport-mode efficiency becomes especially important.";
    }
    else if (cargo >= 50000) {
        quantityText =
            "The shipment is substantial, making the relative planning efficiency of each mode important.";
    }
    else {
        quantityText =
            "The selected shipment quantity is incorporated into the transport planning index.";
    }

    return (
        `Commodity: ${commodity}. ` +
        `${quantityText} ` +
        `The current model evaluates the selected cargo quantity consistently for both Rail and Road.`
    );
}


/* =====================================================
   INDEX REASON
===================================================== */

function buildIndexReason(
    mode,
    rail,
    road,
    improvement
) {

    if (mode === "Rail") {

        return (
            `Rail has a planning index of ${rail.toFixed(2)}, while Road has ` +
            `an index of ${road.toFixed(2)}. The Rail index is lower by ` +
            `${Math.abs(road - rail).toFixed(2)} index points, representing ` +
            `approximately ${improvement}% lower planning index than the ` +
            `alternative in this prototype scenario.`
        );

    }

    return (
        `Road has a planning index of ${road.toFixed(2)}, while Rail has ` +
        `an index of ${rail.toFixed(2)}. The Road index is lower by ` +
        `${Math.abs(road - rail).toFixed(2)} index points, representing ` +
        `approximately ${improvement}% lower planning index than the ` +
        `alternative in this prototype scenario.`
    );
}


/* =====================================================
   ROUTE REASON
===================================================== */

function buildRouteReason(
    origin,
    loadingPort,
    destination,
    arrivalDate
) {

    return (
        `The decision is tied to the scenario entered by the user: ` +
        `${origin} → ${loadingPort} → ${destination}. ` +
        `The requested arrival date is ${arrivalDate}. ` +
        `The current prototype uses these details as the movement context; ` +
        `a production version should additionally use validated route ` +
        `distance, actual transport availability, transit time and live rates.`
    );
}


/* =====================================================
   LOGIC REASON
===================================================== */

function buildLogicReason(
    mode,
    rail,
    road
) {

    const selected =
        mode === "Rail" ? rail : road;

    const alternative =
        mode === "Rail" ? road : rail;

    return (
        `Decision rule: compare the Rail and Road planning indices. ` +
        `The prototype selects the lower value. In this case ${mode} = ` +
        `${selected.toFixed(2)} and the alternative = ${alternative.toFixed(2)}. ` +
        `${mode} therefore becomes the displayed recommendation.`
    );
}


/* =====================================================
   FINAL EXPLANATION
===================================================== */

function buildFinalExplanation(
    mode,
    cargo,
    commodity,
    origin,
    loadingPort,
    destination,
    rail,
    road,
    improvement
) {

    const selected =
        mode === "Rail" ? rail : road;

    const alternativeMode =
        mode === "Rail" ? "Road" : "Rail";

    const alternative =
        mode === "Rail" ? road : rail;

    return (
        `SAYLIV recommends ${mode} for this ${formatNumber(cargo)} MT ` +
        `${commodity} movement from ${origin} via ${loadingPort} to ` +
        `${destination}. The key reason is the lower prototype planning ` +
        `index: ${mode} scores ${selected.toFixed(2)} compared with ` +
        `${alternativeMode}'s ${alternative.toFixed(2)}. This creates a ` +
        `planning-index difference of ${improvement}%. Therefore, under ` +
        `the current End-To-End model, ${mode} represents the lower-index ` +
        `transport option for the selected scenario.`
    );
}


/* =====================================================
   BAR CHART
===================================================== */

function createIndexChart(
    rail,
    road,
    mode
) {

    const canvas =
        document.getElementById("indexChart");

    if (!canvas) return;

    new Chart(canvas, {

        type: "bar",

        data: {

            labels: [
                "Rail",
                "Road"
            ],

            datasets: [

                {
                    label: "Planning Index",

                    data: [
                        rail,
                        road
                    ],

                    borderWidth: 1,

                    borderRadius: 5,

                    backgroundColor: [
                        mode === "Rail"
                            ? "#f28c28"
                            : "#9fb4c8",

                        mode === "Road"
                            ? "#f28c28"
                            : "#9fb4c8"
                    ]
                }

            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return (
                                " Planning Index: " +
                                Number(context.raw).toFixed(2)
                            );

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "Planning Index"
                    }

                },

                x: {

                    title: {
                        display: true,
                        text: "Transport Mode"
                    }

                }

            }

        }

    });
}


/* =====================================================
   PIE CHART
===================================================== */

function createPieChart(
    rail,
    road
) {

    const canvas =
        document.getElementById("pieChart");

    if (!canvas) return;

    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Rail Index",
                "Road Index"
            ],

            datasets: [

                {
                    data: [
                        rail,
                        road
                    ],

                    borderWidth: 2,

                    backgroundColor: [
                        "#f28c28",
                        "#9fb4c8"
                    ]
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "62%",

            plugins: {

                legend: {
                    position: "bottom"
                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            const total =
                                rail + road;

                            const value =
                                Number(context.raw);

                            const percentage =
                                total > 0
                                    ? ((value / total) * 100).toFixed(1)
                                    : "0.0";

                            return (
                                " " +
                                context.label +
                                ": " +
                                value.toFixed(2) +
                                " (" +
                                percentage +
                                "%)"
                            );

                        }

                    }

                }

            }

        }

    });
}


/* =====================================================
   NO DATA
===================================================== */

function showNoData() {

    const main =
        document.querySelector(".main");

    main.innerHTML = `

        <div style="
            max-width:700px;
            margin:100px auto;
            background:white;
            border:1px solid #dce4ed;
            border-radius:10px;
            padding:35px;
            text-align:center;
        ">

            <h2 style="color:#0d2340;">
                No Analysis Data Found
            </h2>

            <p style="
                color:#64748b;
                line-height:1.6;
                font-size:14px;
            ">
                Please complete a New Analysis first.
                SAYLIV will then use your selected cargo,
                route and intermodal recommendation here.
            </p>

            <a href="analysis.html"
               style="
                display:inline-block;
                margin-top:15px;
                padding:11px 18px;
                background:#f28c28;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:700;
               ">
                Start New Analysis
            </a>

        </div>

    `;
}


/* =====================================================
   HELPERS
===================================================== */

function formatNumber(value) {

    return Number(value || 0)
        .toLocaleString("en-IN");
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}