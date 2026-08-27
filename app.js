const grid = document.querySelector("#weatherGrid");
const updatedAt = document.querySelector("#updatedAt");
const recordCount = document.querySelector("#recordCount");

const conditionMap = {
  0: ["맑음", "☀"], 1: ["대체로 맑음", "☀"], 2: ["부분적으로 흐림", "◐"],
  3: ["흐림", "☁"], 45: ["안개", "≋"], 48: ["안개", "≋"],
  51: ["이슬비", "◌"], 53: ["이슬비", "◌"], 55: ["이슬비", "◌"],
  61: ["비", "☂"], 63: ["비", "☂"], 65: ["많은 비", "☂"],
  71: ["눈", "❄"], 73: ["눈", "❄"], 75: ["많은 눈", "❄"], 80: ["소나기", "☂"], 81: ["소나기", "☂"], 82: ["강한 소나기", "☂"], 95: ["뇌우", "ϟ"]
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function formatObserved(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value.replace("T", " ") : new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function render(records) {
  grid.innerHTML = records.map((record) => {
    const [condition, icon] = conditionMap[Number(record.weather_code)] ?? ["관측 중", "•"];
    return `<article class="weather-card"><div class="card-head"><div><h3 class="city">${record.city}</h3><p class="observed">${formatObserved(record.observed_at)} 관측</p></div><div class="weather-symbol" aria-hidden="true">${icon}</div></div><div class="metric-row"><div class="temperature">${Number(record.temperature_2m).toFixed(1)}<small>°</small></div><div class="condition">${condition}</div></div><div class="details"><div class="detail-row"><span class="detail-label">강수량</span><span class="detail-value">${record.precipitation} ${record.precipitation_unit}</span></div><div class="detail-row"><span class="detail-label">좌표</span><span class="detail-value">${Number(record.latitude).toFixed(2)}°N</span></div></div></article>`;
  }).join("");
  updatedAt.textContent = `${formatObserved(records[records.length - 1].collected_at_utc)} 업데이트`;
  recordCount.textContent = `최근 ${records.length}개 기록`;
}

fetch("weather.csv")
  .then((response) => { if (!response.ok) throw new Error("CSV를 불러오지 못했습니다."); return response.text(); })
  .then((csv) => { const records = parseCsv(csv).slice(-2); if (records.length < 2) throw new Error("표시할 데이터가 부족합니다."); render(records); })
  .catch((error) => { grid.innerHTML = `<div class="error-card">${error.message}<br />weather.csv 파일이 앱과 같은 폴더에 있는지 확인해주세요.</div>`; updatedAt.textContent = "업데이트 실패"; });
