const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

// Static serve of frontend
app.use(express.static(path.join(__dirname, 'public')));

// In-memory lock store: { [tableId]: { userId, expiry } }
const tableLocks = {};

app.use(bodyParser.json());

function getEffectiveLock(tableId) {
    if (!tableLocks[tableId]) return null;
    const now = Date.now();
    if (tableLocks[tableId].expiry > now) return tableLocks[tableId];
    delete tableLocks[tableId];
    return null;
}

app.post('/api/tables/lock', (req, res) => {
    const { tableId, userId, duration } = req.body;
    if (typeof tableId !== 'string' || typeof userId !== 'string' || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid request: tableId, userId, and positive duration required."
        });
    }
    const lock = getEffectiveLock(tableId);

    if (lock) return res.status(409).json({
        success: false,
        message: "Table is currently locked by another user."
    });

    const expiry = Date.now() + duration * 1000;
    tableLocks[tableId] = { userId, expiry };

    return res.status(200).json({
        success: true,
        message: "Table locked successfully."
    });
});

app.post('/api/tables/unlock', (req, res) => {

    const { tableId, userId } = req.body;
    if (typeof tableId !== 'string' || typeof userId !== 'string')
        return res.status(400).json({
            success: false,
            message: "Invalid request: tableId and userId required."
        });

    const lock = getEffectiveLock(tableId);
    if (!lock) return res.status(400).json({
        success: false,
        message: "Unlock failed: Table not locked or lock expired."
    });

    if (lock.userId !== userId)
        return res.status(400).json({
            success: false,
            message: "Unlock failed: Table not locked by this user."
        });

    delete tableLocks[tableId];

    return res.status(200).json({
        success: true,
        message: "Table unlocked successfully."
    });
});

app.get('/api/tables/:tableId/status', (req, res) => {
    const { tableId } = req.params;
    if (!tableId) return res.status(400).json({ isLocked: false });
    const lock = getEffectiveLock(tableId);
    res.status(200).json({ isLocked: !!lock });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found." });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
    console.log(`Table Reservation Lock API running at http://localhost:${PORT}/`);
});
