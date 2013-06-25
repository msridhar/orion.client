/*******************************************************************************
 * @license
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 * Copyright (c) 2013 IBM Corporation.
 *
 * THIS FILE IS PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 * ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 * CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT.
 * You can obtain a current copy of the Eclipse Public License from
 * http://www.opensource.org/licenses/eclipse-1.0.php
 *
 * Contributors:
 *     Andrew Eisenberg (VMware) - initial API and implementation
 *     Manu Sridharan (IBM) - Various improvements
 ******************************************************************************/

/*
This module defines the built in types for the scripted JS inferencer.
It also contains functions for manipulating internal type signatures.
*/

/*jslint es5:true browser:true*/
/*global define doctrine console */
define(["plugins/esprima/typeUtils", "plugins/esprima/proposalUtils", "scriptedLogger", "doctrine/doctrine"],
function(typeUtils, proposalUtils, scriptedLogger/*, doctrine*/) {



	// From ecma script manual 262 section 15
	// the global object when not in browser or node
	var Global = function() {};
	Global.prototype = {
		$$proto : new typeUtils.Definition("Object"),

		decodeURI : new typeUtils.Definition("function(uri:String):String"),
		encodeURI : new typeUtils.Definition("function(uri:String):String"),
		'eval' : new typeUtils.Definition("function(toEval:String):Object"),
		parseInt : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		parseFloat : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		Math: new typeUtils.Definition("Math"),
		JSON: new typeUtils.Definition("JSON"),
		Object: new typeUtils.Definition("function(new:Object,val:Object=):Object"),
		Function: new typeUtils.Definition("function(new:Function):Function"),
		Array: new typeUtils.Definition("function(new:Array,val:Array=):Array"),
		Boolean: new typeUtils.Definition("function(new:Boolean,val:Boolean=):Boolean"),
		Number: new typeUtils.Definition("function(new:Number,val:Number=):Number"),
		Date: new typeUtils.Definition("function(new:Date,val:Date=):Date"),
		RegExp: new typeUtils.Definition("function(new:RegExp,val:RegExp=):RegExp"),
		Error: new typeUtils.Definition("function(new:Error,err:Error=):Error"),
		'undefined' : new typeUtils.Definition("undefined"),
		isNaN : new typeUtils.Definition("function(num:Number):Boolean"),
		isFinite : new typeUtils.Definition("function(num:Number):Boolean"),
		"NaN" : new typeUtils.Definition("Number"),
		"Infinity" : new typeUtils.Definition("Number"),
		decodeURIComponent : new typeUtils.Definition("function(encodedURIString:String):String"),
		encodeURIComponent : new typeUtils.Definition("function(decodedURIString:String):String"),

		"this": new typeUtils.Definition("Global")
		// not included since not meant to be referenced directly
		// EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError
	};

	// Node module
	var Module = function() {};
	Module.prototype = {

		// From Global
		decodeURI : new typeUtils.Definition("function(uri:String):String"),
		encodeURI : new typeUtils.Definition("function(uri:String):String"),
		'eval' : new typeUtils.Definition("function(toEval:String):Object"),
		parseInt : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		parseFloat : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		Math: new typeUtils.Definition("Math"),
		JSON: new typeUtils.Definition("JSON"),
		Object: new typeUtils.Definition("function(new:Object,val:Object=):Object"),
		Function: new typeUtils.Definition("function(new:Function):Function"),
		Array: new typeUtils.Definition("function(new:Array,val:Array=):Array"),
		Boolean: new typeUtils.Definition("function(new:Boolean,val:Boolean=):Boolean"),
		Number: new typeUtils.Definition("function(new:Number,val:Number=):Number"),
		Date: new typeUtils.Definition("function(new:Date,val:Date=):Date"),
		RegExp: new typeUtils.Definition("function(new:RegExp,val:RegExp=):RegExp"),
		Error: new typeUtils.Definition("function(new:Error,err:Error=):Error"),
		'undefined' : new typeUtils.Definition("undefined"),
		isNaN : new typeUtils.Definition("function(num:Number):Boolean"),
		isFinite : new typeUtils.Definition("function(num:Number):Boolean"),
		"NaN" : new typeUtils.Definition("Number"),
		"Infinity" : new typeUtils.Definition("Number"),
		decodeURIComponent : new typeUtils.Definition("function(encodedURIString:String):String"),
		encodeURIComponent : new typeUtils.Definition("function(decodedURIString:String):String"),

		"this": new typeUtils.Definition("Module"),
		Buffer: new typeUtils.Definition("Object"),
		console: new typeUtils.Definition("Object"),
		module: new typeUtils.Definition("Module"),
		process: new typeUtils.Definition("Process"),

		require: new typeUtils.Definition("function(module:String):Object"),
//		exports: new typeUtils.Definition("Object"),
		clearInterval: new typeUtils.Definition("function(t:Number)"),
		clearTimeout: new typeUtils.Definition("function(t:Number)"),
		setInterval: new typeUtils.Definition("function(callback:Function,ms:Number):Number"),
		setTimeout : new typeUtils.Definition("function(callback:Function,ms:Number):Number"),
		global: new typeUtils.Definition("Module"),
		querystring: new typeUtils.Definition("String"),
		__filename: new typeUtils.Definition("String"),
		__dirname: new typeUtils.Definition("String")
	};

	var Window = function() {};
	Window.prototype = {
		// copied from Global
		$$proto : new typeUtils.Definition("Object"),

		decodeURI : new typeUtils.Definition("function(uri:String):String"),
		encodeURI : new typeUtils.Definition("function(uri:String):String"),
		'eval' : new typeUtils.Definition("function(toEval:String):Object"),
		parseInt : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		parseFloat : new typeUtils.Definition("function(str:String,radix:Number=):Number"),
		Math: new typeUtils.Definition("Math"),
		JSON: new typeUtils.Definition("JSON"),
		Object: new typeUtils.Definition("function(new:Object,val:Object=):Object"),
		Function: new typeUtils.Definition("function(new:Function):Function"),
		Array: new typeUtils.Definition("function(new:Array,val:Array=):Array"),
		Boolean: new typeUtils.Definition("function(new:Boolean,val:Boolean=):Boolean"),
		Number: new typeUtils.Definition("function(new:Number,val:Number=):Number"),
		Date: new typeUtils.Definition("function(new:Date,val:Date=):Date"),
		RegExp: new typeUtils.Definition("function(new:RegExp,val:RegExp=):RegExp"),
		Error: new typeUtils.Definition("function(new:Error,err:Error=):Error"),
		'undefined' : new typeUtils.Definition("undefined"),
		isNaN : new typeUtils.Definition("function(num:Number):Boolean"),
		isFinite : new typeUtils.Definition("function(num:Number):Boolean"),
		"NaN" : new typeUtils.Definition("Number"),
		"Infinity" : new typeUtils.Definition("Number"),
		decodeURIComponent : new typeUtils.Definition("function(encodedURIString:String):String"),
		encodeURIComponent : new typeUtils.Definition("function(decodedURIString:String):String"),

		"this": new typeUtils.Definition("Window"),
		// see https://developer.mozilla.org/en/DOM/window
			// Properties
		applicationCache : new typeUtils.Definition("DOMApplicationCache"),
		closed : new typeUtils.Definition("Boolean"),
		console : new typeUtils.Definition("Console"),
		defaultStatus : new typeUtils.Definition("String"),
		document : new typeUtils.Definition("Document"),
		frameElement : new typeUtils.Definition("Element"),
		frames : new typeUtils.Definition("Array"),
		history : new typeUtils.Definition("History"),
		innerHeight : new typeUtils.Definition("Number"),
		innerWidth : new typeUtils.Definition("Number"),
		length : new typeUtils.Definition("Number"),
		location : new typeUtils.Definition("Location"),
		locationbar : new typeUtils.Definition("BarInfo"),
		localStorage : new typeUtils.Definition("Storage"),
		menubar : new typeUtils.Definition("BarInfo"),
		name : new typeUtils.Definition("String"),
		navigator : new typeUtils.Definition("Navigator"),
		opener : new typeUtils.Definition("Window"),
		outerHeight : new typeUtils.Definition("Number"),
		outerWidth : new typeUtils.Definition("Number"),
		pageXOffset : new typeUtils.Definition("Number"),
		pageYOffset : new typeUtils.Definition("Number"),
		parent : new typeUtils.Definition("Window"),
		performance : new typeUtils.Definition("Performance"),
		personalbar : new typeUtils.Definition("BarInfo"),
		screen : new typeUtils.Definition("Screen"),
		screenX : new typeUtils.Definition("Number"),
		screenY : new typeUtils.Definition("Number"),
		scrollbars : new typeUtils.Definition("BarInfo"),
		scrollMaxX : new typeUtils.Definition("Number"),
		scrollMaxY : new typeUtils.Definition("Number"),
		scrollX : new typeUtils.Definition("Number"),
		scrollY : new typeUtils.Definition("Number"),
		self : new typeUtils.Definition("Window"),
		sessionStorage : new typeUtils.Definition("Storage"),
		sidebar : new typeUtils.Definition("BarInfo"),
		status : new typeUtils.Definition("String"),
		statusbar : new typeUtils.Definition("BarInfo"),
		toolbar : new typeUtils.Definition("BarInfo"),
		top : new typeUtils.Definition("Window"),
		window : new typeUtils.Definition("Window"),

			// Methods
			// commented methods are mozilla-specific
		addEventListener : new typeUtils.Definition("function()"),
		alert : new typeUtils.Definition("function(msg:String)"),
		atob : new typeUtils.Definition("function(val:Object):String"),
		back : new typeUtils.Definition("function()"),
		blur : new typeUtils.Definition("function()"),
		btoa : new typeUtils.Definition("function(val:Object):String"),
		clearInterval: new typeUtils.Definition("function(t:Number)"),
		clearTimeout: new typeUtils.Definition("function(t:Number)"),
		close : new typeUtils.Definition("function()"),
		confirm : new typeUtils.Definition("function(msg:String):Boolean"),
		dispatchEvent : new typeUtils.Definition("function(domnode:Node)"),
		dump : new typeUtils.Definition("function(msg:String)"),
		escape : new typeUtils.Definition("function(str:String):String"),
		find : new typeUtils.Definition("function(str:String):Boolean"),
		focus : new typeUtils.Definition("function()"),
		forward : new typeUtils.Definition("function()"),
		getAttention : new typeUtils.Definition("function()"),
		getComputedStyle : new typeUtils.Definition("function(domnode:Node):CSSStyleDeclaration"),
		getSelection : new typeUtils.Definition("function():Selection"),
		home : new typeUtils.Definition("function()"),
		matchMedia : new typeUtils.Definition("function(query:Object):MediaQueryList"),
		moveBy : new typeUtils.Definition("function(deltaX:Number,deltaY:Number)"),
		moveTo : new typeUtils.Definition("function(x:Number,y:Number)"),
		open : new typeUtils.Definition("function(strUrl:String,strWindowName:String,strWindowFeatures:String=):Window"),
		openDialog : new typeUtils.Definition("function(strUrl:String,strWindowName:String,strWindowFeatures:String,args:String=):Window"),
		postMessage : new typeUtils.Definition("function(message:String,targetOrigin:String)"),
		print : new typeUtils.Definition("function()"),
		prompt : new typeUtils.Definition("function(message:String):String"),
		removeEventListener : new typeUtils.Definition("function(type:String,listener:Object,useCapture:Boolean=)"),
		resizeBy : new typeUtils.Definition("function(deltaX:Number,deltaY:Number)"),
		resizeTo : new typeUtils.Definition("function(x:Number,y:Number)"),
		scroll : new typeUtils.Definition("function(x:Number,y:Number)"),
		scrollBy : new typeUtils.Definition("function(deltaX:Number,deltaY:Number)"),
		scrollByLines : new typeUtils.Definition("function(lines:Number)"),
		scrollByPages : new typeUtils.Definition("function(pages:Number)"),
		scrollTo : new typeUtils.Definition("function(x:Number,y:Number)"),
		setCursor : new typeUtils.Definition("function(cursor)"),
		setInterval: new typeUtils.Definition("function(callback:Function,ms:Number):Number"),
		setTimeout : new typeUtils.Definition("function(callback:Function,ms:Number):Number"),
		sizeToContent : new typeUtils.Definition("function()"),
		stop : new typeUtils.Definition("function()"),
		unescape : new typeUtils.Definition("function(str:String):String"),
		updateCommands : new typeUtils.Definition("function(cmdName:String)"),

			// Events
		onabort : new typeUtils.Definition("function(event:Event)"),
		onbeforeunload : new typeUtils.Definition("function(event:Event)"),
		onblur : new typeUtils.Definition("function(event:Event)"),
		onchange : new typeUtils.Definition("function(event:Event)"),
		onclick : new typeUtils.Definition("function(event:Event)"),
		onclose : new typeUtils.Definition("function(event:Event)"),
		oncontextmenu : new typeUtils.Definition("function(event:Event)"),
		ondevicemotion : new typeUtils.Definition("function(event:Event)"),
		ondeviceorientation : new typeUtils.Definition("function(event:Event)"),
		ondragdrop : new typeUtils.Definition("function(event:Event)"),
		onerror : new typeUtils.Definition("function(event:Event)"),
		onfocus : new typeUtils.Definition("function(event:Event)"),
		onhashchange : new typeUtils.Definition("function(event:Event)"),
		onkeydown : new typeUtils.Definition("function(event:Event)"),
		onkeypress : new typeUtils.Definition("function(event:Event)"),
		onkeyup : new typeUtils.Definition("function(event:Event)"),
		onload : new typeUtils.Definition("function(event:Event)"),
		onmousedown : new typeUtils.Definition("function(event:Event)"),
		onmousemove : new typeUtils.Definition("function(event:Event)"),
		onmouseout : new typeUtils.Definition("function(event:Event)"),
		onmouseover : new typeUtils.Definition("function(event:Event)"),
		onmouseup : new typeUtils.Definition("function(event:Event)"),
		onpaint : new typeUtils.Definition("function(event:Event)"),
		onpopstate : new typeUtils.Definition("function(event:Event)"),
		onreset : new typeUtils.Definition("function(event:Event)"),
		onresize : new typeUtils.Definition("function(event:Event)"),
		onscroll : new typeUtils.Definition("function(event:Event)"),
		onselect : new typeUtils.Definition("function(event:Event)"),
		onsubmit : new typeUtils.Definition("function(event:Event)"),
		onunload : new typeUtils.Definition("function(event:Event)"),
		onpageshow : new typeUtils.Definition("function(event:Event)"),
		onpagehide : new typeUtils.Definition("function(event:Event)"),

			// Constructors
		Image : new typeUtils.Definition("function(new:HTMLImageElement,width:Number=,height:Number=):HTMLImageElement"),
		Option : new typeUtils.Definition("function(new:HTMLOptionElement,text:String=,value:Object=,defaultSelected:Boolean=,selected:Boolean=):HTMLOptionElement"),
		Worker : new typeUtils.Definition("function(new:Worker,url:String):Worker"),
		XMLHttpRequest : new typeUtils.Definition("function(new:XMLHttpRequest):XMLHttpRequest"),
		WebSocket : new typeUtils.Definition("function(new:WebSocket,url,protocols):WebSocket"),
		Event : new typeUtils.Definition("function(new:Event,type:String):Event"),
		Node : new typeUtils.Definition("function(new:Node):Node")
	};

	var initialGlobalProperties = {};
	Object.keys(Global.prototype).forEach(function(key) {
		initialGlobalProperties[key] = true;
	});
	Object.keys(Window.prototype).forEach(function(key) {
		initialGlobalProperties[key] = true;
	});
	Object.keys(Module.prototype).forEach(function(key) {
		initialGlobalProperties[key] = true;
	});


	/**
	 * A prototype that contains the common built-in types
	 */
	var Types = function(globalObjName) {
		var globObj;
		// this object can be touched by clients
		// and so must not be in the prototype
		// the global 'this'
		if (globalObjName === 'Window') {
			globObj = this.Window = new Window();
		} else if (globalObjName === 'Module') {
			globObj = this.Module = new Module();
		} else {
			globObj = this.Global = new Global();
		}

		this.clearDefaultGlobal = function() {
			Object.keys(initialGlobalProperties).forEach(function(key) {
				delete globObj[key];
			});
		};

	};


	/**
	 * Populate the Types object with built-in types.  These are not meant to be changed through the inferencing process
	 * This uses the built in types as defined in the ECMA script reference manual 262.  Available at
	 * http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf section 15.
	 */
	Types.prototype = {

		/**
		 * See 15.2.4 Properties of the Object Prototype Object
		 */
		Object : {
			$$isBuiltin: true,
			// Can't use the real propoerty name here because would override the real methods of that name
			$_$prototype : new typeUtils.Definition("Object"),
			$_$toString: new typeUtils.Definition("function():String"),
			$_$toLocaleString : new typeUtils.Definition("function():String"),
			$_$valueOf: new typeUtils.Definition("function():Object"),
			$_$hasOwnProperty: new typeUtils.Definition("function(property:String):Boolean"),
			$_$isPrototypeOf: new typeUtils.Definition("function(object:Object):Boolean"),
			$_$propertyIsEnumerable: new typeUtils.Definition("function(property:String):Boolean")
		},

		/**
		 * See 15.3.4 Properties of the Function Prototype Object
		 */
		Function : {
			$$isBuiltin: true,
			apply : new typeUtils.Definition("function(func:function(),argArray:Array=):Object"),
			"arguments" : new typeUtils.Definition("Arguments"),
			bind : new typeUtils.Definition("function(func:function(),...args:Object):Object"),
			call : new typeUtils.Definition("function(func:function(),...args:Object):Object"),
			caller : new typeUtils.Definition("Function"),
			length : new typeUtils.Definition("Number"),
			name : new typeUtils.Definition("String"),
			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.4.4 Properties of the Array Prototype Object
		 */
		Array : {
			$$isBuiltin: true,

			concat : new typeUtils.Definition("function(first:Array,...rest:Array):Array"),
			join : new typeUtils.Definition("function(separator:Object):String"),
			length : new typeUtils.Definition("Number"),
			pop : new typeUtils.Definition("function():Object"),
			push : new typeUtils.Definition("function(...vals:Object):Object"),
			reverse : new typeUtils.Definition("function():Array"),
			shift : new typeUtils.Definition("function():Object"),
			slice : new typeUtils.Definition("function(start:Number,deleteCount:Number,...items:Object):Array"),
			splice : new typeUtils.Definition("function(start:Number,end:Number):Array"),
			sort : new typeUtils.Definition("function(sorter:Object=):Array"),
			unshift : new typeUtils.Definition("function(...items:Object):Number"),
			indexOf : new typeUtils.Definition("function(searchElement,fromIndex=):Number"),
			lastIndexOf : new typeUtils.Definition("function(searchElement,fromIndex=):Number"),
			every : new typeUtils.Definition("function(callbackFn:function(elt:Object),thisArg:Object=):Boolean"),
			some : new typeUtils.Definition("function(callbackFn:function(elt:Object),thisArg:Object=):Boolean"),
			forEach : new typeUtils.Definition("function(callbackFn:function(elt:Object),thisArg:Object=):Object"),
			map : new typeUtils.Definition("function(callbackFn:function(elt:Object):Object,thisArg:Object=):Array"),
			filter : new typeUtils.Definition("function(callbackFn:function(elt:Object):Boolean,thisArg:Object=):Array"),
			reduce : new typeUtils.Definition("function(callbackFn:function(elt:Object):Object,initialValue:Object=):Array"),
			reduceRight : new typeUtils.Definition("function(callbackFn:function(elt:Object):Object,initialValue:Object=):Array"),
			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.5.4 Properties of the String Prototype Object
		 */
		String : {
			$$isBuiltin: true,
			charAt : new typeUtils.Definition("function(index:Number):String"),
			charCodeAt : new typeUtils.Definition("function(index:Number):Number"),
			concat : new typeUtils.Definition("function(str:String):String"),
			indexOf : new typeUtils.Definition("function(searchString:String,start:Number=):Number"),
			lastIndexOf : new typeUtils.Definition("function(searchString:String,start:Number=):Number"),
			length : new typeUtils.Definition("Number"),
			localeCompare : new typeUtils.Definition("function(str:String):Number"),
			match : new typeUtils.Definition("function(regexp:(String|RegExp)):Boolean"),
			replace : new typeUtils.Definition("function(searchValue:(String|RegExp),replaceValue:String):String"),
			search : new typeUtils.Definition("function(regexp:(String|RegExp)):String"),
			slice : new typeUtils.Definition("function(start:Number,end:Number):String"),
			split : new typeUtils.Definition("function(separator:String,limit:Number=):[String]"),  // Array of string
			substring : new typeUtils.Definition("function(start:Number,end:Number=):String"),
			toLocaleUpperCase : new typeUtils.Definition("function():String"),
			toLowerCase : new typeUtils.Definition("function():String"),
			toLocaleLowerCase : new typeUtils.Definition("function():String"),
			toUpperCase : new typeUtils.Definition("function():String"),
			trim : new typeUtils.Definition("function():String"),

			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.6.4 Properties of the Boolean Prototype Object
		 */
		Boolean : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.7.4 Properties of the Number Prototype Object
		 */
		Number : {
			$$isBuiltin: true,
			toExponential : new typeUtils.Definition("function(digits:Number):String"),
			toFixed : new typeUtils.Definition("function(digits:Number):String"),
			toPrecision : new typeUtils.Definition("function(digits:Number):String"),
			// do we want to include NaN, MAX_VALUE, etc?

			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.8.1 15.8.2 Properties and functions of the Math Object
		 * Note that this object is not used as a prototype to define other objects
		 */
		Math : {
			$$isBuiltin: true,

			// properties
			E : new typeUtils.Definition("Number"),
			LN2 : new typeUtils.Definition("Number"),
			LN10 : new typeUtils.Definition("Number"),
			LOG2E : new typeUtils.Definition("Number"),
			LOG10E : new typeUtils.Definition("Number"),
			PI : new typeUtils.Definition("Number"),
			SQRT1_2 : new typeUtils.Definition("Number"),
			SQRT2 : new typeUtils.Definition("Number"),

			// Methods
			abs : new typeUtils.Definition("function(val:Number):Number"),
			acos : new typeUtils.Definition("function(val:Number):Number"),
			asin : new typeUtils.Definition("function(val:Number):Number"),
			atan : new typeUtils.Definition("function(val:Number):Number"),
			atan2 : new typeUtils.Definition("function(val1:Number,val2:Number):Number1"),
			ceil : new typeUtils.Definition("function(val:Number):Number"),
			cos : new typeUtils.Definition("function(val:Number):Number"),
			exp : new typeUtils.Definition("function(val:Number):Number"),
			floor : new typeUtils.Definition("function(val:Number):Number"),
			log : new typeUtils.Definition("function(val:Number):Number"),
			max : new typeUtils.Definition("function(val1:Number,val2:Number):Number"),
			min : new typeUtils.Definition("function(val1:Number,val2:Number):Number"),
			pow : new typeUtils.Definition("function(x:Number,y:Number):Number"),
			random : new typeUtils.Definition("function():Number"),
			round : new typeUtils.Definition("function(val:Number):Number"),
			sin : new typeUtils.Definition("function(val:Number):Number"),
			sqrt : new typeUtils.Definition("function(val:Number):Number"),
			tan : new typeUtils.Definition("function(val:Number):Number"),
			$$proto : new typeUtils.Definition("Object")
		},


		/**
		 * See 15.9.5 Properties of the Date Prototype Object
		 */
		Date : {
			$$isBuiltin: true,
			toDateString : new typeUtils.Definition("function():String"),
			toTimeString : new typeUtils.Definition("function():String"),
			toUTCString : new typeUtils.Definition("function():String"),
			toISOString : new typeUtils.Definition("function():String"),
			toJSON : new typeUtils.Definition("function(key:String):Object"),
			toLocaleDateString : new typeUtils.Definition("function():String"),
			toLocaleTimeString : new typeUtils.Definition("function():String"),

			getTime : new typeUtils.Definition("function():Number"),
			getTimezoneOffset : new typeUtils.Definition("function():Number"),

			getDay : new typeUtils.Definition("function():Number"),
			getUTCDay : new typeUtils.Definition("function():Number"),
			getFullYear : new typeUtils.Definition("function():Number"),
			getUTCFullYear : new typeUtils.Definition("function():Number"),
			getHours : new typeUtils.Definition("function():Number"),
			getUTCHours : new typeUtils.Definition("function():Number"),
			getMinutes : new typeUtils.Definition("function():Number"),
			getUTCMinutes : new typeUtils.Definition("function():Number"),
			getSeconds : new typeUtils.Definition("function():Number"),
			getUTCSeconds : new typeUtils.Definition("function():Number"),
			getMilliseconds : new typeUtils.Definition("function():Number"),
			getUTCMilliseconds : new typeUtils.Definition("function():Number"),
			getMonth : new typeUtils.Definition("function():Number"),
			getUTCMonth : new typeUtils.Definition("function():Number"),
			getDate : new typeUtils.Definition("function():Number"),
			getUTCDate : new typeUtils.Definition("function():Number"),

			setTime : new typeUtils.Definition("function():Number"),
			setTimezoneOffset : new typeUtils.Definition("function():Number"),

			setDay : new typeUtils.Definition("function(dayOfWeek:Number):Number"),
			setUTCDay : new typeUtils.Definition("function(dayOfWeek:Number):Number"),
			setFullYear : new typeUtils.Definition("function(year:Number,month:Number=,date:Number=):Number"),
			setUTCFullYear : new typeUtils.Definition("function(year:Number,month:Number=,date:Number=):Number"),
			setHours : new typeUtils.Definition("function(hour:Number,min:Number=,sec:Number=,ms:Number=):Number"),
			setUTCHours : new typeUtils.Definition("function(hour:Number,min:Number=,sec:Number=,ms:Number=):Number"),
			setMinutes : new typeUtils.Definition("function(min:Number,sec:Number=,ms:Number=):Number"),
			setUTCMinutes : new typeUtils.Definition("function(min:Number,sec:Number=,ms:Number=):Number"),
			setSeconds : new typeUtils.Definition("function(sec:Number,ms:Number=):Number"),
			setUTCSeconds : new typeUtils.Definition("function(sec:Number,ms:Number=):Number"),
			setMilliseconds : new typeUtils.Definition("function(ms:Number):Number"),
			setUTCMilliseconds : new typeUtils.Definition("function(ms:Number):Number"),
			setMonth : new typeUtils.Definition("function(month:Number,date:Number=):Number"),
			setUTCMonth : new typeUtils.Definition("function(month:Number,date:Number=):Number"),
			setDate : new typeUtils.Definition("function(date:Number):Number"),
			setUTCDate : new typeUtils.Definition("function(date:Number):Number"),

			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.10.6 Properties of the RexExp Prototype Object
		 */
		RegExp : {
			$$isBuiltin: true,
//			g : new typeUtils.Definition("Object"),
//			i : new typeUtils.Definition("Object"),
//			gi : new typeUtils.Definition("Object"),
//			m : new typeUtils.Definition("Object"),
			source : new typeUtils.Definition("String"),
			global : new typeUtils.Definition("Boolean"),
			ignoreCase : new typeUtils.Definition("Boolean"),
			multiline : new typeUtils.Definition("Boolean"),
			lastIndex : new typeUtils.Definition("Boolean"),

			exec : new typeUtils.Definition("function(str:String):[String]"),
			test : new typeUtils.Definition("function(str:String):Boolean"),

			$$proto : new typeUtils.Definition("Object")
		},

		"function(new:RegExp):RegExp" : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Function"),

			$1 : new typeUtils.Definition("String"),
			$2 : new typeUtils.Definition("String"),
			$3 : new typeUtils.Definition("String"),
			$4 : new typeUtils.Definition("String"),
			$5 : new typeUtils.Definition("String"),
			$6 : new typeUtils.Definition("String"),
			$7 : new typeUtils.Definition("String"),
			$8 : new typeUtils.Definition("String"),
			$9 : new typeUtils.Definition("String"),
			$_ : new typeUtils.Definition("String"),
			$input : new typeUtils.Definition("String"),
			input : new typeUtils.Definition("String"),
			name : new typeUtils.Definition("String")
		},


		/**
		 * See 15.11.4 Properties of the Error Prototype Object
		 * We don't distinguish between kinds of errors
		 */
		Error : {
			$$isBuiltin: true,
			name : new typeUtils.Definition("String"),
			message : new typeUtils.Definition("String"),
			stack : new typeUtils.Definition("String"),
			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 10.6 Arguments Object
		 */
		Arguments : {
			$$isBuiltin: true,
			callee : new typeUtils.Definition("Function"),
			length : new typeUtils.Definition("Number"),

			$$proto : new typeUtils.Definition("Object")
		},

		/**
		 * See 15.12.2 and 15.12.3 Properties of the JSON Object
		 */
		JSON : {
			$$isBuiltin: true,

			parse : new typeUtils.Definition("function(str:String):Object"),
			stringify : new typeUtils.Definition("function(json:Object):String"),
			$$proto : new typeUtils.Definition("Object")
		},

		"undefined" : {
			$$isBuiltin: true
		},


		///////////////////////////////////////////////////
		// Node specific types
		///////////////////////////////////////////////////
		// See http://nodejs.org/api/process.html
		Process : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			on: new typeUtils.Definition("function(kind:String,callback:function())"),

			abort: new typeUtils.Definition("function()"),
			stdout: new typeUtils.Definition("Stream"),
			stderr: new typeUtils.Definition("Stream"),
			stdin: new typeUtils.Definition("Stream"),
			argv: new typeUtils.Definition("Array"), // Array.<String>
			execPath: new typeUtils.Definition("String"),
			chdir: new typeUtils.Definition("function(directory:String)"),
			cwd: new typeUtils.Definition("function():String"),
			env: new typeUtils.Definition("Object"),
			getgid: new typeUtils.Definition("function():Number"),
			setgid: new typeUtils.Definition("function(id:Number)"),
			getuid: new typeUtils.Definition("function():Number"),
			setuid: new typeUtils.Definition("function(id:Number)"),
			version: new typeUtils.Definition("String"),
			versions: new typeUtils.Definition("Object"), // TODO create a versions object?
			config: new typeUtils.Definition("Object"),
			kill: new typeUtils.Definition("function(pid:Number,signal:Number=)"),
			pid: new typeUtils.Definition("Number"),
			title: new typeUtils.Definition("String"),
			arch: new typeUtils.Definition("String"),
			platform: new typeUtils.Definition("String"),
			memoryUsage: new typeUtils.Definition("function():Object"),
			nextTick: new typeUtils.Definition("function(callback:function())"),
			umask: new typeUtils.Definition("function(mask:Number=)"),
			uptime: new typeUtils.Definition("function():Number"),
			hrtime: new typeUtils.Definition("function():Array") // Array.<Number>
		},

		// See http://nodejs.org/api/stream.html
		// Stream is a wierd one since it is built into the stream module,
		// but this module isn't always around, so must explicitly define it.
		Stream : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),
			// combines readable and writable streams

			// readable

			// events
			data: new typeUtils.Definition("function(data:Object)"),
			error: new typeUtils.Definition("function(exception:Object)"),
			close: new typeUtils.Definition("function()"),

			readable: new typeUtils.Definition("Boolean"),

			setEncoding: new typeUtils.Definition("function(encoding:String=)"),
			pause: new typeUtils.Definition("function()"),
			resume: new typeUtils.Definition("function()"),
			pipe: new typeUtils.Definition("function(destination:Object,options:Object=)"),

			// writable
			drain: new typeUtils.Definition("function()"),

			writable: new typeUtils.Definition("Boolean"),

			write: new typeUtils.Definition("function(buffer:Object=)"),
			end: new typeUtils.Definition("function(string:String=,encoding:String=)"),
			destroy: new typeUtils.Definition("function()"),
			destroySoon: new typeUtils.Definition("function()")
		},

		///////////////////////////////////////////////////
		// Browser specific types
		///////////////////////////////////////////////////

		// https://developer.mozilla.org/en/DOM/window.screen
		Screen : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			availTop : new typeUtils.Definition("Number"),
			availLeft : new typeUtils.Definition("Number"),
			availHeight : new typeUtils.Definition("Number"),
			availWidth : new typeUtils.Definition("Number"),
			colorDepth : new typeUtils.Definition("Number"),
			height : new typeUtils.Definition("Number"),
			left : new typeUtils.Definition("Number"),
			pixelDepth : new typeUtils.Definition("Number"),
			top : new typeUtils.Definition("Number"),
			width : new typeUtils.Definition("Number")
		},


		// https://developer.mozilla.org/en-US/docs/DOM/window.locationbar
		BarInfo : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			visible : new typeUtils.Definition("Boolean")
		},

		// http://w3c-test.org/webperf/specs/NavigationTiming/
		// incomplete
		Performance : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// https://developer.mozilla.org/en/DOM/window.navigator
		Navigator : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			// properties
			appName : new typeUtils.Definition("String"),
			appVersion : new typeUtils.Definition("String"),
			connection : new typeUtils.Definition("Connection"),
			cookieEnabled : new typeUtils.Definition("Boolean"),
			language : new typeUtils.Definition("String"),
			mimeTypes : new typeUtils.Definition("MimeTypeArray"),
			onLine : new typeUtils.Definition("Boolean"),
			oscpu : new typeUtils.Definition("String"),
			platform : new typeUtils.Definition("String"),
			plugins : new typeUtils.Definition("String"),
			userAgent : new typeUtils.Definition("String"),

			// methods
			javaEnabled : new typeUtils.Definition("function():Boolean"),
			registerContentHandler : new typeUtils.Definition("function(mimType:String,url:String,title:String)"),
			registerProtocolHandler : new typeUtils.Definition("function(protocol:String,url:String,title:String)")
		},

		// (not in MDN) http://www.coursevector.com/dommanual/dom/objects/MimeTypeArray.html
		MimeTypeArray : {
			$$isBuiltin: true,
			length : new typeUtils.Definition("Number"),
			item : new typeUtils.Definition("function(index:Number):MimeType"),
			namedItem : new typeUtils.Definition("function(name:String):MimeType")
		},

		// (not in MDN) http://www.coursevector.com/dommanual/dom/objects/MimeType.html
		MimeType : {
			$$isBuiltin: true,
			description : new typeUtils.Definition("String"),
			suffixes : new typeUtils.Definition("String"),
			type : new typeUtils.Definition("String"),
			enabledPlugin : new typeUtils.Definition("Plugin")
		},

		// (not in MDN) http://www.coursevector.com/dommanual/dom/objects/Plugin.html
		Plugin : {
			$$isBuiltin: true,
			description : new typeUtils.Definition("String"),
			fileName : new typeUtils.Definition("String"),
			length : new typeUtils.Definition("Number"),
			name : new typeUtils.Definition("String"),
			item : new typeUtils.Definition("function(index:Number):MimeType"),
			namedItem : new typeUtils.Definition("function(name:String):MimeType")
		},

		// http://dvcs.w3.org/hg/dap/raw-file/tip/network-api/Overview.html#the-connection-interface
		Connection : {
			$$isBuiltin: true,
			bandwidth : new typeUtils.Definition("Number"),
			metered : new typeUtils.Definition("Boolean"),

			onchange : new typeUtils.Definition("Function")
		},

		// http://dev.w3.org/html5/webstorage/#storage-0
		Storage : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			length : new typeUtils.Definition("Number"),

			key : new typeUtils.Definition("function(idx:Number):String"),
			getItem : new typeUtils.Definition("function(key:String):String"),
			setItem : new typeUtils.Definition("function(key:String,value:String)"),
			removeItem : new typeUtils.Definition("function(key:String)"),
			clear : new typeUtils.Definition("function()")
		},

		// http://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#interface-xmlhttprequest
		XMLHttpRequest : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			onreadystatechange : new typeUtils.Definition("EventHandler"),

			// request
			open : new typeUtils.Definition("function(method:String,url:String,async:Boolean=,user:String=,password:String=)"),
			setRequestHeader : new typeUtils.Definition("function(header,value)"),
			timeout : new typeUtils.Definition("Number"),
			withCredentials : new typeUtils.Definition("Boolean"),
			upload : new typeUtils.Definition("Object"), // not right
			send : new typeUtils.Definition("function(data:String=)"),
			abort : new typeUtils.Definition("function()"),

			// response
			getResponseHeader : new typeUtils.Definition("function(header:String):String"),
			getAllResponseHeaders : new typeUtils.Definition("function():String"),
			overrideMimType : new typeUtils.Definition("Object"),
			responseType : new typeUtils.Definition("Object"),  // not right
			readyState : new typeUtils.Definition("Number"),
			response : new typeUtils.Definition("Object"),
			responseText : new typeUtils.Definition("String"),
			responseXML : new typeUtils.Definition("Document"),
			status : new typeUtils.Definition("Number"),
			statusText : new typeUtils.Definition("String")
		},

		// http://www.w3.org/TR/workers/
		Worker : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			terminate : new typeUtils.Definition("function()"),
			postMessage : new typeUtils.Definition("function(message:String,transfer:Object=)"),
			onmessage : new typeUtils.Definition("function()")
		},

		// http://www.w3.org/TR/workers/#messageport
		MessagePort : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// http://www.whatwg.org/specs/web-apps/current-work/multipage//network.html#websocket
		WebSocket : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			onreadystatechange : new typeUtils.Definition("EventHandler"),
			onopen : new typeUtils.Definition("EventHandler"),
			onerror : new typeUtils.Definition("EventHandler"),
			onclose : new typeUtils.Definition("EventHandler"),

			readyState : new typeUtils.Definition("Number"),
			extensions : new typeUtils.Definition("String"),
			protocol : new typeUtils.Definition("String"),

			close : new typeUtils.Definition("function(reason:Object=)"),
			send :  new typeUtils.Definition("function(data)")
		},

		// https://developer.mozilla.org/en/DOM/Console
		Console : {
			$$isBuiltin: true,
			debug : new typeUtils.Definition("function(msg:String)"),
			dir : new typeUtils.Definition("function(obj)"),
			error : new typeUtils.Definition("function(msg:String)"),
			group : new typeUtils.Definition("function()"),
			groupCollapsed : new typeUtils.Definition("function()"),
			groupEnd : new typeUtils.Definition("function()"),
			info : new typeUtils.Definition("function(msg:String)"),
			log : new typeUtils.Definition("function(msg:String)"),
			time : new typeUtils.Definition("function(timerName:String)"),
			timeEnd : new typeUtils.Definition("function(timerName:String)"),
			trace : new typeUtils.Definition("function()"),
			warn : new typeUtils.Definition("function(msg:String)")
		},

		// TODO FIXADE remove ???
		// http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#eventhandler
		EventHandler : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// https://developer.mozilla.org/en/DOM/Event
		Event : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			// properties
			bubbles : new typeUtils.Definition("Boolean"),
			cancelable : new typeUtils.Definition("Boolean"),
			currentTarget : new typeUtils.Definition("Object"),
			defaultPrevented : new typeUtils.Definition("Boolean"),
			eventPhase : new typeUtils.Definition("Number"),  // Add constants
			explicitOriginalTarget : new typeUtils.Definition("Object"),
			originalTarget : new typeUtils.Definition("Object"),
			target : new typeUtils.Definition("Object"),
			timeStamp : new typeUtils.Definition("Number"),
			isTrusted : new typeUtils.Definition("Boolean"),

			// methods
			initEvent : new typeUtils.Definition("function(type:String,bubbles:Boolean,cancelable:Boolean)"),
			preventDefault : new typeUtils.Definition("function()"),
			stopImmediatePropagation : new typeUtils.Definition("function()"),
			stopPropagation : new typeUtils.Definition("function()")
		},

		"function(new:Event):Event" : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Function"),

			CAPTURING_PHASE : new typeUtils.Definition("Number"),
			AT_TARGET : new typeUtils.Definition("Number"),
			BUBBLING_PHASE : new typeUtils.Definition("Number")
		},

		// see http://www.w3.org/TR/dom/#documenttype
		DocumentType : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node"),

			name : new typeUtils.Definition("String"),
			publicId : new typeUtils.Definition("String"),
			systemId : new typeUtils.Definition("String"),

			before : new typeUtils.Definition("function(nodeOrString:(Node|String))"),
			after : new typeUtils.Definition("function(nodeOrString:(Node|String))"),
			replace : new typeUtils.Definition("function(nodeOrString:(Node|String))"),
			remove : new typeUtils.Definition("function()")
		},

		// see http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#the-history-interface
		History : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			length : new typeUtils.Definition("Number"),
			state : new typeUtils.Definition("Object"),

			go : new typeUtils.Definition("function(delta:Number)"),
			back : new typeUtils.Definition("function()"),
			forward : new typeUtils.Definition("function()"),
			pushState : new typeUtils.Definition("function(data:Object,title:String,url:String)"),
			replaceState : new typeUtils.Definition("function(data:Object,title:String,url:String)")
		},

		// see http://www.w3.org/TR/dom/#document (complete)
		// see http://www.w3.org/TR/html5/dom.html#documents-in-the-dom (incomplete)
		Document : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node"),

			implementation : new typeUtils.Definition("DOMImplementation"),
			URL : new typeUtils.Definition("String"),
			documentURI : new typeUtils.Definition("String"),
			compatMode : new typeUtils.Definition("String"),
			characterSet : new typeUtils.Definition("String"),
			contentType : new typeUtils.Definition("String"),

			doctype : new typeUtils.Definition("DocumentType"),
			documentElement : new typeUtils.Definition("Element"),

			getElementsByTagName : new typeUtils.Definition("function(localName:String):HTMLCollection"),
			getElementsByTagNameNS : new typeUtils.Definition("function(namespace,localName:String):HTMLCollection"),
			getElementsByClassName : new typeUtils.Definition("function(classNames:String):HTMLCollection"),
			getElementById : new typeUtils.Definition("function(elementId:String):Element"),
			createElement : new typeUtils.Definition("function(elementId:String):Element"),
			createElementNS : new typeUtils.Definition("function(namespace,qualifiedName:String):Element"),
			createDocumentFragment : new typeUtils.Definition("function():DocumentFragment"),
			createTextNode : new typeUtils.Definition("function(data):Text"),
			createComment : new typeUtils.Definition("function(data):Comment"),
			createProcessingInstruction : new typeUtils.Definition("function(target,data):ProcessingInstruction"),
			importNode : new typeUtils.Definition("function(node:Node,deep:Boolean=):Node"),
			adoptNode : new typeUtils.Definition("function(node:Node):Node"),
			createEvent : new typeUtils.Definition("function(eventInterfaceName:String):Event"),
			createRange : new typeUtils.Definition("function():Range"),

			createNodeIterator : new typeUtils.Definition("function(root:Node,whatToShow:Object=,filter:Object=):NodeIterator"),
			createTreeWalker : new typeUtils.Definition("function(root:Node,whatToShow:Object=,filter:Object=):TreeWalker")
		},

		// see http://www.w3.org/TR/dom/#domimplementation
		DOMImplementation : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			createDocumentType : new typeUtils.Definition("function(qualifiedName:String,publicId:String,systemId:String):DocumentType"),
			createDocument : new typeUtils.Definition("function(namespace:String,qualifiedName:String,doctype:String):Document"),
			createHTMLDocument : new typeUtils.Definition("function(title:String):Document"),
			hasFeature : new typeUtils.Definition("function(feature:String):Boolean")
		},

		// see http://www.w3.org/TR/dom/#node
		Node : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			nodeType : new typeUtils.Definition("Number"),
			nodeName : new typeUtils.Definition("String"),
			baseURI : new typeUtils.Definition("String"),
			ownerDocument : new typeUtils.Definition("Document"),
			parentNode : new typeUtils.Definition("Node"),
			parentElement : new typeUtils.Definition("Element"),
			childNodes : new typeUtils.Definition("NodeList"),
			firstChild : new typeUtils.Definition("Node"),
			lastChild : new typeUtils.Definition("Node"),
			previousSibling : new typeUtils.Definition("Node"),
			nextSibling : new typeUtils.Definition("Node"),
			nodeValue : new typeUtils.Definition("String"),
			textContent : new typeUtils.Definition("String"),

			hasChildNodes : new typeUtils.Definition("function():Boolean"),
			compareDocumentPosition : new typeUtils.Definition("function(other:Node):Number"),
			contains : new typeUtils.Definition("function(other:Node):Boolean"),
			insertBefore : new typeUtils.Definition("function(child:Node):Node"),
			appendChild : new typeUtils.Definition("function(node:Node):Node"),
			replaceChild : new typeUtils.Definition("function(child:Node):Node"),
			removeChild : new typeUtils.Definition("function(child:Node):Node"),
			normalize : new typeUtils.Definition("function()"),
			cloneNode : new typeUtils.Definition("function(deep:Boolean=):Node"),
			isEqualNode : new typeUtils.Definition("function(node:Node):Boolean"),
			lookupPrefix : new typeUtils.Definition("function(namespace:String):String"),
			lookupNamespaceURI : new typeUtils.Definition("function(prefix:String):String"),
			isDefaultNamespace : new typeUtils.Definition("function(namespace:String):Boolean")
		},

		// Constants declared on Node
		"function(new:Node):Node" : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Function"),
			ELEMENT_NODE : new typeUtils.Definition("Number"),
			ATTRIBUTE_NODE : new typeUtils.Definition("Number"),
			TEXT_NODE : new typeUtils.Definition("Number"),
			CDATA_SECTION_NODE : new typeUtils.Definition("Number"),
			ENTITY_REFERENCE_NODE : new typeUtils.Definition("Number"),
			ENTITY_NODE : new typeUtils.Definition("Number"),
			PROCESSING_INSTRUCTION_NODE : new typeUtils.Definition("Number"),
			COMMENT_NODE : new typeUtils.Definition("Number"),
			DOCUMENT_NODE : new typeUtils.Definition("Number"),
			DOCUMENT_TYPE_NODE : new typeUtils.Definition("Number"),
			DOCUMENT_FRAGMENT_NODE : new typeUtils.Definition("Number"),
			NOTATION_NODE : new typeUtils.Definition("Number"),

			DOCUMENT_POSITION_DISCONNECTED : new typeUtils.Definition("Number"),
			DOCUMENT_POSITION_PRECEDING : new typeUtils.Definition("Number"),
			DOCUMENT_POSITION_FOLLOWING : new typeUtils.Definition("Number"),
			DOCUMENT_POSITION_CONTAINS : new typeUtils.Definition("Number"),
			DOCUMENT_POSITION_CONTAINED_BY : new typeUtils.Definition("Number"),
			DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : new typeUtils.Definition("Number")
		},

		// see http://www.w3.org/TR/dom/#element
		Element : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node"),

			namespaceURI : new typeUtils.Definition("String"),
			prefix : new typeUtils.Definition("String"),
			localName : new typeUtils.Definition("String"),
			tagName : new typeUtils.Definition("String"),

			id : new typeUtils.Definition("String"),
			className : new typeUtils.Definition("String"),

			classList : new typeUtils.Definition("DOMTokenList"),

			attributes : new typeUtils.Definition("Array"), // of attributes

			childElementCount : new typeUtils.Definition("Number"),

			children : new typeUtils.Definition("HTMLCollection"),
			firstElementChild : new typeUtils.Definition("Element"),
			lastElementChild : new typeUtils.Definition("Element"),
			previousElementSibling : new typeUtils.Definition("Element"),
			nextElementSibling : new typeUtils.Definition("Element"),

			getAttribute : new typeUtils.Definition("function(name:String):String"),
			getAttributeNS : new typeUtils.Definition("function(namespace:String,localname:String):String"),
			setAttribute : new typeUtils.Definition("function(name:String,value:Object)"),
			setAttributeNS : new typeUtils.Definition("function(namespace:String,name:String,value:Object)"),
			removeAttribute : new typeUtils.Definition("function(name:String)"),
			removeAttributeNS : new typeUtils.Definition("function(namespace:String,localname:String)"),
			hasAttribute : new typeUtils.Definition("function(name:String):Boolean"),
			hasAttributeNS : new typeUtils.Definition("function(namespace:String,localname:String):Boolean"),

			getElementsByTagName : new typeUtils.Definition("function(localName:String):HTMLCollection"),
			getElementsByTagNameNS : new typeUtils.Definition("function(namespace:String,localName:String):HTMLCollection"),
			getElementsByClassName : new typeUtils.Definition("function(classname:String):HTMLCollection"),

			prepend : new typeUtils.Definition("function(...nodes:Node)"),
			append : new typeUtils.Definition("function(...nodes:Node)"),
			before : new typeUtils.Definition("function(...nodes:Node)"),
			after : new typeUtils.Definition("function(...nodes:Node)"),
			replace : new typeUtils.Definition("function(...nodes:Node)"),
			remove : new typeUtils.Definition("function()")
		},

		// see http://www.w3.org/TR/dom/#attr
		Attr : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node"),

			isId : new typeUtils.Definition("Boolean"),
			name : new typeUtils.Definition("String"),
			value : new typeUtils.Definition("String"),
			namespaceURI : new typeUtils.Definition("String"),
			prefix : new typeUtils.Definition("String"),
			localName : new typeUtils.Definition("String")
		},

		// see http://www.w3.org/TR/dom/#interface-nodelist
		NodeList : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			item : new typeUtils.Definition("Node"),
			length : new typeUtils.Definition("Number")
		},

		// incomplete
		DOMApplicationCache : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// incomplete
		CSSStyleDeclaration : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},
		// incomplete
		MediaQueryList : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},
		// see http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#dom-location
		Location : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			assign : new typeUtils.Definition("function(url:String)"),
			replace : new typeUtils.Definition("function(url:String)"),
			reload : new typeUtils.Definition("function()"),

			href : new typeUtils.Definition("String"),
			protocol : new typeUtils.Definition("String"),
			host : new typeUtils.Definition("String"),
			hostname : new typeUtils.Definition("String"),
			port : new typeUtils.Definition("String"),
			pathname : new typeUtils.Definition("String"),
			search : new typeUtils.Definition("String"),
			hash : new typeUtils.Definition("String")
		},

		// see http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections
		Selection : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			anchorNode : new typeUtils.Definition("Node"),
			anchorOffset : new typeUtils.Definition("Number"),
			focusNode : new typeUtils.Definition("Node"),
			focusOffset : new typeUtils.Definition("Number"),
			rangeCount : new typeUtils.Definition("Number"),

			isCollapsed : new typeUtils.Definition("Boolean"),


			collapse : new typeUtils.Definition("function(node:Node,offset:Number)"),
			collapseToStart : new typeUtils.Definition("function()"),
			collapseToEnd : new typeUtils.Definition("function()"),

			extend : new typeUtils.Definition("function(node:Node,offset:Number)"),

			selectAllChildren : new typeUtils.Definition("function(node:Node)"),
			deleteFromDocument : new typeUtils.Definition("function()"),
			getRangeAt : new typeUtils.Definition("function(index:Number):Range"),
			addRange : new typeUtils.Definition("function(range:Range)"),
			removeRange : new typeUtils.Definition("function(range:Range)"),
			removeAllRanges : new typeUtils.Definition("function()")
		},

		// see http://www.w3.org/TR/html5/the-html-element.html#the-html-element
		// incomplete
		HTMLElement : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Element"),

			id : new typeUtils.Definition("String"),
			title : new typeUtils.Definition("String"),
			lang : new typeUtils.Definition("String"),
			dir : new typeUtils.Definition("String"),
			className : new typeUtils.Definition("String")
		},

		// see http://www.w3.org/TR/html5/the-img-element.html#htmlimageelement
		// incomplete
		HTMLImageElement : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("HTMLElement")
		},

		// incomplete
		HTMLOptionElement : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("HTMLElement")
		},

		// http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-75708506
		HTMLCollection : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),
			length : new typeUtils.Definition("Number"),
			item : new typeUtils.Definition("function(index:Number):Element"),
			namedItem : new typeUtils.Definition("function(name:String):Element")
		},

		// incomplete
		NodeIterator : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// incomplete
		TreeWalker : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object")
		},

		// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#interface-documentfragment
		DocumentFragment : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node"),

			prepend : new typeUtils.Definition("function(...nodes:Node)"),
			append : new typeUtils.Definition("function(...nodes:Node)")
		},

		// incomplete
		Text : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node")
		},

		// incomplete
		ProcessingInstruction : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node")
		},

		// incomplete
		Comment : {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Node")
		},

		// see http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#ranges
		Range: {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			startContainer : new typeUtils.Definition("Node"),
			startOffset : new typeUtils.Definition("Number"),
			endContainer : new typeUtils.Definition("Node"),
			endOffset : new typeUtils.Definition("Number"),
			collapsed : new typeUtils.Definition("Boolean"),
			commonAncestorContainer : new typeUtils.Definition("Node"),

			setStart : new typeUtils.Definition("function(refNode:Node,offset:Number)"),
			setEnd : new typeUtils.Definition("function(refNode:Node,offset:Number)"),
			setStartBefore : new typeUtils.Definition("function(refNode:Node)"),
			setStartAfter : new typeUtils.Definition("function(refNode:Node)"),
			setEndBefore : new typeUtils.Definition("function(refNode:Node)"),
			setEndAfter : new typeUtils.Definition("function(refNode:Node)"),
			collapse : new typeUtils.Definition("function(toStart:Node)"),
			selectNode : new typeUtils.Definition("function(refNode:Node)"),
			selectNodeContents : new typeUtils.Definition("function(refNode:Node)"),

			compareBoundaryPoints : new typeUtils.Definition("function(how:Object,sourceRange:Object):Number"),

			deleteContents : new typeUtils.Definition("function()"),
			extractContents : new typeUtils.Definition("function():DocumentFragment"),
			cloneContents : new typeUtils.Definition("function():DocumentFragment"),
			insertNode : new typeUtils.Definition("function(node:Node)"),
			surroundContents : new typeUtils.Definition("function(nodeParent:Node)"),

			cloneRange : new typeUtils.Definition("function():Range"),
			detach : new typeUtils.Definition("function()"),


			isPointInRange : new typeUtils.Definition("function(node:Node,offset:Number):Boolean"),
			comparePoint : new typeUtils.Definition("function(node:Node,offset:Number):Number"),

			intersectsNode : new typeUtils.Definition("function(node:Node):Boolean")
		},

		"funciton():Range" : {
			$$isBuiltin: true,
			START_TO_START : new typeUtils.Definition("Number"),
			START_TO_END : new typeUtils.Definition("Number"),
			END_TO_END : new typeUtils.Definition("Number"),
			END_TO_START : new typeUtils.Definition("Number")
		},


		// incomplete
		DOMTokenList: {
			$$isBuiltin: true,
			$$proto : new typeUtils.Definition("Object"),

			length : new typeUtils.Definition("Number"),

			item : new typeUtils.Definition("function(index:Number):String"),
			contains : new typeUtils.Definition("function(token:String):Boolean"),
			add : new typeUtils.Definition("function(token:String)"),
			remove : new typeUtils.Definition("function(token:String)"),
			toggle : new typeUtils.Definition("function(token:String):Boolean")
		}
	};

	return {
		Types : Types
	};
});
