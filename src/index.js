'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (period, language) {
  return new Promise((resolve, reject) => {

    if (typeof period === 'undefined') {
      period = 'daily';
    }

    if (typeof language === 'undefined') {
      language = '';
    }

    return axios.get('https://github.com/trending/' + encodeURIComponent(language) + '?since=' + period)
      .then(response => {
        const $ = cheerio.load(response.data);
        const repos = [];

        $('li', 'ol.repo-list').each((index, repo) => {
          const title = $(repo).find('h3').text().trim();

          const starLink = '/' + title.replace(/ /g, '') + '/stargazers';
          const forkLink = '/' + title.replace(/ /g, '') + '/network';

          repos.push({
            author: title.split(' / ')[0],
            name: title.split(' / ')[1],
            href: 'https://github.com/' + title.replace(/ /g, ''),
            description: $(repo).find('p', '.py-1').text().trim() || null,
            language: $(repo).find('[itemprop=programmingLanguage]').text().trim(),
            stars: parseInt($(repo).find('[href="' + starLink + '"]').text().trim().replace(',', '') || 0),
            forks: parseInt($(repo).find('[href="' + forkLink + '"]').text().trim().replace(',', '') || 0),
            starsToday: parseInt($(repo).find('span.float-sm-right:contains("stars today")').text().trim().replace('stars today','').replace(',','') || 0)
          });
        });

        resolve(repos);
      })
      .catch(err => {
        reject(err);
      });
  });
}