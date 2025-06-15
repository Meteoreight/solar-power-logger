import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = '/app/data/records.json';

app.use(express.json());

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// GET /api/records - Retrieve all records
app.get('/api/records', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, return empty array
                return res.json([]);
            }
            console.error('Error reading data file:', err);
            return res.status(500).json({ message: 'Error reading data file' });
        }
        try {
            const records = JSON.parse(data);
            res.json(records);
        } catch (parseError) {
            console.error('Error parsing data file:', parseError);
            // If parsing fails (e.g. empty or corrupted file), return empty array
            res.json([]);
        }
    });
});

// POST /api/records - Add new records or overwrite existing file
app.post('/api/records', (req, res) => {
    const newRecords = req.body;

    if (!Array.isArray(newRecords)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of records.' });
    }

    // Validate individual records (basic check)
    if (newRecords.some(record => typeof record.date !== 'string' || typeof record.totalWhGenerated !== 'number')) {
        return res.status(400).json({ message: 'Invalid record structure. Each record must have a date (string) and totalWhGenerated (number).' });
    }

    fs.writeFile(DATA_FILE, JSON.stringify(newRecords, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing data file:', err);
            return res.status(500).json({ message: 'Error writing data file' });
        }
        res.status(201).json({ message: 'Records saved successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
