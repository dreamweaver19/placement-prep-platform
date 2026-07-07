export function getApiErrorMessage(error, fallback) {
  if (error.response?.data?.msg) return error.response.data.msg;
  if (error.code === 'ECONNABORTED') return 'Request timed out. Check that the backend server is running.';
  if (error.request) return 'Cannot reach backend server. Start the server on port 5000 and try again.';
  return fallback;
}
