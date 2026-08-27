"""Collect current Seoul weather from Open-Meteo and append it to CSV."""

import csv
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


TIMEZONE = "Asia/Seoul"
OUTPUT = Path("data/weather.csv")
LOCATIONS = {
    "진주": (35.1796, 128.1076),
    "대구": (35.8714, 128.6014),
}


def fetch_weather(latitude: float, longitude: float) -> dict:
    params = urllib.parse.urlencode(
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,precipitation,weather_code",
            "timezone": TIMEZONE,
        }
    )
    url = f"https://api.open-meteo.com/v1/forecast?{params}"
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)


def append_row(city: str, payload: dict) -> None:
    current = payload["current"]
    units = payload["current_units"]
    row = {
        "city": city,
        "observed_at": current["time"],
        "collected_at_utc": datetime.now(timezone.utc).isoformat(),
        "latitude": payload["latitude"],
        "longitude": payload["longitude"],
        "temperature_2m": current["temperature_2m"],
        "temperature_unit": units["temperature_2m"],
        "precipitation": current["precipitation"],
        "precipitation_unit": units["precipitation"],
        "weather_code": current["weather_code"],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(row)
    write_header = not OUTPUT.exists() or OUTPUT.stat().st_size == 0
    with OUTPUT.open("a", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()
        writer.writerow(row)


if __name__ == "__main__":
    for city, (latitude, longitude) in LOCATIONS.items():
        append_row(city, fetch_weather(latitude, longitude))
    print(f"Appended weather data to {OUTPUT}")
