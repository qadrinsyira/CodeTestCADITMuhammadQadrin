'use strict';	
//Muhammad Qadrin Syira
//Electrical Engineering Institut Teknologi Bandung
//Sensor Aggregation - Nodejs Application

/*

	Functions

*/

function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}

function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();
 
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return median;
}

function arrayMin(arr) {
	var len = arr.length, min = Infinity;
	while (len--) {
	  if (arr[len] < min) {
		min = arr[len];
	  }
	}
	return min;
  };
  
  function arrayMax(arr) {
	var len = arr.length, max = -Infinity;
	while (len--) {
	  if (arr[len] > max) {
		max = arr[len];
	  }
	}
	return max;
  };


/*

	Data Preparation

*/
var fs = require('fs');
let rawdata = fs.readFileSync('sensor_data.json');
let sensor = JSON.parse(rawdata);
//console.log(sensor);


/*

	Programs

*/


/*Changing Time from Timestamp to Date*/
sensor.array.forEach(function(arr){
	var timestamp = +arr.timestamp;
	arr.timestamp = (new Date(parseInt(timestamp))).toLocaleDateString();
})
//console.log(sensor.array);


/*Grouping by Date*/
let resultDate = sensor.array.reduce(function (r, a) {
	r[a.timestamp] = r[a.timestamp] || [];
	r[a.timestamp].push(a);
	//r["timestamp"] = a.timestamp
	//r["data"] = r[a.timestamp]
	return r;
}, Object.create(null));


/*Grouping by RoomArea inside the Date Group*/

let lengthOfDate = Object.keys(resultDate).length;

var arrayRoomDate = [];
for (let i = 0; i < lengthOfDate; i++){
    let date = ''
    let arrayTemp = resultDate[Object.keys(resultDate)[i]].reduce(function (r, a) {
        date = a.timestamp
        r[a.roomArea] = r[a.roomArea] || []
        r[a.roomArea].push(a)
        return r
        }, {})

    let objectTemp = {
        date: date,
        data: arrayTemp
    }

    arrayRoomDate.push(objectTemp)
}



//Printing Resultdate & ArrayRoomDate

//console.log(resultDate);
//console.log(arrayRoomDate);
//console.log(arrayRoomDate[5]);

var arrayFinal = [];
arrayRoomDate.forEach(function(el){
	el.processedData = {}
    Object.keys(el.data).forEach(function(key) {
		let arrayTemperature = []
		let arrayHumidity = []
		el.data[key].forEach(function(data){
			arrayTemperature.push(data.temperature)
			arrayHumidity.push(data.humidity)
		})
		let meanTemperature = mean(arrayTemperature)
		let meanHumidity = mean(arrayHumidity)
		let medianTemperature = median(arrayTemperature)
		let medianHumidity = median(arrayHumidity)
		let minTemperature = arrayMin(arrayTemperature)
		let minHumidity = arrayMin(arrayHumidity)
		let maxTemperature = arrayMax(arrayTemperature)
		let maxHumidity = arrayMax(arrayHumidity)


		el.processedData[key]= {
			minTemperature: minTemperature,
			minHumidity: minHumidity,
			maxTemperature: maxTemperature,
			maxHumidity: maxHumidity,
			medianTemperature: medianTemperature,
			medianHumidity: medianHumidity,
			avgTemperature: meanTemperature,
			avgHumidity: meanHumidity
		}

		let objectTempProcessed = {
			date: el.date,
			data: el.processedData
		}

		arrayFinal.push(objectTempProcessed)
    });
})

console.log(arrayFinal)


//Writing output on hasil2.js
const write = JSON.stringify(arrayFinal)
fs.writeFile('resultAggregation.json', write, (err) => {
    if (err) {
        throw err
    }
})