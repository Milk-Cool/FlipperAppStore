const buildFap = app => new Promise((resolve, reject) => {
	fetch(`https://corsanywhere-taloud.onrender.com/https://flipc.org/api/v1/${app.path}?branch=${app.branch}&nowerr=1`, {
		"headers": {
			"accept": "application/json"
		},
		"method": "GET",
	}).then(res => res.json()).then(res => resolve(res.fap.filename)).catch(reject);
});
const getFap = app => new Promise((resolve, reject) => {
	fetch(`https://corsanywhere-taloud.onrender.com/https://flipc.org/api/v1/${app.path}/elf?branch=${app.branch}&nowerr=1`, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
		},
		"method": "GET"
	}).then(res => res.arrayBuffer()).then(resolve).catch(reject);
});
