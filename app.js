class App {
	constructor(path, category){
		path = path.split("/");
		this.category = category;
		this.author = path[0];
		this.name = path[1];
		this.branch = path[2];
		this.path = this.author + "/" + this.name;
		this.full = path.join("/");
	}
}
