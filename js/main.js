import { fetchSpot } from "./api.js";

const status = document.getElementById("status");
const statusMessage = document.getElementById("status-message");
const retryButton = document.getElementById("retry-btn");
const refreshButton = document.getElementById("refresh-btn");
const cards = document.getElementById("cards");
const template = document.getElementById("card-template");
const lastUpdate = document.getElementById("last-update");

async function loadPrices() {
  status.hidden = false;
  retryButton.hidden = true;
  statusMessage.textContent = "Chargement des prix…";
  refreshButton.disabled = true;
  retryButton.disabled = true;
  try {
    const data = await fetchSpot();
    status.hidden = true;

    const metals = [
      { name: "Or", price: data.xau.price },
      { name: "Argent", price: (data.silver_usd_oz / 31.1035) * data.fx_rate },
    ];

    cards.replaceChildren();
    for (const metal of metals) {
      const card = template.content.cloneNode(true);
      card.querySelector(".card-metal").textContent = metal.name;
      card.querySelector(".card-price").textContent =
        metal.price.toFixed(2) + " MAD";
      cards.append(card);
    }

    lastUpdate.textContent =
      "Dernière mise à jour : " +
      new Date(data.updated_at).toLocaleString("fr-FR");
  } catch (error) {
    statusMessage.textContent = "Impossible de charger les prix.";
    retryButton.hidden = false;
  } finally {
    refreshButton.disabled = false;
    retryButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadPrices);
retryButton.addEventListener("click", loadPrices);

loadPrices();
