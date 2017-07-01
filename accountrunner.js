const sync = require('child_process').execSync;

const fs = require('fs');
const acc = fs.readFileSync('accounts.json').toString();
const accounts = JSON.parse(acc).accounts;

for(var i=0; i<accounts.length; i++) {
	let account = accounts[i];
	// console.log(accounts);
	try {
		let command = `npm run runner --cookie="${account.cookie}" --times="${account.times}" --captcha="${account.captcha}" --custom="${account.custom_cookie_string}"`;
		sync(command, {stdio:[0,1,2]});
	} catch(e) {
		console.log(e);
	}
	if(i == accounts.length - 1) {
		i = -1;
	}
}