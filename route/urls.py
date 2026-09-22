from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),

    path(
        "api/search/",
        views.search_location,
        name="search_location"
    ),

    path(
        "api/calculate-route/",
        views.calculate_route,
        name="calculate_route"
    ),

    path(
        "api/charging-stations/",
        views.charging_stations,
        name="charging_stations"
    ),

    path(
        "api/route-charging-stations/",
        views.route_charging_stations,
        name="route_charging_stations"
    ),
]