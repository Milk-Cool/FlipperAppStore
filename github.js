const getIconUrl = app => new Promise((resolve, reject) => {
	fetch(`https://raw.githubusercontent.com/${app.full}/application.fam`).then(res => res.text()).then(async res => {
		resolve(`https://raw.githubusercontent.com/${app.full}/${res.match(/fap_icon="(?<icon>.+)"/).groups.icon}`);
	}).catch(() => resolve("unknown.png"));
});
const getAppName = app => new Promise((resolve, reject) => {
	fetch(`https://raw.githubusercontent.com/${app.full}/application.fam`).then(res => res.text()).then(async res => {
		resolve(res.match(/name="(?<name>.+)"/).groups.name);
	}).catch(() => resolve(app.name));
});
