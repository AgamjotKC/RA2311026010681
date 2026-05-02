const axios = require("axios");
const { Log } = require("../logging_middleware/logger");


const CONFIG = {
    BASE_URL: "http://20.207.122.201/evaluation-service",
    AUTH: {
        email: "ac1662@srmist.edu.in",
        name: "Agamjot Kaur Choudhary",
        rollNo: "RA2311026010681",
        accessCode: "QkbpxH",
        clientID: "98da9432-6426-46f8-9908-486345073c9d",
        clientSecret: "RaZxFGAhNDYyYyxe"
    }
};


const getToken = async () => {
    const res = await axios.post(`${CONFIG.BASE_URL}/auth`, CONFIG.AUTH);
    return res.data.access_token;
};


const getDepots = async (token) => {
    await Log("backend", "info", "service", "Fetching depot data");

    const res = await axios.get(`${CONFIG.BASE_URL}/depots`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.depots;
};

const getVehicles = async (token) => {
    await Log("backend", "info", "service", "Fetching vehicle tasks");

    const res = await axios.get(`${CONFIG.BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.vehicles;
};


const calculateMaxImpact = (vehicles, capacity) => {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () =>
        Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        const { Duration, Impact } = vehicles[i - 1];

        for (let w = 0; w <= capacity; w++) {
            if (Duration <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    Impact + dp[i - 1][w - Duration]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][capacity];
};


const runScheduler = async () => {
    try {
        await Log("backend", "info", "controller", "Scheduler execution started");

        const token = await getToken();

        const depots = await getDepots(token);
        const vehicles = await getVehicles(token);

        for (const depot of depots) {
            const capacity = depot.MechanicHours;

            await Log(
                "backend",
                "info",
                "service",
                `Processing depot ${depot.ID}`
            );

            await Log(
                "backend",
                "debug",
                "service",
                `Capacity: ${capacity}, Total Tasks: ${vehicles.length}`
            );

            const maxImpact = calculateMaxImpact(vehicles, capacity);

            console.log(`Depot ${depot.ID} → Max Impact: ${maxImpact}`);

            await Log(
                "backend",
                "info",
                "service",
                `Depot ${depot.ID} completed with max impact ${maxImpact}`
            );
        }

    } catch (err) {
        await Log("backend", "error", "service", "Scheduler execution failed");
        console.error(err.message);
    }
};

runScheduler();