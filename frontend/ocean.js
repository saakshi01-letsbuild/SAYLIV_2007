// ============================================================
// SAYLIV OCEAN SCANNER
// Representative vessel traffic prototype
// ============================================================


// ============================================================
// MAP
// ============================================================

const map = L.map("oceanMap", {
    zoomControl: true,
    minZoom: 2
});


// OpenStreetMap tiles
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// Initial view
map.setView(
    [12, 65],
    3
);


// ============================================================
// PORTS
// ============================================================

const ports = {

    Paradip: {
        lat: 20.27,
        lng: 86.67
    },

    Visakhapatnam: {
        lat: 17.69,
        lng: 83.29
    },

    Gangavaram: {
        lat: 17.62,
        lng: 83.22
    },

    Gopalpur: {
        lat: 19.27,
        lng: 84.90
    },

    Dhamra: {
        lat: 20.78,
        lng: 86.95
    },

    Haldia: {
        lat: 22.03,
        lng: 88.06
    }

};


// ============================================================
// ORIGIN LOCATIONS
// ============================================================

const origins = {

    Australia: {
        lat: -25.0,
        lng: 151.0
    },

    US: {
        lat: 29.0,
        lng: -88.0
    },

    Mozambique: {
        lat: -17.0,
        lng: 40.0
    },

    Russia: {
        lat: 43.0,
        lng: 47.0
    },

    Indonesia: {
        lat: -5.0,
        lng: 118.0
    }

};


// ============================================================
// REPRESENTATIVE VESSEL DATA
// ============================================================

const vessels = [

    {
        name: "SAYLIV Ocean 01",
        type: "Panamax",
        origin: "Australia",
        destination: "Paradip",
        status: "In Transit",
        eta: "12 Oct 2026",
        cargo: "Coal • 72,000 MT",
        position: [-11, 126]
    },

    {
        name: "Eastern Trader",
        type: "Supramax",
        origin: "Australia",
        destination: "Dhamra",
        status: "In Transit",
        eta: "14 Oct 2026",
        cargo: "Coal • 52,000 MT",
        position: [-4, 118]
    },

    {
        name: "Pacific Bulk",
        type: "Capesize",
        origin: "Australia",
        destination: "Visakhapatnam",
        status: "In Transit",
        eta: "17 Oct 2026",
        cargo: "Iron Ore • 132,000 MT",
        position: [-8, 145]
    },

    {
        name: "Mozambique Star",
        type: "Panamax",
        origin: "Mozambique",
        destination: "Paradip",
        status: "Approaching Port",
        eta: "10 Oct 2026",
        cargo: "Coal • 68,000 MT",
        position: [-6, 67]
    },

    {
        name: "Indian Ocean Trader",
        type: "Supramax",
        origin: "Mozambique",
        destination: "Gopalpur",
        status: "In Transit",
        eta: "16 Oct 2026",
        cargo: "Coal • 48,000 MT",
        position: [-9, 73]
    },

    {
        name: "US Gulf Carrier",
        type: "Capesize",
        origin: "US",
        destination: "Haldia",
        status: "In Transit",
        eta: "22 Oct 2026",
        cargo: "Coal • 120,000 MT",
        position: [12, -42]
    },

    {
        name: "Atlantic Bulk",
        type: "Panamax",
        origin: "US",
        destination: "Paradip",
        status: "Loading",
        eta: "28 Oct 2026",
        cargo: "Coal • 70,000 MT",
        position: [26, -72]
    },

    {
        name: "Caspian Trader",
        type: "Supramax",
        origin: "Russia",
        destination: "Dhamra",
        status: "In Transit",
        eta: "20 Oct 2026",
        cargo: "Coal • 54,000 MT",
        position: [25, 65]
    },

    {
        name: "Volga Marine",
        type: "Panamax",
        origin: "Russia",
        destination: "Haldia",
        status: "In Transit",
        eta: "24 Oct 2026",
        cargo: "Coal • 76,000 MT",
        position: [30, 55]
    },

    {
        name: "Java Bulk",
        type: "Handysize",
        origin: "Indonesia",
        destination: "Gangavaram",
        status: "Approaching Port",
        eta: "09 Oct 2026",
        cargo: "Coal • 36,000 MT",
        position: [1, 104]
    },

    {
        name: "Sunda Trader",
        type: "Supramax",
        origin: "Indonesia",
        destination: "Visakhapatnam",
        status: "In Transit",
        eta: "13 Oct 2026",
        cargo: "Coal • 55,000 MT",
        position: [-1, 111]
    },

    {
        name: "East Meridian",
        type: "Handysize",
        origin: "Indonesia",
        destination: "Gopalpur",
        status: "Loading",
        eta: "19 Oct 2026",
        cargo: "Limestone • 32,000 MT",
        position: [-5, 120]
    }

];


// ============================================================
// LAYERS
// ============================================================

const routeLayer =
    L.layerGroup().addTo(map);

const vesselLayer =
    L.layerGroup().addTo(map);

const portLayer =
    L.layerGroup().addTo(map);


// ============================================================
// PORT MARKERS
// ============================================================

Object.entries(ports).forEach(
    ([name, data]) => {

        const marker =
            L.circleMarker(
                [data.lat, data.lng],
                {
                    radius: 6,
                    color: "#0d2340",
                    fillColor: "#0d2340",
                    fillOpacity: 1,
                    weight: 2
                }
            );

        marker
            .bindTooltip(
                name + " Port",
                {
                    direction: "top"
                }
            );

        marker.addTo(portLayer);
    }
);


// ============================================================
// ROUTE DRAWING
// ============================================================

function drawRoute(vessel) {

    const origin =
        origins[vessel.origin];

    const destination =
        ports[vessel.destination];

    if (!origin || !destination) {
        return;
    }


    const routePoints = [

        [origin.lat, origin.lng],

        vessel.position,

        [destination.lat, destination.lng]

    ];


    const line =
        L.polyline(
            routePoints,
            {
                color: "#3285d8",
                weight: 2,
                opacity: 0.55,
                dashArray: "6 7"
            }
        );


    line.bindTooltip(
        vessel.origin +
        " → " +
        vessel.destination
    );


    line.addTo(routeLayer);
}


// ============================================================
// VESSEL MARKER
// ============================================================

function createVesselMarker(vessel) {

    const marker =
        L.circleMarker(
            vessel.position,
            {
                radius: 7,
                color: "#ffffff",
                fillColor: "#f28c28",
                fillOpacity: 1,
                weight: 2
            }
        );


    marker.bindTooltip(
        vessel.name,
        {
            direction: "top"
        }
    );


    marker.on(
        "click",
        function () {

            showVessel(vessel);

        }
    );


    marker.addTo(vesselLayer);
}


// ============================================================
// SHOW VESSEL
// ============================================================

function showVessel(vessel) {

    document.getElementById(
        "selectedVesselName"
    ).textContent =
        vessel.name;


    document.getElementById(
        "selectedVesselRoute"
    ).textContent =
        vessel.origin +
        " → " +
        vessel.destination;


    document.getElementById(
        "selectedType"
    ).textContent =
        vessel.type;


    document.getElementById(
        "selectedStatus"
    ).textContent =
        vessel.status;


    document.getElementById(
        "selectedEta"
    ).textContent =
        vessel.eta;


    document.getElementById(
        "selectedCargo"
    ).textContent =
        vessel.cargo;

}


// ============================================================
// FILTERS
// ============================================================

const originFilter =
    document.getElementById(
        "originFilter"
    );

const destinationFilter =
    document.getElementById(
        "destinationFilter"
    );

const vesselFilter =
    document.getElementById(
        "vesselFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


// ============================================================
// RENDER NETWORK
// ============================================================

function renderNetwork() {

    routeLayer.clearLayers();

    vesselLayer.clearLayers();


    const origin =
        originFilter.value;

    const destination =
        destinationFilter.value;

    const vesselType =
        vesselFilter.value;

    const status =
        statusFilter.value;


    const filtered =
        vessels.filter(
            function (vessel) {

                const originMatch =
                    origin === "All" ||
                    vessel.origin === origin;

                const destinationMatch =
                    destination === "All" ||
                    vessel.destination === destination;

                const vesselMatch =
                    vesselType === "All" ||
                    vessel.type === vesselType;

                const statusMatch =
                    status === "All" ||
                    vessel.status === status;


                return (
                    originMatch &&
                    destinationMatch &&
                    vesselMatch &&
                    statusMatch
                );
            }
        );


    filtered.forEach(
        function (vessel) {

            drawRoute(vessel);

            createVesselMarker(vessel);

        }
    );


    updateStats(filtered);


    if (filtered.length > 0) {

        showVessel(filtered[0]);

    } else {

        document.getElementById(
            "selectedVesselName"
        ).textContent =
            "No vessel found";

        document.getElementById(
            "selectedVesselRoute"
        ).textContent =
            "Try changing the filters.";

        document.getElementById(
            "selectedType"
        ).textContent =
            "--";

        document.getElementById(
            "selectedStatus"
        ).textContent =
            "--";

        document.getElementById(
            "selectedEta"
        ).textContent =
            "--";

        document.getElementById(
            "selectedCargo"
        ).textContent =
            "--";
    }

}


// ============================================================
// STATS
// ============================================================

function updateStats(filtered) {

    document.getElementById(
        "vesselCount"
    ).textContent =
        filtered.length;


    const uniqueRoutes =
        new Set(
            filtered.map(
                vessel =>
                    vessel.origin +
                    " → " +
                    vessel.destination
            )
        );


    document.getElementById(
        "routeCount"
    ).textContent =
        uniqueRoutes.size;


    /*
        Prototype congestion signal.
        This will later be connected to the
        backend/live port feed.
    */

    const congestion =
        filtered.length >= 8
            ? "High"
            : filtered.length >= 4
                ? "Medium"
                : "Low";


    document.getElementById(
        "congestionLevel"
    ).textContent =
        congestion;


    /*
        Prototype market signal.
        Can later use freight forecast output.
    */

    document.getElementById(
        "marketSignal"
    ).textContent =
        "Stable";

}


// ============================================================
// FILTER EVENTS
// ============================================================

originFilter.addEventListener(
    "change",
    renderNetwork
);

destinationFilter.addEventListener(
    "change",
    renderNetwork
);

vesselFilter.addEventListener(
    "change",
    renderNetwork
);

statusFilter.addEventListener(
    "change",
    renderNetwork
);


// ============================================================
// INITIAL RENDER
// ============================================================

renderNetwork();


// ============================================================
// OPTIONAL: CONNECT WITH EXISTING SAYLIV RESULT
// ============================================================

/*
    If an analysis already exists in localStorage,
    Ocean Scanner can automatically focus on the
    selected destination.

    We don't force it because the user may want to
    explore the whole network first.
*/

try {

    const storedInput =
        JSON.parse(
            localStorage.getItem(
                "saylivInput"
            ) || "null"
        );


    if (
        storedInput &&
        storedInput.destination
    ) {

        const optionExists =
            Array.from(
                destinationFilter.options
            ).some(
                option =>
                    option.value ===
                    storedInput.destination
            );


        if (optionExists) {

            destinationFilter.value =
                storedInput.destination;

            renderNetwork();

        }

    }

} catch (error) {

    console.log(
        "No previous SAYLIV analysis found."
    );

}