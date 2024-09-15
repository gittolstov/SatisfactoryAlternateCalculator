class Main{
	constructor(){
		for (let a in this){
			console.log(this[a]);
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