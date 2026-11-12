import { fetchSpot, fetchHistory } from "./api.js";
import { computeChange } from "./change.js";
import { estimateValue, parseWeight } from "./estimator.js";
const status = document.getElementById("status");
const statusMessage = document.getElementById("status-message");
const retryButton = document.getElementById("retry-btn");
const refreshButton = document.getElementById("refresh-btn");
const cards = document.getElementById("cards");
const template = document.getElementById("card-template");
const lastUpdate = document.getElementById("last-update");
const currencySelect = document.getElementById("currency-select");
const savedCurrency = localStorage.getItem("currency");
if (savedCurrency) {
  currencySelect.value = savedCurrency;
}
const estimatorMetal = document.getElementById("estimator-metal");
const weightInput = document.getElementById("weight-input");
const weightError = document.getElementById("weight-error");
const estimateResult = document.getElementById("estimate-result");
const historyMetal = document.getElementById("history-metal");
const historyPeriod = document.getElementById("history-period");
const chart = document.getElementById("chart");
const chartStatus = document.getElementById("chart-status");

let currentMetals = [];
let currentCurrency = "";

function updateEstimate() {
  const result = parseWeight(weightInput.value);

  if (!result.valid) {
    weightError.textContent = result.message;
    estimateResult.textContent = "";
    return;
  }

  weightError.textContent = "";
  const metal = currentMetals.find(
    (m) => m.chartSymbol === estimatorMetal.value,
  );
  if (!metal) {
    return;
  }

  const value = estimateValue(result.value, metal.price);
  estimateResult.textContent =
    "Valeur estimée : " + value.toFixed(2) + " " + currentCurrency;
}

async function loadPrices() {
  const currency = currencySelect.value;
  currentCurrency = currency;

  status.hidden = false;
  retryButton.hidden = true;
  statusMessage.textContent = "Chargement des prix…";
  refreshButton.disabled = true;
  retryButton.disabled = true;

  try {
    const data = await fetchSpot(currency);
    status.hidden = true;

    const metals = [
      { name: "Or", chartSymbol: "xau", price: data.xau.price },
      {
        name: "Argent",
        chartSymbol: "silver",
        price: (data.silver_usd_oz / 31.1035) * data.fx_rate,
      },
    ];
    currentMetals = metals;
    const selectedMetal = estimatorMetal.value;
    estimatorMetal.replaceChildren();

    for (const metal of metals) {
      const option = document.createElement("option");
      option.value = metal.chartSymbol;
      option.textContent = metal.name;
      estimatorMetal.append(option);
    }

    if (selectedMetal) {
      estimatorMetal.value = selectedMetal;
    }

    const selectedHistoryMetal = historyMetal.value;
    historyMetal.replaceChildren();

    for (const metal of metals) {
      const option = document.createElement("option");
      option.value = metal.chartSymbol;
      option.textContent = metal.name;
      historyMetal.append(option);
    }

    if (selectedHistoryMetal) {
      historyMetal.value = selectedHistoryMetal;
    }

    cards.replaceChildren();
    for (const metal of metals) {
      const card = template.content.cloneNode(true);
      card.querySelector(".card-metal").textContent = metal.name;
      card.querySelector(".card-price").textContent =
        metal.price.toFixed(2) + " " + currency;
      const points = await fetchHistory(metal.chartSymbol);
      const change = computeChange(points);
      const deltaValue = (change.delta / 31.1035) * data.fx_rate;
      const isUp = change.delta >= 0;

      card.querySelector(".card-arrow").textContent = isUp ? "▲" : "▼";
      card.querySelector(".card-delta").textContent =
        deltaValue.toFixed(2) +
        " " +
        currency +
        " (" +
        change.percent.toFixed(2) +
        " %)";
      card.querySelector(".card").classList.add(isUp ? "is-up" : "is-down");
      cards.append(card);
    }

    lastUpdate.textContent =
      "Dernière mise à jour : " +
      new Date(data.updated_at).toLocaleString("fr-FR");
    if (weightInput.value !== "") {
      updateEstimate();
    }
  } catch (error) {
    statusMessage.textContent = error.message;
    retryButton.hidden = false;
  } finally {
    refreshButton.disabled = false;
    retryButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadPrices);
retryButton.addEventListener("click", loadPrices);
currencySelect.addEventListener("change", () => {
  localStorage.setItem("currency", currencySelect.value);
  loadPrices();
});

weightInput.addEventListener("input", updateEstimate);
estimatorMetal.addEventListener("change", updateEstimate);

async function loadHistory() {
chartStatus.textContent = "Chargement de l'historique…";
  try{
  const points = await fetchHistory(historyMetal.value);
  const days = Number(historyPeriod.value);
  const shown = points.slice(-days);
  renderChart(shown);
  }catch (error){
    chart.replaceChildren();
    chartStatus.textContent = "Impossible de charger l'historique.";
  }
}

function renderChart(points) {
  chart.replaceChildren();
  if (points.length === 0) {
    chartStatus.textContent = "Aucune donnée d'historique.";
    return;
  }
  chartStatus.textContent = `${points.length} points affichés.`;

  const value = points.map((point) => point.c);
  const MAX = Math.max(...value);
  const MIN = Math.min(...value);

  for (const point of points) {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const a = (point.c-MIN)/(MAX-MIN);
    bar.style.height = 10 + a*90 + "%";
    chart.append(bar);
  }
}

historyMetal.addEventListener("change", loadHistory);
historyPeriod.addEventListener("change", loadHistory);
loadHistory();
loadPrices();
