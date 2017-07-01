const request = require("sync-request");
const inquirer = require("inquirer");
const sync = require('child_process').execSync;

const { log } = console;

let answers = {
	"cookie" : process.env.npm_config_cookie,
	"captcha" : process.env.npm_config_captcha,
	"runTimes" : process.env.npm_config_times
};
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 


let COOKIE_STRING, CAPTCHA_ANSWER;

const GET_VIDEO =
	"https://www.youlikehits.com/youtubenew2.php?step=reload&rand=0.1";
const USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";

const CAPTCHA_CHECKER = "Solve the Problem and Submit";
const LOGIN_CHECKER = "Please login again";
const CAPTCHA_RETRY_CHECKER = "You did not successfully solve the problem.";
const VIEW_LENGTH_CHECKER = "You didn't view the video for the specified length of time";
const HOST = "https://www.youlikehits.com/";
const CUSTOM_COOKIE_STRING = process.env.npm_config_custom;

let options = {
	headers: {
		Cookie: COOKIE_STRING,
		"User-Agent": USER_AGENT
	},
	retry: true,
	maxRetries: 3
};

const API = {
	youtube: {
		GET: {
			url: `${HOST}youtubenew2.php?step=reload&rand=0.1`,
			method: "GET"
		},
		CAPTCHA: {
			url: `${HOST}youtubenew2.php`,
			method: "POST"
		}
	}
};

const checkers = {
	captcha_checker: function(response) {
		if (response.includes(CAPTCHA_CHECKER)) {
			solveCaptcha();
		}
		return true;
	},
	login_checker: function(response) {
		if (response.includes(LOGIN_CHECKER)) {
			console.log(options);
			exit("LOGIN IS REQUIRED");
		}
		return true;
	},
	captcha_rety_checher: function(response) {
		if (response.includes(CAPTCHA_RETRY_CHECKER)) {
			return false;
		}
		return true;
	},
	view_length_checker: function(response) {
		if (response.includes(VIEW_LENGTH_CHECKER)) {
			return false;
		}
		return true;
	}
};

const exit = function(message) {
	log(message);
	process.exit(0);
};

const wait = function(seconds = 1) {
	let waitTill = new Date(new Date().getTime() + seconds * 1000);
	while (waitTill > new Date()) {}
	return true;
};

const solveCaptcha = function(times = 3) {
	let option = Object.assign(options);

	option["headers"]["Content-Type"] = "application/x-www-form-urlencoded";
	option["body"] = `answer=${CAPTCHA_ANSWER}&submit=Submit`;

	let response = requestURL(
		API["youtube"]["CAPTCHA"]["method"],
		API["youtube"]["CAPTCHA"]["url"],
		options,
		[checkers["captcha_rety_checher"]]
	);

	if (response.includes(CAPTCHA_RETRY_CHECKER) && times > 0) {
		return solveCaptcha(--times);
	}
};

const requestURL = function(method, URL, options, checkers = [], times = 3) {
		let response,
		passed = true;
		response = request(method, URL, options);
		response = response.getBody("utf8")
	if (times === 0) {
		console.log();
		console.log(URL, method, options);
		console.log(response);
		exit("URL REQUEST PROBLEM" + URL);
	}


	try {
;
		passed = checkers.reduce(function(result, currentFunction) {
			return result && currentFunction(response);
		}, true);
	} catch (e) {
		passed = false;
		log(e);
	}
	response = passed
		? response
		: requestURL(method, URL, options, checkers, --times);
	return response;
};

const questions = [
	{
		type: "confirm",
		name: "login",
		message: "Did you login on youlikehits.com?",
		default: false
	},
	{
		type: "input",
		name: "cookie",
		message: "Please Copy Paste the Cookie you get on login",
		default: false,
		when: answers => {
			if (!answers.login) {
				log("You must login");
				return false;
			}
			return true;
		}
	},
	{
		type: "input",
		name: "captcha",
		message: `I promise.. this is last step ..Go to view youtube and solve captcha and input result here`,
		default: false,
		when: answers => {
			if (!answers.cookie) {
				log("You must enter your cookie first");
				return false;
			}
			return true;
		}
	},
	{
		type: "input",
		name: "times",
		message: `Number of videos to watch ..you can enter ..default is 10 ;)`,
		default: 10,
		when: answers => {
			if (!answers.login) {
				log("You must login");
				return false;
			}
			return true;
		}
	}
];

function setOptions(cookieString) {
	options['headers']['Cookie'] = cookieString;
}

function updateOptions() {
	let cookieString = options['headers']['Cookie'];
	let customString = "_pk_id.1."+CUSTOM_COOKIE_STRING;
	let idStart = cookieString.indexOf(customString)+(customString).length;
	let idEnd = cookieString.indexOf(";", idStart);
	let id = cookieString.substring(idStart, idEnd);
	let arrId = id.split(".");
	let date = Math.round((new Date()).getTime() / 1000);	

	cookieString = cookieString.replaceAll(arrId[3], ''+date); 
	cookieString = cookieString.replaceAll(arrId[4], ''+date); 
	idStart = cookieString.indexOf("__utma")+"__utma".length;
	idEnd = cookieString.indexOf(";", idStart);
	id = cookieString.substring(idStart, idEnd);
	arrId = id.split(".");

	cookieString = cookieString.replaceAll(arrId[3], ''+date); 
	options['headers']['Cookie'] = cookieString;
	process.env['sccookie'] = cookieString;

}

function setCaptchaAnswer(answer) {
	CAPTCHA_ANSWER = answer;
}

function startSoundCloud() {
	let command = `npm run scrunner --sccookie="${options.headers.Cookie}"`;
	sync(command, {stdio:[0,1,2]});
}

function startYoutube() {
	let total = parseInt(answers.runTimes);
	let currentTime = 0;

	while (currentTime < total) {
		viewVideo() ? currentTime++ : null;
	}
}
function init() {
	setOptions(answers.cookie);
	updateOptions();
	setCaptchaAnswer(answers.captcha);
	startYoutube();
	startSoundCloud();

};

function viewVideo() {
	updateOptions();

	let response;
	let defaultCheckers = [
		checkers["captcha_checker"],
		checkers["login_checker"],
		checkers["view_length_checker"]
	];

	response = requestURL(
		API["youtube"]["GET"]["method"],
		API["youtube"]["GET"]["url"],
		options,
		defaultCheckers
	);

	let detailsStart = response.indexOf("imageWin") + "imageWin(".length;
	let detailsEnd = response.indexOf(");", detailsStart);
	let details = response.substring(detailsStart, detailsEnd);
	details = details.split(",").map(function(element) {
		return element.trim().replace(/'/g, "");
	});

	if (details.length !== 4) {
		log(response);
		log("Skipped a video");
		log("If captcha is reason for skip..wait for retry ...");

		return false;
	}

	log("Got a video :D");
	let VIEW_VIDEO = `https://www.youlikehits.com/youtuberender.php?id=${details[0]}&step=points&x=${details[3]}&rand=0.04596779850586352`;
	response = requestURL("GET", VIEW_VIDEO, options, defaultCheckers);

	// WAIT
	let seconds = parseInt(details[2]) + 5;
	log(`Waiting for ${seconds} seconds`);
	let waiting = wait(seconds);

	// GET POINTS
	const GET_POINTS = `https://www.youlikehits.com/playyoutubenew.php?id=${details[0]}&step=points&x=${details[3]}&rand=0.04596779850586352`;

	response = requestURL("GET", GET_POINTS, options, defaultCheckers);
	let pointsStart = response.indexOf("Points Added!") - 4;
	let pointsEnd = response.indexOf("Points Added!") + "Points Added!".length;
	let points = response.substring(pointsStart, pointsEnd);
	let result = response.indexOf("Points Added!") !== -1 ? true : false;
	result ? log(points) : null;

	updateOptions();
	return true;
}



init();
