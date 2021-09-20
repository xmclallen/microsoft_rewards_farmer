const puppeteer = require('puppeteer-core');
const axios = require('axios');
const config = require('./settings.json');

const main = () => {
	for ( user of config.accounts ){
		farmPoints( user );
	}
};

const farmPoints = async ( userInfo ) => {

	const browser = await puppeteer.launch({
		executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		args: [
			'--incognito',
		  ],
		headless: false
	});	
	const pages = await browser.pages();
	const page = pages[0];
	page.setUserAgent(
	  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.52"
	);
	
	await loginToMicrosoftLive( page , userInfo );

	const rewards = await getRewardsInfo( page );

	console.log( JSON.stringify( rewards ) );
	console.log('[BING]', 'Beginning searches.')

	await runSearches( page , 90/3); // 90 points max / 3 points per page

	await switchToMobile( page );
	await runSearches(page, 60/3); // 60 points max / 3 points per page

	const endRewards = await getRewardsInfo( page );
	console.log( JSON.stringify( endRewards ) );

	console.log('DONE!');
	console.log();
	console.log(`[~~ Points Summary For ${userInfo.username} ~~]`)

	displayRedemptionOptions( endRewards );

	browser.close();
};


const loginToMicrosoftLive = async ( page, auth ) => {

	const url = `https://login.live.com`;

	await page.goto( url );

	// Enter username, then wait 2 seconds for next card to load
	await page.waitForSelector(`input[name="loginfmt"]`);
	await page.type(`input[name="loginfmt"]`, auth.username);
	await page.click(`input[id="idSIButton9"]`);
	await page.waitForTimeout( 2000 )

	// Enter password, then wait 2 seconds for next card to load
	if (auth.password != "")
	{
		await page.waitForSelector(`input[name="passwd"]`);
		await page.type(`input[name="passwd"]`, auth.password);
		await page.click(`input[id="idSIButton9"]`);
		await page.waitForTimeout( 2000 );		
	}
	
	// Don't remind password, wait for next page to load.
	await page.waitForSelector(`input[name="DontShowAgain"]`);
	await page.click(`input[id="idSIButton9"]`);
	await page.waitForTimeout( 2000 );
};

const getRewardsInfo = async ( page ) => {
	const url = `https://account.microsoft.com/rewards`;

	await page.goto( url );
	// Click on the Rewards link

	await page.waitForTimeout( 2000 );
	
	// Connect to Reward, wait for next page to load.
	if (await page.$('a[id="raf-signin-link-id"]') !== null)
	{
		await page.click('a[id="raf-signin-link-id"]');
		await page.waitForTimeout( 2000 );
	}

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
				
		// Connect to Bing, wait for next page to load.
		if (await page.$('input[id="id_a"]') !== null)
		{
			await page.click('input[id="id_a"]');
			await page.waitForTimeout( 2000 );
		}
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
		console.log(`${(points / reward.cost * 100 ).toFixed(2)}% of ${reward.title} ( ${reward.cost} pts)`)
		console.log(`   or ${(points / reward.discounted * 100 ).toFixed(2)}% of ${reward.discounted} pts at the discounted Level 2 rate`)
	}
};

main ();
