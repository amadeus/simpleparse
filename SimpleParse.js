(function(){

if (!window.String.prototype.startsWith)
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};

var SimpleParse = window.SimpleParse = {

	addSections: function(){
		var sections = Array.flatten(Array.from(arguments));
		sections.each(function(key){
			SimpleParse.Sections.push(key);
		});
	},

	addModule: function(key, parser){
		if (
			typeOf(key) !== 'string' ||
			typeOf(parser) !== 'function'
		)
			throw new Error('SimpleParse: Missing a required argument [key, parser]: ' + key + ',' + parser);

		SimpleParse.Sections[key] = parser;
	},

	encode: function(json){
		dbg.log('not built yet');
	},

	decode: function(string){
			// Base Model
		var reference = {
				model: {},
				section: null
			},
			// Each line represents a step or module
			units = string.split('\n');

		if (!units.length) return;

		// Parse out each line
		units.each(function(unit){
			unit = unit.trim();
			if (!unit) return;
			// Determine if current string is a section, if not get the current section
			var sectionInfo = Internal.parseSection(unit, reference);

			// If we have no section or the current line is a section, no need to continue
			if (sectionInfo.isSection || !reference.section) return;

			// Parse out the next module
			Internal.parseModule(unit, reference);
		});

		return reference.model;
	},

	Sections: [],

	Modules: {
		code: function(string){
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
		},

		map: function(string){
			var arr = string.split(','),
				href, image, label;

			// If we don't have enough attributes, fallback to paragraph
			if (arr.length < 2)
				return SimpleParse.Modules.paragraph(string, reference);

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
		},

		imagebutton: function(string){
			var arr = string.split(','),
				href, src, alt;

			// If we don't have enough attributes, fallback to paragraph
			if (arr.length < 2)
				return SimpleParse.Modules.paragraph(string, reference);

			href = arr.splice(0, 1)[0].trim();
			src = arr.splice(0, 1)[0].trim();
			title = arr.join(',').trim();

			return {
				type: 'imagebutton',
				src: src,
				href: href,
				title: title
			};
		},

		image: function(string){
			var arr = string.split(','),
				src = arr.splice(0, 1)[0].trim(),
				alt = arr.join(',').trim();

			return {
				type: 'image',
				src: src,
				alt: alt
			};
		},

		paragraph: function(string){
			// TODO: Parse out links...

			// Add to section
			return {
				type: 'paragraph',
				content: string.trim()
			};
		}
	}

};

var Internal = {

	// Clean supplied key from string if it exists
	cleanKeyFromString: function(key, string){
		key = key.toUpperCase() + ':';
		if (string.startsWith(key))
			return string.slice(key.length).trim();
		return string;
	},

	// Parses string to determine if it has a model, otherwise fallback to paragraph
	parseModule: function(string, reference){
		var parsedModule = null;

		// First check to see if we have a data model this module
		Object.each(SimpleParse.Modules, function(fn, key){
			if (parsedModule) return;
			var match = key.toUpperCase() + ':';
			if (string.startsWith(match)) {
				parsedModule = true;
				string = Internal.cleanKeyFromString(key, string);
				reference.section.modules.push(fn(string, reference));
			}
		});

		// If we had a model and parsed it, we're all done
		if (parsedModule) return;

		// Fallback on the paragraph model
		string = Internal.cleanKeyFromString('paragraph', string);
		reference.section.modules.push(SimpleParse.Modules.paragraph(string, reference));
	},

	// Parse section from line, if it exists, set it up as current section, otherwise return the current section
	parseSection: function(string, reference){
		var newSection = false,
			obj = {
				isSection: false,
				match: null,
				section: reference.section
			};

		SimpleParse.Sections.each(function(section){
			if (newSection) return;
			var match = section.toUpperCase() + ':';
			if (string.startsWith(match)){
				obj.isSection = true;
				obj.match = match;
				newSection = section;
			}
		});

		if (newSection && !reference.model[newSection])
			reference.model[newSection] = [];

		if (newSection){
			obj.section = Internal.generateSection(string, obj.match);
			reference.model[newSection].push(obj.section);
		}

		reference.section = obj.section;

		return obj;
	},

	// Generates the basic model for a section
	generateSection: function(string, match){
		var title = string.slice(match.length).trim();
		return {
			title: title,
			modules: []
		};
	}

};

}).call(this);
