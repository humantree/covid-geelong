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
  const validPostcodes = Object.keys(postcodeNames);
  return postcodes.filter((postcode) => postcode.new > 0
    && validPostcodes.includes(postcode.postcode));
}

async function checkForCases(skipTimeCheck = false) {
  let output = '';
  const lgas = await getCasesByLGA();

  const today = moment().tz('Australia/Melbourne').format('DD/MM/YYYY');
  const lastUpdated = lgas[0].file_processed_date;

  if (!skipTimeCheck && today !== lastUpdated) {
    output += '⏳ Case data not updated yet\n';
    output += '   This is usually updated around 12 PM AEST';
    return output;
  }

  const geelong = lgas.find((lga) => lga.LGA === 'Greater Geelong (C)');
  geelong.new = +geelong.new;

  if (+geelong.new === 0) {
    return '✅ No new cases reported in Greater Geelong';
  }

  output += `😷 ${geelong.new} new case${geelong.new > 1 ? 's' : ''} reported in Greater Geelong\n\n`;

  const postcodes = await getCasesByPostcode();
  const postcodesLastUpdated = postcodes[0].file_processed_date;

  if (!skipTimeCheck && today !== postcodesLastUpdated) {
    output += '⏳ Postcode data not updated yet';
    return output;
  }

  const geelongPostcodes = filterPostcodes(postcodes);

  geelongPostcodes.forEach((postcode) => {
    output += `🦠 ${postcode.postcode}: ${postcode.new}\n`;
    output += `   ${postcodeNames[postcode.postcode]}\n\n`;
  });

  return output;
}

module.exports = checkForCases;
