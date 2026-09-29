// ============================================================
// SAYLIV CARGO BOOKING
// Ocean Scanner → Vessel Matching → Tracking Prototype
// ============================================================


// ============================================================
// REPRESENTATIVE VESSEL NETWORK
// ============================================================

const vessels = [

    {
        id: "SV-001",
        name: "SAYLIV Ocean 01",
        type: "Panamax",
        origin: "Australia",
        loadingPort: "Newcastle",
        destination: "Paradip",
        status: "In Transit",
        eta: "12 Oct 2026",
        capacity: 82500,
        available: 55000
    },

    {
        id: "SV-002",
        name: "Eastern Trader",
        type: "Supramax",
        origin: "Australia",
        loadingPort: "Hay Point",
        destination: "Dhamra",
        status: "In Transit",
        eta: "14 Oct 2026",
        capacity: 60000,
        available: 52000
    },

    {
        id: "SV-003",
        name: "Pacific Bulk",
        type: "Capesize",
        origin: "Australia",
        loadingPort: "Gladstone",
        destination: "Visakhapatnam",
        status: "In Transit",
        eta: "17 Oct 2026",
        capacity: 150000,
        available: 90000
    },

    {
        id: "SV-004",
        name: "Mozambique Star",
        type: "Panamax",
        origin: "Mozambique",
        loadingPort: "Maputo",
        destination: "Paradip",
        status: "Approaching Port",
        eta: "10 Oct 2026",
        capacity: 82500,
        available: 60000
    },

    {
        id: "SV-005",
        name: "Indian Ocean Trader",
        type: "Supramax",
        origin: "Mozambique",
        loadingPort: "Beira",
        destination: "Gopalpur",
        status: "In Transit",
        eta: "16 Oct 2026",
        capacity: 60000,
        available: 50000
    },

    {
        id: "SV-006",
        name: "US Gulf Carrier",
        type: "Capesize",
        origin: "US",
        loadingPort: "New Orleans",
        destination: "Haldia",
        status: "In Transit",
        eta: "22 Oct 2026",
        capacity: 150000,
        available: 100000
    },

    {
        id: "SV-007",
        name: "Atlantic Bulk",
        type: "Panamax",
        origin: "US",
        loadingPort: "New Orleans",
        destination: "Paradip",
        status: "Loading",
        eta: "28 Oct 2026",
        capacity: 82500,
        available: 60000
    },

    {
        id: "SV-008",
        name: "Caspian Trader",
        type: "Supramax",
        origin: "Russia",
        loadingPort: "Novorossiysk",
        destination: "Dhamra",
        status: "In Transit",
        eta: "20 Oct 2026",
        capacity: 60000,
        available: 50000
    },

    {
        id: "SV-009",
        name: "Volga Marine",
        type: "Panamax",
        origin: "Russia",
        loadingPort: "Novorossiysk",
        destination: "Haldia",
        status: "In Transit",
        eta: "24 Oct 2026",
        capacity: 82500,
        available: 55000
    },

    {
        id: "SV-010",
        name: "Java Bulk",
        type: "Handysize",
        origin: "Indonesia",
        loadingPort: "Taboneo",
        destination: "Gangavaram",
        status: "Approaching Port",
        eta: "09 Oct 2026",
        capacity: 40000,
        available: 32000
    },

    {
        id: "SV-011",
        name: "Sunda Trader",
        type: "Supramax",
        origin: "Indonesia",
        loadingPort: "Taboneo",
        destination: "Visakhapatnam",
        status: "In Transit",
        eta: "13 Oct 2026",
        capacity: 60000,
        available: 52000
    },

    {
        id: "SV-012",
        name: "East Meridian",
        type: "Handysize",
        origin: "Indonesia",
        loadingPort: "Taboneo",
        destination: "Gopalpur",
        status: "Loading",
        eta: "19 Oct 2026",
        capacity: 40000,
        available: 35000
    }

];


// ============================================================
// DOM ELEMENTS
// ============================================================

const cargoType = document.getElementById("cargoType");
const cargoQuantity = document.getElementById("cargoQuantity");
const loadingPort = document.getElementById("loadingPort");
const destinationPort = document.getElementById("destinationPort");
const arrivalDate = document.getElementById("arrivalDate");
const preferredVessel = document.getElementById("preferredVessel");
const findButton = document.getElementById("findVesselButton");
const resultBody = document.getElementById("resultBody");
const trackingPanel = document.getElementById("trackingPanel");


// ============================================================
// FIND SUITABLE VESSEL
// ============================================================

function findSuitableVessel() {

    const cargo = Number(cargoQuantity.value);
    const destination = destinationPort.value;
    const loading = loadingPort.value;
    const preferred = preferredVessel.value;

    if (!cargo || cargo <= 0) {

        alert("Please enter a valid cargo quantity.");

        return;
    }


    // --------------------------------------------------------
    // STEP 1 — DESTINATION MATCH
    // --------------------------------------------------------

    let matches = vessels.filter(function (vessel) {

        return vessel.destination === destination;

    });


    // --------------------------------------------------------
    // STEP 2 — PREFERRED VESSEL TYPE
    // --------------------------------------------------------

    if (preferred !== "Any") {

        matches = matches.filter(function (vessel) {

            return vessel.type === preferred;

        });

    }


    // --------------------------------------------------------
    // STEP 3 — AVAILABLE CAPACITY
    // --------------------------------------------------------

    const capacityMatches = matches.filter(function (vessel) {

        return vessel.available >= cargo;

    });


    // --------------------------------------------------------
    // STEP 4 — RANK MATCHES
    // --------------------------------------------------------

    const ranked = capacityMatches.map(function (vessel) {

        let score = 0;

        const utilization =
            (cargo / vessel.available) * 100;


        // Good utilization
        if (utilization >= 60 && utilization <= 100) {

            score += 40;

        }
        else if (utilization >= 40) {

            score += 25;

        }


        // Exact loading-port match
        if (vessel.loadingPort === loading) {

            score += 25;

        }


        // Preferred vessel type
        if (
            preferred !== "Any" &&
            vessel.type === preferred
        ) {

            score += 20;

        }


        // Vessel status
        if (vessel.status === "In Transit") {

            score += 10;

        }
        else if (vessel.status === "Approaching Port") {

            score += 8;

        }
        else if (vessel.status === "Loading") {

            score += 5;

        }


        return {
            vessel: vessel,
            score: score
        };

    });


    // Highest score first
    ranked.sort(function (a, b) {

        return b.score - a.score;

    });


    // --------------------------------------------------------
    // STEP 5 — NO MATCH
    // --------------------------------------------------------

    if (ranked.length === 0) {

        showNoMatch(
            cargo,
            destination
        );

        return;

    }


    // --------------------------------------------------------
    // STEP 6 — SELECT BEST MATCH
    // --------------------------------------------------------

    const selected = ranked[0].vessel;

    showMatch(
        selected,
        cargo,
        ranked[0].score
    );

}


// ============================================================
// NO MATCH DISPLAY
// ============================================================

function showNoMatch(cargo, destination) {

    resultBody.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                !
            </div>

            <h3>
                No suitable vessel found
            </h3>

            <p>
                The Ocean Scanner could not find
                enough representative available
                capacity for
                <strong>${cargo.toLocaleString("en-IN")} MT</strong>
                towards
                <strong>${destination}</strong>.
                Try reducing the cargo quantity
                or selecting another vessel type.
            </p>

        </div>

    `;


    trackingPanel.classList.remove("visible");

}


// ============================================================
// SHOW MATCH
// ============================================================

function showMatch(vessel, cargo, score) {

    const remaining =
        vessel.available - cargo;


    const utilization =
        Math.round(
            (cargo / vessel.available) * 100
        );


    const fill =
        Math.min(utilization, 100);


    resultBody.innerHTML = `

        <div class="match-header">

            <div>

                <div class="match-label">
                    Suitable Vessel Found
                </div>

                <div class="match-title">
                    ${vessel.name}
                </div>

                <div class="match-route">
                    ${vessel.origin}
                    →
                    ${vessel.destination}
                </div>

            </div>

            <div class="available">
                Capacity Available
            </div>

        </div>


        <div class="match-grid">

            <div class="match-stat">

                <small>
                    Vessel Type
                </small>

                <strong>
                    ${vessel.type}
                </strong>

            </div>


            <div class="match-stat">

                <small>
                    Route Status
                </small>

                <strong>
                    ${vessel.status}
                </strong>

            </div>


            <div class="match-stat">

                <small>
                    ETA
                </small>

                <strong>
                    ${vessel.eta}
                </strong>

            </div>


            <div class="match-stat">

                <small>
                    Match Score
                </small>

                <strong>
                    ${score}
                </strong>

            </div>

        </div>


        <div class="capacity-box">

            <div class="capacity-head">

                <span>
                    Your cargo
                </span>

                <span>
                    ${cargo.toLocaleString("en-IN")} MT
                </span>

            </div>


            <div class="capacity-bar">

                <div
                    class="capacity-fill"
                    style="width:${fill}%"
                ></div>

            </div>


            <div
                style="
                    margin-top:7px;
                    font-size:10px;
                    color:#64748b;
                "
            >

                Vessel available capacity:
                <strong>
                    ${vessel.available.toLocaleString("en-IN")} MT
                </strong>

                <br>

                Remaining prototype capacity:
                <strong>
                    ${Math.max(
                        remaining,
                        0
                    ).toLocaleString("en-IN")} MT
                </strong>

            </div>

        </div>


        <div class="recommendation">

            <strong>
                SAYLIV Recommendation
            </strong>

            <p>

                ${vessel.name} is the selected
                prototype vessel for your
                ${cargo.toLocaleString("en-IN")} MT
                ${cargoType.value}
                requirement towards
                ${vessel.destination}.

                The vessel has sufficient
                representative available capacity
                and satisfies the selected route
                requirements.

            </p>

        </div>


        <button
            class="book-button"
            id="bookVesselButton"
            type="button"
        >

            Request Cargo Booking

        </button>

    `;


    // --------------------------------------------------------
    // BOOKING BUTTON
    // --------------------------------------------------------

    const bookButton =
        document.getElementById("bookVesselButton");


    if (bookButton) {

        bookButton.addEventListener(
            "click",
            function () {

                createBooking(
                    vessel,
                    cargo
                );

            }
        );

    }

}


// ============================================================
// CREATE BOOKING
// ============================================================

function createBooking(vessel, cargo) {

    const bookingId =
        "SYL-" +
        Date.now()
            .toString()
            .slice(-7);


    const booking = {

        bookingId: bookingId,

        status: "Booking Requested",

        company: "SAYLIV",

        vessel: vessel.name,

        vesselType: vessel.type,

        origin: vessel.origin,

        loadingPort: vessel.loadingPort,

        destination: vessel.destination,

        cargo: cargo,

        cargoType: cargoType.value,

        arrivalDate: arrivalDate.value,

        bookingDate:
            new Date().toLocaleDateString("en-IN")

    };


    // Store booking
    localStorage.setItem(
        "saylivBooking",
        JSON.stringify(booking)
    );


    localStorage.setItem(
        "saylivBookingData",
        JSON.stringify(booking)
    );


    showTracking(booking);

}


// ============================================================
// SHOW TRACKING
// ============================================================

function showTracking(booking) {

    trackingPanel.classList.add("visible");


    document.getElementById(
        "bookingId"
    ).textContent =
        "Booking ID: " +
        booking.bookingId;


    document.getElementById(
        "trackingVessel"
    ).textContent =
        booking.vessel +
        " • " +
        booking.vesselType;


    trackingPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ============================================================
// LOAD PREVIOUS ANALYSIS
// ============================================================

function loadPreviousAnalysis() {

    try {

        const savedInput =
            JSON.parse(
                localStorage.getItem(
                    "saylivInput"
                ) || "null"
            );


        if (!savedInput) {

            return;

        }


        // Cargo
        if (savedInput.cargo) {

            cargoQuantity.value =
                savedInput.cargo;

        }


        // Destination
        if (savedInput.destination) {

            const destinationOption =
                Array.from(
                    destinationPort.options
                ).find(function (option) {

                    return option.value ===
                        savedInput.destination;

                });


            if (destinationOption) {

                destinationPort.value =
                    savedInput.destination;

            }

        }


        // Arrival date
        if (savedInput.arrivalDate) {

            arrivalDate.value =
                savedInput.arrivalDate;

        }


        // Vessel
        if (savedInput.vessel) {

            const vesselOption =
                Array.from(
                    preferredVessel.options
                ).find(function (option) {

                    return option.value ===
                        savedInput.vessel;

                });


            if (vesselOption) {

                preferredVessel.value =
                    savedInput.vessel;

            }

        }


        // Commodity
        if (savedInput.commodity) {

            const cargoOption =
                Array.from(
                    cargoType.options
                ).find(function (option) {

                    return option.value ===
                        savedInput.commodity;

                });


            if (cargoOption) {

                cargoType.value =
                    savedInput.commodity;

            }

        }

    }

    catch (error) {

        console.log(
            "No previous SAYLIV analysis found."
        );

    }

}


// ============================================================
// BUTTON CONNECTION
// ============================================================

function connectFindButton() {

    if (!findButton) {

        console.error(
            "SAYLIV: Find Vessel button not found."
        );

        return;

    }


    findButton.addEventListener(
        "click",
        function () {

            console.log(
                "SAYLIV: Find Suitable Vessel clicked."
            );


            findSuitableVessel();

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

loadPreviousAnalysis();

connectFindButton();

console.log(
    "SAYLIV Cargo Booking loaded successfully."
);