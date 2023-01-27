// Global device variable
let flipper = null;

const $ = selector => document.querySelector(selector);
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

let reader;
let connected = false;

let state = 0;

// Write text to Flipper
const textEncoder = new TextEncoderStream();
let writableStreamClosed;
let writer;

const writeText = data => {
	writer.write((new TextEncoder()).encode(data));
	$("#Dout_hex").value += data.split("").map(x => x.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase() + " ").join("");
	$("#Dout_text").value += data;
};
const writeRaw = data => {
	writer.write(data);
	$("#Dout_hex").value += String.fromCharCode(...data).split("").map(x => x.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase() + " ").join("");
	$("#Dout_text").value += String.fromCharCode(...data);
}
const send = text => writeText(text + "\r\n");

// This function disconnects the flipper
const disconnect = async () => {
	reader.releaseLock();
	writer.releaseLock();
	await flipper.close();
	flipper = null;
};

const main = async () => {
	if(flipper === null){
		flipper = await navigator.serial.requestPort({ "filters": [{ "usbVendorId": 0x0483 }] });
		await flipper.open({ "baudRate": 9600 });
	}
	navigator.serial.addEventListener("disconnect", () => flipper = null);
	writer = flipper.writable.getWriter();
	setTimeout(async () => {
		while(flipper.readable){
			reader = flipper.readable.getReader();
			let dataIn = "";
			while(true){
				const { value, done } = await reader.read();
				connected = true;
				const textValue = Array.from(value).filter(x => x != 0x07).map(x => String.fromCharCode(x)).join("");
				$("#Din_hex").value += Array.from(value).map(x => x.toString(16).toUpperCase().padStart(2, "0") + " ").join("");
				$("#Din_text").value += textValue;
			}
		}
	});
};

const install = async app => {
	if(flipper == null) return alert("The Flipper Zero is not connected!");
	state = 1;
	const name = await buildFap(app);
	state = 2;
	const fap = new Uint8Array(await getFap(app));
	state = 3;
	send(`storage mkdir /ext/apps/${app.category}`);
	await sleep(500);
	send(`storage remove /ext/apps/${app.category}/${name}`);
	await sleep(500);
	writeText(`storage write_chunk /ext/apps/${app.category}/${name} ${fap.byteLength}\r`);
	await sleep(500);
	writeRaw(fap);
	state = 0;
	return fap.byteLength;
}
const installScreen = async app => {
	$(".loading").style.display = "block";
	await install(app);
	$(".loading").style.display = "none";
}

(async () => {
	loadRepos();
	for(let i of categories){
		let sel = document.createElement("input");
		sel.type = "checkbox";
		sel.id = "selcat_" + i;
		sel.style.width = "48px";
		sel.checked = true;
		sel.onchange = () => {
			console.log(1)
			console.log(document.querySelectorAll(".category_" + i))
			document.querySelectorAll(".category_" + i).forEach(j => j.style.display = sel.checked ? "flex" : "none");
		};
		$("#categories").appendChild(sel);
		
		let label = document.createElement("label");
		label.setAttribute("for", "selcat_" + i);
		label.innerText = i;
		$("#categories").appendChild(label);
	}
	for(let i of applications){
		let appDiv = document.createElement("div");
		appDiv.classList.add(`category_${i.category}`);
		appDiv.style.height = "100px";
		appDiv.style.borderBottom = "2px solid gray";
		appDiv.style.display = "flex";
		
		let icon = document.createElement("img");
		icon.style.display = "inline-block";
		icon.style.height = "80px";
		icon.style.margin = "10px";
		icon.style.imageRendering = "pixelated";
		icon.src = await getIconUrl(i);
		appDiv.appendChild(icon);
		
		let name = document.createElement("h1");
		name.style.marginLeft = "30px";
		name.style.display = "inline-block";
		name.style.height = "100px";
		name.classList.add("app_name");
		name.innerText = await getAppName(i);
		appDiv.appendChild(name);
		
		let category = document.createElement("h1");
		category.style.marginLeft = "30px";
		category.style.display = "inline-block";
		category.style.height = "100px";
		category.style.color = "gray";
		category.innerText = i.category;
		appDiv.appendChild(category);
		
		let downloadButton = document.createElement("button");
		downloadButton.style.display = "inline-block";
		downloadButton.style.position = "absolute";
		downloadButton.style.height = "80px";
		downloadButton.style.margin = "10px";
		downloadButton.style.right = "40px";
		downloadButton.innerText = "Download";
		downloadButton.onclick = () => installScreen(i);
		appDiv.appendChild(downloadButton);
		
		$("#apps").appendChild(appDiv);
	}
	const sortedApps = Array.from($("#apps").children).sort((x, y) => x.querySelector(".app_name").innerText > y.querySelector(".app_name").innerText ? 1 : -1);
	for(let i of $("#apps").children)
		i.remove();
	for(let i of sortedApps)
		$("#apps").appendChild(i);
	$(".loading").style.display = "none";
})();

setInterval(() => {
	switch(state){
		case 1:
			$("#status").innerText = "Building FAP...";
			break;
		case 2:
			$("#status").innerText = "Downloading FAP...";
			break;
		case 3:
			$("#status").innerText = "Uploading FAP to Flipper...";
			break;
		default:
			$("#status").innerText = "Loading...";
	}
	if(flipper === null){
		$("#connect").innerText = "Connect";
		$("#connect").disabled = false;
	}else{
		$("#connect").innerText = "Connected";
		$("#connect").disabled = true;
	}
}, 100);
