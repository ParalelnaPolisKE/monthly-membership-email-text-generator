'use strict';

const parser = require('node-html-parser').parse;
const request = require('request');
const S = require('sanctuary');
const config = require('config');

const querySelector = selector => element => element.querySelector(selector);
const querySelectorAll = selector => element => element.querySelectorAll(selector);
const getChildren = parent => parent.childNodes;
const getRate = parent => parent.querySelector('.one-month-data-rate');
const flattenList = S.reduce(S.concat) ([]);
const rawText = S.prop('rawText');
const average = list => {
  const sum = S.pipe([
    S.map(S.parseFloat),
    S.map(S.fromMaybe (0)),
    S.sum,
  ])(list);
  const length = S.prop('length')(list);
  return Math.round(sum/length*100)/100;//we round to 2 decimals
}
const year = S.splitOn('.')(config.get('searchPattern'))[1];
const url = `https://freecurrencyrates.com/en/exchange-rate-history/BTC-EUR/${year}/blockchain`;
const repo = 'https://github.com/ParalelnaPolisKE/monthly-membership-email-text-generator';
const addresses = config.get('addresses');
const satoshisInBtc = 100000000;
const roundBtc = num => Math.round(num*satoshisInBtc)/satoshisInBtc;
const period = config.get('period');
const membershipFee = config.get('membershipFee');
const generateImport = addresses => S.reduce
  (acc => name => {
    const address = S.prop(name)(addresses);
    return acc + `importaddress "${address}" "${name} clenske ${period}" false\n`;
  })
  ('')
  (Object.keys(addresses));

const template = average =>
`subject: clenske za ${period} v krypto
body:
 Ahojte!\n
  zdroj: ${url}
  priemerna cena: € ${average}
  €${membershipFee} v BTC: ${roundBtc(membershipFee/average)}
  obdobie: ${period}
  skript repo: ${repo}\n
  Prosim poslat na dolu uvedene adresy:\n
${JSON.stringify(addresses, null, 2)}
  \n
  import pre bitcoind watch only addresy:\n
${generateImport(addresses)}
`

request(url, (err, res, body) => {
  const root = parser(body);
  const final = S.pipe([
    querySelectorAll('.one-month-rates'),
    S.filter (node =>
      S.pipe([
        querySelector('.month-header'),
        rawText,
        S.test (S.regex ('g') (config.get('searchPattern')))
      ])(node)
    ),
    S.head,
    S.fromMaybe({}),
    querySelectorAll('.column'),
    S.map(getChildren),
    flattenList,
    S.filter(elm => elm.tagName ? true : false),//we drop textNodes
    S.map(getRate),
    S.map(getChildren),
    flattenList,
    S.map(rawText),
    average,
  ])(root);

  console.log(template (final));
});
