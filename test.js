
var start = Date.now();

for(i = 0; i < 10000; i++){
    console.log("js " + i);
}

var end = Date.now();
console.log(`Execution time: ${end - start} ms`);
