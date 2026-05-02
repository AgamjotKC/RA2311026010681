const express = require("express");
const axios = require("axios");
const { Log } = require("../logging_middleware/logger");

const app = express();
app.use(express.json());

const PORT = 3000;


let fallbackNotifications = [
    {
        ID: "1",
        Type: "Placement",
        Message: "CSX hiring",
        Timestamp: "2026-04-22 17:51:18"
    },
    {
        ID: "2",
        Type: "Event",
        Message: "Tech Fest",
        Timestamp: "2026-04-22 17:51:06"
    }
];


const getPriorityWeight = (type) => {
    if (type === "Placement") return 3;
    if (type === "Result") return 2;
    return 1;
};


const sortByPriority = (a, b) => {
    const weightDiff = getPriorityWeight(b.Type) - getPriorityWeight(a.Type);
    if (weightDiff !== 0) return weightDiff;

    return new Date(b.Timestamp) - new Date(a.Timestamp);
};


const fetchNotifications = async () => {
    try {
        await Log("backend", "info", "service", "Fetching notifications from external API");

        const res = await axios.get(
            "http://20.207.122.201/evaluation-service/notifications"
        );

        return res.data;

    } catch (err) {
        await Log("backend", "error", "service", "API fetch failed, using fallback data");
        return fallbackNotifications;
    }
};


app.get("/", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Root API hit");
        res.send("Campus Notification Service Running");
    } catch (err) {
        await Log("backend", "error", "route", err.message);
        res.status(500).send("Error");
    }
});

app.get("/api/v1/notifications", async (req, res) => {
    try {
        await Log("backend", "info", "handler", "Fetching all notifications");

        const data = await fetchNotifications();

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        await Log("backend", "error", "handler", err.message);
        res.status(500).json({
            success: false,
            message: "Error fetching notifications"
        });
    }
});


app.get("/api/v1/notifications/priority", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        await Log("backend", "info", "handler", `Fetching top ${limit} priority notifications`);

        const data = await fetchNotifications();

        const sorted = data.sort(sortByPriority);

        const topN = sorted.slice(0, limit);

        res.status(200).json({
            success: true,
            count: topN.length,
            data: topN
        });

    } catch (err) {
        await Log("backend", "error", "handler", err.message);
        res.status(500).json({
            success: false,
            message: "Error fetching priority notifications"
        });
    }
});


app.get("/health", async (req, res) => {
    try {
        await Log("backend", "info", "route", "Health check hit");
        res.status(200).json({ status: "OK" });
    } catch (err) {
        await Log("backend", "error", "route", err.message);
        res.status(500).json({ status: "Error" });
    }
});


app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await Log("backend", "info", "service", `Server started on port ${PORT}`);
});