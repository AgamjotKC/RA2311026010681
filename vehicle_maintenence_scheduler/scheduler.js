const axios = require("axios");
const { Log } = require("../logging_middleware/logger");


const getToken = async () => {
    const res = await axios.post(
        "http://20.207.122.201/evaluation-service/auth",
        {
            email: "ac1662@srmist.edu.in",
            name: "Agamjot Kaur Choudhary",
            rollNo: "RA2311026010681",
            accessCode: "QkbpxH",
            clientID: "98da9432-6426-46f8-9908-486345073c9d",
            clientSecret: "RaZxFGAhNDYyYyxe"
        }
    );
    return res.data.access_token;
};


const getDepots = async (token) => {
    await Log("backend", "info", "service", "Fetching depots");

    const res = await axios.get(
        "http://20.207.122.201/evaluation-service/depots",
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return res.data.depots;
};


const getVehicles = async (token) => {
    await Log("backend", "info", "service", "Fetching vehicles");

    const res = await axios.get(
        "http://20.207.122.201/evaluation-service/vehicles",
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    return res.data.vehicles;
};


const knapsack = (vehicles, capacity) => {
    const n = vehicles.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

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
        await Log("backend", "info", "controller", "Scheduler started");

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

            const maxImpact = knapsack(vehicles, capacity);

            console.log(`Depot ${depot.ID} → Max Impact: ${maxImpact}`);

            await Log(
                "backend",
                "info",
                "service",
                `Depot ${depot.ID} completed with impact ${maxImpact}`
            );
        }

    } catch (err) {
        await Log("backend", "error", "service", "Scheduler failed");
        console.error(err.message);
    }
};

runScheduler();