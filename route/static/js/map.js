// ============================================================
// EV SMART DRIVE
// DIGITAL SPEED VERSION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {


    // ========================================================
    // ELEMENTS
    // ========================================================

    const startRide =
        document.getElementById("startRide");

    const stopRide =
        document.getElementById("stopRide");


    const accelerator =
        document.getElementById("accelerator");

    const brakePedal =
        document.getElementById("brakePedal");


    const parkingMode =
        document.getElementById("parkingMode");

    const drivingMode =
        document.getElementById("driveMode");


    const speedDisplay =
        document.getElementById("speed");

    const acceleratorSpeed =
        document.getElementById("acceleratorSpeed");


    const driveStatus =
        document.getElementById("driveStatus");

    const selectedModeDisplay =
        document.getElementById("selectedMode");


    const batteryDisplay =
        document.getElementById("battery");

    const batteryBar =
        document.getElementById("batteryBar");


    const odometerDisplay =
        document.getElementById("odometer");

    const tripDistanceDisplay =
        document.getElementById("tripDistance");


    const fromLocation =
        document.getElementById("fromLocation");

    const destinationInput =
        document.getElementById("destinationInput");

    const navigateButton =
        document.getElementById("navigateButton");


    const distanceDisplay =
        document.getElementById("distance");

    const travelTimeDisplay =
        document.getElementById("travelTime");


    const locationStatus =
        document.getElementById("locationStatus");


    const trafficDisplay =
        document.getElementById("traffic");

    const elevationDisplay =
        document.getElementById("elevation");

    const roadDisplay =
        document.getElementById("roadType");

    const chargingDisplay =
        document.getElementById("chargingStation");


    const consumptionDisplay =
        document.getElementById("consumption");

    const destinationBatteryDisplay =
        document.getElementById("destinationBattery");

    const rangeDisplay =
        document.getElementById("range");

    const reachabilityDisplay =
        document.getElementById("reachability");



    // ========================================================
    // STATE
    // ========================================================

    const modeLimits = {

        Eco: 40,

        Normal: 60,

        Sport: 100

    };


    let selectedDrivingMode = "Eco";


    let driving = false;

    let braking = false;


    let currentSpeed = 0;

    let targetSpeed = 0;


    let battery = 85;


    let odometer = 0;

    let tripDistance = 0;


    let lastMotionTime =
        performance.now();


    let currentLatitude = null;

    let currentLongitude = null;


    let map = null;

    let vehicleMarker = null;

    let routeLine = null;

    let destinationMarker = null;


    let routeDistanceKm = null;



    // ========================================================
    // CLOCK
    // ========================================================

    function updateClock() {

        const clock =
            document.getElementById("clock");

        if (clock) {

            clock.textContent =
                new Date().toLocaleTimeString();

        }

    }


    updateClock();

    setInterval(
        updateClock,
        1000
    );



    // ========================================================
    // DIGITAL SPEED
    // ========================================================

    function updateSpeedometer(speed) {

        speed =
            Number(speed) || 0;


        speed =
            Math.max(
                0,
                Math.min(100, speed)
            );


        if (speed < 0.5) {

            speed = 0;

        }


        if (speedDisplay) {

            speedDisplay.textContent =
                Math.round(speed);

        }


        if (driveStatus) {

            if (
                !driving &&
                currentSpeed <= 0.1
            ) {

                driveStatus.textContent =
                    "PARKED";

            }

            else if (braking) {

                driveStatus.textContent =
                    "BRAKING";

            }

            else if (driving) {

                driveStatus.textContent =
                    "DRIVE";

            }

        }

    }



    // ========================================================
    // TARGET SPEED
    // ========================================================

    function updateTargetSpeed() {

        if (
            !driving ||
            braking
        ) {

            targetSpeed = 0;

        }

        else {

            const percent =
                Number(
                    accelerator?.value || 0
                );


            const maximum =
                modeLimits[
                    selectedDrivingMode
                ];


            targetSpeed =
                (
                    percent / 100
                ) * maximum;

        }


        if (acceleratorSpeed) {

            acceleratorSpeed.textContent =
                Math.round(targetSpeed);

        }

    }



    // ========================================================
    // ACCELERATOR
    // ========================================================

    if (accelerator) {

        accelerator.min = 0;

        accelerator.max = 100;

        accelerator.step = 1;

        accelerator.value = 0;


        accelerator.addEventListener(
            "input",
            () => {

                if (!driving) {

                    accelerator.value = 0;

                    targetSpeed = 0;

                    updateTargetSpeed();

                    return;

                }


                updateTargetSpeed();

            }
        );

    }



    // ========================================================
    // DRIVING MODES
    // ========================================================

    document
        .querySelectorAll(".mode")
        .forEach(button => {


            button.addEventListener(
                "click",
                () => {


                    document
                        .querySelectorAll(".mode")
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    selectedDrivingMode =
                        button.dataset.mode ||
                        "Eco";


                    if (selectedModeDisplay) {

                        selectedModeDisplay.textContent =
                            selectedDrivingMode.toUpperCase();

                    }


                    updateTargetSpeed();

                }
            );

        });



    // ========================================================
    // PARK
    // ========================================================

    function enterParkMode() {

        driving = false;

        braking = false;

        targetSpeed = 0;


        if (accelerator) {

            accelerator.disabled = true;

            accelerator.value = 0;

        }


        if (parkingMode) {

            parkingMode.classList.add(
                "active"
            );

        }


        if (drivingMode) {

            drivingMode.classList.remove(
                "active"
            );

        }


        if (brakePedal) {

            brakePedal.classList.remove(
                "pressed"
            );

        }


        if (driveStatus) {

            driveStatus.textContent =
                "PARKED";

        }


        updateTargetSpeed();

    }



    // ========================================================
    // DRIVE
    // ========================================================

    function enterDriveMode() {

        driving = true;

        braking = false;


        if (accelerator) {

            accelerator.disabled = false;

        }


        if (parkingMode) {

            parkingMode.classList.remove(
                "active"
            );

        }


        if (drivingMode) {

            drivingMode.classList.add(
                "active"
            );

        }


        if (driveStatus) {

            driveStatus.textContent =
                "DRIVE";

        }


        updateTargetSpeed();

    }



    if (parkingMode) {

        parkingMode.addEventListener(
            "click",
            enterParkMode
        );

    }


    if (drivingMode) {

        drivingMode.addEventListener(
            "click",
            enterDriveMode
        );

    }



    // ========================================================
    // START RIDE
    // ========================================================

    if (startRide) {

        startRide.addEventListener(
            "click",
            () => {


                enterDriveMode();


                startRide.disabled =
                    true;


                if (stopRide) {

                    stopRide.disabled =
                        false;

                }


                if (reachabilityDisplay) {

                    reachabilityDisplay.textContent =
                        "READY";

                }

            }
        );

    }



    // ========================================================
    // STOP RIDE
    // ========================================================

    if (stopRide) {

        stopRide.addEventListener(
            "click",
            () => {


                enterParkMode();


                if (startRide) {

                    startRide.disabled =
                        false;

                }


                stopRide.disabled =
                    true;


                if (reachabilityDisplay) {

                    reachabilityDisplay.textContent =
                        "STOPPED";

                }

            }
        );

    }



    // ========================================================
    // BRAKE
    // ========================================================

    function pressBrake(event) {

        if (event) {

            event.preventDefault();

        }


        if (!driving) {

            return;

        }


        braking = true;

        targetSpeed = 0;


        if (brakePedal) {

            brakePedal.classList.add(
                "pressed"
            );

        }

    }



    function releaseBrake(event) {

        if (event) {

            event.preventDefault();

        }


        braking = false;


        if (brakePedal) {

            brakePedal.classList.remove(
                "pressed"
            );

        }


        updateTargetSpeed();

    }



    if (brakePedal) {

        brakePedal.addEventListener(
            "mousedown",
            pressBrake
        );


        brakePedal.addEventListener(
            "mouseup",
            releaseBrake
        );


        brakePedal.addEventListener(
            "mouseleave",
            releaseBrake
        );


        brakePedal.addEventListener(
            "touchstart",
            pressBrake,
            {
                passive: false
            }
        );


        brakePedal.addEventListener(
            "touchend",
            releaseBrake,
            {
                passive: false
            }
        );

    }



    // ========================================================
    // VEHICLE SIMULATION
    // ========================================================

    function updateVehicle() {

        const now =
            performance.now();


        const dt =
            Math.min(
                (now - lastMotionTime) /
                1000,
                0.2
            );


        lastMotionTime = now;


        // --------------------------------
        // PARK
        // --------------------------------

        if (!driving) {

            currentSpeed -=
                4.0 * dt;

        }


        // --------------------------------
        // BRAKING
        // --------------------------------

        else if (braking) {

            currentSpeed -=
                28.0 * dt;

        }


        // --------------------------------
        // ACCELERATION
        // --------------------------------

        else {

            if (
                currentSpeed <
                targetSpeed
            ) {

                currentSpeed +=
                    18.0 * dt;

            }


            else if (
                currentSpeed >
                targetSpeed
            ) {

                currentSpeed -=
                    7.0 * dt;

            }

        }


        if (currentSpeed < 0) {

            currentSpeed = 0;

        }


        const maximum =
            modeLimits[
                selectedDrivingMode
            ];


        if (currentSpeed > maximum) {

            currentSpeed =
                maximum;

        }


        if (
            Math.abs(
                currentSpeed -
                targetSpeed
            ) < 0.15
        ) {

            currentSpeed =
                targetSpeed;

        }


        // --------------------------------
        // DISTANCE
        // --------------------------------

        const distanceKm =
            currentSpeed *
            dt /
            3600;


        if (
            distanceKm > 0 &&
            driving
        ) {

            odometer +=
                distanceKm;

            tripDistance +=
                distanceKm;


            // Demo battery consumption

            battery -=
                distanceKm * 1.8;


            battery =
                Math.max(
                    0,
                    battery
                );

        }


        // --------------------------------
        // DISPLAY
        // --------------------------------

        updateSpeedometer(
            currentSpeed
        );


        if (odometerDisplay) {

            odometerDisplay.textContent =
                odometer.toFixed(2) +
                " km";

        }


        if (tripDistanceDisplay) {

            tripDistanceDisplay.textContent =
                tripDistance.toFixed(2) +
                " km";

        }


        if (batteryDisplay) {

            batteryDisplay.textContent =
                Math.round(battery);

        }


        if (batteryBar) {

            batteryBar.style.width =
                battery + "%";

        }


        updatePrediction();

    }


    setInterval(
        updateVehicle,
        50
    );



    // ========================================================
    // PREDICTION
    // ========================================================

    function updatePrediction() {

        const distance =
            Number(routeDistanceKm);


        if (!Number.isFinite(distance)) {


            if (consumptionDisplay) {

                consumptionDisplay.textContent =
                    "-- %";

            }


            if (destinationBatteryDisplay) {

                destinationBatteryDisplay.textContent =
                    "-- %";

            }


            if (rangeDisplay) {

                rangeDisplay.textContent =
                    "-- km";

            }


            return;

        }


        const multiplier = {

            Eco: 0.85,

            Normal: 1.00,

            Sport: 1.25

        }[
            selectedDrivingMode
        ] || 1;


        const predictedConsumption =
            Math.min(
                100,
                distance *
                1.8 *
                multiplier
            );


        const destinationBattery =
            Math.max(
                0,
                battery -
                predictedConsumption
            );


        const estimatedRange =
            battery /
            (
                1.8 *
                multiplier
            );


        if (consumptionDisplay) {

            consumptionDisplay.textContent =
                predictedConsumption.toFixed(1) +
                " %";

        }


        if (destinationBatteryDisplay) {

            destinationBatteryDisplay.textContent =
                destinationBattery.toFixed(1) +
                " %";

        }


        if (rangeDisplay) {

            rangeDisplay.textContent =
                estimatedRange.toFixed(1) +
                " km";

        }


        if (reachabilityDisplay) {

            reachabilityDisplay.textContent =
                destinationBattery > 5
                    ? "REACHABLE"
                    : "CHARGE REQUIRED";

        }

    }



    // ========================================================
    // MAP INITIALIZATION
    // ========================================================

    function initializeMap() {

        const mapElement =
            document.getElementById("map");


        if (
            !mapElement ||
            typeof L === "undefined"
        ) {

            return;

        }


        map =
            L.map(
                mapElement,
                {
                    zoomControl: true,
                    scrollWheelZoom: true
                }
            )
            .setView(
                [13.08957, 77.49543],
                13
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"

            }
        )
        .addTo(map);


        setTimeout(
            () => {

                map.invalidateSize();

            },
            300
        );

    }


    initializeMap();



    // ========================================================
    // GPS
    // ========================================================

    if ("geolocation" in navigator) {


        navigator.geolocation.watchPosition(

            position => {


                currentLatitude =
                    position.coords.latitude;


                currentLongitude =
                    position.coords.longitude;


                if (fromLocation) {

                    fromLocation.textContent =

                        currentLatitude.toFixed(5) +
                        ", " +
                        currentLongitude.toFixed(5);

                }


                if (locationStatus) {

                    locationStatus.textContent =
                        "● LIVE LOCATION";

                }


                updateVehicleMarker();

            },


            error => {


                console.log(
                    "GPS Error:",
                    error
                );


                if (fromLocation) {

                    fromLocation.textContent =
                        "Location unavailable";

                }


                if (locationStatus) {

                    locationStatus.textContent =
                        "● LOCATION OFF";

                }

            },


            {

                enableHighAccuracy: true,

                maximumAge: 5000,

                timeout: 10000

            }

        );

    }



    // ========================================================
    // VEHICLE MARKER
    // ========================================================

    function updateVehicleMarker() {

        if (
            !map ||
            currentLatitude === null ||
            currentLongitude === null
        ) {

            return;

        }


        const position = [

            currentLatitude,

            currentLongitude

        ];


        if (!vehicleMarker) {


            vehicleMarker =

                L.marker(
                    position
                )
                .addTo(map)
                .bindPopup(
                    "EV Smart Drive"
                );


        }

        else {


            vehicleMarker.setLatLng(
                position
            );

        }

    }



    // ========================================================
    // GEOCODING
    // ========================================================

    async function geocodeDestination(query) {

        const url =

            "https://nominatim.openstreetmap.org/search?" +

            new URLSearchParams({

                q: query,

                format: "json",

                limit: "1"

            });


        const response =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Geocoding failed"
            );

        }


        const data =
            await response.json();


        if (!data.length) {

            throw new Error(
                "Destination not found"
            );

        }


        return {

            lat:
                Number(data[0].lat),

            lon:
                Number(data[0].lon),

            name:
                data[0].display_name

        };

    }



    // ========================================================
    // OSRM ROUTE
    // ========================================================

    async function loadRoute(destination) {


        if (
            currentLatitude === null ||
            currentLongitude === null
        ) {

            throw new Error(
                "Waiting for GPS location"
            );

        }


        const routeUrl =

            "https://router.project-osrm.org/route/v1/driving/" +

            `${currentLongitude},${currentLatitude};` +

            `${destination.lon},${destination.lat}` +

            "?overview=full&geometries=geojson";


        const response =
            await fetch(
                routeUrl
            );


        if (!response.ok) {

            throw new Error(
                "Route service unavailable"
            );

        }


        const data =
            await response.json();


        if (
            data.code !== "Ok" ||
            !data.routes ||
            !data.routes.length
        ) {

            throw new Error(
                "No route found"
            );

        }


        return data.routes[0];

    }



    // ========================================================
    // NAVIGATION
    // ========================================================

    if (navigateButton) {


        navigateButton.addEventListener(
            "click",
            async () => {


                const destinationText =
                    destinationInput?.value.trim();


                if (!destinationText) {

                    alert(
                        "Please enter a destination."
                    );

                    return;

                }


                if (
                    currentLatitude === null ||
                    currentLongitude === null
                ) {

                    alert(
                        "Waiting for laptop GPS location."
                    );

                    return;

                }


                navigateButton.disabled =
                    true;


                navigateButton.textContent =
                    "⏳ CALCULATING...";


                try {


                    const destination =
                        await geocodeDestination(
                            destinationText
                        );


                    const route =
                        await loadRoute(
                            destination
                        );


                    routeDistanceKm =
                        route.distance /
                        1000;


                    const durationMinutes =
                        route.duration /
                        60;


                    if (distanceDisplay) {

                        distanceDisplay.textContent =

                            routeDistanceKm.toFixed(2) +
                            " km";

                    }


                    if (travelTimeDisplay) {


                        const hours =
                            Math.floor(
                                durationMinutes /
                                60
                            );


                        const minutes =
                            Math.round(
                                durationMinutes %
                                60
                            );


                        travelTimeDisplay.textContent =

                            hours > 0

                                ? `${hours} h ${minutes} min`

                                : `${minutes} min`;

                    }



                    // ----------------------------------------
                    // REMOVE OLD ROUTE
                    // ----------------------------------------

                    if (
                        routeLine &&
                        map
                    ) {

                        map.removeLayer(
                            routeLine
                        );

                    }


                    if (
                        destinationMarker &&
                        map
                    ) {

                        map.removeLayer(
                            destinationMarker
                        );

                    }



                    // ----------------------------------------
                    // DRAW ROUTE
                    // ----------------------------------------

                    if (map) {


                        routeLine =

                            L.geoJSON(
                                route.geometry,
                                {

                                    style: {

                                        weight: 5

                                    }

                                }
                            )
                            .addTo(map);


                        destinationMarker =

                            L.marker(
                                [
                                    destination.lat,
                                    destination.lon
                                ]
                            )
                            .addTo(map)
                            .bindPopup(
                                destinationText
                            )
                            .openPopup();


                        map.fitBounds(
                            routeLine.getBounds(),
                            {
                                padding:
                                    [30, 30]
                            }
                        );

                    }



                    // ----------------------------------------
                    // ROUTE INFORMATION
                    // ----------------------------------------

                    if (trafficDisplay) {

                        trafficDisplay.textContent =
                            "Live route";

                    }


                    if (elevationDisplay) {

                        elevationDisplay.textContent =
                            "Route data";

                    }


                    if (roadDisplay) {

                        roadDisplay.textContent =
                            "Road route";

                    }


                    if (chargingDisplay) {

                        chargingDisplay.textContent =
                            "Search nearby";

                    }


                    updatePrediction();


                }

                catch (error) {


                    console.error(
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to calculate route."
                    );

                }


                finally {


                    navigateButton.disabled =
                        false;


                    navigateButton.textContent =
                        "🧭 NAVIGATE";

                }

            }
        );

    }



    // ========================================================
    // INITIAL STATE
    // ========================================================

    selectedDrivingMode =
        "Eco";


    if (selectedModeDisplay) {

        selectedModeDisplay.textContent =
            "ECO";

    }


    enterParkMode();


    if (startRide) {

        startRide.disabled =
            false;

    }


    if (stopRide) {

        stopRide.disabled =
            true;

    }


    currentSpeed = 0;

    targetSpeed = 0;


    updateSpeedometer(0);

    updatePrediction();


    console.log(
        "EV Smart Drive initialized"
    );

});