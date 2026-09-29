const API = "http://127.0.0.1:8000";

let input = JSON.parse(
    localStorage.getItem("saylivInput") || "null"
);

let result = JSON.parse(
    localStorage.getItem("saylivResult") || "null"
);


/* =====================================================
   BASIC HELPERS
===================================================== */

function setText(id, text) {
    const el = document.getElementById(id);

    if (el) {
        el.textContent =
            text === undefined ||
            text === null ||
            text === ""
                ? "—"
                : String(text);
    }
}


function safe(value, fallback = "—") {
    return value !== undefined &&
           value !== null &&
           value !== ""
        ? value
        : fallback;
}


/* =====================================================
   CARD HELPER
   IMPORTANT:
   Does NOT destroy existing card heading/design.
===================================================== */

function setCard(id, html) {

    const card = document.getElementById(id);

    if (!card) {
        console.warn("SAYLIV card not found:", id);
        return;
    }

    /*
       If this card already has dynamic content from
       a previous render, update that instead of adding
       another copy.
    */

    let body = card.querySelector(".dynamic-card-content");

    if (!body) {
        body = document.createElement("div");
        body.className = "dynamic-card-content";

        /*
           Add content at the end of the existing card.
           This preserves the original heading, label,
           description and card styling.
        */

        card.appendChild(body);
    }

    body.innerHTML = html;
}


/* =====================================================
   LOAD BACKEND RESULT
===================================================== */

async function loadAnalysis() {

    /*
       Normally analysis.html already stores:
       saylivInput
       saylivResult
    */

    if (input && result) {
        renderResult(input, result);
        return;
    }


    /*
       Fallback demo scenario.

       This makes the result page work even if
       localStorage was cleared.
    */

    input = {
        commodity: "Coal",
        cargo: 50000,
        origin: "Australia",
        loadingPort: "Newcastle",
        destination: "Paradip",
        arrivalDate: "2026-10-15",
        vessel: "Any",
        contract: "Short-term"
    };


    try {

        const response = await fetch(API + "/analyze", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(input)
        });


        if (!response.ok) {
            throw new Error(
                "Backend returned " + response.status
            );
        }


        result = await response.json();


        localStorage.setItem(
            "saylivInput",
            JSON.stringify(input)
        );


        localStorage.setItem(
            "saylivResult",
            JSON.stringify(result)
        );


        renderResult(input, result);

    }

    catch (error) {

        console.error(
            "SAYLIV backend error:",
            error
        );


        setText(
            "recommendationText",
            "SAYLIV backend could not be reached."
        );
    }
}


/* =====================================================
   RENDER EVERYTHING
===================================================== */

function renderResult(input, data) {

    console.log(
        "SAYLIV RESULT:",
        data
    );


    /* =================================================
       SCENARIO
    ================================================= */

    setText(
        "scenarioTitle",
        `${safe(input.commodity)} → ${safe(
            data.destination,
            input.destination
        )}`
    );


    setText(
        "scenarioDetails",
        `${safe(input.cargo)} MT • ${safe(
            input.origin
        )} • ${safe(input.contract)}`
    );


    setText(
        "destinationPort",
        safe(
            data.destination,
            input.destination
        )
    );


    /* =================================================
       MAIN DECISION
    ================================================= */

    setText(
        "recommendation",
        safe(
            data.recommended_vessel
        )
    );


    setText(
        "recommendationText",
        safe(
            data.recommendation_text
        )
    );


    setText(
        "score",
        data.recommendation_score !== undefined
            ? `${data.recommendation_score}/100`
            : "—"
    );


    /* =================================================
       SNAPSHOT
    ================================================= */

    setText(
        "freight",
        data.forecast_rate !== undefined
            ? data.forecast_rate
            : "—"
    );


    setText(
        "entryWindow",
        safe(
            data.entry_window
        )
    );


    setText(
        "overallRisk",
        safe(
            data.risk
        )
    );


    setText(
        "idleTime",
        data.expected_idle !== undefined
            ? `${data.expected_idle} hrs`
            : "—"
    );


    /* =================================================
       FREIGHT FORECAST
    ================================================= */

    setText(
        "forecast",

        data.forecast_rate !== undefined

            ? `₹/index ${data.forecast_rate} • ${safe(
                data.freight_trend
            )} trend • ${safe(
                data.forecast_model,
                "Random Forest Regression"
            )} • ${safe(
                data.forecast_confidence
            )}% confidence`

            : "Forecast unavailable"
    );


    /* =================================================
       PORT COMPATIBILITY
    ================================================= */

    const checks =
        data.port_checks || {};


    setText(
        "port",

        `${safe(data.port_status)}
         | Draft ${checks.draft ? "✓" : "✗"}
         | LOA ${checks.loa ? "✓" : "✗"}
         | Beam ${checks.beam ? "✓" : "✗"}`
    );


    /* =================================================
       RISK
    ================================================= */

    const rb =
        data.risk_breakdown || {};


    setText(
        "risk",

        `Market: ${safe(rb.market_volatility)}
         | Port: ${safe(rb.port_congestion)}
         | Delay: ${safe(rb.delay_exposure)}
         | Vessel: ${safe(rb.vessel_availability)}`
    );


    /* =================================================
       IDLE
    ================================================= */

    setText(
        "idleLarge",

        data.expected_idle !== undefined
            ? `${data.expected_idle} hrs`
            : "—"
    );


    /* =================================================
       VESSEL ALTERNATIVES
    ================================================= */

    const table =
        document.querySelector(
            ".vessel-table"
        );


    if (
        table &&
        Array.isArray(data.alternatives)
    ) {

        const rows =
            data.alternatives
                .map((vessel, index) => {

                    const score =
                        vessel.score !== undefined
                            ? vessel.score
                            : vessel.utilization;


                    return `
                        <tr>
                            <td>${index + 1}</td>

                            <td>
                                ${safe(
                                    vessel.vessel_type
                                )}
                            </td>

                            <td>
                                ${safe(
                                    vessel.capacity_mt
                                )} MT
                            </td>

                            <td>
                                ${safe(score)}%
                            </td>
                        </tr>
                    `;
                })
                .join("");


        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Vessel</th>
                    <th>Capacity</th>
                    <th>Score</th>
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>
        `;
    }


    /* =================================================
       1. FREIGHT POOLING
    ================================================= */

    if (data.pooling) {

        setCard(
            "pooling",

            `
            <strong>
                ${
                    data.pooling.pooling_possible
                        ? "Pooling opportunity identified"
                        : "Pooling not feasible"
                }
            </strong>

            <br><br>

            Combined cargo:
            <strong>
                ${safe(
                    data.pooling.combined_cargo
                )} MT
            </strong>

            <br>

            Vessel utilization:
            <strong>
                ${safe(
                    data.pooling.utilization
                )}%
            </strong>

            <br><br>

            <small>
                ${safe(
                    data.pooling.message
                )}
            </small>
            `
        );
    }


    /* =================================================
       2. CARBON-AWARE PLANNING
    ================================================= */

    if (data.carbon) {

        setCard(
            "carbon",

            `
            <strong>
                ${safe(
                    data.carbon.estimated_emissions_tco2
                )} tCO₂
            </strong>

            estimated emissions

            <br><br>

            <small>
                ${safe(
                    data.carbon.status
                )}
            </small>

            <br>

            <small>
                ${safe(
                    data.carbon.efficiency_note
                )}
            </small>
            `
        );
    }


    /* =================================================
       3. INTERMODAL OPTIMIZATION
    ================================================= */

    if (data.intermodal) {

        setCard(
            "intermodal",

            `
            <strong>
                ${safe(
                    data.intermodal.recommended_mode
                )}
            </strong>

            recommended

            <br><br>

            ${safe(
                data.intermodal.reason
            )}

            <br><br>

            <small>
                ${safe(
                    data.intermodal.status
                )}
            </small>
            `
        );
    }


    /* =================================================
       4. WHAT-IF SIMULATOR
    ================================================= */

    if (data.whatif) {

        /*
           Keep the existing What-if card structure.

           Only update elements that already exist.
        */

        const currentCargo =
            document.getElementById(
                "currentCargo"
            );

        if (
            currentCargo &&
            currentCargo.tagName !== "INPUT"
        ) {
            currentCargo.textContent =
                `${safe(
                    data.whatif.current_cargo
                )} MT`;
        }


        /*
           Do NOT overwrite an input field called
           newCargo.
        */

        const newCargoElement =
            document.getElementById(
                "newCargo"
            );

        if (
            newCargoElement &&
            newCargoElement.tagName !== "INPUT"
        ) {
            newCargoElement.textContent =
                `${safe(
                    data.whatif.new_cargo
                )} MT`;
        }


        setText(
            "whatifResult",
            safe(
                data.whatif.feasibility
            )
        );


        setText(
            "whatifMessage",
            safe(
                data.whatif.message
            )
        );
    }


    /* =================================================
       5. OCEAN SCANNER
    ================================================= */

    if (data.ocean) {

        setCard(
            "ocean",

            `
            <strong>
                ${safe(
                    data.ocean.congestion
                )}
            </strong>

            <br><br>

            ${safe(
                data.ocean.market_signal
            )}

            <br><br>

            Route activity score:
            <strong>
                ${safe(
                    data.ocean.route_activity_score
                )}
            </strong>

            <br><br>

            <small>
                ${safe(
                    data.ocean.status
                )}
            </small>
            `
        );
    }


    /* =================================================
       6. PLANNER
    ================================================= */

    if (data.planner) {

        const steps =
            Array.isArray(
                data.planner.steps
            )

                ? data.planner.steps
                    .map(step => `
                        <div>
                            <strong>
                                ${step.step}.
                                ${safe(step.stage)}
                            </strong>

                            ${
                                step.description
                                    ? ` — ${safe(
                                        step.description
                                      )}`
                                    : ""
                            }
                        </div>
                    `)
                    .join("")

                : "";


        setCard(
            "planner",

            `
            <strong>
                ${safe(
                    data.planner.strategy
                )}
            </strong>

            <br><br>

            ${steps}

            <br>

            <small>
                ${safe(
                    data.planner.status
                )}
            </small>
            `
        );
    }


    /* =================================================
       7. WEATHER
    ================================================= */

    if (data.weather) {

        setCard(
            "weather",

            `
            <strong>
                ${safe(
                    data.weather.condition
                )}
            </strong>

            <br><br>

            Level:
            <strong>
                ${safe(
                    data.weather.level
                )}
            </strong>

            <br><br>

            ${safe(
                data.weather.message
            )}

            <br><br>

            <small>
                ${safe(
                    data.weather.status
                )}
            </small>
            `
        );
    }


    /* =================================================
       CONTRACT STRATEGY
    ================================================= */

    if (data.contract_strategy) {

        setText(
            "contractStrategy",
            data.contract_strategy
        );
    }
}


/* =====================================================
   WHAT-IF BUTTON
===================================================== */

window.runWhatIf = function () {

    const inputBox =
        document.getElementById(
            "newCargo"
        );


    if (!inputBox) {
        return;
    }


    /*
       If newCargo is an input,
       use its value.
    */

    const newCargo =
        Number(
            inputBox.value
        );


    if (
        !newCargo ||
        newCargo <= 0
    ) {

        setText(
            "whatifMessage",
            "Enter a valid cargo quantity."
        );

        return;
    }


    /*
       Prototype vessel capacity.
    */

    const capacity =
        82500;


    const utilization =
        Math.round(
            (newCargo / capacity) * 100
        );


    let feasibility;


    if (utilization > 100) {

        feasibility =
            "Not feasible";

    }

    else if (utilization >= 85) {

        feasibility =
            "High utilization";

    }

    else if (utilization >= 60) {

        feasibility =
            "Feasible";

    }

    else {

        feasibility =
            "Low utilization";
    }


    setText(
        "whatifResult",
        feasibility
    );


    setText(
        "whatifMessage",

        `Simulated cargo ${newCargo} MT • Vessel utilization ${utilization}%`
    );
};


/* =====================================================
   START
===================================================== */

loadAnalysis();