var Util = {
	/*要格式化的数字, 要保留的小数位数, 指定小数点显示的字符, 指定千位分隔符显示的字符*/
	numberFormat : function (number, decimals, dec_point, thousands_sep, dec_method) {
			dec_method = dec_method || 'round';
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
			var n = !isFinite(+number) ? 0 : +number,
				prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
				sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
				dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
				s = '',
				toFixedFix = function (n, prec) {
					var k = Math.pow(10, prec);
					return '' + Math[dec_method](n * k) / k;
				};
			s = (prec ? toFixedFix(n, prec) : '' + Math[dec_method](n)).split('.');
			if (s[0].length > 3) {
				s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}
			return s.join(dec);
	},
	fixNumInput: function(v, decimals) {//输入的数字字符串截取为最多decimals位的数字
		decimals = decimals ? decimals : 2;
		var dots_num = v.match(/\./g);
		if (v.indexOf('.') < 0 || decimals == 0) {
			return v.replace(/[^\d]/g, '');
		} else if (dots_num.length == 1) {
			return v.replace(/[^\d\.]/g, '').substr(0, v.indexOf('.') + decimals + 1);
		} else {
			var i = v.substr(0, v.indexOf('.')),
				d = v.substring(v.indexOf('.'), v.length).replace(/[^\d]/g, '').substr(0, decimals);
			return (d ? i + '.' + d : i);
		}
	},
	isNumeric: function(obj){
		return obj-parseFloat(obj)+1 >=0;
	},
	repayPlanByDays: function(type) {
  	var RepayPlans = {
  		debx: function(amount, rate, days) {//等额本息
  			var r = rate / 100 / 12;
  			var n = Math.ceil(days / 31);
  			var pre_month_repay = amount * (r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  			return pre_month_repay * n - amount;
  		},
  		ayfx: function(amount, rate, days) {//按月付息
  			return amount * (rate / 100 / 365) * days;
  		}
  	};
  	var f = function(){
			return 0; 
		};
		switch(type){
			case '0':
				f = RepayPlans.debx;//等额本息
				break;
			case '1':
			default:
				f = RepayPlans.ayfx;//按月付息
				break; 
		}
		return f;
  },
	repayPlan : function(type){
		var RepayPlans = {
			debx : function(amount, rate, sTime, eTime){//等额本息
				var r = rate / 100 / 12;
				var sTimeObj = new Date(sTime),
					eTimeObj = new Date(eTime),
					y        = eTimeObj.getFullYear() - sTimeObj.getFullYear(),
					n        = y * 12 + eTimeObj.getMonth() - sTimeObj.getMonth();
				var pre_month_repay = amount * (r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
				return pre_month_repay * n - amount;
			},
			ayfx : function(amount, rate, sTime, eTime){//按月付息
				var days = (eTime - sTime)/86400000;
				return amount * (rate / 365 / 100) * days;
			}
		};
		var f = function(){return 0;};
		switch(type){
			case '0' :
				f = RepayPlans.debx;
				break;
			case '1' :
				f = RepayPlans.ayfx;
				break;
		}
		return f;
	},
	convertMS: function(ms) {
		var d, h, m, s;
		s = Math.floor(ms / 1000);
		m = Math.floor(s / 60);
		s = s % 60;
		h = Math.floor(m / 60);
		m = m % 60;
		d = Math.floor(h / 24);
		h = h % 24;
		return { d: d, h: h, m: m, s: s };
	},
	replaceData: function(str, obj) {//用obj对象里的内容替换str中的埋点，埋点格式为${...}
		return str.replace(/\$\{([\w\.?]+)\}/g, function(s, k) {
			var keys = k.split('.'), l = keys.length;
			var key = keys[0];
			if (l > 1) {
				var o = obj;
				for (var i = 0; i < l; i++) {
					if (key in o) {
						o = o[key];
						key = keys[i + 1];
					} else return s;
				}
				return o;
			}
			return key in obj ? obj[key] : s;
		});
	},
	queryUrl: function(url, key) {//获取url里的值，如果不传key，则返回所有值对
		url = url.replace(/^[^?=]*\?/ig, '').split('#')[0];
		var json = {};
		url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
			try {
				key = decodeURIComponent(key);
			} catch(e) {}
			try {
				value = decodeURIComponent(value);
			} catch(e) {}
			if (!(key in json)) {
				json[key] = /\[\]$/.test(key) ? [value] : value;
			}
			else if (json[key] instanceof Array) {
				json[key].push(value);
			}
			else {
				json[key] = [json[key], value];
			}
		});
		return key ? json[key] : json;
	},
	encodeURIJson: function(json){//把json转为uri串
		var s = [];
		for( var p in json ){
			if(json[p]==null) continue;
			if(json[p] instanceof Array)
			{
				for (var i=0;i<json[p].length;i++) s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
			}
			else
				s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
		}
		return s.join('&');
	},
	removeURLParameter: function (url, parameter) {
		var urlparts= url.split('?');   
		if (urlparts.length>=2) {
			var prefix= encodeURIComponent(parameter)+'=';
			var pars= urlparts[1].split(/[&;]/g);
			for (var i= pars.length; i-- > 0;) {    
				if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
					pars.splice(i, 1);
				}
			}
			url= urlparts[0]+'?'+pars.join('&');
			return url;
		} else {
			return url;
		}
	},
	getUrlHash: function () {
		return window.location.hash.substr(1);
	},
	appendCSS: function(src) {
		var link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = src;
		document.getElementsByTagName("head")[0].appendChild(link);
	},
	appendHiddenInput: function(form, name, value) {
		var ipt = document.createElement('input');
		ipt.type = 'hidden';
		ipt.name = name;
		ipt.value = value;
		form.appendChild(ipt);
	},
	appendHtml : function (el, str) {
		var div = document.createElement('div');
		div.innerHTML = str;
		while (div.children.length > 0) {
			el.appendChild(div.children[0]);
		}
	},
	removeHtml : function (el) {
		el.parentNode.removeChild(el);
	},
	siblings: function (elem) {
		var result = Array.prototype.filter.call(elem.parentNode.children, function(child){
			return child !== elem;
		});
		return result;
	},
	hasClass : function (elem, className) {
		return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	},
	addClass : function (elem, className) {
		 if (!this.hasClass(elem,className)) elem.className += " "+className;
	},
	removeClass : function (elem, className) {
		if (elem.classList) {
			elem.classList.remove(className);
		}
		else{
			elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	},
	toggleClass : function (elem, className) {
		var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
		if (this.hasClass(elem, className)) {
			while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
				newClass = newClass.replace( ' ' + className + ' ' , ' ' );
			}
			elem.className = newClass.replace(/^\s+|\s+$/g, '');
		} else {
			elem.className += ' ' + className;
		}
	},
	addEvents: function (target, type, func) {  
		if (target.addEventListener) {//非ie 和ie9以上
			target.addEventListener(type, func, false); 
		} else if (target.attachEvent) {
			target.attachEvent("on" + type, func);
		} 
	},
	removeEvents: function (target, type, func){
		if (target.addEventListener) {//非ie 和ie9以上
			target.removeEventListener(type, func, false); 
		} else if (target.attachEvent) {
			target.detachEvent("on" + type, func);
		}
	},
	tab : function (tabClassName, contentClassName) {
		var self = this;
		var nav = document.querySelectorAll('.'+tabClassName);
		var contents = document.querySelectorAll('.'+contentClassName);
		Array.prototype.forEach.call(nav, function(item, i){
			item.setAttribute('tab',i);
		});
		var handle = function(event){
			var targetElem = event.target;
			if (targetElem.classList.contains(tabClassName)) {
				self.addClass(targetElem,'cur');
				self.siblings(targetElem).forEach(function(item, i){
					self.removeClass(item,'cur');
				});
				var index = targetElem.getAttribute('tab');
				var thatContent = contents[index];
				self.addClass(thatContent,'cur');
				setTimeout(function(){
					self.addClass(thatContent,'show');
				},300);
				self.siblings(thatContent).forEach(function(item, i){
					self.removeClass(item,'cur');
				});
			}
		}
		document.body.addEventListener("touchend", handle,false);
		document.body.addEventListener("click", handle,false);
	},
	isEmptyObject: function (obj) {
		return Object.keys(obj).length === 0;
	},
	extend: function (to, from) {
		for (var key in from) {
			to[key] = from[key];
		}
		return to;
	},
	getRandom: function(start,end) {
		return Math.floor(Math.random() * (end - start + 1)) + start;
	},
	isSupportedLs: function () {
		var supported = false;
		var storage = window.localStorage;
		if (storage && storage.setItem ) {
			supported = true;
			var key = '__' + Math.round(Math.random() * 1e7);
			try {
				storage.setItem(key, key);
				storage.removeItem(key);
			} catch (err) {
				supported = false;
			}
		}
		return supported;
	},
	get: function (obj) {
		if (!obj.url || obj.url.length ===0 ) {
			console.error('Ajax URL is required');
			return;
		}
		var ajaxData = {
			url: obj.url,
			data: obj.data,
			success: obj.success || function () {},
			error: obj.error || function () {},
			cacheName: obj.cacheName,
			cacheTime: obj.cacheTime
		};
		var self = this;
		var needCache = this.isSupportedLs() && ajaxData.cacheName && ajaxData.cacheName.length > 0 && ajaxData.cacheTime && ajaxData.cacheTime > 1000;
		var sendRquest = function () {
			var request = new XMLHttpRequest();
			var requestAddr = ajaxData.url;
			if (ajaxData.data && !self.isEmptyObject(ajaxData.data)) {
				var query = self.encodeURIJson(ajaxData.data);
				requestAddr = ajaxData.url + '?' +query;
			}
			request.open('GET', requestAddr, true);
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					var data = JSON.parse(request.responseText);
					if (data.code === 1) {
						var fetchData = data.data;
						if (needCache) {
							var setData = {
								endTime: window.CONFIG.SERVER_TIME + ajaxData.cacheTime,
								data: fetchData
							};
							localStorage.setItem(ajaxData.cacheName, JSON.stringify(setData));
						}
						ajaxData.success(fetchData);
					}else {
						ajaxData.error(data);
					}
				} else {
					ajaxData.error();
				}
			};
			request.onerror = function() {
				ajaxData.error();
			};
			request.send();
		};
		if (needCache) {
			//需要进行缓存 && localStorage功能可用
				var cacheValueData = JSON.parse(localStorage.getItem(ajaxData.cacheName)); //缓存的数据
				if (cacheValueData && window.CONFIG.SERVER_TIME <= +cacheValueData.endTime ) {
					//本地有数据 && 缓存生效期间 不进行请求
					//直接返回本地数据
					ajaxData.success(cacheValueData.data);
				}else{
					//本地没有数据 || 缓存失效 重新请求
					sendRquest();
				}
		}else {
			//不需要进行缓存 || localStorage功能不可用 直接请求
			sendRquest();
		}
	},
	post: function (obj) {
		if (!obj.url || obj.url.length ===0 ) {
			console.error('Ajax URL is required');
			return;
		}
		var ajaxData = {
			url: obj.url,
			data: obj.data,
			success: obj.success || function () {},
			error: obj.error || function () {}
		};
		var self = this;
		var sendRquest = function () {
			var request = new XMLHttpRequest();
			var requestAddr = ajaxData.url;
			request.open('POST', requestAddr, true);
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					var data = JSON.parse(request.responseText);
					if (data.code === 1) {
						var fetchData = data.data;
						ajaxData.success(fetchData);
					}else {
						ajaxData.error(data);
					}
				} else {
					ajaxData.error();
				}
			};
			request.onerror = function() {
				ajaxData.error();
			};
			if (ajaxData.data && !self.isEmptyObject(ajaxData.data)) {
				var params = self.encodeURIJson(ajaxData.data);
				request.send(params);
			}
		};
		sendRquest();
	},
	getDevicePixelRatio: function () {
		var ratio = 1;
		if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
			ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
		} else if (window.devicePixelRatio !== undefined) {
			ratio = window.devicePixelRatio;
		}
		return ratio;
	},
	isAndroidWechat: function() { // 针对Android版本的微信浏览器
		return (/android/i).test(window.navigator.userAgent) && (/micromessenger/i).test(window.navigator.userAgent);
	},
	reload: function () { // Android版本的微信浏览器reload是不生效的
		var hash = +(new Date());
		var new_search = (/wechat_hash/).test(window.location.search) ? 
			// 如果之前有添加过指纹，就更新它
			window.location.search.replace(/wechat_hash=\d+(&?)/,'wechat_hash=' + hash + '$1') :
			window.location.search === '' ?
			// 如果 search 为空
			'?wechat_hash=' + hash :
			// 如果 search 不为空
			window.location.search + '&wechat_hash=' + hash;
		// 修改浏览器历史
		var current_title = document.title;
		var new_uri = window.location.origin + window.location.pathname + new_search;
		window.history.replaceState(null, current_title, new_uri);
		// 重新加载页面
		window.location.reload(true);
	}
};