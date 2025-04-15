const API_BASE_URL = process.env.REACT_APP_API_URL;

export function getApiUrl(path = "") {
  return `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
}
