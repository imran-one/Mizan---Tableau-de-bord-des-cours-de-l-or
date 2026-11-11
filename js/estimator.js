export function estimateValue(weight, pricePerGram) {
  return Math.round(weight * pricePerGram * 100) / 100;
};

export function parseWeight(text) {
  const cleaned = text.trim().replace(",", ".");

  if (cleaned === "") {
    return { valid: false, message: "Saisissez un poids." };
  }

  const value = Number(cleaned);

  if (Number.isNaN(value)) {
    return { valid: false, message: "Le poids doit être un nombre." };
  }
  if (value <= 0) {
    return { valid: false, message: "Le poids doit être supérieur à 0." };
  }

  return { valid: true, value };
};