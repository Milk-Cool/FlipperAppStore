let applications = [];
let categories = [];
const loadRepos = () => {
	for(let i of Object.keys(reposList)){
		categories.push(i);
		vi = reposList[i];
		for(let j of vi)
			applications.push(new App(j, i));
	}
}
