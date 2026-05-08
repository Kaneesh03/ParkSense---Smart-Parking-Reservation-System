const axios = require("axios");
const fs = require("fs");

async function testAdmin() {
  let log = "";
  try {
    log += ("Logging in...\n");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@parksense.com",
      password: "admin123"
    });
    const token = loginRes.data.token;
    log += ("Token: " + token + "\n");

    const config = { headers: { Authorization: token } };

    log += ("Fetching /admin/stats...\n");
    await axios.get("http://localhost:5000/api/admin/stats", config);
    log += ("Stats OK\n");

    log += ("Fetching /admin/bookings...\n");
    await axios.get("http://localhost:5000/api/admin/bookings", config);
    log += ("Bookings OK\n");

    log += ("Fetching /admin/owners/pending...\n");
    await axios.get("http://localhost:5000/api/admin/owners/pending", config);
    log += ("Owners OK\n");

    log += ("Fetching /admin/lots/pending...\n");
    await axios.get("http://localhost:5000/api/admin/lots/pending", config);
    log += ("Lots OK\n");

  } catch (err) {
    log += ("TEST FAILED: " + JSON.stringify(err.response ? err.response.data : err.message) + "\n");
  } finally {
      fs.writeFileSync("test_out.txt", log);
  }
}

testAdmin();
