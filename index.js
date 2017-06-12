const request = require("sync-request");

const COOKIE_STRING = "";
const GET_VIDEO = "http://www.youlikehits.com/youtubenew2.php?step=reload&rand=0.03451081519794963";
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
const seconds = 15;
const options = {
    headers: {
    	'Cookie': COOKIE_STRING,
    	'User-Agent' : USER_AGENT
	}
};
let count = 0;
let counter = 0;
while(count < 10) {
	counter++;
	console.log('Counter'+counter);
	let response;
	try {
		response = request('GET', GET_VIDEO, options);
		response = response.getBody('utf8');
	} catch(e) {
		console.log(e);
		continue;
	}	

	console.log(response);
	if(response.includes("Solve the Problem and Submit")) {
		console.log('continue');
		continue;
	}
	let detailsStart = response.indexOf("imageWin") + "imageWin(".length;
	let detailsEnd = response.indexOf(");", detailsStart);
	let details = response.substring(detailsStart, detailsEnd);
	details = details.split(",").map(function(element) {
		return element.trim().replace(/'/g, "");
	})
	console.log(details);
	if(details.length !== 4) {
		continue;
		process.exit(0);
	}
	
	let  VIEW_VIDEO = `http://www.youlikehits.com/youtuberender.php?id=${details[0]}&step=points&x=${details[3]}&rand=0.04596779850586352`;
	try {
		response = request('GET', VIEW_VIDEO, options);		
	} catch (e) {
		console.log(e);
		continue;
	}
	console.log('PASSED');
	var waitTill = new Date(new Date().getTime() + parseInt(details[2]) * 1000);
	while(waitTill > new Date()){}
	console.log('Wait complete');

	const GET_POINTS = `http://www.youlikehits.com/playyoutubenew.php?id=${details[0]}&step=points&x=${details[3]}&rand=0.04596779850586352`;
	console.log(GET_POINTS);
	try {
		response = request('GET', GET_POINTS, options);
	} catch(e) {
		console.log(e);
		continue;
	}
	response = response.getBody('utf8');
	console.log(response);
	console.log(count);
	count++;
}

