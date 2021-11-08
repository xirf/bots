const scrapy = require('node-scrapy');
const fetch = (...args) => import('node-fetch').then(({
	default: fetch
}) => fetch(...args));

