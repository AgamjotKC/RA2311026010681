const axios = require("axios");

// Allowed values
const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
    "cache", "controller", "cron_job", "db", "domain",
    "handler", "repository", "route", "service",
    "api", "component", "hook", "page", "state", "style",
    "auth", "config", "middleware", "utils"
];

// 🔐 Get token
const getToken = async () => {
    try {
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

    } catch (err) {
        console.error("Auth failed:", err.response?.data || err.message);
        return null;
    }
};

// 🚀 Log function
const Log = async (stack, level, pkg, message) => {
    try {
        if (!validStacks.includes(stack)) return console.error("Invalid stack");
        if (!validLevels.includes(level)) return console.error("Invalid level");
        if (!validPackages.includes(pkg)) return console.error("Invalid package");
        if (!message || typeof message !== "string") return console.error("Invalid message");

        const token = await getToken();
        if (!token) return;

        const response = await axios.post(
            "http://20.207.122.201/evaluation-service/logs",
            {
                stack,
                level,
                package: pkg,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Log sent:", response.data.logID);

    } catch (err) {
        console.error("Logging failed:", err.response?.data || err.message);
    }
};

module.exports = { Log };