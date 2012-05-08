/*
 *
 *	name: SimpleParse
 *
 *	description: A simple parser
 *
 *	license: MIT-style license
 *
 *	author: Amadeus Demarzi
 *
 *	provides: window.SimpleParse
 *
 */

(function(){

if (!window.String.prototype.startsWith){
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

var SimpleParse = window.SimpleParse = {

	addSections: function(){
		var sections = Array.flatten(Array.from(arguments));
		sections.each(function(key){
			SimpleParse.Sections.push(key);
		});
	},

	addModule: function(key, encode, decode){
		if (typeOf(key) !== 'string' || typeOf(decode) !== 'function' || typeOf(encode) !== 'function')
			throw new Error('SimpleParse: Missing a required argument [key, parser]: ' + key + ', ' + decode + ', ' + encode);

		SimpleParse.Modules[key] = {
			encode: encode,
			decode: decode
		};
	},

	encode: function(model){
		if (typeOf(model) !== 'object')
			throw new Error('SimpleParse: Must pass a valid object model to decode: ' + model);

		var reference = {
			model: model,
			string: ''
		};

		Object.each(model, function(sections, key){
			sections.each(function(section){
				Internal.encodeSection(section, key, reference);
			});
		});

		return reference.string.trim();
	},

	decode: function(string){
		// Base Model
		var reference = {
				model: {},
				section: null
			},
			// Each line represents a step or module
			units = string.split('\n');

		if (!string || !units.length) return null;

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

		if (!reference.section) return null;

		return reference.model;
	},

	Sections: [],

	Modules: {

		paragraph: {

			encode: function(model){
				return model.content;
			},

			decode: function(string){
				return {
					type: 'paragraph',
					content: string.trim()
				};
			}
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
		var parsedModule = null, module;

		// First check to see if we have a data model this module
		Object.each(SimpleParse.Modules, function(obj, key){
			if (parsedModule) return;
			var match = key.toUpperCase() + ':', module, cleaned;
			if (string.startsWith(match)) {
				cleaned = Internal.cleanKeyFromString(key, string);
				module = obj.decode(cleaned);
				if (!module) return;
				reference.section.modules.push(module);
				parsedModule = true;
			}
		});

		// If we had a model and parsed it, we're all done
		if (parsedModule) return;

		// Fallback on the paragraph model
		string = Internal.cleanKeyFromString('paragraph', string);
		module = SimpleParse.Modules.paragraph.decode(string);
		if (module) reference.section.modules.push(module);
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
	},

	encodeSection: function(section, sectionKey, reference){
		reference.string += sectionKey.toUpperCase() + ': ' + section.title + '\n';

		section.modules.each(function(module){
			var string = Internal.encodeModule(module);
			if (string) reference.string += string + '\n';
		});

		reference.string += '\n';
	},

	encodeModule: function(model, reference){
		var encoder = window.SimpleParse.Modules[model.type].encode,
			string, type;
		if (encoder) {
			string =  encoder(model);
			type = (model.type === 'paragraph') ? '' : model.type.toUpperCase() + ': ';
			return type + string;
		}

		return null;
	}

};

}).call(this);
