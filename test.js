// const translate = require('google-translate-api');

 
if(teslang.isSupported('id')){
    console.log("true");
}else{
    console.log("false")
}

// translate('Ik spreek Engels', {to: 'sdf'}).then(res => {
//     console.log(res.text);
//     //=> I speak English
//     console.log(res.from.language.iso);
//     //=> nl
// });