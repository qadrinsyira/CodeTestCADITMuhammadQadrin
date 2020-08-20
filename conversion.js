'use strict';	
//Muhammad Qadrin Syira
//Electrical Engineering Institut Teknologi Bandung
//Salary Conversion - Nodejs Application


//Library and Declarations
const fetch = require("node-fetch");
var salaries = {};
var https = require('https');

/*

Functions

*/

function convertCurrency(amount, fromCurrency, toCurrency, cb) {
	var apiKey = '68f9db8cf41dbfcf65b3';
	
	fromCurrency = encodeURIComponent(fromCurrency);
	toCurrency = encodeURIComponent(toCurrency);
	var query = fromCurrency + '_' + toCurrency;
	
	var url = 'https://free.currconv.com/api/v7/convert?q='
				+ query + '&compact=ultra&apiKey=' + apiKey;
	
	https.get(url, function(res){
		var body = '';
	
		res.on('data', function(chunk){
			body += chunk;
		});
	
		res.on('end', function(){
			try {
				var jsonObj = JSON.parse(body);
	
				var val = jsonObj[query];
				if (val) {
				var total = val * amount;
				cb(null, Math.round(total * 100) / 100);
				} else {
				var err = new Error("Value not found for " + query);
				console.log(err);
				cb(err);
				}
			} catch(e) {
				console.log("Parse error: ", e);
				cb(e);
			}
		});
	}).on('error', function(e){
			console.log("Got an error: ", e);
			cb(e);
	});
	}

//Dummy Async Function for Convertion Testing

/*function asyncFunction (a, b, c, cb) {
//	setTimeout(() => {
//		cb('err', a*2);
//	}, 1000);
} */
	
//Reading Local Salary File
var fs = require('fs');
fs.readFile('salary_data.json', (err, data) => {
	if (err) throw err;
	salaries = JSON.parse(data);

	//Iteration for All Convertion
	function convertAll(cbfunction){
		let salariesUSD = [];
		for (let i =0; i< salaries.array.length;i++) {
			let salary = salaries.array[i].salaryInIDR;
			salariesUSD[i] = {
				id: salaries.array[i].id,
				salaryInUSD: 0
			}
			convertCurrency(salary, 'IDR', 'USD', function(err, amount) {
				// console.log(amount)
				salariesUSD[i].salaryInUSD = amount;

				//If ALL CONVERSION is success
				if(i == salaries.array.length - 1){
					cbfunction(salariesUSD)
				}
			});
		}

	}
	//Success Conversion
	convertAll(
		function(salariesUSD){
		let url = 'http://jsonplaceholder.typicode.com/users';
		
		//Fetching Data
		fetch(url)
		.then(function(response) {
			return response.json();	
		})
		.then(function(datas){
			for (let i = 0; i < datas.length ; i++){
				datas[i]['salaryInIDR'] = salaries.array[i].salaryInIDR
				datas[i]['salaryInUSD'] = salariesUSD[i].salaryInUSD
			}

			console.log(datas)
			
			// Write JSON string to resultConversion.json
			const write = JSON.stringify(datas);
			fs.writeFile('resultConversion.json', write, (err) => {
				if (err) {
					throw err;
				}
				console.log("JSON data is saved.");
			});
		})
	}
	)
})




