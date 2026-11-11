export async function fetchSpot(currency) {
  if (!navigator.onLine) {
    throw new ApiError("offline", "Vous êtes hors ligne.");
  }

  let response;
  try {
    response = await fetch(
      `https://xaus.com/api/v1/spot?currency=${currency}&unit=gram&compact=1`,
    );
  } catch {
    throw new ApiError("network", "Impossible de joindre le serveur.");
  }

  if (response.status === 429) {
    throw new ApiError("quota", "Trop de requêtes. Réessayez dans une minute.");
  }
  if (!response.ok) {
    throw new ApiError(
      "http",
      "Erreur du serveur (code " + response.status + ").",
    );
  }

  return await response.json();
}

class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}
