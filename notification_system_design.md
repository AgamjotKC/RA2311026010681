# Design API 

Objective
The system is used to show notifications to students about placements, results, and events.

Core Features

* View all notifications
* View unread notifications
* Mark one notification as read
* Mark all notifications as read
* Support real-time updates (future idea)

Base URL
[http://localhost:3000/api/v1](http://localhost:3000/api/v1)

Get Notifications
Endpoint
GET /notifications

Query
unread=true (optional)

Response example
{
"success": true,
"count": 2,
"data": [
{
"id": "1",
"type": "Placement",
"message": "Company hiring",
"isRead": false,
"createdAt": "2026-04-22T17:51:18Z"
}
]
}

Mark one notification as read
PATCH /notifications/:id/read

Mark all notifications as read
PATCH /notifications/read-all

Real-time idea
We can use WebSockets or SSE so that notifications come instantly instead of refreshing again and again.


# Stage 2: Database Design

Database choice
PostgreSQL is a good choice because data is structured and we can use indexes.

Table schema

CREATE TABLE notifications (
id UUID PRIMARY KEY,
studentId INT,
type VARCHAR(20),
message TEXT,
isRead BOOLEAN DEFAULT FALSE,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Problems when data grows

* Too many notifications
* Slow queries
* High database load

Solutions

* Add indexes
* Use pagination
* Archive old data


# Stage 3: Query Optimization

Given query

SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;

Why slow

* No index
* Full table scan
* Sorting large data

Solution

CREATE INDEX idx_notifications
ON notifications(studentID, isRead, createdAt DESC);

Why not index everything

* Takes more space
* Slows insert and update

Query for placement notifications in last 7 days

SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';



# Stage 4: Performance Improvements

Problem
Notifications are fetched every time page loads which increases DB load.

Solutions

Caching
Store data in Redis
Fast but need to handle cache updates

Pagination
Fetch limited data instead of all

Lazy loading
Load only when user opens notifications

Real-time
Use WebSockets instead of repeated API calls


# Stage 5: Notify All Feature

Problem
Sending notifications to 50,000 users at once is slow if done directly.

Solution
Use a queue system like Kafka or RabbitMQ.

Flow

1. HR clicks notify all
2. Request goes to queue
3. Workers process in background
4. Notifications sent in parallel

Benefits

* Faster
* Scalable
* Does not block main server


# Stage 6: Priority Inbox

Objective
Show top n important notifications based on priority and time.

Priority logic

Type priority
Placement highest
Result medium
Event lowest

Recency
If same type, newer notification comes first

Approach

* Fetch notifications from API
* Assign priority based on type
* Sort by priority and timestamp
* Return top 10 notifications

API used

GET /api/v1/notifications/priority?limit=10

Time complexity

O(n log n) because of sorting

Better approach

Use min heap of size k

Time complexity becomes

O(n log k)

Handling new notifications

* Compare with lowest in heap
* Replace if higher priority
* Keeps top notifications updated

Fallback

If API fails, use fallback data

Logging

Used logging middleware everywhere with
backend stack
info and error levels
route handler and service packages


# Conclusion

This system supports basic notification features and can scale with more users. It can be improved further using caching, queues, and real-time updates.

