// ============================================================
// EV SMART NAVIGATION
// COMPLETE SINGLE-CONTROLLER VERSION
//
// GPS
// MAP
// SEARCH
// ROUTE
// CHARGING STATIONS
// RUN / DRIVE / PARK
// ECO / NORMAL / SPORT
// ACCELERATOR SLIDER
// BRAKE
// BATTERY
// TRIP
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ====================================================
        // ELEMENTS
        // ====================================================

        const startInput =
            document.getElementById(
                "startInput"
            );


        const destinationInput =
            document.getElementById(
                "destinationInput"
            );


        const navigateButton =
            document.getElementById(
                "navigateButton"
            );


        const useCurrentButton =
            document.getElementById(
                "useCurrentButton"
            );


        const nearbyButton =
            document.getElementById(
                "nearbyButton"
            );


        const mapLocationButton =
            document.getElementById(
                "mapLocationButton"
            );


        const mapChargingButton =
            document.getElementById(
                "mapChargingButton"
            );


        // Vehicle buttons

        const runButton =
            document.getElementById(
                "runButton"
            );


        const driveButton =
            document.getElementById(
                "driveButton"
            );


        const parkButton =
            document.getElementById(
                "parkButton"
            );


        const startRide =
            document.getElementById(
                "startRide"
            );


        const stopRide =
            document.getElementById(
                "stopRide"
            );


        const accelerator =
            document.getElementById(
                "accelerator"
            );


        const brakePedal =
            document.getElementById(
                "brakePedal"
            );


        // Mode buttons

        const ecoMode =
            document.getElementById(
                "ecoMode"
            );


        const normalMode =
            document.getElementById(
                "normalMode"
            );


        const sportMode =
            document.getElementById(
                "sportMode"
            );


        // Displays

        const speedDisplay =
            document.getElementById(
                "speed"
            );


        const acceleratorSpeed =
            document.getElementById(
                "acceleratorSpeed"
            );


        const driveStatus =
            document.getElementById(
                "driveStatus"
            );


        const selectedModeDisplay =
            document.getElementById(
                "selectedMode"
            );


        const batteryDisplay =
            document.getElementById(
                "battery"
            );


        const batteryBar =
            document.getElementById(
                "batteryBar"
            );


        const odometerDisplay =
            document.getElementById(
                "odometer"
            );


        const tripDistanceDisplay =
            document.getElementById(
                "tripDistance"
            );


        const fromLocation =
            document.getElementById(
                "fromLocation"
            );


        const locationStatus =
            document.getElementById(
                "locationStatus"
            );


        const gpsStatus =
            document.getElementById(
                "gpsStatus"
            );


        const distanceDisplay =
            document.getElementById(
                "distance"
            );


        const travelTimeDisplay =
            document.getElementById(
                "travelTime"
            );


        const trafficDisplay =
            document.getElementById(
                "traffic"
            );


        const elevationDisplay =
            document.getElementById(
                "elevation"
            );


        const roadDisplay =
            document.getElementById(
                "roadType"
            );


        const chargingDisplay =
            document.getElementById(
                "chargingStation"
            );


        const consumptionDisplay =
            document.getElementById(
                "consumption"
            );


        const destinationBatteryDisplay =
            document.getElementById(
                "destinationBattery"
            );


        const rangeDisplay =
            document.getElementById(
                "range"
            );


        const reachabilityDisplay =
            document.getElementById(
                "reachability"
            );


        const stationList =
            document.getElementById(
                "stationList"
            );


        const stationStatus =
            document.getElementById(
                "stationStatus"
            );


        const chargingStatus =
            document.getElementById(
                "chargingStatus"
            );


        const deviationValue =
            document.getElementById(
                "deviationValue"
            );



        // ====================================================
        // VEHICLE STATE
        // ====================================================

        const modeLimits = {

            Eco: 40,

            Normal: 60,

            Sport: 100

        };


        const modeConsumption = {

            Eco: 0.85,

            Normal: 1.00,

            Sport: 1.25

        };


        let selectedDrivingMode =
            "Eco";


        let currentMode =
            "park";


        let driving =
            false;


        let braking =
            false;


        let currentSpeed =
            0;


        let targetSpeed =
            0;


        let battery =
            15;


        let odometer =
            0;


        let tripDistance =
            0;


        let lastMotionTime =
            performance.now();



        // ====================================================
        // GPS STATE
        // ====================================================

        let currentLatitude =
            null;


        let currentLongitude =
            null;


        let gpsStarted =
            false;


        let firstGPSFix =
            false;


        let gpsWatchId =
            null;



        // ====================================================
        // MAP STATE
        // ====================================================

        let map =
            null;


        let currentLocationMarker =
            null;


        let destinationMarker =
            null;


        let routeLine =
            null;


        let originalRouteLine =
            null;


        let stationMarkers =
            [];


        let selectedStation =
            null;



        // ====================================================
        // ROUTE STATE
        // ====================================================

        let originalStartLat =
            null;


        let originalStartLon =
            null;


        let originalDestinationLat =
            null;


        let originalDestinationLon =
            null;


        let originalDestinationName =
            "";


        let originalRouteDistance =
            0;


        let currentRoute =
            null;



        // ====================================================
        // CLOCK
        // ====================================================

        function updateClock() {

            const clock =
                document.getElementById(
                    "clock"
                );


            if (clock) {

                clock.textContent =
                    new Date()
                        .toLocaleTimeString();

            }

        }


        updateClock();


        setInterval(
            updateClock,
            1000
        );



        // ====================================================
        // HELPERS
        // ====================================================

        function validCoordinatePair(
            lat,
            lon
        ) {

            const latitude =
                Number(lat);


            const longitude =
                Number(lon);


            return (
                Number.isFinite(latitude)
                &&
                Number.isFinite(longitude)
                &&
                latitude >= -90
                &&
                latitude <= 90
                &&
                longitude >= -180
                &&
                longitude <= 180
            );

        }



        function updateText(
            id,
            value
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }



        function formatMinutes(
            minutes
        ) {

            const value =
                Number(minutes);


            if (
                !Number.isFinite(value)
            ) {

                return "--";

            }


            const rounded =
                Math.round(
                    value
                );


            if (
                rounded < 60
            ) {

                return rounded +
                    " min";

            }


            const hours =
                Math.floor(
                    rounded / 60
                );


            const mins =
                rounded % 60;


            return (
                hours +
                " h " +
                mins +
                " min"
            );

        }



        function escapeHtml(
            value
        ) {

            return String(
                value ?? ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

        }



        async function readJsonResponse(
            response
        ) {

            const text =
                await response.text();


            try {

                return JSON.parse(
                    text
                );

            } catch (error) {

                console.error(
                    "Non-JSON response:",
                    text
                );


                throw new Error(
                    "Server returned HTML/non-JSON " +
                    "(HTTP " +
                    response.status +
                    "). Check the Django API endpoint."
                );

            }

        }



        function setButtonBusy(
            button,
            busy,
            busyText,
            normalText
        ) {

            if (!button) {

                return;

            }


            if (busy) {

                button.disabled =
                    true;


                button.dataset.oldText =
                    button.textContent;


                button.textContent =
                    busyText;

            } else {

                button.disabled =
                    false;


                button.textContent =
                    normalText ||
                    button.dataset.oldText ||
                    "Calculate Route";

            }

        }



        // ====================================================
        // MAP INITIALIZATION
        // ====================================================

        function initializeMap() {

            if (map) {

                return;

            }


            const mapElement =
                document.getElementById(
                    "map"
                );


            if (!mapElement) {

                console.error(
                    "Map element not found."
                );

                return;

            }


            /*
             * IMPORTANT:
             *
             * This is ONLY the initial fallback view.
             * It is NOT the user's location.
             *
             * GPS will move the marker to the real
             * browser location once the GPS fix arrives.
             */

            map =
                L.map(
                    mapElement
                ).setView(

                    [
                        15.3173,
                        75.7139
                    ],

                    7

                );


            L.tileLayer(

                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

                {

                    maxZoom: 19,

                    attribution:
                        "&copy; OpenStreetMap contributors"

                }

            ).addTo(map);


            setTimeout(

                function () {

                    map.invalidateSize();

                },

                300

            );

        }



        // ====================================================
        // GPS
        // ====================================================

        function setGPSStatus(
            text
        ) {

            if (gpsStatus) {

                gpsStatus.textContent =
                    text;

            }


            if (locationStatus) {

                locationStatus.textContent =
                    text;

            }

        }



        function updateCurrentLocationText() {

            if (
                !validCoordinatePair(
                    currentLatitude,
                    currentLongitude
                )
            ) {

                return;

            }


            const text =
                currentLatitude.toFixed(5) +
                ", " +
                currentLongitude.toFixed(5);


            if (fromLocation) {

                fromLocation.textContent =
                    text;

            }


            setGPSStatus(
                "GPS: Location detected"
            );

        }



        function updateVehicleMarker() {

            if (
                !map
                ||
                !validCoordinatePair(
                    currentLatitude,
                    currentLongitude
                )
            ) {

                return;

            }


            const position = [

                currentLatitude,

                currentLongitude

            ];


            if (!currentLocationMarker) {

                currentLocationMarker =
                    L.marker(
                        position
                    )
                    .addTo(map)
                    .bindPopup(
                        "📍 Current Location"
                    );

            } else {

                currentLocationMarker.setLatLng(
                    position
                );

            }

        }



        function startGPS() {

            if (gpsStarted) {

                return;

            }


            gpsStarted =
                true;


            if (
                !navigator.geolocation
            ) {

                setGPSStatus(
                    "GPS: Not supported"
                );

                return;

            }


            setGPSStatus(
                "GPS: Detecting location..."
            );


            gpsWatchId =
                navigator.geolocation.watchPosition(

                    function (position) {

                        const lat =
                            Number(
                                position.coords.latitude
                            );


                        const lon =
                            Number(
                                position.coords.longitude
                            );


                        if (
                            !validCoordinatePair(
                                lat,
                                lon
                            )
                        ) {

                            console.warn(
                                "Invalid GPS coordinates:",
                                lat,
                                lon
                            );

                            return;

                        }


                        currentLatitude =
                            lat;


                        currentLongitude =
                            lon;


                        console.log(
                            "GPS FIX:",
                            currentLatitude,
                            currentLongitude
                        );


                        updateCurrentLocationText();


                        updateVehicleMarker();


                        /*
                         * Only the FIRST GPS fix changes
                         * the map view automatically.
                         *
                         * Later GPS updates move the marker
                         * but do not constantly move the map.
                         */

                        if (!firstGPSFix) {

                            firstGPSFix =
                                true;


                            map.setView(

                                [
                                    currentLatitude,
                                    currentLongitude
                                ],

                                15

                            );

                        }

                    },


                    function (error) {

                        console.error(
                            "GPS error:",
                            error
                        );


                        if (
                            error.code === 1
                        ) {

                            setGPSStatus(
                                "GPS: Permission denied"
                            );

                        } else if (
                            error.code === 2
                        ) {

                            setGPSStatus(
                                "GPS: Position unavailable"
                            );

                        } else if (
                            error.code === 3
                        ) {

                            setGPSStatus(
                                "GPS: Timeout"
                            );

                        } else {

                            setGPSStatus(
                                "GPS: Error"
                            );

                        }

                    },


                    {

                        enableHighAccuracy:
                            true,

                        maximumAge:
                            5000,

                        timeout:
                            15000

                    }

                );

        }



        // ====================================================
        // CURRENT LOCATION BUTTON
        // ====================================================

        function useCurrentLocation() {

            if (
                !validCoordinatePair(
                    currentLatitude,
                    currentLongitude
                )
            ) {

                alert(
                    "Waiting for current GPS location."
                );

                return;

            }


            if (startInput) {

                startInput.value =
                    "Current Location";


                startInput.dataset.lat =
                    currentLatitude;


                startInput.dataset.lon =
                    currentLongitude;


                startInput.dataset.selected =
                    "true";

            }


            updateCurrentLocationText();


            updateVehicleMarker();


            if (map) {

                map.setView(

                    [
                        currentLatitude,
                        currentLongitude
                    ],

                    16

                );

            }

        }



        if (useCurrentButton) {

            useCurrentButton.addEventListener(
                "click",
                useCurrentLocation
            );

        }



        if (mapLocationButton) {

            mapLocationButton.addEventListener(

                "click",

                function () {

                    if (
                        !validCoordinatePair(
                            currentLatitude,
                            currentLongitude
                        )
                    ) {

                        alert(
                            "Waiting for GPS location."
                        );

                        return;

                    }


                    map.setView(

                        [
                            currentLatitude,
                            currentLongitude
                        ],

                        16

                    );


                    updateVehicleMarker();

                }

            );

        }



        // ========================================================
// SEARCH
// ========================================================

let startSearchTimer = null;

let destinationSearchTimer = null;


// ========================================================
// SEARCH SETUP
// ========================================================

function setupSearch(
    input,
    type
) {

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            const query =
                input.value.trim();


            // The user changed the text.
            // Previous coordinates are no longer valid.

            input.dataset.selected =
                "false";

            input.dataset.lat =
                "";

            input.dataset.lon =
                "";


            if (
                type === "start"
            ) {

                clearTimeout(
                    startSearchTimer
                );

            } else {

                clearTimeout(
                    destinationSearchTimer
                );

            }


            removeSuggestions(
                type
            );


            if (
                query.length < 2
            ) {

                return;

            }


            const timer =
                setTimeout(
                    function () {

                        searchLocations(
                            query,
                            type
                        );

                    },
                    350
                );


            if (
                type === "start"
            ) {

                startSearchTimer =
                    timer;

            } else {

                destinationSearchTimer =
                    timer;

            }

        }
    );

}


// ========================================================
// INITIALIZE BOTH SEARCH BOXES
// ========================================================

setupSearch(
    startInput,
    "start"
);


setupSearch(
    destinationInput,
    "destination"
);


// ========================================================
// SEARCH LOCATIONS
// ========================================================

async function searchLocations(
    query,
    type
) {

    try {

        showSearchMessage(
            "Searching...",
            type
        );


        const response =
            await fetch(

                "/api/search/?q=" +
                encodeURIComponent(
                    query
                ),

                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }

            );


        const data =
            await readJsonResponse(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                data.error ||
                "Search failed."
            );

        }


        let results =
            Array.isArray(
                data.results
            )
                ?
                data.results
                :
                [];


        // =================================================
        // VALIDATE COORDINATES
        // =================================================

        results =
            results.filter(
                function (item) {

                    return validCoordinatePair(

                        getLatitude(
                            item
                        ),

                        getLongitude(
                            item
                        )

                    );

                }
            );


        // =================================================
        // LOCAL SEARCH FALLBACK
        // =================================================

        if (
            results.length === 0
        ) {

            const lower =
                query.toLowerCase();


            const fallbackQueries = [];


            if (
                lower.startsWith(
                    "chikkab"
                )
            ) {

                fallbackQueries.push(
                    "Chikkabanavara Karnataka India"
                );

            }


            if (
                lower.startsWith(
                    "chitrad"
                )
            ) {

                fallbackQueries.push(
                    "Chitradurga Karnataka India"
                );

            }


            if (
                lower.startsWith(
                    "hiriy"
                )
            ) {

                fallbackQueries.push(
                    "Hiriyur Karnataka India"
                );

            }


            if (
                lower.startsWith(
                    "gowdanah"
                )
            ) {

                fallbackQueries.push(
                    "Gowdanahalli Hiriyur Karnataka India"
                );

            }


            for (
                const fallback of
                fallbackQueries
            ) {

                try {

                    const fallbackResponse =
                        await fetch(

                            "/api/search/?q=" +
                            encodeURIComponent(
                                fallback
                            ),

                            {
                                method: "GET",

                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }

                        );


                    const fallbackData =
                        await readJsonResponse(
                            fallbackResponse
                        );


                    if (
                        Array.isArray(
                            fallbackData.results
                        )
                    ) {

                        results =
                            fallbackData.results.filter(
                                function (item) {

                                    return validCoordinatePair(

                                        getLatitude(
                                            item
                                        ),

                                        getLongitude(
                                            item
                                        )

                                    );

                                }
                            );

                    }


                    if (
                        results.length > 0
                    ) {

                        break;

                    }

                }
                catch (
                    fallbackError
                ) {

                    console.warn(
                        "Fallback search failed:",
                        fallbackError
                    );

                }

            }

        }


        // =================================================
        // SHOW RESULTS
        // =================================================

        if (
            results.length === 0
        ) {

            showSearchMessage(
                "No locations found",
                type
            );

            return;

        }


        showSuggestions(
            results.slice(
                0,
                10
            ),
            type
        );

    }
    catch (error) {

        console.error(
            "Search error:",
            error
        );


        showSearchMessage(
            "Search failed",
            type
        );

    }

}


// ========================================================
// GET LATITUDE
// ========================================================

function getLatitude(
    item
) {

    if (!item) {
        return null;
    }


    const value =
        item.lat ??
        item.latitude;


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ?
        number
        :
        null;

}


// ========================================================
// GET LONGITUDE
// ========================================================

function getLongitude(
    item
) {

    if (!item) {
        return null;
    }


    const value =
        item.lon ??
        item.lng ??
        item.longitude;


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ?
        number
        :
        null;

}


// ========================================================
// SUGGESTION ELEMENT
// ========================================================

function getSuggestionsElement(
    type
) {

    return document.getElementById(

        type === "start"
            ?
            "startSuggestions"
            :
            "destinationSuggestions"

    );

}


// ========================================================
// REMOVE SUGGESTIONS
// ========================================================

function removeSuggestions(
    type
) {

    const box =
        getSuggestionsElement(
            type
        );


    if (box) {

    box.innerHTML =
        "";

    box.style.display =
        "none";

}

}


// ========================================================
// SEARCH MESSAGE
// ========================================================

function showSearchMessage(
    message,
    type
) {

    const box =
        getSuggestionsElement(
            type
        );


    if (!box) {
        return;
    }


    box.innerHTML = "";


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        "search-message";


    messageElement.textContent =
        message;


    box.appendChild(
        messageElement
    );

}


// ========================================================
// SHOW SUGGESTIONS
// ========================================================

function showSuggestions(
    results,
    type
) {

    const box =
        getSuggestionsElement(
            type
        );


    if (!box) {
        return;
    }


    box.innerHTML =
        "";
    box.style.display =
        "block";


    results.forEach(
        function (result) {

            const lat =
                getLatitude(
                    result
                );


            const lon =
                getLongitude(
                    result
                );


            if (
                !validCoordinatePair(
                    lat,
                    lon
                )
            ) {

                return;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "suggestion";


            button.textContent =
                result.name ||
                result.display_name ||
                "Unknown location";


            button.addEventListener(
                "click",
                function () {

                    const input =
                        type === "start"
                            ?
                            startInput
                            :
                            destinationInput;


                    if (!input) {
                        return;
                    }


                    // =========================================
                    // SAVE SELECTED LOCATION
                    // =========================================

                    input.value =
                        result.name ||
                        result.display_name ||
                        "Selected Location";


                    input.dataset.lat =
                        lat;


                    input.dataset.lon =
                        lon;


                    input.dataset.selected =
                        "true";


                    // =========================================
                    // CLOSE SUGGESTIONS
                    // =========================================

                    removeSuggestions(
                        type
                    );


                    // =========================================
                    // MOVE MAP
                    // =========================================

                    if (map) {

                        map.setView(
                            [
                                lat,
                                lon
                            ],
                            15
                        );

                    }


                    // =========================================
                    // START LOCATION
                    // =========================================

                    if (
                        type === "start"
                    ) {

                        console.log(
                            "Start selected:",
                            lat,
                            lon
                        );

                    }


                    // =========================================
                    // DESTINATION
                    // =========================================

                    if (
                        type === "destination"
                    ) {

                        console.log(
                            "Destination selected:",
                            lat,
                            lon
                        );

                    }

                }
            );


            box.appendChild(
                button
            );

        }
    );


    if (
        box.children.length === 0
    ) {

        showSearchMessage(
            "No valid locations found",
            type
        );

    }

}


        // ====================================================
        // ROUTE
        // ====================================================

        async function requestRoute(

            startLat,
            startLon,
            endLat,
            endLon

        ) {

            if (
                !validCoordinatePair(
                    startLat,
                    startLon
                )
                ||
                !validCoordinatePair(
                    endLat,
                    endLon
                )
            ) {

                throw new Error(
                    "Invalid route coordinates."
                );

            }


            const url =
                "/api/calculate-route/?" +

                "start_lat=" +
                encodeURIComponent(
                    startLat
                ) +

                "&start_lon=" +
                encodeURIComponent(
                    startLon
                ) +

                "&end_lat=" +
                encodeURIComponent(
                    endLat
                ) +

                "&end_lon=" +
                encodeURIComponent(
                    endLon
                );


            console.log(
                "ROUTE REQUEST:",
                url
            );


            const response =
                await fetch(

                    url,

                    {

                        method:
                            "GET",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    }

                );


            const data =
                await readJsonResponse(
                    response
                );


            if (
                !response.ok
                ||
                !data.success
            ) {

                throw new Error(

                    data.error ||
                    "Route calculation failed."

                );

            }


            return data;

        }



        function drawOriginalRoute(
            geometry
        ) {

            if (!map) {

                return;

            }


            if (originalRouteLine) {

                map.removeLayer(
                    originalRouteLine
                );

                originalRouteLine =
                    null;

            }


            if (
                !Array.isArray(
                    geometry
                )
                ||
                geometry.length < 2
            ) {

                return;

            }


            originalRouteLine =
                L.polyline(

                    geometry,

                    {

                        weight:
                            6,

                        opacity:
                            0.75

                    }

                )
                .addTo(map);

        }



        function drawSelectedRoute(
            geometry
        ) {

            if (!map) {

                return;

            }


            if (routeLine) {

                map.removeLayer(
                    routeLine
                );

                routeLine =
                    null;

            }


            if (
                !Array.isArray(
                    geometry
                )
                ||
                geometry.length < 2
            ) {

                return;

            }


            routeLine =
                L.polyline(

                    geometry,

                    {

                        weight:
                            7,

                        opacity:
                            0.95

                    }

                )
                .addTo(map);

        }



        function updateRouteInformation(
            route
        ) {

            if (!route) {

                return;

            }


            const distance =
                Number(
                    route.distance_km
                );


            const duration =
                Number(
                    route.duration_min
                );


            if (
                Number.isFinite(
                    distance
                )
            ) {

                updateText(
                    "distance",
                    distance.toFixed(2) +
                    " km"
                );

            }


            if (
                Number.isFinite(
                    duration
                )
            ) {

                updateText(
                    "travelTime",
                    formatMinutes(
                        duration
                    )
                );

            }


            originalRouteDistance =
                Number(
                    route.distance_km
                )
                ||
                0;


            updateText(
                "originalRouteDistance",
                originalRouteDistance.toFixed(2) +
                " km"
            );

        }



        async function navigateToDestination() {

            removeSuggestions(
                "destination"
            );


            if (
                !validCoordinatePair(
                    currentLatitude,
                    currentLongitude
                )
            ) {

                alert(
                    "Waiting for current GPS location."
                );

                return;

            }


            const text =
                destinationInput
                    ?
                    destinationInput.value.trim()
                    :
                    "";


            if (!text) {

                alert(
                    "Please enter a destination."
                );

                return;

            }


            setButtonBusy(

                navigateButton,

                true,

                "⏳ CALCULATING...",

                "🧭 Calculate Route"

            );


            try {

                let latitude =
                    destinationInput.dataset.lat;


                let longitude =
                    destinationInput.dataset.lon;


                /*
                 * If user typed the location manually
                 * instead of clicking a suggestion,
                 * search it.
                 */

                if (
                    !validCoordinatePair(
                        latitude,
                        longitude
                    )
                ) {

                    let results =
                        [];


                    try {

                        results =
                            await backendSearch(
                                text
                            );

                    } catch (error) {

                        console.warn(
                            error
                        );

                    }


                    results =
                        results.filter(

                            function (item) {

                                return validCoordinatePair(

                                    getSearchLatitude(
                                        item
                                    ),

                                    getSearchLongitude(
                                        item
                                    )

                                );

                            }

                        );


                    if (
                        results.length === 0
                    ) {

                        results =
                            await nominatimSearch(
                                text
                            );

                    }


                    const first =
                        results.find(

                            function (item) {

                                return validCoordinatePair(

                                    getSearchLatitude(
                                        item
                                    ),

                                    getSearchLongitude(
                                        item
                                    )

                                );

                            }

                        );


                    if (!first) {

                        throw new Error(
                            "Destination not found."
                        );

                    }


                    latitude =
                        getSearchLatitude(
                            first
                        );


                    longitude =
                        getSearchLongitude(
                            first
                        );

                }


                await setDestination(

                    text,

                    Number(
                        latitude
                    ),

                    Number(
                        longitude
                    ),

                    true

                );


            } catch (error) {

                console.error(
                    "Navigation error:",
                    error
                );


                alert(
                    error.message ||
                    "Navigation error."
                );

            } finally {

                setButtonBusy(

                    navigateButton,

                    false,

                    "⏳ CALCULATING...",

                    "🧭 Calculate Route"

                );

            }

        }



        if (navigateButton) {

            navigateButton.addEventListener(

                "click",

                navigateToDestination

            );

        }



// ============================================================
// SET DESTINATION + CALCULATE ROUTE
// ============================================================

async function setDestination(

    name,
    latitude,
    longitude,
    findStations

) {

    latitude =
        Number(latitude);

    longitude =
        Number(longitude);


    if (
        !validCoordinatePair(
            latitude,
            longitude
        )
    ) {

        throw new Error(
            "Invalid destination coordinates."
        );

    }


    // ========================================================
    // DESTINATION
    // ========================================================

    originalDestinationName =
        name;

    originalDestinationLat =
        latitude;

    originalDestinationLon =
        longitude;


    // ========================================================
    // START
    //
    // Priority:
    // 1. Selected Start Location
    // 2. Current GPS Location
    // ========================================================

    let startLat = null;
    let startLon = null;


    if (
        startInput
        &&
        validCoordinatePair(
            startInput.dataset.lat,
            startInput.dataset.lon
        )
    ) {

        startLat =
            Number(
                startInput.dataset.lat
            );

        startLon =
            Number(
                startInput.dataset.lon
            );

        console.log(
            "USING SELECTED START:",
            startLat,
            startLon
        );

    } else {

        if (
            !validCoordinatePair(
                currentLatitude,
                currentLongitude
            )
        ) {

            throw new Error(
                "Please select a starting location or wait for GPS."
            );

        }

        startLat =
            Number(
                currentLatitude
            );

        startLon =
            Number(
                currentLongitude
            );

        console.log(
            "USING CURRENT GPS START:",
            startLat,
            startLon
        );

    }


    originalStartLat =
        startLat;

    originalStartLon =
        startLon;


    selectedStation =
        null;


    // ========================================================
    // UPDATE DESTINATION INPUT
    // ========================================================

    if (destinationInput) {

        destinationInput.value =
            name;

        destinationInput.dataset.lat =
            latitude;

        destinationInput.dataset.lon =
            longitude;

        destinationInput.dataset.selected =
            "true";

    }


    updateText(
        "destination",
        name
    );


    // ========================================================
    // CALCULATE ROUTE
    // ========================================================

    const route =
        await requestRoute(

            startLat,
            startLon,

            latitude,
            longitude

        );


    if (!route) {

        return;

    }


    currentRoute =
        route;


    originalRouteDistance =
        Number(
            route.distance_km
        )
        ||
        0;


    // ========================================================
    // DRAW ROUTE
    // ========================================================

    drawOriginalRoute(
        route.geometry
    );


    // ========================================================
    // DESTINATION MARKER
    // ========================================================

    if (
        destinationMarker
    ) {

        map.removeLayer(
            destinationMarker
        );

    }


    destinationMarker =
        L.marker(

            [
                latitude,
                longitude
            ]

        )
        .addTo(map)
        .bindPopup(

            "<b>📍 " +
            escapeHtml(name) +
            "</b>"

        );


    // ========================================================
    // ROUTE INFORMATION
    // ========================================================

    updateRouteInformation(
        route
    );


    updateText(
        "traffic",
        route.traffic ||
        "Available"
    );


    updateText(
        "elevation",
        route.elevation ||
        "--"
    );


    updateText(
        "roadType",
        route.road_type ||
        route.roadType ||
        "--"
    );


    // ========================================================
    // EV RANGE CHECK
    // ========================================================

    calculateEVEstimate(

        Number(
            route.distance_km
        )
        ||
        0

    );


    // ========================================================
    // KEEP ROUTE VISIBLE
    // ========================================================

    if (
        Array.isArray(
            route.geometry
        )
        &&
        route.geometry.length > 1
    ) {

        map.fitBounds(

            L.latLngBounds(
                route.geometry
            ),

            {
                padding:
                    [30, 30]
            }

        );

    }


    // ========================================================
    // STATIONS
    //
    // IMPORTANT:
    // Stations are an OVERLAY.
    // They do not replace the route.
    // ========================================================

    if (
        findStations
    ) {

        await loadNearbyStations();

    }

}



        // ====================================================
        // EV ESTIMATION
        // ====================================================

        function calculateEVEstimate(
            distanceKm
        ) {

            if (
                !Number.isFinite(
                    distanceKm
                )
                ||
                distanceKm < 0
            ) {

                return;

            }


            const consumptionFactor =
                modeConsumption[
                    selectedDrivingMode
                ] || 1;


            /*
             * Demo/project estimate.
             *
             * 1% battery per km base.
             * This can later be replaced by
             * the ML model / ESP32 data.
             */

            const chargeConsumed =
                distanceKm *
                1.0 *
                consumptionFactor;


            const finalBattery =
                Math.max(

                    0,

                    battery -
                    chargeConsumed

                );


            const estimatedRange =
                battery /
                (
                    1.0 *
                    consumptionFactor
                );


            updateText(

                "consumption",

                chargeConsumed.toFixed(1) +
                "%"

            );


            updateText(

                "destinationBattery",

                finalBattery.toFixed(1) +
                "%"

            );


            updateText(

                "range",

                estimatedRange.toFixed(1) +
                " km"

            );


            updateText(

                "reachability",

                finalBattery > 0
                    ?
                    "YES"
                    :
                    "NO"

            );

        }



        // ====================================================
        // STATION COORDINATES
        // ====================================================

        function getStationCoordinates(
            station
        ) {

            if (!station) {

                return null;

            }


            let lat =
                station.lat ??
                station.latitude;


            let lon =
                station.lon ??
                station.lng ??
                station.longitude;


            /*
             * Handle geometry:
             *
             * geometry.coordinates = [lon, lat]
             */

            if (
                !validCoordinatePair(
                    lat,
                    lon
                )
                &&
                station.geometry
                &&
                Array.isArray(
                    station.geometry.coordinates
                )
            ) {

                const coordinates =
                    station.geometry.coordinates;


                if (
                    coordinates.length >= 2
                ) {

                    lon =
                        coordinates[0];


                    lat =
                        coordinates[1];

                }

            }


            /*
             * Handle nested location object.
             */

            if (
                !validCoordinatePair(
                    lat,
                    lon
                )
                &&
                station.location
            ) {

                lat =
                    station.location.lat ??
                    station.location.latitude;


                lon =
                    station.location.lon ??
                    station.location.lng ??
                    station.location.longitude;

            }


            lat =
                Number(
                    lat
                );


            lon =
                Number(
                    lon
                );


            if (
                !validCoordinatePair(
                    lat,
                    lon
                )
            ) {

                return null;

            }


            return {

                lat:
                    lat,

                lon:
                    lon

            };

        }



        // ====================================================
        // CLEAR STATION MARKERS
        // ====================================================

        function clearStationMarkers() {

            if (!map) {

                return;

            }


            stationMarkers.forEach(

                function (marker) {

                    if (
                        marker
                        &&
                        map.hasLayer(
                            marker
                        )
                    ) {

                        map.removeLayer(
                            marker
                        );

                    }

                }

            );


            stationMarkers =
                [];

        }



        // ====================================================
        // STATION LIST MESSAGE
        // ====================================================

        function setStationListMessage(
            message
        ) {

            if (stationList) {

                stationList.innerHTML =
                    `<div class="station-empty">${
                        message
                    }</div>`;

            }

        }



        function updateChargingStatus(
            text
        ) {

            if (chargingStatus) {

                chargingStatus.textContent =
                    text;

            }


            if (stationStatus) {

                stationStatus.textContent =
                    text;

            }

        }



        // ====================================================
        // ADD STATION MARKER
        // ====================================================

        function addStationMarker(

            station,
            coordinates

        ) {

            if (
                !map
                ||
                !coordinates
                ||
                !validCoordinatePair(
                    coordinates.lat,
                    coordinates.lon
                )
            ) {

                return null;

            }


            /*
             * THIS CHECK PREVENTS:
             *
             * Invalid LatLng object:
             * (undefined, undefined)
             */

            const lat =
                Number(
                    coordinates.lat
                );


            const lon =
                Number(
                    coordinates.lon
                );


            if (
                !validCoordinatePair(
                    lat,
                    lon
                )
            ) {

                console.warn(
                    "Skipping invalid station:",
                    station
                );

                return null;

            }


            const marker =
                L.marker(

                    [
                        lat,
                        lon
                    ]

                )
                .addTo(map);


            const name =
                station.name ||
                station.title ||
                station.operator ||
                "Charging Station";


            marker.bindPopup(

                "<b>⚡ " +
                escapeHtml(name) +
                "</b>"

            );


            marker.on(

                "click",

                function () {

                    selectedStation =
                        station;

                }

            );


            stationMarkers.push(
                marker
            );


            return marker;

        }



// ============================================================
// CREATE CHARGING STATION CARD
// ============================================================

function createStationCard(station) {

    const card =
        document.createElement("div");


    card.className =
        "station-card";


    // ========================================================
    // STATION NAME
    // ========================================================

    const name =
        station.name
        ||
        "Charging Station";


    // ========================================================
    // COORDINATES
    // ========================================================

    const coordinates =
        station.coordinates
        ||
        {
            lat:
                station.lat,

            lon:
                station.lon
        };


    const stationLat =
        Number(
            coordinates.lat
        );


    const stationLon =
        Number(
            coordinates.lon
        );


    // ========================================================
    // DISTANCE
    // ========================================================

    const distance =
        Number(
            station.distance_km
        );


    let distanceText =
        "Distance unavailable";


    if (
        Number.isFinite(
            distance
        )
    ) {

        distanceText =
            distance.toFixed(1) +
            " km from current location";

    }


    // ========================================================
    // CARD CONTENT
    // ========================================================

    card.innerHTML = `

        <div class="station-name">
            ⚡ ${escapeHtml(name)}
        </div>

        <div class="station-distance">
            📍 ${escapeHtml(distanceText)}
        </div>

        <div class="station-action">
            Click to select
        </div>

    `;


    // ========================================================
    // STATION CLICK
    // ========================================================

    card.addEventListener(

        "click",

        async function () {

            selectedStation =
                station;


            // =================================================
            // CHECK STATION COORDINATES
            // =================================================

            if (
                !validCoordinatePair(
                    stationLat,
                    stationLon
                )
            ) {

                console.error(
                    "Invalid charging station coordinates:",
                    station
                );

                return;

            }


            // =================================================
            // CHECK WHETHER DESTINATION EXISTS
            // =================================================

            const destinationExists =

                destinationInput

                &&

                validCoordinatePair(

                    destinationInput.dataset.lat,

                    destinationInput.dataset.lon

                );


            // =================================================
            // NO DESTINATION
            //
            // Station becomes destination.
            // =================================================

            if (
                !destinationExists
            ) {

                try {

                    await setDestination(

                        name,

                        stationLat,

                        stationLon,

                        true

                    );

                }

                catch (error) {

                    console.error(

                        "Station destination error:",

                        error

                    );


                    alert(

                        error.message

                        ||

                        "Unable to use charging station as destination."

                    );

                }


                return;

            }


            // =================================================
            // DESTINATION ALREADY EXISTS
            //
            // DO NOT CHANGE DESTINATION.
            // DO NOT RECALCULATE ROUTE.
            // =================================================

            if (
                map
            ) {

                map.setView(

                    [
                        stationLat,
                        stationLon
                    ],

                    16

                );

            }


            // =================================================
            // UPDATE CHARGING STATION INFORMATION
            // =================================================

            updateText(

                "chargingStation",

                name

            );


            updateText(

                "deviationValue",

                name

            );


            console.log(

                "Charging station selected:",

                station

            );

        }

    );


    return card;

}

        // ====================================================
        // DISPLAY STATIONS
        // ====================================================

        function displayStations(
            stations
        ) {

            clearStationMarkers();


            if (stationList) {

                stationList.innerHTML =
                    "";

            }


            if (
                !Array.isArray(
                    stations
                )
                ||
                stations.length === 0
            ) {

                setStationListMessage(
                    "⚡ No charging stations found."
                );

                return;

            }


            let validCount =
                0;


            stations.forEach(

                function (station) {

                    const coordinates =
                        getStationCoordinates(
                            station
                        );


                    /*
                     * NEVER send undefined
                     * coordinates to Leaflet.
                     */

                    if (!coordinates) {

                        console.warn(
                            "Station skipped because coordinates are invalid:",
                            station
                        );

                        return;

                    }


                    validCount++;


                    addStationMarker(

                        station,

                        coordinates

                    );


                    if (stationList) {

                        stationList.appendChild(

                            createStationCard(

                                station,

                                coordinates

                            )

                        );

                    }

                }

            );


            if (
                validCount === 0
            ) {

                setStationListMessage(

                    "⚡ Stations were returned, " +
                    "but none contained valid map coordinates."

                );

            }

        }



// ============================================================
// LOAD NEARBY STATIONS
//
// Stations are ALWAYS sorted from current GPS location.
// Existing route is NEVER removed.
// ============================================================

async function loadNearbyStations() {

    if (
        !validCoordinatePair(
            currentLatitude,
            currentLongitude
        )
    ) {

        updateChargingStatus(
            "Waiting for current GPS location..."
        );

        return;

    }


    updateChargingStatus(
        "Searching nearby charging stations..."
    );


    setStationListMessage(
        "⏳ Searching nearby stations..."
    );


    try {

        const url =
            "/api/charging-stations/?" +

            "lat=" +
            encodeURIComponent(
                currentLatitude
            ) +

            "&lon=" +
            encodeURIComponent(
                currentLongitude
            ) +

            "&radius=25";


        console.log(
            "Nearby charging API:",
            url
        );


        const response =
            await fetch(

                url,

                {
                    method:
                        "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }

                }

            );


        const data =
            await readJsonResponse(
                response
            );


        if (
            !response.ok
            ||
            !data.success
        ) {

            throw new Error(

                data.error
                ||
                "Nearby station search failed."

            );

        }


        let stations =
            Array.isArray(
                data.stations
            )
                ?
                data.stations
                :
                [];


        // ====================================================
        // SORT NEAREST → FARTHEST
        // FROM CURRENT GPS LOCATION
        // ====================================================

        stations.sort(

            function (a, b) {

                const distanceA =
                    Number(
                        a.distance_km
                    );

                const distanceB =
                    Number(
                        b.distance_km
                    );


                return (

                    (Number.isFinite(distanceA)
                        ? distanceA
                        : 999999)

                    -

                    (Number.isFinite(distanceB)
                        ? distanceB
                        : 999999)

                );

            }

        );


        // ====================================================
        // DISPLAY STATIONS
        //
        // Does NOT touch routeLine/originalRouteLine.
        // ====================================================

        displayStations(
            stations
        );


        updateChargingStatus(

            stations.length +
            " charging station(s) found — nearest first."

        );


        console.log(
            "Stations sorted from current location:",
            stations
        );


    } catch (error) {

        console.error(
            "Nearby station error:",
            error
        );


        setStationListMessage(

            "⚠ " +
            escapeHtml(
                error.message
            )

        );


        updateChargingStatus(
            "Charging station search failed."
        );

    }

}



        if (nearbyButton) {

            nearbyButton.addEventListener(

                "click",

                loadNearbyStations

            );

        }



        if (mapChargingButton) {

            mapChargingButton.addEventListener(

                "click",

                loadNearbyStations

            );

        }



        // ====================================================
// NEARBY CHARGING
// ====================================================

async function loadNearbyStations() {

    if (
        !validCoordinatePair(
            currentLatitude,
            currentLongitude
        )
    ) {

        alert(
            "Waiting for current GPS location."
        );

        return;

    }


    updateChargingStatus(
        "Searching nearby stations..."
    );


    setStationListMessage(
        "⏳ Searching..."
    );


    try {

        const url =
            "/api/charging-stations/?" +

            "lat=" +
            encodeURIComponent(
                currentLatitude
            ) +

            "&lon=" +
            encodeURIComponent(
                currentLongitude
            ) +

            "&radius=25";


        console.log(
            "Nearby charging API:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await readJsonResponse(
                response
            );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Nearby station search failed."
            );

        }


        const stations =
            Array.isArray(
                data.stations
            )
                ? data.stations
                : [];


        displayStations(
            stations
        );


        updateChargingStatus(

            stations.length +
            " charging station(s) found."

        );


        if (
            map &&
            validCoordinatePair(
                currentLatitude,
                currentLongitude
            )
        ) {

            map.setView(
                [
                    currentLatitude,
                    currentLongitude
                ],
                14
            );

        }

    }
    catch (error) {

        console.error(
            "Nearby station error:",
            error
        );


        setStationListMessage(

            "⚠ " +
            escapeHtml(
                error.message
            )

        );


        updateChargingStatus(
            "Charging station search failed."
        );

    }

}


        // ====================================================
        // VEHICLE SPEEDOMETER
        // ====================================================

        function updateSpeedometer(
            speed
        ) {

            speed =
                Number(
                    speed
                )
                ||
                0;


            speed =
                Math.max(
                    0,
                    Math.min(
                        100,
                        speed
                    )
                );


            if (
                speed < 0.5
            ) {

                speed =
                    0;

            }


            if (speedDisplay) {

                speedDisplay.textContent =
                    Math.round(
                        speed
                    );

            }


            if (acceleratorSpeed) {

                acceleratorSpeed.textContent =
                    Math.round(
                        speed
                    );

            }

        }



        // ====================================================
        // UPDATE TARGET SPEED
        // ====================================================

        function updateTargetSpeed() {

            if (
                !driving
                ||
                currentMode !== "drive"
            ) {

                targetSpeed =
                    0;

            } else {

                const percentage =
                    Number(
                        accelerator?.value ||
                        0
                    );


                const maximumSpeed =
                    modeLimits[
                        selectedDrivingMode
                    ];


                targetSpeed =
                    (
                        percentage /
                        100
                    )
                    *
                    maximumSpeed;

            }

        }



        // ====================================================
        // VEHICLE LOOP
        // ====================================================

        function vehicleLoop(
            now
        ) {

            const dt =
                Math.min(

                    (
                        now -
                        lastMotionTime
                    )
                    /
                    1000,

                    0.1

                );


            lastMotionTime =
                now;


            updateTargetSpeed();


            if (braking) {

                currentSpeed -=
                    80 *
                    dt;

            } else if (
                currentSpeed <
                targetSpeed
            ) {

                currentSpeed +=
                    25 *
                    dt;

            } else if (
                currentSpeed >
                targetSpeed
            ) {

                currentSpeed -=
                    18 *
                    dt;

            }


            currentSpeed =
                Math.max(

                    0,

                    Math.min(
                        100,
                        currentSpeed
                    )

                );


            updateSpeedometer(
                currentSpeed
            );


            /*
             * Simple demo battery movement.
             *
             * Later this can be replaced with
             * ESP32 battery percentage.
             */

            if (
                driving
                &&
                currentSpeed > 0
            ) {

                const consumption =
                    0.002 *
                    modeConsumption[
                        selectedDrivingMode
                    ] *
                    currentSpeed *
                    dt;


                battery -=
                    consumption;


                battery =
                    Math.max(
                        0,
                        battery
                    );


                const distance =
                    (
                        currentSpeed *
                        dt
                    )
                    /
                    3600;


                odometer +=
                    distance;


                tripDistance +=
                    distance;

            }


            updateVehicleDisplays();


            requestAnimationFrame(
                vehicleLoop
            );

        }



        function updateVehicleDisplays() {

            if (batteryDisplay) {

                batteryDisplay.textContent =
                    Math.round(
                        battery
                    );

            }


            if (batteryBar) {

                batteryBar.style.width =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            battery
                        )
                    ) +
                    "%";

            }


            if (odometerDisplay) {

                odometerDisplay.textContent =
                    odometer.toFixed(
                        2
                    );

            }


            if (tripDistanceDisplay) {

                tripDistanceDisplay.textContent =
                    tripDistance.toFixed(
                        2
                    );

            }


            if (driveStatus) {

                if (
                    currentMode ===
                    "park"
                ) {

                    driveStatus.textContent =
                        "PARKED";

                } else if (
                    braking
                ) {

                    driveStatus.textContent =
                        "BRAKING";

                } else if (
                    driving
                ) {

                    driveStatus.textContent =
                        "DRIVING";

                } else {

                    driveStatus.textContent =
                        "READY";

                }

            }

        }



        // ====================================================
        // ENTER PARK
        // ====================================================

        function enterParkMode() {

            currentMode =
                "park";


            driving =
                false;


            braking =
                false;


            targetSpeed =
                0;


            currentSpeed =
                0;


            if (accelerator) {

                accelerator.disabled =
                    true;


                accelerator.value =
                    0;

            }


            if (brakePedal) {

                brakePedal.disabled =
                    true;

            }


            updateSpeedometer(
                0
            );


            updateVehicleDisplays();

        }



        // ====================================================
        // ENTER DRIVE
        // ====================================================

        function enterDriveMode() {

            currentMode =
                "drive";


            driving =
                true;


            braking =
                false;


            if (accelerator) {

                accelerator.disabled =
                    false;

            }


            if (brakePedal) {

                brakePedal.disabled =
                    false;

            }


            updateVehicleDisplays();

        }



        // ====================================================
        // RUN
        // ====================================================

        function runVehicle() {

            if (
                currentMode ===
                "park"
            ) {

                enterDriveMode();

            }


            driving =
                true;


            updateVehicleDisplays();

        }



        // ====================================================
        // DRIVE BUTTON
        // ====================================================

        if (driveButton) {

            driveButton.addEventListener(

                "click",

                function () {

                    enterDriveMode();

                }

            );

        }



        // ====================================================
        // PARK BUTTON
        // ====================================================

        if (parkButton) {

            parkButton.addEventListener(

                "click",

                function () {

                    enterParkMode();

                }

            );

        }



        // ====================================================
        // RUN BUTTON
        // ====================================================

        if (runButton) {

            runButton.addEventListener(

                "click",

                function () {

                    runVehicle();

                }

            );

        }



        // ====================================================
        // START RIDE
        // ====================================================

        if (startRide) {

            startRide.addEventListener(

                "click",

                function () {

                    enterDriveMode();

                }

            );

        }



        // ====================================================
        // STOP RIDE
        // ====================================================

        if (stopRide) {

            stopRide.addEventListener(

                "click",

                function () {

                    enterParkMode();

                }

            );

        }



        // ====================================================
        // ACCELERATOR
        // ====================================================

        if (accelerator) {

            accelerator.addEventListener(

                "input",

                function () {

                    updateTargetSpeed();

                }

            );

        }



        // ====================================================
        // BRAKE
        // ====================================================

        if (brakePedal) {

            brakePedal.addEventListener(

                "mousedown",

                function () {

                    if (
                        currentMode !==
                        "drive"
                    ) {

                        return;

                    }


                    braking =
                        true;

                }

            );


            brakePedal.addEventListener(

                "mouseup",

                function () {

                    braking =
                        false;

                }

            );


            brakePedal.addEventListener(

                "mouseleave",

                function () {

                    braking =
                        false;

                }

            );


            brakePedal.addEventListener(

                "touchstart",

                function (event) {

                    event.preventDefault();


                    if (
                        currentMode !==
                        "drive"
                    ) {

                        return;

                    }


                    braking =
                        true;

                }

            );


            brakePedal.addEventListener(

                "touchend",

                function () {

                    braking =
                        false;

                }

            );

        }



        // ====================================================
        // DRIVING MODES
        // ====================================================

        function selectDrivingMode(
            mode
        ) {

            if (
                !modeLimits[
                    mode
                ]
            ) {

                return;

            }


            selectedDrivingMode =
                mode;


            const buttons = [

                ecoMode,

                normalMode,

                sportMode

            ];


            buttons.forEach(

                function (button) {

                    if (!button) {

                        return;

                    }


                    button.classList.toggle(

                        "active",

                        button.dataset.mode ===
                        mode

                    );

                }

            );


            if (selectedModeDisplay) {

                selectedModeDisplay.textContent =
                    mode;

            }


            updateTargetSpeed();


            /*
             * Recalculate EV estimate
             * if a route already exists.
             */

            if (
                originalRouteDistance >
                0
            ) {

                calculateEVEstimate(
                    originalRouteDistance
                );

            }

        }



        if (ecoMode) {

            ecoMode.addEventListener(

                "click",

                function () {

                    selectDrivingMode(
                        "Eco"
                    );

                }

            );

        }


        if (normalMode) {

            normalMode.addEventListener(

                "click",

                function () {

                    selectDrivingMode(
                        "Normal"
                    );

                }

            );

        }


        if (sportMode) {

            sportMode.addEventListener(

                "click",

                function () {

                    selectDrivingMode(
                        "Sport"
                    );

                }

            );

        }



        // ====================================================
        // INITIALIZATION
        // ====================================================

        initializeMap();


        enterParkMode();


        selectDrivingMode(
            "Eco"
        );


        updateVehicleDisplays();


        updateChargingStatus(
            "Ready"
        );


        startGPS();


        requestAnimationFrame(
            vehicleLoop
        );


        console.log(
            "EV Smart Navigation initialized."
        );

    }

);