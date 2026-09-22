import json
import math
import urllib.parse
import urllib.request
import requests

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET


# ============================================================
# CONFIGURATION
# ============================================================

USER_AGENT = (
    "EV-Smart-Drive/1.0 "
    "(educational project)"
)

NOMINATIM_URL = (
    "https://nominatim.openstreetmap.org/search"
)

OSRM_URL = (
    "https://router.project-osrm.org/route/v1/driving"
)

OPENCHARGEMAP_URL = (
    "https://api.openchargemap.io/v3/poi/"
)


# ============================================================
# OPEN CHARGE MAP API KEY
# ============================================================

OPENCHARGEMAP_API_KEY = getattr(
    settings,
    "OPENCHARGEMAP_API_KEY",
    ""
)


# ============================================================
# HTTP GET JSON
# ============================================================

def http_get_json(
    url,
    params=None,
    timeout=20
):

    if params:

        separator = (
            "&"
            if "?" in url
            else "?"
        )

        url = (
            url
            + separator
            + urllib.parse.urlencode(params)
        )

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=timeout
    ) as response:

        content = response.read().decode(
            "utf-8"
        )

    return json.loads(content)


# ============================================================
# HOME
# ============================================================

def home(request):

    return render(
        request,
        "index.html"
    )


# ============================================================
# LOCATION SEARCH
# ============================================================

@require_GET
def search_location(request):

    query = request.GET.get(
        "q",
        ""
    ).strip()

    # --------------------------------------------------------
    # Wait until the user has entered enough text.
    # This also prevents unnecessary Nominatim requests.
    # --------------------------------------------------------

    if len(query) < 3:

        return JsonResponse(
            {
                "success": True,
                "results": []
            }
        )

    # --------------------------------------------------------
    # CACHE
    #
    # Repeated searches should NOT hit Nominatim again.
    # --------------------------------------------------------

    cache_key = (
        "ev_location_search_"
        + query.lower()
    )

    cached_results = cache.get(
        cache_key
    )

    if cached_results is not None:

        return JsonResponse(
            {
                "success": True,
                "results": cached_results
            }
        )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # Do ONE Nominatim request only.
    #
    # The old code sent:
    #
    #   1. query
    #   2. query + ", India"
    #
    # for every search. That can trigger HTTP 429.
    #
    # countrycodes=in already limits the search to India.
    # --------------------------------------------------------

    params = {

        "q": query,

        "format": "jsonv2",

        "limit": 10,

        "countrycodes": "in",

        "addressdetails": 1,

        "accept-language": "en",

        "dedupe": 1,

    }

    try:

        data = http_get_json(
            NOMINATIM_URL,
            params=params,
            timeout=15
        )

        if not isinstance(
            data,
            list
        ):

            data = []

        results = []
        seen = set()

        for item in data:

            try:

                latitude = float(
                    item["lat"]
                )

                longitude = float(
                    item["lon"]
                )

            except (
                KeyError,
                TypeError,
                ValueError
            ):

                continue

            # ------------------------------------------------
            # Remove duplicate coordinates.
            # ------------------------------------------------

            key = (
                round(latitude, 6),
                round(longitude, 6)
            )

            if key in seen:

                continue

            seen.add(key)

            address = item.get(
                "address",
                {}
            )

            if not isinstance(
                address,
                dict
            ):

                address = {}

            results.append(
                {
                    "name":
                        item.get(
                            "display_name",
                            "Unknown location"
                        ),

                    "lat":
                        latitude,

                    "lon":
                        longitude,

                    "type":
                        item.get(
                            "type",
                            ""
                        ),

                    "city":
                        address.get(
                            "city",
                            ""
                        ),

                    "town":
                        address.get(
                            "town",
                            ""
                        ),

                    "village":
                        address.get(
                            "village",
                            ""
                        ),

                    "state":
                        address.get(
                            "state",
                            ""
                        ),

                    "postcode":
                        address.get(
                            "postcode",
                            ""
                        ),
                }
            )

        results = results[:15]

        # ----------------------------------------------------
        # Cache successful results for 10 minutes.
        # ----------------------------------------------------

        cache.set(
            cache_key,
            results,
            600
        )

        return JsonResponse(
            {
                "success": True,
                "results": results
            }
        )

    except Exception as error:

        print(
            "Nominatim search error:",
            error
        )

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # Do not hide the actual error while testing.
        # The frontend still receives a valid JSON response.
        # ----------------------------------------------------

        return JsonResponse(
            {
                "success": False,

                "results": [],

                "error":
                    "Location search is temporarily unavailable. "
                    "Please wait a few seconds and try again."
            },
            status=503
        )


# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def haversine(
    lat1,
    lon1,
    lat2,
    lon2
):

    earth_radius = 6371.0

    lat1_rad = math.radians(
        lat1
    )

    lat2_rad = math.radians(
        lat2
    )

    delta_lat = math.radians(
        lat2 - lat1
    )

    delta_lon = math.radians(
        lon2 - lon1
    )

    a = (

        math.sin(
            delta_lat / 2
        ) ** 2

        +

        math.cos(
            lat1_rad
        )

        *

        math.cos(
            lat2_rad
        )

        *

        math.sin(
            delta_lon / 2
        ) ** 2

    )

    c = (
        2
        *
        math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a)
        )
    )

    return (
        earth_radius
        *
        c
    )


# ============================================================
# DISTANCE FROM POINT TO ROUTE
# ============================================================

def minimum_distance_to_route(
    latitude,
    longitude,
    route_points
):

    minimum = float(
        "inf"
    )

    for point in route_points:

        try:

            route_lon = float(
                point[0]
            )

            route_lat = float(
                point[1]
            )

        except (
            TypeError,
            ValueError,
            IndexError
        ):

            continue

        distance = haversine(

            latitude,
            longitude,

            route_lat,
            route_lon

        )

        if distance < minimum:

            minimum = distance

    return minimum


# ============================================================
# OSRM ROUTE
# ============================================================

def get_osrm_route(
    start_lat,
    start_lon,
    end_lat,
    end_lon
):

    coordinates = (

        f"{start_lon},{start_lat};"
        f"{end_lon},{end_lat}"

    )

    params = {

        "overview":
            "full",

        "geometries":
            "geojson",

        "steps":
            "false",

    }

    url = (
        OSRM_URL
        + "/"
        + coordinates
    )

    data = http_get_json(
        url,
        params=params,
        timeout=25
    )

    if (
        data.get("code")
        !=
        "Ok"
    ):

        raise Exception(
            "No drivable route found."
        )

    routes = data.get(
        "routes",
        []
    )

    if not routes:

        raise Exception(
            "No route returned by OSRM."
        )

    route = routes[0]

    distance_km = (
        float(
            route["distance"]
        )
        / 1000.0
    )

    duration_min = (
        float(
            route["duration"]
        )
        / 60.0
    )

    coordinates = (
        route
        .get(
            "geometry",
            {}
        )
        .get(
            "coordinates",
            []
        )
    )

    # ========================================================
    # OSRM gives:
    #
    # [longitude, latitude]
    #
    # Leaflet needs:
    #
    # [latitude, longitude]
    # ========================================================

    leaflet_geometry = []

    for point in coordinates:

        if len(point) < 2:

            continue

        leaflet_geometry.append(
            [
                float(point[1]),
                float(point[0])
            ]
        )

    return {

        "distance_km":
            round(
                distance_km,
                2
            ),

        "duration_min":
            round(
                duration_min,
                1
            ),

        "geometry":
            leaflet_geometry,

    }


# ============================================================
# CALCULATE ROUTE
#
# IMPORTANT:
# Current navigation.js uses GET.
#
# Therefore this endpoint is GET.
# ============================================================

@require_GET
def calculate_route(request):

    try:

        start_lat = float(
            request.GET[
                "start_lat"
            ]
        )

        start_lon = float(
            request.GET[
                "start_lon"
            ]
        )

        end_lat = float(
            request.GET[
                "end_lat"
            ]
        )

        end_lon = float(
            request.GET[
                "end_lon"
            ]
        )

    except (
        KeyError,
        TypeError,
        ValueError
    ):

        return JsonResponse(
            {
                "success": False,

                "error":
                    "Invalid route coordinates."
            },
            status=400
        )

    try:

        route = get_osrm_route(

            start_lat,
            start_lon,

            end_lat,
            end_lon

        )

        return JsonResponse(
            {

                "success": True,

                "distance_km":
                    route[
                        "distance_km"
                    ],

                "duration_min":
                    route[
                        "duration_min"
                    ],

                "geometry":
                    route[
                        "geometry"
                    ],

                "start": {

                    "lat":
                        start_lat,

                    "lon":
                        start_lon,

                },

                "destination": {

                    "lat":
                        end_lat,

                    "lon":
                        end_lon,

                }

            }
        )

    except Exception as error:

        print(
            "Route calculation error:",
            error
        )

        return JsonResponse(
            {
                "success": False,

                "error":
                    str(error)
            },
            status=500
        )


# ============================================================
# FORMAT CHARGING STATION
# ============================================================

def format_station(item):

    address_info = item.get(
        "AddressInfo",
        {}
    )

    latitude = (
        address_info.get(
            "Latitude"
        )
    )

    longitude = (
        address_info.get(
            "Longitude"
        )
    )

    if (
        latitude is None
        or
        longitude is None
    ):

        return None

    try:

        latitude = float(
            latitude
        )

        longitude = float(
            longitude
        )

    except (
        TypeError,
        ValueError
    ):

        return None

    title = (
        address_info.get(
            "Title"
        )
        or
        "Charging Station"
    )

    address_line = (
        address_info.get(
            "AddressLine1"
        )
        or
        ""
    )

    town = (
        address_info.get(
            "Town"
        )
        or
        ""
    )

    state = (
        address_info.get(
            "StateOrProvince"
        )
        or
        ""
    )

    postcode = (
        address_info.get(
            "Postcode"
        )
        or
        ""
    )

    # ========================================================
    # BUILD ADDRESS
    # ========================================================

    address_parts = []

    for value in [
        address_line,
        town,
        state,
        postcode
    ]:

        if value:

            address_parts.append(
                str(value)
            )

    address = ", ".join(
        address_parts
    )

    # ========================================================
    # OPERATOR
    # ========================================================

    operator = ""

    operators = item.get(
        "OperatorInfo",
        {}
    )

    if isinstance(
        operators,
        dict
    ):

        operator = (
            operators.get(
                "Title"
            )
            or
            operators.get(
                "Name"
            )
            or
            ""
        )

    # ========================================================
    # POWER
    # ========================================================

    power_kw = None

    connections = item.get(
        "Connections",
        []
    )

    if isinstance(
        connections,
        list
    ):

        for connection in connections:

            if not isinstance(
                connection,
                dict
            ):

                continue

            power = (
                connection.get(
                    "PowerKW"
                )
            )

            if power is not None:

                try:

                    power_kw = float(
                        power
                    )

                    break

                except (
                    TypeError,
                    ValueError
                ):

                    pass

    # ========================================================
    # STATION ID
    # ========================================================

    station_id = item.get(
        "ID"
    )

    if not station_id:

        station_id = (
            f"{latitude}_"
            f"{longitude}"
        )

    return {

        "id":
            str(
                station_id
            ),

        "name":
            title,

        "address":
            address,

        "town":
            town,

        "state":
            state,

        # IMPORTANT:
        # These names match navigation.js

        "latitude":
            latitude,

        "longitude":
            longitude,

        "power_kw":
            power_kw,

        "operator":
            operator,

        "distance_km":
            0.0,

    }


# ============================================================
# GET CHARGING STATIONS
# ============================================================

def get_charging_stations(
    latitude,
    longitude,
    distance_km=25,
    max_results=100
):

    params = {

        "output":
            "json",

        "countrycode":
            "IN",

        "latitude":
            latitude,

        "longitude":
            longitude,

        "distance":
            distance_km,

        "distanceunit":
            "KM",

        "maxresults":
            max_results,

        "compact":
            "false",

        "verbose":
            "false",

    }

    if OPENCHARGEMAP_API_KEY:

        params["key"] = (
            OPENCHARGEMAP_API_KEY
        )

    data = http_get_json(

        OPENCHARGEMAP_URL,

        params=params,

        timeout=30

    )

    stations = []

    if not isinstance(
        data,
        list
    ):

        return stations

    for item in data:

        station = format_station(
            item
        )

        if station is None:

            continue

        station[
            "distance_km"
        ] = round(

            haversine(

                latitude,
                longitude,

                station[
                    "latitude"
                ],

                station[
                    "longitude"
                ]

            ),

            2

        )

        stations.append(
            station
        )

    stations.sort(
        key=lambda station:
            station.get(
                "distance_km",
                999999
            )
    )

    return stations


# ============================================================
# NEARBY CHARGING STATIONS
#
# JS calls:
#
# /api/charging-stations/
# ?lat=...
# &lon=...
# &radius=25
# ============================================================

@require_GET
def charging_stations(request):
    try:
        lat = float(request.GET.get("lat"))
        lon = float(request.GET.get("lon"))
        radius = float(request.GET.get("radius", 25))
    except (TypeError, ValueError):
        return JsonResponse(
            {
                "success": False,
                "error": "Invalid latitude, longitude, or radius."
            },
            status=400
        )

    url = "https://api.openchargemap.io/v3/poi/"

    params = {
        "output": "json",
        "latitude": lat,
        "longitude": lon,
        "distance": radius,
        "distanceunit": "KM",
        "maxresults": 50,
        "compact": "true",
        "verbose": "false",
    }

    headers = {}

    if OPENCHARGEMAP_API_KEY:
        headers["X-API-Key"] = OPENCHARGEMAP_API_KEY

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as e:
        return JsonResponse(
            {
                "success": False,
                "error": f"Charging station API error: {str(e)}"
            },
            status=502
        )

    except ValueError:
        return JsonResponse(
            {
                "success": False,
                "error": "Charging station API returned invalid JSON."
            },
            status=502
        )

    stations = []

    for item in data:

        address_info = item.get("AddressInfo") or {}

        latitude = address_info.get("Latitude")
        longitude = address_info.get("Longitude")

        # Ignore stations without valid coordinates
        if latitude is None or longitude is None:
            continue

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            continue

        title = (
            address_info.get("Title")
            or "Charging Station"
        )

        address = (
            address_info.get("AddressLine1")
            or ""
        )

        town = (
            address_info.get("Town")
            or ""
        )

        state = (
            address_info.get("StateOrProvince")
            or ""
        )

        postcode = (
            address_info.get("Postcode")
            or ""
        )

        full_address = ", ".join(
            part
            for part in [
                address,
                town,
                state,
                postcode
            ]
            if part
        )

        stations.append({

            # New format
            "latitude": latitude,
            "longitude": longitude,

            # Compatibility with older JS
            "lat": latitude,
            "lon": longitude,

            "name": title,
            "address": full_address,

        })

    return JsonResponse(
        {
            "success": True,
            "count": len(stations),
            "stations": stations,
        }
    )

# ============================================================
# ROUTE CHARGING STATIONS
#
# JS sends:
#
# start_lat
# start_lon
# end_lat
# end_lon
#
# using GET.
# ============================================================

@require_GET
def route_charging_stations(
    request
):

    try:

        start_lat = float(
            request.GET[
                "start_lat"
            ]
        )

        start_lon = float(
            request.GET[
                "start_lon"
            ]
        )

        end_lat = float(
            request.GET[
                "end_lat"
            ]
        )

        end_lon = float(
            request.GET[
                "end_lon"
            ]
        )

    except (
        KeyError,
        TypeError,
        ValueError
    ):

        return JsonResponse(
            {

                "success": False,

                "stations": [],

                "error":
                    "Invalid route coordinates."

            },
            status=400
        )

    try:

        # ====================================================
        # ORIGINAL ROUTE
        # ====================================================

        original_route = get_osrm_route(

            start_lat,
            start_lon,

            end_lat,
            end_lon

        )

        route_geometry = (
            original_route[
                "geometry"
            ]
        )

        if not route_geometry:

            return JsonResponse(
                {

                    "success": False,

                    "stations": [],

                    "error":
                        "Route geometry is empty."

                },
                status=500
            )

        # ====================================================
        # ROUTE BOUNDING BOX
        # ====================================================

        route_lats = [
            point[0]
            for point in route_geometry
        ]

        route_lons = [
            point[1]
            for point in route_geometry
        ]

        min_lat = min(
            route_lats
        )

        max_lat = max(
            route_lats
        )

        min_lon = min(
            route_lons
        )

        max_lon = max(
            route_lons
        )

        center_lat = (
            min_lat
            +
            max_lat
        ) / 2

        center_lon = (
            min_lon
            +
            max_lon
        ) / 2

        # ====================================================
        # SEARCH RADIUS
        # ====================================================

        north_south = haversine(

            min_lat,
            center_lon,

            max_lat,
            center_lon

        )

        east_west = haversine(

            center_lat,
            min_lon,

            center_lat,
            max_lon

        )

        route_radius = max(

            25,

            north_south / 2,

            east_west / 2

        )

        route_radius = min(
            route_radius + 10,
            100
        )

        # ====================================================
        # GET STATIONS
        # ====================================================

        stations = (
            get_charging_stations(

                center_lat,
                center_lon,

                distance_km=route_radius,

                max_results=100

            )
        )

        results = []

        # ====================================================
        # ROUTE DEVIATION
        # ====================================================

        for station in stations:

            station_lat = (
                station[
                    "latitude"
                ]
            )

            station_lon = (
                station[
                    "longitude"
                ]
            )

            distance_from_route = (
                minimum_distance_to_route(

                    station_lat,
                    station_lon,

                    route_geometry

                )
            )

            station[
                "distance_from_route_km"
            ] = round(

                distance_from_route,
                2

            )

            # =================================================
            # CLASSIFICATION
            # =================================================

            if distance_from_route <= 0.5:

                station[
                    "route_status"
                ] = "ON ROUTE"

            elif distance_from_route <= 3:

                station[
                    "route_status"
                ] = "NEAR ROUTE"

            elif distance_from_route <= 5:

                station[
                    "route_status"
                ] = "DETOUR"

            else:

                continue

            # =================================================
            # APPROXIMATE DEVIATION
            # =================================================

            try:

                first_leg = (
                    get_osrm_route(

                        start_lat,
                        start_lon,

                        station_lat,
                        station_lon

                    )
                )

                second_leg = (
                    get_osrm_route(

                        station_lat,
                        station_lon,

                        end_lat,
                        end_lon

                    )
                )

                total_via_station = (

                    first_leg[
                        "distance_km"
                    ]

                    +

                    second_leg[
                        "distance_km"
                    ]

                )

                deviation_km = (

                    total_via_station

                    -

                    original_route[
                        "distance_km"
                    ]

                )

                # Don't show negative deviation

                deviation_km = max(
                    0,
                    deviation_km
                )

                station[
                    "deviation_km"
                ] = round(
                    deviation_km,
                    2
                )

                total_time = (

                    first_leg[
                        "duration_min"
                    ]

                    +

                    second_leg[
                        "duration_min"
                    ]

                )

                extra_time = (

                    total_time

                    -

                    original_route[
                        "duration_min"
                    ]

                )

                station[
                    "extra_time_min"
                ] = round(

                    max(
                        0,
                        extra_time
                    ),

                    1

                )

            except Exception as error:

                print(
                    "Deviation calculation error:",
                    error
                )

                # Still keep station.
                station[
                    "deviation_km"
                ] = round(
                    distance_from_route,
                    2
                )

                station[
                    "extra_time_min"
                ] = 0

            results.append(
                station
            )

        # ====================================================
        # SORT
        # ====================================================

        results.sort(

            key=lambda station:

                station.get(
                    "deviation_km",
                    999999
                )

        )

        return JsonResponse(
            {

                "success": True,

                "stations":
                    results,

                "original_route":
                    {

                        "distance_km":
                            original_route[
                                "distance_km"
                            ],

                        "duration_min":
                            original_route[
                                "duration_min"
                            ],

                    }

            }
        )

    except Exception as error:

        print(
            "Route charging station error:",
            error
        )

        return JsonResponse(
            {

                "success": False,

                "stations": [],

                "error":
                    str(error)

            },
            status=500
        )