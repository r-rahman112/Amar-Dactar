async function fetchHealth() {
  try {
    const res = await fetch("http://localhost:3000/api/users/health");
    const data = await res.text();
    console.log("Health:", data);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}
fetchHealth();
