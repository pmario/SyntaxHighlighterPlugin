/***
|''Name''|SyntaxHighlighterPlugin3|
|''Description''|Enables syntax highlighting|
|''Author''|PMario|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://syntaxhighlighter.tiddlyspace.com/#SyntaxHighlighterPlugin3|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
|''Requires''|ShCore.js|
|''Keywords''|syntax highlighting color code|
!Documentation
*see: [[SyntaxHighlighterPlugin3Info]]
!Description
Enables syntax highlighting for <pre> blocks.
!Usage
!!!!Macro
<<<
*The macro will only render the containing tiddler, when viewed.
{{{
<<highlightSyntax>>
}}}
<<<
!!!!StyleSheet
<<<
*add this to your StyleSheet
{{{
[[ShCore.css]]
[[ShThemeDefault.css]]
}}}
<<<
!!!!ViewTemplate
<<<
<!--{{{-->
<div class='tagging' macro='tagging'></div>
<div macro='highlightSyntax'></div>  <!-- insert this line -->
<div class='tagClear'></div>
<!--}}}-->
<<<
!!!!Parameters
<<<
<...>
<<<
!!!!Revision History
<<<
*V 0.1.0 2010-08-17
**initial release
<<<
!!!!ToDo
<<<
*Find a solutio for expter mode!
*Find the problem with highlighting the regExp. (see "blue" code below)
<<<
!!!Code
***/

//{{{
version.extensions.SyntaxHighlighterPlugin3 = {major: 0, minor: 1, revision: 0, date: new Date(2010,8,17)};

(function($) {

if(!window.SyntaxHighlighter) {
//	throw "Missing dependency: SyntaxHighlighter";
	displayMessage("Missing dependency: SyntaxHighlighter");
}

config.macros.highlightSyntax = {
	getElementsByClass: function (searchClass,node,tag) {
		var classElements = new Array();
		if ( node == null )
			node = document;
		if ( tag == null )
			tag = '*';
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if ( pattern.test(els[i].className) ) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	},
	
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var arr = this.getElementsByClass('sh', story.findContainingTiddler(place), 'pre');
		for (i=0; i<arr.length; i++) {
			SyntaxHighlighter.highlight(null, arr[i]);
		}			
	} // handler
};

})(jQuery);
//}}}

/***
!!!!!Add class attribute to pre, if defined
***/
//{{{
(function(formatters) { //# set up alias
	var expert = false;		// if true, the new regExp will be activated
	var guess = true;	// guess language for syntax highlighting

	var helper = {};	
	helper.enclosedTextHelper = function(w, attr){
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");
				
			// check, if there is a class parameter. introduced for syntax highlighting.
			if (!attr || attr == '') {
				createTiddlyElement(w.output,this.element,null,null,text);				
			} 
			else {
				createTiddlyElement(w.output,this.element,null,attr,text);				
			}
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	};
	// merge the new helper function into formatterHelpers. 
	merge(config.formatterHelpers, helper);
	
//}}}
/***
!!!!!Change formatter: "monospacedByLine
***/
//{{{
	
	var mono = formatters[formatters.findByField("name", "monospacedByLine")];

	mono.element = "pre";

	if (expert) {
		mono.match = "^(?:/\\*\\{\\{\\{.*\\*/|\\{\\{\\{.*|//\\{\\{\\{.*|<!--\\{\\{\\{.*-->)\\n"; // new
	}
	else {
 		mono.match = "^(?:/\\*\\{\\{\\{\\*/|\\{\\{\\{|//\\{\\{\\{|<!--\\{\\{\\{-->)\\n";	// original
	};
	mono.handler = function(w) {
		var result = '';
		var match;
		var regExp;
		
		// test for "{{{ some text }}}"
		regExp = /^.*}}}/im; 
		match = regExp.exec(w.matchText);
		if (match != null) {
			return false; 	// it doesn't belong to this function.
//		console.log('wrong handler!')		
		}; 

		// additional tests for highlighter text		
		regExp = /^\{\{\{(.*)/im;
		match = regExp.exec(w.matchText);
		if (match != null) {
			result = (expert) ? 'sh ' + match[1] : (guess) ? 'sh brush:text' : '';  // highlighter class info
//		console.log('match: ', match, 'result: ', result, 'w', w);
		}; 
		regExp = /^\/\/\{\{\{(.*)/im;
		match = regExp.exec(w.matchText);
		if (match != null) {
			result = (expert) ? 'sh ' + match[1] : (guess) ? 'sh brush:js' : '' ;  // highlighter class info
//		console.log('match: ', match, 'result: ', result, 'w', w);
		};
		regExp = /^<!--\{\{\{(.*)-->/im;
		match = regExp.exec(w.matchText);
		if (match != null) {
			result = (expert) ? 'sh ' + match[1] : (guess) ? 'sh brush:xml' : '' ;  // highlighter class info
//		console.log('match: ', match, 'result: ', result, 'w', w);
		};
		regExp = /^\/\*\{\{\{(.*)\*\//im;
		match = regExp.exec(w.matchText);
		if (match != null) {
			result = (expert) ? 'sh ' + match[1] : (guess) ? 'sh brush:css' : '';  // highlighter class info
//		console.log('match: ', match, 'result: ', result, 'w', w);
		}; 
		
		// delete whitespace at begin an end
		result = result.replace(/^[ \t]+|[ \t]+$/mg, "");

		// make identifier shorter because of additional info from above
		match = w.matchText.slice(0,3);

		switch(match) {
		case "/*{": // CSS
			this.lookaheadRegExp = /\/\*\{\{\{.*\*\/\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\*\}\}\}\*\/$\n?)/mg;
			break;
		case "{{{": // monospaced block
			this.lookaheadRegExp = /^\{\{\{.*\n((?:^[^\n]*\n)+?)(^\f*\}\}\}$\n?)/mg;
			break;
		case "//{": // plugin
			this.lookaheadRegExp = /^\/\/\{\{\{.*\n\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\/\}\}\}$\n?)/mg;
			break;
		case "<!-": //template
			this.lookaheadRegExp = /<!--\{\{\{.*-->\n\n*((?:^[^\n]*\n)+?)(\n*^\f*<!--\}\}\}-->$\n?)/mg;
			break;
		default:
			break;
		};
		
		config.formatterHelpers.enclosedTextHelper.call(this, w, result);
	} // mono.handler

})(config.formatters); //# end of alias
//}}}
/***
*Here the {{{<<highlightSyntax>>}}} is activated for this tiddler <<highlightSyntax>>
***/