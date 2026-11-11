import { fetchSpot, fetchHistory } from "./api.js";
import { computeChange } from "./change.js";

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

async function loadPrices() {
  const currency = currencySelect.value;

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

loadPrices();
