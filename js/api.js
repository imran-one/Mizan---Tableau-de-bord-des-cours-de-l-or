export async function fetchSpot(currency) {
  return await request(`https://xaus.com/api/v1/spot?currency=${currency}&unit=gram&compact=1`);
}

export async function fetchHistory(chartSymbol) {
  const data = await request(`https://xaus.com/api/v1/chart?symbol=${chartSymbol}&range=1mo&interval=1d`);
  return data.points;
}

class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

async function request(url) {
  if (!navigator.onLine) {
    throw new ApiError("offline", "Vous êtes hors ligne.");
  }

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("network", "Impossible de joindre le serveur.");
  }

  if (response.status === 429) {
    throw new ApiError("quota", "Trop de requêtes. Réessayez dans une minute.");
  }
  if (!response.ok) {
    throw new ApiError("http", "Erreur du serveur (code " + response.status + ").");
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("parse", "Réponse illisible du serveur.");
  }
}