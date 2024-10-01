class Main{
	constructor(){
		this.getMyData();
		this.items = [];
		this.loaded = false;
		setTimeout((obj) => {obj.startingSequence()}, 1000, this);
	}

	startingSequence(){
		globalStringCounter = 0;
		this.unpackJson(received);
		for (let a in this.items){
			this.items[a] = new Item(this.items[a]);
		}
	}

	createRecipe(){
		let name = prompt("enter new item name, actual game name in latin camelCase");
		if (typeof(this.getItem(name)) !== "undefined"){
			alert("such item already exists");
			return;
		}
		let a = new Item({type: name, mostResourceEfficient: 0, preferred: 0, recipes: []});
		main.items.push(a);
		a.displayItem();
		a.tier = parseFloat(prompt("enter tier"));
		a.displayItem();
		a.ficsitPoints = parseFloat(prompt("enter ficsit point cost"));
		a.displayItem();
		let b = parseFloat(prompt("enter amount of recipes"));
		for(let c = 0; c < b; c++){
			let currentRecipe = {items:{}, byproducts:{}};
			a.recipes.push(currentRecipe);
			let items = parseFloat(prompt("enter amount of items for recipe №" + (c + 1)));
			for (let d = 0; d < items; d++){
				currentRecipe.items[prompt("enter item name №" + (d + 1))] = parseFloat(prompt("enter its amount"));
			}
			currentRecipe.items.result = parseFloat(prompt("enter resulting amount"));
			currentRecipe.ppm = parseFloat(prompt("enter amount of parts per minute"));
			currentRecipe.actualProduction = 0;
			let x = prompt("enter byproduct or cancel");
			if (x !== null){
				currentRecipe.byproducts[x] = parseFloat(prompt("enter its amount"));
			}
			x = prompt("check ok if the recipe is real, otherwise, cancel");
			if (x !== null){
				currentRecipe.pseudo = false;
			} else {
				currentRecipe.pseudo = true;
			}
			currentRecipe.building = prompt("enter building name");
		}
		a.preferred = 0;
	}

	getItem(name){
		for (let a in this.items){
			if (this.items[a].type === name){
				return this.items[a];
			}
		}
	}

	sync(){
		if (!this.loaded){console.log("NOT YET"); return}
		this.sendMyData(this.packJson(this));
	}

	packJson(obj){
		let string = "{";
		let checker = false;
		for (let a in Object.entries(obj)){
			checker = true;
			string += Object.entries(obj)[a][0] + ":";
			switch(typeof Object.entries(obj)[a][1]){
				case "object":
					if (Array.isArray(Object.entries(obj)[a][1])){
						string += this.packArray(Object.entries(obj)[a][1]);
					} else {
						string += this.packJson(Object.entries(obj)[a][1]);
					}
					break;
				case "number":
					string += Object.entries(obj)[a][1];
					break;
				case "string":
					string += '"' + Object.entries(obj)[a][1] + '"';
					break;
				case "boolean":
					string += Object.entries(obj)[a][1];
					break;
			}
			string += ",";
		}
		if (checker){
			string = string.slice(0, -1);
		}
		string += "}";
		return string;
	}

	packArray(arr){
		let string = "[";
		let checker = false;
		for (let a in arr){
			checker = true;
			switch(typeof arr[a]){
				case "object":
					if (Array.isArray(arr[a])){
						string += this.packArray(arr[a]);
					} else {
						string += this.packJson(arr[a]);
					}
					break;
				case "number":
					string += arr[a];
					break;
				case "string":
					string += '"' + arr[a] + '"';
					break;
				case "boolean":
					string += arr[a];
					break;
			}
			string += ",";
		}
		if (checker){
			string = string.slice(0, -1);
		}
		string += "]";
		return string;
	}

	unpackJson(string, projecedObject = this){
		let accumulator = "";
		let isValue = false;
		while (globalStringCounter < string.length){//перебирает всю строку (по глобальному счётчику)
			globalStringCounter++;
			if (isValue){//если сейчас читается часть строки, отвечающая за значение объекта, а не за ключ
				if (string[globalStringCounter] == "["){
					projecedObject[accumulator] = [];
					this.unpackArray(string, projecedObject[accumulator]);
					isValue = false;
					accumulator = "";
					continue;
				} else if (string[globalStringCounter] == "{"){
					projecedObject[accumulator] = {};
					this.unpackJson(string, projecedObject[accumulator]);
					isValue = false;
					accumulator = "";
					continue;
				} else if (string[globalStringCounter] == '"'){
					projecedObject[accumulator] = this.unpackString(string);
					isValue = false;
					accumulator = "";
					continue;
				} else if (string[globalStringCounter] == "t" || string[globalStringCounter] == "f"){
					globalStringCounter--;
					projecedObject[accumulator] = this.unpackBoolean(string);
					isValue = false;
					accumulator = "";
					continue;
				} else {
					globalStringCounter--;
					projecedObject[accumulator] = this.unpackNumber(string);
					isValue = false;
					accumulator = "";
					continue;
				}
			}
			if (string[globalStringCounter] == ":"){//изменяет режим чтения с ключа на значение
				isValue = true;
				continue;
			} else if (string[globalStringCounter] == ","){//переходит к следующему ключу
				isValue = false;
				continue;
			} else if (string[globalStringCounter] == "}"){//объект дочитан, переход на уровень выше
				return;
			}
			accumulator += string[globalStringCounter];//собирает по кускам ключ
		}
	}

	unpackArray(string, projecedObject){
		while (globalStringCounter < string.length){//перебирает всю строку (по глобальному счётчику)
			globalStringCounter++;
			if (string[globalStringCounter] == "["){
				let b = [];
				projecedObject.push(b);
				this.unpackArray(string, b);
				continue;
			} else if (string[globalStringCounter] == "{"){
				let b = {};
				projecedObject.push(b);
				this.unpackJson(string, b);
				continue;
			} else if (string[globalStringCounter] == '"'){
				projecedObject.push(this.unpackString(string));
				continue;
			} else if (string[globalStringCounter] == "t" || string[globalStringCounter] == "f"){
				globalStringCounter--;
				projecedObject.push(this.unpackBoolean(string));
				continue;
			} else if (string[globalStringCounter] == ","){//переходит к следующему элементу массива
				continue;
			} else if (string[globalStringCounter] == "]"){//массив дочитан, переход на уровень выше
				return;
			} else {
				globalStringCounter--;
				projecedObject.push(this.unpackNumber(string));
				continue;
			}
		}
	}

	unpackString(string){
		let accumulator = "";
		while (globalStringCounter < string.length){//перебирает всю строку (по глобальному счётчику)
			globalStringCounter++;
			if (string[globalStringCounter] == '"'){//строка дочитана, переход на уровень выше
				return accumulator;
			} else {
				accumulator += string[globalStringCounter];
			}
		}
	}

	unpackBoolean(string){
		let accumulator = "";
		while (globalStringCounter < string.length){//перебирает всю строку (по глобальному счётчику)
			globalStringCounter++;
			accumulator += string[globalStringCounter];
			let x = string[globalStringCounter + 1];
			if (x === "," || x === "}" || x === "]"){//булево значение дочитано, переход на уровень выше
				return accumulator === "true";
			}
		}
	}

	unpackNumber(string){
		let accumulator = "";
		while (globalStringCounter < string.length){//перебирает всю строку (по глобальному счётчику)
			globalStringCounter++;
			accumulator += string[globalStringCounter];
			let x = string[globalStringCounter + 1];
			if (x === "," || x === "}" || x === "]"){//число значение дочитано, переход на уровень выше
				return parseFloat(accumulator);
			}
		}
	}

	sendMyData(something){
		let url = '/write';
		fetch(url, {
			method: "post",
			headers: {
			'Accept': 'text/html',
			'Content-Type': 'text/html'
			},
			body: something
		})
		.then( (response) => {
			console.log(response);
		});
	}
	
	getMyData(){
		let url = '/read';
		fetch(url)
		.then(function(response) {
			return response.text();
		})
		.then(function(txt) {
			received = txt;
		})
	}
}


class Item{
	constructor(params){
		/*
		{
		 recipes:[
		  {items:{item1:1, item2:2, result:3}, ppm:20, actualProduction:0, building:"refinery", byproducts:{item:1}, pseudo: false},
		  {items:{item1:2, item2:3, result:3}, ppm:20, actualProduction:0, building:"refinery", byproducts:{}, pseudo: false},
		  {items:{item1:3, item2:4, result:3}, ppm:20, actualProduction:0, building:"refinery", byproducts:{}, pseudo: false}
		 ],
		 type = "item3",
		 tier:4,
		 ficsitPoints:2000,
		 mostResourceEfficient:0,
		 preferred:0
		}
		*/
		for (let a in params){
			this[a] = params[a];
		}
	}

	forOnePart(recipeId, subtractByproducts = false){
		let obj = {};
		for (let a in this.recipes[recipeId].items){
			if (a == "result"){continue}
			obj[a] = this.recipes[recipeId].items[a] / this.recipes[recipeId].items.result;
		}
		if (subtractByproducts){
			for (let a in this.recipes[recipeId].byproducts){
				obj[a] = -this.recipes[recipeId].byproducts[a] / this.recipes[recipeId].items.result;
			}
		}
		return obj;
	}

	getMostResourceEfficient(minimalTier = 1, countWater = false, subtractByproducts = false){//TODO add converter ratios?
		if (this.tier <= minimalTier){//for one part
			let obj = {};
			obj[this.type] = 1;
			return obj;
		}
		let cheapest = 0;
		let cheapestValue = 100000;
		let totalResources = {};
		for (let a in this.recipes){
			let value = 0;
			let resources = {};
			let parts = Object.entries(this.forOnePart(a, subtractByproducts));
			for (let b in parts){
				let currentItem = main.getItem(parts[b][0]);
				if (typeof currentItem === 'undefined'){
					let x = {};
					x[parts[b][0]] = parts[b][1];
					this.smartObjectAddition(resources, x);
					continue;
				}
				let partCost = currentItem.getMostResourceEfficient(minimalTier, countWater, subtractByproducts);
				this.smartObjectAddition(resources, partCost, parts[b][1]);//accumulates resource cost from each ingredient, recursively
			}
			for (let b in resources){//adds up every resource by number
				value += resources[b];
			}
			if (value < cheapestValue){
				cheapest = a;
				cheapestValue = value;
				totalResources = resources;
			}
		}
		this.mostResourceEfficient = this.recipes[cheapest];
		return totalResources;
	}

	getMostResourceEfficientNumber(minimalTier = 1, countWater = false, subtractByproducts = false){//TODO add converter ratios?
		if (this.tier <= minimalTier){//for one part
			let obj = {};
			obj[this.type] = 1;
			return obj;
		}
		let cheapest = 0;
		let cheapestValue = 100000;
		let totalResources = {};
		for (let a in this.recipes){
			let value = 0;
			let resources = {};
			let parts = Object.entries(this.forOnePart(a, subtractByproducts));
			for (let b in parts){
				let currentItem = main.getItem(parts[b][0]);
				if (typeof currentItem === 'undefined'){
					let x = {};
					x[parts[b][0]] = parts[b][1];
					this.smartObjectAddition(resources, x);
					continue;
				}
				let partCost = currentItem.getMostResourceEfficient(minimalTier, countWater, subtractByproducts);
				this.smartObjectAddition(resources, partCost, parts[b][1]);//accumulates resource cost from each ingredient, recursively
			}
			for (let b in resources){//adds up every resource by number
				value += resources[b];
			}
			if (value < cheapestValue){
				cheapest = a;
				cheapestValue = value;
				totalResources = resources;
			}
		}
		return cheapest;
	}

	getRecipeData(id, minimalTier = 1, countWater = false, subtractByproducts = false){//TODO add converter ratios?
		if (this.tier <= minimalTier){//for one part
			let obj = {};
			obj[this.type] = 1;
			return obj;
		}
		let value = 0;
		let resources = {};
		let parts = Object.entries(this.forOnePart(id, subtractByproducts));
		for (let b in parts){
			let currentItem = main.getItem(parts[b][0]);
			if (typeof currentItem === 'undefined'){
				let x = {};
				x[parts[b][0]] = parts[b][1];
				this.smartObjectAddition(resources, x);
				continue;
			}
			let partCost = currentItem.getMostResourceEfficient(minimalTier, countWater, subtractByproducts);
			this.smartObjectAddition(resources, partCost, parts[b][1]);//accumulates resource cost from each ingredient, recursively
		}
		return resources;
	}

	smartObjectAddition(obj1, obj2, multiplier = 1){//adds the second to first
		for (let a in obj2){
			if (typeof obj1[a] !== 'undefined'){
				obj1[a] += obj2[a] * multiplier;
			} else {
				obj1[a] = obj2[a] * multiplier;
			}
		}
	}

	displayItem(){
	    document.getElementById("item name").innerHTML = this.type;
	    document.getElementById("icon").src = "/static/" + this.type + ".png";
	    document.getElementById("tier").value = this.tier;
	    document.getElementById("points").value = this.ficsitPoints;
	    document.getElementById("ppm").innerHTML = this.getActualProduction();
		this.displayRecipe(0);
	}

	displayRecipe(id){
		if (this.recipes.length === 0){return}
		for (let a = 1; a <= 4; a++){
			document.getElementById("item" + a).src = "";
			document.getElementById("count" + a).innerHTML = "0";
			document.getElementById("need" + a).innerHTML = "0";
			document.getElementById("prov" + a).innerHTML = "0";
		}
	    let b = 1;
		for (let a in this.recipes[id].items){
			if (a === "result"){
				continue;
			}
			document.getElementById("item" + b).src = "/static/" + a + ".png";
			document.getElementById("count" + b).innerHTML = this.recipes[id].items[a];
			document.getElementById("need" + b).innerHTML = this.recipes[id].items[a] / this.recipes[id].items.result * this.recipes[id].actualProduction;
			if (typeof main.getItem(a) !== "undefined"){
			    document.getElementById("prov" + b).innerHTML = main.getItem(a).getActualProduction();
			} else {
			    document.getElementById("prov" + b).innerHTML = "not avaliable";
			}
			b++;
		}
		for (let a in this.recipes[id].byproducts){
			document.getElementById("byproduct").src = "/static/" + a + ".png";
			document.getElementById("byproduct in recipe").innerHTML = this.recipes[id].byproducts[a];
			document.getElementById("byproduct produced").innerHTML = this.recipes[id].byproducts[a] / this.recipes[id].items.result * this.recipes[id].actualProduction;
		}
		document.getElementById("selfcount").innerHTML = this.recipes[id].items.result;
		document.getElementById("produced").value = this.recipes[id].actualProduction;
		if (id === this.preferred){
			document.getElementById("isPreferred").checked = true;
		} else {
			document.getElementById("isPreferred").checked = false;
		}
	}

	changeProduction(id, num){
	    this.recipes[id].actualProduction = num;
	}

	getActualProduction(){
		let all = 0;
		for (let a in this.recipes){
			all += this.recipes[a].actualProduction;
		}
		return all;
	}

	getIngredients(amount = 1){
		
	}
}


function changeRecipe(){
	main.getItem(document.getElementById('item name').innerHTML).displayRecipe(document.getElementById('recipe').value);
}


function itemCountChange(){
	main.getItem(document.getElementById('item name').innerHTML).changeProduction(document.getElementById('recipe').value, parseFloat(document.getElementById('produced').value));
	main.getItem(document.getElementById('item name').innerHTML).displayRecipe(document.getElementById('recipe').value);
}


function checkRecipe(){
	if (document.getElementById('isPreferred').checked){
		main.getItem(document.getElementById('item name').innerHTML).preferred = parseFloat([document.getElementById('recipe').value]);
	} else {
		main.getItem(document.getElementById('item name').innerHTML).preferred = main.getItem(document.getElementById('item name').innerHTML).getMostResourceEfficientNumber();
	}
}


function search(){
	main.getItem(document.getElementById('search').value).displayItem();
}


let received = "";
let globalStringCounter = 0;
let main = new Main();