class Main{
	constructor(){
		this.getMyData();
		this.items = [];
		this.loaded = false;
		this.productionSetups = [];
		setTimeout((obj) => {obj.startingSequence()}, 1000, this);
	}

	startingSequence(){
		globalStringCounter = 0;
		this.unpackJson(received);
		for (let a in this.items){
			this.items[a] = new Item(this.items[a]);
		}
		this.loadSetup(0);
	}

	loadSetup(id){
		for (let a in this.items){
			this.items[a].clearProduction();
		}
		for (let a in this.productionSetups[id]){
			this.getItem(a).loadProduction(this.productionSetups[id][a]);
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
		a.preferred = -1;
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

	makeJsonReadable(json){
		let a = this.packJson(json);
		let previous = 0;
		let array = [];
		for (let b = 0; b < a.length; b++){
			if (a[b] === "," || a[b] === ":"){
				array.push(a.slice(previous, b + 1));
				previous = b + 1;
			}
		}
		array.push(a.slice(previous, a.length));
		let string = array.join(" ");
		previous = 0;
		array = [];
		for (let b = 0; b < string.length; b++){
			if (string[b] === "," && string[b - 1] === "}"){
				array.push(string.slice(previous, b + 1));
				previous = b + 1;
			}
		}
		array.push(string.slice(previous, string.length));
		string = array.join("\n");
		return string;
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

	sortRecipes(){
        let temp = [...this.items];
        let sorted = [];
        let len = temp.length;
        for (let a = 0; a < len; a++){
            let recipeCost = 0;
            let maxId = 0;
            for (let b in temp){
                let cost = temp[b].getBestRecipeData(1, false, undefined, false)[0];
                let accum = 0;
                for (let c in cost){
                    accum += cost[c];
                }
                if (accum > recipeCost){
                    recipeCost = accum;
                    maxId = b;
                }
            }
            let slic = temp.splice(maxId, 1)[0];
            sorted.push({cost: recipeCost, item: slic.type, tier: slic.tier, ficsitPoints: slic.ficsitPoints, point_per_resource: slic.ficsitPoints/recipeCost});
        }
        console.log(sorted);
	}

	//handler functions
	changeRecipe(){
		main.getItem(document.getElementById('item name').innerHTML).displayRecipe(document.getElementById('recipe').value);
	}
	
	itemCountChange(){
		main.getItem(document.getElementById('item name').innerHTML).changeProduction(document.getElementById('recipe').value, parseFloat(document.getElementById('produced').value));
		main.getItem(document.getElementById('item name').innerHTML).displayRecipe(document.getElementById('recipe').value);
	}
	
	checkRecipe(){
		if (document.getElementById('isPreferred').checked){
			main.getItem(document.getElementById('item name').innerHTML).preferred = parseFloat([document.getElementById('recipe').value]);
		} else {
			main.getItem(document.getElementById('item name').innerHTML).preferred = main.getItem(document.getElementById('item name').innerHTML).getMostResourceEfficientNumber();
		}
	}
	
	search(){
		main.getItem(document.getElementById('search').value).displayItem();
	}

	displayEstimate(){
		let a = 
		main.getItem(
			document.getElementById('item name').innerHTML
		).getRecipeData(
			parseFloat(document.getElementById('recipe').value),
			parseFloat(document.getElementById('searchableTier').value)
		)
		let SUM = 0;
		for (let b in a){//adds up every resource into one number
			SUM += a[b];
		}
		a.SUM = SUM;
		alert(this.packJson(a));
	}

	displayBest(){
		let a = main.getItem(document.getElementById('item name').innerHTML);
		let bestNum = a.getMostResourceEfficientNumber(parseFloat(document.getElementById('searchableTier').value));
		a.displayRecipe(bestNum);
		document.getElementById('recipe').value = bestNum;
	}

	changeTier(){
		let a = main.getItem(document.getElementById('item name').innerHTML);
		a.tier = parseFloat(document.getElementById('tier').value);
	}

	changePoints(){
		let a = main.getItem(document.getElementById('item name').innerHTML);
		a.points = parseFloat(document.getElementById('points').value);
	}

	getCurrent(){
		return main.getItem(document.getElementById('item name').innerHTML);
	}

	enterHandler(){
	    if (event.keyCode === 13){
	        this.search();
	    }
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
		this.clearProduction();
	}

	redefineTier(){
		for (let a in this.recipes){
			let tier = 0;
			for (let b in this.recipes[a].items){
				if (b === "result"){continue}
				if (typeof main.getItem(b) === "undefined"){continue}
				if (main.getItem(b).tier > tier){
					tier = main.getItem(b).tier;
				}
			}
			if (tier < this.tier){
				this.tier = tier + 1;
			}
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

	getBestRecipeData(minimalTier, countWater, usePreferred = true, subtractByproducts, id = -1, chain = false){//if id is -1, will pick best recipe, otherwise, id one
		if (this.tier <= minimalTier){//for one part
			let obj = {};
			obj[this.type] = 1;
			return [obj, 0];
		}
		let cheapest = 0;
		let cheapestValue = 100000;
		let totalResources = {};
		let recipesLength = this.recipes.length;
		let a0 = 0;
		if (id >= 0){
			a0 = id;
			recipesLength = id + 1;
		} else if (usePreferred && this.preferred >= 0){
			a0 = this.preferred;
			recipesLength = a0 + 1;
		}
		let temporalChain = {};
		for (let a = a0; a < recipesLength; a++){
			let value = 0;
			let resources = {};
			let parts = Object.entries(this.forOnePart(a, subtractByproducts));
			let temporalierChain = false;
			if (chain){
				temporalierChain = {};
			}
			for (let b in parts){
				if (parts[b][0] === "water" && !countWater){continue}
				let currentItem = main.getItem(parts[b][0]);
				if (typeof currentItem === 'undefined'){
					let x = {};
					x[parts[b][0]] = parts[b][1];
					this.smartObjectAddition(resources, x);
					continue;
				}
				let nextData = currentItem.getBestRecipeData(minimalTier, countWater, usePreferred, subtractByproducts, undefined, temporalierChain);//partcost, cheapest, chain
				this.smartObjectAddition(resources, nextData[0], parts[b][1]);//accumulates resource cost from each ingredient, recursively
				if (chain){
					this.smartObjectAddition(temporalierChain, nextData[2], parts[b][1]);
				}
			}
			for (let b in resources){//adds up every resource into one number
				value += resources[b];
			}
			if (value < cheapestValue){
				cheapest = a;
				cheapestValue = value;
				totalResources = resources;
				if (chain){
					temporalChain = temporalierChain;
				}
			}
		}
		if (chain){
			chain = {};
			let a = {};
			a[this.type] = 1;
			this.smartObjectAddition(chain, temporalChain);
			this.smartObjectAddition(chain, a);
		}

		//this.mostResourceEfficient = this.recipes[cheapest];
		return [totalResources, cheapest, chain];
	}

	getMostResourceEfficient(minimalTier = 1, countWater = false, usePreferred = true, subtractByproducts = false){//TODO add converter ratios?
		return this.getBestRecipeData(minimalTier, countWater, usePreferred, subtractByproducts)[0];
	}

	getMostResourceEfficientNumber(minimalTier = 1, countWater = false, usePreferred = true, subtractByproducts = false){//TODO add converter ratios?
		return this.getBestRecipeData(minimalTier, countWater, usePreferred, subtractByproducts)[1];
	}

	getRecipeData(id, minimalTier = 1, countWater = false, usePreferred = true, subtractByproducts = false){//TODO add converter ratios?
		return this.getBestRecipeData(minimalTier, countWater, usePreferred, subtractByproducts, id)[0];
	}

	getProductionChain(amount = 1, minimalTier = 1, countWater = false, usePreferred = true, subtractByproducts = false){//TODO add converter ratios?
		let a = this.getBestRecipeData(minimalTier, countWater, usePreferred, subtractByproducts, undefined, {});
		let b = {};
		this.smartObjectAddition(b, a[2], amount);
		this.smartObjectAddition(b, a[0], amount);
		return main.makeJsonReadable(b);
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

	loadProduction(prod){//{2: 30}
		for (let a in prod){
			this.recipes[a].actualProduction = prod[a];
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
		if (parseFloat(id) === this.preferred){
			document.getElementById("isPreferred").checked = true;
		} else {
			document.getElementById("isPreferred").checked = false;
		}
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
	}

	changeProduction(id, num){
	    this.recipes[id].actualProduction = num;
	}

	clearProduction(){
		for (let a in this.recipes){
			this.recipes[a].actualProduction = 0;
		}
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


let received = "";
let globalStringCounter = 0;
let main = new Main();