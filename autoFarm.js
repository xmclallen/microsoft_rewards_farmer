const puppeteer = require('puppeteer-core');
const axios = require('axios');
const config = require('./settings.json');

(async () => {
	const browser = await puppeteer.launch({
		executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
		headless: false
	});
	const page = await browser.newPage();

	await loginToMicrosoftLive( page , config.accounts[0]);

	const rewards = await getRewardsInfo( page );

	console.log( JSON.stringify( rewards ) );
	console.log('[BING]', 'Beginning searches.')

	await runSearches( page );

	await switchToMobile( page );
	await runSearches(page, 10);

	const endRewards = await getRewardsInfo( page );
	console.log( JSON.stringify( endRewards ) );

	console.log('DONE!');

	displayRedemptionOptions( endRewards );

	await browser.close();
})();


const loginToMicrosoftLive = async ( page, auth ) => {
	console.log( JSON.stringify(config) );
	const url = `https://login.live.com`;

	await page.goto( url );

	// Enter username, then wait 2 seconds for next card to load
	await page.waitForSelector(`input[name="loginfmt"]`);
	await page.type(`input[name="loginfmt"]`, auth.username);
	await page.click(`input[id="idSIButton9"]`);
	await page.waitForTimeout( 2000 )

	// Enter password, wait for next page to load.
	await page.waitForSelector(`input[name="passwd"]`);
	await page.type(`input[name="passwd"]`, auth.password);
	await page.click(`input[id="idSIButton9"]`);
	await page.waitForTimeout( 10000 );
};

const getRewardsInfo = async ( page ) => {
	const url = `https://account.microsoft.com/rewards`;

	await page.goto( url );
	// Click on the Rewards link

	await page.waitForTimeout( 2000 );


	const rewards = await page.evaluate(() => {
		const rewardsSel = `#userBanner > mee-banner > div > div > div > div.info-columns > div:nth-child(1) > mee-banner-slot-2 > mee-rewards-user-status-item > mee-rewards-user-status-balance > div > div > div > div > div > p.bold.number.margin-top-1 > mee-rewards-counter-animation > span`;
		const element = document.querySelector( rewardsSel );
		return element && element.innerText; // will return undefined if the element is not found
	});

	return parseInt(rewards);
};


const runSearches = async ( page, numOfSearches = 20) => {
	const url = `https://www.bing.com/search?q=`;

	const terms = await getSearchTerms( numOfSearches );

	console.log( terms );

	for( term of terms ){
		await page.goto(`${url}${term}`);
		await page.waitForTimeout( 2000 );
	}
	return;
};

const getSearchTerms = async ( num = 20 ) => {
	const url = `https://random-word-api.herokuapp.com/word?swear=0&number=${num}`
	const response = await axios.get( url );
	return await response.data;
};

const switchToMobile = async ( page ) => {
	const iPhone = puppeteer.devices['iPhone 6'];
	await page.emulate(iPhone);
};

const displayRedemptionOptions = ( points ) => {
	console.log(`Your point value of ${points} is roughly equal to:`);
	for( reward of config.rewards ){
		console.log(`${parseFloat(points) / parseFloat(reward.cost)} of ${reward.title} ( ${reward.cost} pts)`)
	}
};


