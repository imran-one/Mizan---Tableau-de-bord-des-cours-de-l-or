export async function fetchSpot() {
  const response = await fetch("https://xaus.com/api/v1/spot?currency=MAD&unit=gram&compact=1");
  return await response.json();
}