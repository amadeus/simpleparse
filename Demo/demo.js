(function(){

var markup = document.id('content-markup'),
	decode = document.id('decode'),
	json = document.id('content-json'),
	encode = document.id('encode');

decode.addEvent('click', function(){
	var value = SimpleParse.decode(markup.value);
	if (!value) return;
	json.value = JSON.encode(value);
	markup.value = '';
});

encode.addEvent('click', function(){
	var value = JSON.decode(json.value);
	if (!value) return;
	markup.value = SimpleParse.encode(value);
	json.value = '';
});

}).call(this);
