# Jinju and Daegu weather data collector

This repository collects current weather for Jinju and Daegu from the Open-Meteo API.

## How it works

- GitHub Actions runs every day at 09:00 Korea Standard Time.
- `collect_weather.py` fetches the current temperature, precipitation, and weather code for both cities.
- A row is appended to `data/weather.csv`.
- The workflow commits and pushes the CSV using GitHub's built-in `GITHUB_TOKEN`.

Run it locally with:

```powershell
python collect_weather.py
```

The workflow can also be started manually from the repository's **Actions** tab.

## Data source

Open-Meteo API: https://open-meteo.com/en/docs
