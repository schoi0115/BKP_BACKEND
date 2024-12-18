const csv = require('csvtojson');
const fs = require('fs');

// Get today's and yesterday's date in the format YYYYMMDD
const today = new Date();
const dateString = today.toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayDateString = yesterday.toISOString().split('T')[0].replace(/-/g, '');

// Paths
// const csvFilePath = `./data/MIOYM_MLS_${dateString}.csv`;  // Path to today's CSV file

const csvFilePath = `./data/MIOYM_MLS_20241218.csv`; 
const jsonFilePath = './data/data.json';  // Path to save the JSON data

// Function to load existing JSON data from file
function loadExistingData() {
  if (fs.existsSync(jsonFilePath)) {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing JSON data:', error.message);
      return []; // Return an empty array if parsing fails
    }
  }
  return []; // Return an empty array if file doesn't exist
}

// Function to compare and filter new data
function filterNewData(existingData, newData) {
  return newData.filter(newRecord => {
    return !existingData.some(existingRecord => existingRecord.id === newRecord.id); // Replace 'id' with a unique field to compare
  });
}

// Check if today's CSV file exists and is not empty
fs.stat(csvFilePath, (err, stats) => {
  if (err) {
    console.error('File not found:', csvFilePath);
    return;
  }
  if (stats.size === 0) {
    console.error('CSV file is empty:', csvFilePath);
    return;
  }

  // Load yesterday's existing data
  const existingData = loadExistingData();

  // Convert today's CSV to JSON
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      if (jsonObj.length === 0) {
        console.error('No data found in the CSV file.');
        return;
      }

      // Filter new records that are not already in yesterday's data
      const newRecords = filterNewData(existingData, jsonObj);

      if (newRecords.length === 0) {
        console.log('No new data to add.');
        return;
      }

      // Combine existing and new records
      const updatedData = [...existingData, ...newRecords];

      // Save the updated data to the JSON file
      fs.writeFileSync(jsonFilePath, JSON.stringify(updatedData, null, 2));
      console.log('New data added and saved to data.json');
    })
    .catch((err) => {
      console.error('Error converting CSV to JSON:', err.message);
    });
});
