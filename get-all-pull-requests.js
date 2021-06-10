/*
Eric Richards
2021-06-09
*/

const axios = require('axios');
main()


// main ctrl
async function main() {
	const reposList = await getListOfRepos()

	var allPullsList = [];

	for (i = 0; i < reposList.data.length; i++) {
		var listOfPulls = [];
		var oneRepoPullsList = await getListOfPulls(reposList.data[i].name, 1, listOfPulls)
		allPullsList = allPullsList.concat(oneRepoPullsList)
	}

	console.log(allPullsList)
};


// returns JSON of repos
async function getListOfRepos() {
	try {
		let resRepos = await axios({
			url: 'https://api.github.com/orgs/ramda/repos',
			method: 'get',
			headers: {
				'Authorization': 'token abc123',
				'Content-Type': 'application/json',
			}
		})
		return resRepos;

	} catch (err) {
		console.error(err);
	}
};


// returns JSON of pull requests, given a repo name
async function getListOfPulls(repo, page, listOfPulls) {
	try {
		let resPulls = await axios({
			url: 'https://api.github.com/repos/ramda/' + repo + '/pulls',
			method: 'get',
			headers: {
				'Authorization': 'token abc123',
				'Content-Type': 'application/json',
			},
			params: {
				'state': 'all',
				'page': page,
				'per_page': 100,
			}
		})
		listOfPulls = listOfPulls.concat(resPulls.data)

		// use the 'link' response header to recursively call this function if there is a next page
		if (resPulls.headers.link) {
			var headerLink = resPulls.headers.link.split(',');

			if (headerLink[0].substr(headerLink[0].length - 5,headerLink[0].length - 1) == 'next"') {
				var nextPage = headerLink[0].substring(headerLink[0].indexOf('&page=') + 6, headerLink[0].indexOf('&per_page'));
				listOfPulls = await getListOfPulls(repo, nextPage, listOfPulls)
			} else if (headerLink[1].substr(headerLink[1].length - 5,headerLink[1].length - 1) == 'next"') {
				var nextPage = headerLink[1].substring(headerLink[1].indexOf('&page=') + 6, headerLink[1].indexOf('&per_page'));
				listOfPulls = await getListOfPulls(repo, nextPage, listOfPulls)
			} else { return listOfPulls; }
		}
		return listOfPulls;

	} catch (err) {
		console.error(err);
	}
};
