const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();


app.use(express.json());

const PORT = 4005;

// const allowedOrigins = [
//     'http://localhost:3000',
//     'https://majestic-arithmetic-a69ab6.netlify.app',
//     'https://majestic-arithmetic-a69ab6.netlify.app/api/data',
//     'https://majestic-arithmetic-a69ab6.netlify.app/api/deal'
// ];
// app.use(cors({ allowedOrigins })); // Allow requests only from this origin
app.use(cors)


app.get('/', (req, res) => {
    res.send("Hellow world")
})
const calculateAverage = (high, low) => (high + low) / 2;

app.get('/api/data', (req, res) => {
    fs.readFile('./data/data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err.message);
            return res.status(500).json({ error: 'Error reading data' });
        }

        res.json(JSON.parse(data)); // Send all property data to the client
    });
});

app.get('/api/deal', (req, res) => {
    fs.readFile('./data/data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err.message);
            return res.status(500).json({ error: 'Error reading data' });
        }

        let properties = JSON.parse(data);

        // Filtering properties
        properties = properties.filter((item) => {
            const avgPrice = calculateAverage(item.avm_range_high, item.avm_range_low);
            return item.mls_list_price < avgPrice * 0.5; // List price is 50% cheaper
        });

        // Sorting properties
        const sortBy = req.query.sortBy || 'PropState'; // Default to sorting by PropState
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        properties.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
            if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
            return 0;
        });

        res.json(properties); // Send filtered and sorted data
    });
});

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

app.listen(process.env.PORT || 4005, () => {
    console.log(`Server started , ${process.env.PORT}`);
});
