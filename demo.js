(function(){

var sections = ['intro', 'step', 'footer'];

var textarea = document.id('content'),
	button = document.id('generate');


SimpleParse.addSections(sections);

button.addEvent('click', function(){
	dbg.log(SimpleParse.decode(textarea.value));
});

}).call(this);
