const register = async () => {
    console.log("Attempting to register admin via API...");
    try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Super Admin",
                email: "admin@parksense.com",
                password: "admin123",
                role: "admin"
            })
        });

        const data = await response.json();
        console.log("Response:", response.status, data);
    } catch (error) {
        console.error("Error:", error.message);
    }
};

register();
