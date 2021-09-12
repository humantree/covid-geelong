/* eslint-disable no-console */

const commandLineArgs = require('command-line-args');
const checkForCases = require('./check-for-cases');

(async () => {
  const optionDefinitions = [
    { name: 'all-active', type: Boolean },
    { name: 'skip-time-check', type: Boolean },
  ];

  const options = commandLineArgs(optionDefinitions);
  console.log(await checkForCases(options['skip-time-check'], options['all-active']));
})();
