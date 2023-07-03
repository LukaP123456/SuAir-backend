// data.js
const tokens = [
    process.env.STUDIO_PRESENT_TOKEN,
    process.env.MAKSIMA_TOKEN,
    process.env.DESANKA_TOKEN,
];

const urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token);
const lat_long_urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token + "/validated-data");

const data_files = [
    {data: '../test-data-json/stud-pres-big-data.json', lat_long_data: '../test-data-json/stud-pres-small-data.json'},
    {data: '../test-data-json/maksima-big-data.json', lat_long_data: '../test-data-json/maksima-small-data.json'},
    {data: '../test-data-json/desanka-big-data.json', lat_long_data: '../test-data-json/desanka-small-data.json'},
];

module.exports = {urls, lat_long_urls, data_files};
