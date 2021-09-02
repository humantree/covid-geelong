/* eslint-disable no-console */

const parse = require('csv-parse/lib/sync');
const got = require('got');
const moment = require('moment-timezone');

const postcodeNames = require('./postcode-names.json');

async function getCasesByLGA() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9oKYNQhJ6v85dQ9qsybfMfc-eaJ9oKVDZKx-VGUr6szNoTbvsLTzpEaJ3oW_LZTklZbz70hDBUt-d/pub?gid=0&single=true&output=csv';
  const { body } = (await got(url));
  return parse(body, { columns: true });
}

async function getCasesByPostcode() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwXSqlP56q78lZKxc092o6UuIyi7VqOIQj6RM4QmlVPgtJZfbgzv0a3X7wQQkhNu8MFolhVwMy4VnF/pub?gid=0&single=true&output=csv';
  const { body } = (await got(url));
  return parse(body, { columns: true });
}

function filterPostcodes(postcodes) {
  const VALID_POSTCODES = ['3211', '3212', '3213', '3214', '3215', '3216', '3219', '3220', '3222', '3223', '3224', '3225', '3226', '3227'];
  return postcodes.filter((postcode) => postcode.new > 0
    && VALID_POSTCODES.includes(postcode.postcode));
}

(async () => {
  const lgas = await getCasesByLGA();

  const today = moment().tz('Australia/Melbourne').format('DD/MM/YYYY');
  const lastUpdated = lgas[0].file_processed_date;

  if (today !== lastUpdated) {
    return console.log('⏳ Case data not updated yet');
  }

  const geelong = lgas.find((lga) => lga.LGA === 'Greater Geelong (C)');
  geelong.new = +geelong.new;

  if (+geelong.new === 0) {
    return console.log('✅ No new cases reported in Greater Geelong');
  }

  console.log(`😷 ${geelong.new} new case${geelong.new > 1 ? 's' : ''} reported in Greater Geelong\n`);

  const postcodes = await getCasesByPostcode();
  const postcodesLastUpdated = postcodes[0].file_processed_date;

  if (today !== postcodesLastUpdated) {
    return console.log('⏳ Postcode data not updated yet');
  }

  const geelongPostcodes = filterPostcodes(postcodes);

  geelongPostcodes.forEach((postcode) => {
    console.log(`🦠 ${postcode.postcode}: ${postcode.new}`);
    console.log(`   ${postcodeNames[postcode.postcode]}\n`);
  });

  return 0;
})();
