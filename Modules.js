(function(){
var Sections = ['intro', 'step', 'footer'];

var Modules = [

	{
		key: 'code',

		encode: function(model){
			var arr = [model.code];
			if (model.title) arr.push(model.title);
			return arr.join(', ');
		},

		decode: function(string){
			var arr = string.split(','),
				code, title;

			code = arr.splice(0, 1)[0].trim();
			title = arr.join(',').trim();

			title = (title === '') ? 'Code' : title;

			return {
				type: 'code',
				code: code,
				title: title
			};
		}
	},

	{
		key: 'map',

		encode: function(model){
			var arr = [model.href, model.src];
			if (model.label) arr.push(model.label);
			return arr.join(', ');
		},

		decode: function(string){
			var arr = string.split(','),
				href, image, label;

			if (arr.length < 2)
				return null;

			href = arr.splice(0, 1)[0].trim();
			src = arr.splice(0, 1)[0].trim();
			label = arr.join(',').trim();

			label = (label === '') ? 'View in Maps' : label;

			return {
				type: 'map',
				href: href,
				src: src,
				label: label
			};
		}
	},

	{
		key: 'imagebutton',

		encode: function(model){
			var arr = [model.href, model.src];
			if (model.title) arr.push(model.title);
			return arr.join(', ');
		},

		decode: function(string){
			var arr = string.split(','),
				href, src, alt;

			// If we don't have enough attributes, return null to be fallen back by the parser
			if (arr.length < 2) return null;

			href = arr.splice(0, 1)[0].trim();
			src = arr.splice(0, 1)[0].trim();
			title = arr.join(',').trim();

			return {
				type: 'imagebutton',
				src: src,
				href: href,
				title: title
			};
		}
	},

	{
		key: 'image',

		encode: function(model){
			var arr = [model.src];
			if (model.alt) arr.push(model.alt);
			return arr.join(', ');
		},

		decode: function(string){
			var arr = string.split(','),
				src = arr.splice(0, 1)[0].trim(),
				alt = arr.join(',').trim();

			return {
				type: 'image',
				src: src,
				alt: alt
			};
		}
	}
];

Modules.each(function(module){
	window.SimpleParse.addModule(module.key, module.encode, module.decode);
});

SimpleParse.addSections(Sections);

}).call(this);
