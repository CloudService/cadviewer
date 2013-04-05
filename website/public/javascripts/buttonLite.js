﻿var BSHARE_SHOST_NAME = "http://static.bshare.cn", BSHARE_BUTTON_HOST = "http://b.bshare.cn", BSHARE_WEB_HOST = "http://www.bshare.cn";
(function (e, g) {
	if (!e.bShareUtil || !e.bShareControl) {
		var k = g.documentElement,
		h = navigator;
		e.BUZZ = {};
		e.bShareControl = {
			count : 0,
			viewed : !1,
			viewInfo : null,
			bShareLoad : !1,
			clicked : !1
		};
		var f = e.bShareUtil = {
			requestedScripts : [],
			encode : encodeURIComponent,
			isIe6 : /msie|MSIE 6/.test(h.userAgent),
			isIe7 : /MSIE 7/.test(h.userAgent),
			isIe8 : /MSIE 8/.test(h.userAgent),
			isIe9 : /MSIE 9/.test(h.userAgent),
			isIe : /Microsoft Internet Explorer/.test(h.appName),
			isSt : g.compatMode === "CSS1Compat",
			isQk : function () {
				return f.isIe6 || f.isIe && !f.isSt
			},
			isTrue : function (a) {
				return typeof a === "boolean" ? a : a.toLowerCase() === "true"
			},
			formatParam : function (a, b) {
				if (a === "number")
					return parseInt(b, 10);
				else if (a === "boolean")
					return f.isTrue(b);
				return b
			},
			isUndefined : function (a) {
				return typeof a === "undefined"
			},
			arrayContains : function (a, b, d) {
				for (var c = a.length; c--; )
					if (!f.isUndefined(b) && a[c] === b)
						return !0;
					else if (!f.isUndefined(d) && d.test(a[c]))
						return !0;
				return !1
			},
			loadScript : function (a, b) {
				var d = f.requestedScripts;
				if (!f.arrayContains(d, a))
					 / (bsMore(Org) ?  \ .js | bshareS887(Org) ?  \ .js) / .test(a) &&
					d.push(a), b = b || function () {},
				d = g.createElement("script"),
				d.src = a,
				d.type = "text/javascript",
				d.charset = "utf-8",
				d.onload = b,
				d.onreadystatechange = function () {
					/(complete|loaded)/.test(this.readyState) && b()
				},
				g.getElementsByTagName("head")[0].appendChild(d)
			},
			loadStyle : function (a) {
				var b = g.createElement("style");
				b.type = "text/css";
				b.styleSheet ? b.styleSheet.cssText = a : b.appendChild(g.createTextNode(a));
				g.getElementsByTagName("head")[0].appendChild(b)
			},
			getOffset : function (a) {
				for (var b = {
						x : a.offsetLeft,
						y : a.offsetTop,
						h : a.offsetHeight,
						w : a.offsetWidth
					}; a = a.offsetParent; b.x += a.offsetLeft, b.y += a.offsetTop);
				return b
			},
			getElem : function (a, b, d, c) {
				for (var a = a.getElementsByTagName(b), b = [], j = 0, g = 0, h = a.length; g < h; g++) {
					var e = a[g];
					if (!d || e.className.indexOf(d) !== -1)
						b.push(e), typeof c === "function" && c(e, j++)
				}
				return b
			},
			getText : function (a) {
				return f.isIe ? a.innerText : a.textContent
			},
			hasElem : function (a, b) {
				for (var d = 0, c = a.length; d < c; ++d)
					if (a[d] === b)
						return !0;
				return !1
			},
			insertAfter : function (a, b) {
				var d = b.parentNode;
				d.lastChild === b ? d.appendChild(a) :
				d.insertBefore(a, b.nextSibling)
			},
			getWH : function () {
				return {
					h : (f.isSt ? k : g.body).clientHeight,
					w : (f.isSt ? k : g.body).clientWidth
				}
			},
			stopProp : function (a) {
				a = a || e.event || {};
				a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
			},
			getScript : function (a) {
				for (var b = g.getElementsByTagName("script"), d = [], c = 0, j = b.length; c < j; c++) {
					var e = b[c].src;
					e && e.search(a) >= 0 && (e.toLowerCase().indexOf("bshare.cn") > -1 || e.toLowerCase().indexOf("static.local")) && d.push(b[c])
				}
				return d
			},
			parseOptions : function (a, b) {
				var d = {},
				c = a.indexOf("?");
				c && (a = a.substring(c + 1));
				(c = a.indexOf("#")) && (a = a.substring(c + 1));
				for (var a = a.replace("+", " "), c = a.split(/[&;]/g), j = 0, e = c.length; j < e; j++) {
					var g = c[j].split("="),
					h = decodeURIComponent(g[0]),
					f = b ? g[1] : null;
					if (!b)
						try {
							f = decodeURIComponent(g[1])
						} catch (k) {}
						
					d[h] = f
				}
				return d
			},
			submitForm : function (a, b, d, c) {
				var c = c || "post",
				j = g.createElement("form");
				g.body.appendChild(j);
				j.method = c;
				j.target = d;
				j.setAttribute("accept-charset", "utf-8");
				j.action = a;
				for (var e in b)
					if (typeof b[e] !== "function")
						a = g.createElement("input"),
						a.type = "hidden", a.name = e, a.value = b[e], j.appendChild(a);
				if (f.isIe)
					g.charset = "utf-8";
				j.submit();
				g.body.removeChild(j)
			},
			replaceParam : function (a, b, d) {
				return d = b ? d.replace(a, f.encode(b)) : d.replace(a, "")
			},
			ready : function (a) {
				if (g.addEventListener)
					g.addEventListener("DOMContentLoaded", function () {
						g.removeEventListener("DOMContentLoaded", arguments.callee, !1);
						a.call()
					}, !1), e.addEventListener("load", a, !1);
				else if (g.attachEvent) {
					g.attachEvent("onreadystatechange", function () {
						g.readyState === "complete" && (g.detachEvent("onreadystatechange",
								arguments.callee), a.call())
					});
					e.attachEvent("onload", a);
					var b = !1;
					try {
						b = e.frameElement === null
					} catch (d) {}
					
					k.doScroll && b && function () {
						try {
							k.doScroll("left")
						} catch (b) {
							setTimeout(arguments.callee, 10);
							return
						}
						a.call()
					}
					()
				} else
					e.onload = a
			},
			createBuzzObject : function (a, b) {
				if (e[a])
					return e[a];
				var d = e[a] = {
					shost : e.BSHARE_SHOST_NAME,
					bhost : e.BSHARE_BUTTON_HOST,
					whost : e.BSHARE_WEB_HOST,
					defaultConfig : b,
					params : {
						type : 0,
						publisherUuid : "",
						url : "",
						title : "",
						summary : "",
						content : "",
						pic : "",
						pics : "",
						video : "",
						vTag : "",
						vUid : "",
						vEmail : "",
						product : "",
						price : "0",
						brand : "",
						tag : "",
						category : "",
						template : "1",
						apvuid : "",
						apts : "",
						apsign : ""
					},
					isReady : !1,
					completed : !1,
					curb : 0,
					preb : -1,
					entries : [],
					counters : []
				};
				d.config = {};
				d.elems = {
					powerBy : '<div id="bsPower" style="float:right;text-align:right;overflow:hidden;height:100%;"><a class="bsSiteLink" style="font-size:10px;vertical-align:text-bottom;line-height:24px;cursor:pointer;" href="' + d.whost + '" target="_blank"><span style="font-size:10px;vertical-align:text-bottom;"><span style="color:#f60;">b</span>Share</span></a></div>'
				};
				for (var c in d.defaultConfig)
					d.config[c] = d.defaultConfig[c];
				d.imageBasePath = d.shost + "/frame/images/";
				d.jsBasePath = d.shost + "/b/";
				d.addEntry = function (a) {
					if (typeof d.counters === "number")
						d.counters = [];
					d.entries.unshift(a);
					d.counters.push(0)
				};
				return e[a]
			},
			parseBuzzOptions : function (a, b, d, c, j) {
				var i;
				i = (a = f.getScript(b)[a]) ? f.parseOptions(a.src) : {},
				a = i;
				j && (a = j(a));
				for (var e in a)
					a[e] === void 0 || a[e] === null || typeof d[e] === "number" && a[e] === "" || (d[e] !== void 0 ? d[e] = f.formatParam(typeof d[e], a[e]) : c[e] !== void 0 &&
							(c[e] = f.formatParam(typeof c[e], a[e])))
			}
		}
	}
})(window, document);
(function (e, g, k) {
	var h = g.bShareUtil,
	f = g.bShareControl;
	if (!(f.count > 0)) {
		var a = h.createBuzzObject(e, {
				lang : "zh",
				height : 0,
				width : 0,
				image : "",
				bgc : "none",
				fgc : "#333",
				poptxtc : "#666",
				popbgc : "#f2f2f2",
				sn : !1,
				logo : !0,
				style : 1,
				fs : 0,
				inline : !1,
				beta : !1,
				popjs : "",
				popHCol : 2,
				pop : 0,
				mdiv : 0,
				poph : "auto",
				bps : "",
				bps2 : "",
				showShareCount : !0,
				icon : !0,
				text : null,
				promote : !1
			}),
		b = a.config,
		d = a.params;
		a.topMap = {
			baiduhi : 0,
			bsharesync : 1,
			douban : 2,
			facebook : 3,
			feixin : 4,
			ifengmb : 5,
			itieba : 6,
			kaixin001 : 7,
			msn : 8,
			neteasemb : 9,
			peoplemb : 10,
			qqmb : 11,
			qqxiaoyou : 12,
			qzone : 13,
			renren : 14,
			sinaminiblog : 15,
			sinaqing : 16,
			sohuminiblog : 17,
			tianya : 18,
			twitter : 19
		};
		a.boxConfig = {
			position : 0,
			boxHeight : 408,
			boxWidth : 548,
			closeTop : 8,
			closeRight : 20,
			hasWrapper : !0
		};
		a.customization = {};
		a.loadOptions = function () {
			h.parseBuzzOptions(0, /((bshare|static).*button(Lite)?(Org)?\.js|bshare_load)/, b, d, function (a) {
				if (typeof g.bShareOpt !== "undefined")
					for (var b in g.bShareOpt)
						a[b] = g.bShareOpt[b];
				a.lang = a.lang === "en" ? "en" : "zh";
				if (a.h && a.w && a.img)
					a.height = a.h, a.width = a.w, a.image = a.img;
				a.bgc = a.bgcolor ||
					void 0;
				a.fgc = a.textcolor || void 0;
				a.logo = !(a.logo && a.logo.toLowerCase() === "false");
				a.popHCol = a.pophcol || void 0;
				if (a.style)
					a.style = "-1||0||1||2||3||4||5||10||11||999".indexOf(a.style) < 0 ? void 0 : parseInt(a.style, 10);
				if (a.bp)
					a.style && a.style === 2 ? a.bps2 = a.bp.split(",") : a.bps = a.bp.split(",");
				a.showShareCount = a.style && /(3|4|5)/.test(a.style) ? !1 : !(a.ssc && a.ssc.toString().toLowerCase() === "false");
				a.type = g.BSHARE_BUTTON_TYPE || a.type;
				a.publisherUuid = a.uuid || void 0;
				return a
			});
			a.buttonType = d.type;
			for (var c in a.defaultConfig)
				a.defaultConfig[c] !==
				b[c] && (a.customization[c] = b[c]);
			if (g.location.href.indexOf(a.whost + "/moreStyles") < 0)
				b.promote = !1
		};
		a.writeButton = function () {
			var c = "",
			d = {
				0 : 0,
				1 : [110, 85],
				10 : [90, 51],
				11 : [82, 82]
			},
			e = {
				0 : 16,
				1 : 24,
				10 : 21,
				11 : 49
			},
			g = a.imageBasePath,
			f = b.style,
			m = b.image,
			o = b.showShareCount,
			n = b.width,
			p = b.height;
			f !== 3 && f !== 4 && f !== 5 && (c = '<div class="bsPromo bsPromo1"></div>');
			f > 1 && f < 6 ? a.writeBshareDiv(c) : f === -1 ? (h.getElem(k, "div", "bshare-custom", function (b) {
					if (!b.childNodes[0].className || b.childNodes[0].className.indexOf("bsPromo") < 0) {
						var c =
							k.createElement("div");
						c.className = "bsPromo bsPromo" + (a.isLite ? 2 : 1);
						b.insertBefore(c, b.childNodes[0])
					}
				}), (b.beta || b.popjs) && a.writeBshareDiv('<div class="buzzButton">' + b.text + "</div>", "")) : f >= 0 && (f !== 999 && (m = g + "button_custom", f === 0 ? m = g + "logo_square_s.gif" : (m += f + "-" + (b.lang === "en" ? "en" : "zh"), o && (m += "-c"), f === 10 && (n = /(Blue|Red|Green|Grey|Orange)/.test(b.bgc) ? b.bgc : "Orange", m += "-" + n), m += ".gif"), n = d[f][o ? 0 : 1], p = e[f]), c += '<div class="buzzButton bsStyle' + f + '" style="height:' + p + "px;color:" + b.fgc + ";", f ===
				0 ? (c += b.icon ? "background:transparent url(" + m + ") no-repeat;" : "", c += 'float:left"><div style="padding:0 4px' + (b.icon ? " 0 21px" : " 0 0") + ";" + (a.isLite ? "height:16px;" : "") + '"><span class="bshareText" style="line-height:18px;float:left;">' + (b.text === null ? "\u5206\u4eab" : b.text) + "</span></div></div>", o && (c += '<div style="background:transparent url(' + g + 'counter_box.gif) no-repeat;float:left;width:40px;height:16px;text-align:center;font-weight:bold;">&nbsp;<span style="position:relative;line-height:16px;" class="shareCount"></span></div>')) :
				(c += ";background:transparent url(" + m + ") no-repeat;text-align:center;width:" + n + 'px;">', o && f !== 999 && (c += '<span style="font-weight:bold;position:relative;line-height:' + (f === 10 ? "22" : "25") + 'px;" class="shareCount"></span>'), c += "</div>"), c += '<div style="clear:both;"></div>', a.writeBshareDiv(c, "font-size:12px;height:" + p + "px;width:" + n + "px;"))
		};
		a.more = function () {
			return typeof a.moreDiv === "function" ? (a.moreDiv(), !0) : !1
		};
		a.commLoad = function (c) {
			if (!c) {
				if (b.mdiv < 0)
					return;
				var e = 0,
				k = setInterval(function () {
						a.more() ||
						e >= 30 ? clearInterval(k) : ++e
					}, 100);
				return !1
			}
			var i;
			if (c === "bsharesync")
				i = [a.whost, "/bsyncShare?site=", c].join(""), a.shareStats(c), h.submitForm(i, d, "_blank");
			else if (c === "email")
				i = [a.bhost, "/bshareEmail"].join(""), a.shareStats(c), h.submitForm(i, d, "_blank");
			else if (c === "clipboard")
				h.copy2Clipboard(), a.shareStats(c);
			else if (c === "favorite")
				h.add2Bookmark(), a.shareStats(c);
			else if (c === "printer")
				h.add2Printer(), a.shareStats(c);
			else {
				i = "";
				if (f.bShareLoad) {
					i = [a.bhost, "/bshare_redirect?site=", c].join("");
					for (var l in d)
						!/(content|target)/.test(l) &&
						d[l] && typeof d[l] !== "function" && (i += "&" + l + "=" + h.encode(d[l]))
				} else (i = g.BS_PURL_MAP[c]) || alert(a.iL8n.loadFailed), c === "gmw" ? i = h.replaceParam("${URL}", d.url.replace("http://", ""), i) : d.url && (i = h.replaceParam("${URL}", d.url, i)), i = h.replaceParam("${TITLE}", d.title, i), i = h.replaceParam("${CONTENT}", d.summary, i), i = h.replaceParam("${IMG}", d.pic, i), i = h.replaceParam("${VIDEO}", d.video, i);
				g.open(i, "", "height=600,width=800,top=100,left=100,screenX=100,screenY=100,scrollbars=yes,resizable=yes")
			}
		};
		a.onLoad = function () {
			h.getElem(k,
				"a", "bshareDiv", function (b, c) {
				h.getElem(b, "div", "buzzButton", function (b) {
					b.onclick = function (b) {
						return function (c) {
							a.more(c, b);
							return !1
						}
					}
					(c)
				})
			});
			var c = b.showShareCount;
			if (b.style === 0) {
				var d = h.getElem(k, "div", "buzzButton")[0].offsetWidth;
				c && (d += 41);
				h.getElem(k, "a", "bshareDiv", function (a) {
					a.style.width = d + "px"
				})
			}
			var e = a.entries.length;
			if (c && e > 0) {
				for (var c = "", f = 0; f < e; f++) {
					var l = a.entries[f];
					if (typeof l.url === "string") {
						if (h.isIe && c.length + l.url.length > 2E3)
							break;
						c !== "" && (c += "|");
						c += l.url
					}
				}
				c !== "" && (c += "|");
				c += g.location.href;
				a.count(c)
			}
		};
		a.renderButton = function () {
			h.loadStyle("a.bshareDiv,#bsPanel,#bsMorePanel,#bshareF{border:none;background:none;padding:0;margin:0;font:12px Helvetica,Calibri,Tahoma,Arial,\u5b8b\u4f53,sans-serif;line-height:14px;}#bsPanel div,#bsMorePanel div,#bshareF div{display:block;}.bsRlogo .bsPopupAwd,.bsRlogoSel .bsPopupAwd,.bsLogo .bsPopupAwd,.bsLogoSel .bsPopupAwd{ line-height:16px!important;}a.bshareDiv div,#bsFloatTab div{*display:inline;zoom:1;display:inline-block;}a.bshareDiv img,a.bshareDiv div,a.bshareDiv span,a.bshareDiv a,#bshareF table,#bshareF tr,#bshareF td{text-decoration:none;background:none;margin:0;padding:0;border:none;line-height:1.2}a.bshareDiv span{display:inline;float:none;}div.buzzButton{cursor:pointer;font-weight:bold;}.buzzButton .shareCount a{color:#333}.bsStyle1 .shareCount a{color:#fff}span.bshareText{white-space:nowrap;}span.bshareText:hover{text-decoration:underline;}a.bshareDiv .bsPromo,div.bshare-custom .bsPromo{display:none;position:absolute;z-index:100;}a.bshareDiv .bsPromo.bsPromo1,div.bshare-custom .bsPromo.bsPromo1{width:51px;height:18px;top:-18px;left:0;line-height:16px;font-size:12px !important;font-weight:normal !important;color:#fff;text-align:center;background:url(" +
				a.imageBasePath + "bshare_box_sprite2.gif) no-repeat 0 -606px;}div.bshare-custom .bsPromo.bsPromo2{background:url(" + a.imageBasePath + "bshare_promo_sprite.gif) no-repeat;cursor:pointer;}");
			a.writeButton()
		};
		a.loadButtonStyle = function () {
			if (a.buttonType !== 15) {
				var c,
				d = b.style;
				if (b.beta)
					c = a.jsBasePath + "styles/bshareS888.js?v=20130401";
				else if (b.popjs)
					c = b.popjs;
				else if (b.style !== -1 && (c = a.jsBasePath + "styles/bshareS" + (d > 1 && d < 6 ? d : 1) + ".js?v=20130401", b.pop === -1 && (d <= 1 || d >= 6)))
					c = "";
				c && h.loadScript(c)
			}
		};
		a.international = function (c) {
			var d =
				a.jsBasePath + "langs/";
			d += b.lang !== "zh" ? "bs-lang-en.js?v=20130401" : "bs-lang-zh.js?v=20130401";
			h.loadScript(d, c)
		};
		a.start = function () {
			h.loadEngine && (h.loadEngine(e), a.isLite && a.loadOptions(), a.international(function () {
					if (!a.completed) {
						if (b.text === void 0 || b.text === null)
							b.text = b.style === 0 ? a.iL8n.shareTextShort : a.iL8n.shareText;
						a.isLite && a.renderButton();
						if (a.buttonType === 15)
							a.boxConfig = {
								position : 0,
								boxHeight : 404,
								boxWidth : 650,
								closeTop : 10,
								closeRight : 16
							};
						h.createShareBox(e);
						a.createBox && a.createBox();
						b.mdiv >= 0 && a.buttonType !==
						15 && h.loadScript(a.jsBasePath + "components/bsMore.js?v=20130401");
						if (a.buttonType === 1)
							return a.show(), !1;
						a.loadButtonStyle();
						a.onLoad();
						a.prepare(0);
						a.view();
						setTimeout(function () {
							f.bShareLoad || h.loadScript(a.jsBasePath + "components/bsPlatforms.js?v=20130401")
						}, 3E3);
						a.completed = !0
					}
				}))
		};
		a.init = function () {
			if (!a.isReady)
				a.isReady = !0, h.loadScript(a.jsBasePath + "engines/bs-engine.js?v=20130401", a.start)
		}
	}
})("bShare", window, document);
(function (e, g, k) {
	if (!(g.bShareControl.count > 0)) {
		g.bShareControl.count += 1;
		var h = g.bShareUtil,
		f = g[e],
		a = f.config;
		f.isLite = !0;
		f.customization.type = "lite";
		f.writeBshareDiv = function (b, d) {
			h.getElem(k, "a", "bshareDiv", function (c) {
				if (b)
					c.innerHTML = b;
				else if (c.innerHTML.length < 24)
					c.innerHTML = "";
				c.onclick = function () {
					return !1
				};
				c.style.cssText = (a.inline ? "" : "display:block;") + "text-decoration:none;padding:0;margin:0;" + d || ""
			})
		};
		f.load = function (a) {
			f.click();
			a !== "bsharesync" && f.updateCounter();
			f.prepare();
			f.commLoad(a);
			return !0
		};
		h.ready(f.init)
	}
})("bShare", window, document);
(function () {
	var e = window.bShare;
	if (!e)
		e = window.bShare = {};
	e.pnMap = {
		115 : ["115\u6536\u85cf\u5939", 0],
		"139mail" : ["139\u90ae\u7bb1", 2],
		"9dian" : ["\u8c46\u74e39\u70b9", 6],
		baiducang : ["\u767e\u5ea6\u641c\u85cf", 7],
		baiduhi : ["\u767e\u5ea6\u7a7a\u95f4", 8],
		bgoogle : ["Google\u4e66\u7b7e", 10],
		bsharesync : ["\u4e00\u952e\u901a", 16],
		caimi : ["\u8d22\u8ff7", 17],
		cfol : ["\u4e2d\u91d1\u5fae\u535a", 18],
		chouti : ["\u62bd\u5c49", 20],
		clipboard : ["\u590d\u5236\u7f51\u5740", 21],
		cyolbbs : ["\u4e2d\u9752\u8bba\u575b", 22],
		cyzone : ["\u521b\u4e1a\u5427", 23],
		delicious : ["\u7f8e\u5473\u4e66\u7b7e", 24],
		dig24 : ["\u9012\u5ba2\u7f51", 25],
		digg : ["Digg", 26],
		diglog : ["\u5947\u5ba2\u53d1\u73b0", 27],
		diigo : ["Diigo", 29],
		douban : ["\u8c46\u74e3\u7f51", 30],
		dream : ["\u68a6\u5e7b\u4eba\u751f", 31],
		duitang : ["\u5806\u7cd6", 32],
		eastdaymb : ["\u4e1c\u65b9\u5fae\u535a", 33],
		email : ["\u7535\u5b50\u90ae\u4ef6",
			34],
		evernote : ["Evernote", 35],
		facebook : ["Facebook", 36],
		fanfou : ["\u996d\u5426", 37],
		favorite : ["\u6536\u85cf\u5939", 38],
		feixin : ["\u98de\u4fe1", 39],
		friendfeed : ["FriendFeed", 40],
		fwisp : ["Fwisp", 42],
		ganniu : ["\u8d76\u725b\u5fae\u535a", 43],
		gmail : ["Gmail", 44],
		gmw : ["\u5149\u660e\u7f51", 45],
		gtranslate : ["\u8c37\u6b4c\u7ffb\u8bd1", 46],
		hemidemi : ["\u9ed1\u7c73\u4e66\u7b7e", 47],
		hexunmb : ["\u548c\u8baf\u5fae\u535a", 48],
		huaban : ["\u82b1\u74e3", 49],
		ifengkb : ["\u51e4\u51f0\u5feb\u535a", 50],
		ifengmb : ["\u51e4\u51f0\u5fae\u535a", 51],
		ifensi : ["\u7c89\u4e1d\u7f51", 52],
		instapaper : ["Instapaper", 53],
		itieba : ["i\u8d34\u5427", 54],
		joinwish : ["\u597d\u613f\u7f51", 55],
		kaixin001 : ["\u5f00\u5fc3\u7f51", 56],
		laodao : ["\u5520\u53e8\u7f51", 57],
		leihou : ["\u96f7\u7334", 58],
		leshou : ["\u4e50\u6536", 59],
		linkedin : ["LinkedIn",
			60],
		livespace : ["MS Livespace", 61],
		mala : ["\u9ebb\u8fa3\u5fae\u535a", 63],
		masar : ["\u739b\u6492\u7f51", 65],
		meilishuo : ["\u7f8e\u4e3d\u8bf4", 66],
		miliao : ["\u7c73\u804a", 67],
		mister_wong : ["Mister Wong", 68],
		mogujie : ["\u8611\u83c7\u8857", 69],
		moptk : ["\u732b\u6251\u63a8\u5ba2", 70],
		msn : ["MSN", 71],
		myshare : ["MyShare", 72],
		myspace : ["MySpace", 73],
		neteasemb : ["\u7f51\u6613\u5fae\u535a", 74],
		netvibes : ["Netvibes", 75],
		peoplemb : ["\u4eba\u6c11\u5fae\u535a", 76],
		pinterest : ["Pinterest", 79],
		poco : ["Poco\u7f51", 81],
		printer : ["\u6253\u5370", 82],
		printf : ["Print Friendly", 83],
		qqmb : ["\u817e\u8baf\u5fae\u535a", 84],
		qqshuqian : ["QQ\u4e66\u7b7e", 85],
		qqxiaoyou : ["\u670b\u53cb\u7f51", 86],
		qzone : ["QQ\u7a7a\u95f4", 87],
		readitlater : ["ReadItLater", 88],
		reddit : ["Reddit", 89],
		redmb : ["\u7ea2\u5fae\u535a", 90],
		renjian : ["\u4eba\u95f4\u7f51", 91],
		renmaiku : ["\u4eba\u8109\u5e93", 92],
		renren : ["\u4eba\u4eba\u7f51", 93],
		shouji : ["\u624b\u673a", 95],
		sinaminiblog : ["\u65b0\u6d6a\u5fae\u535a", 96],
		sinaqing : ["\u65b0\u6d6aQing", 97],
		sinavivi : ["\u65b0\u6d6aVivi", 98],
		sohubai : ["\u641c\u72d0\u767d\u793e\u4f1a", 99],
		sohuminiblog : ["\u641c\u72d0\u5fae\u535a", 100],
		southmb : ["\u5357\u65b9\u5fae\u535a", 101],
		stumbleupon : ["StumbleUpon", 102],
		szone : ["\u5b88\u682a\u7f51", 103],
		taojianghu : ["\u6dd8\u6c5f\u6e56", 104],
		tianya : ["\u5929\u6daf", 105],
		tongxue : ["\u540c\u5b66\u5fae\u535a", 106],
		tuita : ["\u63a8\u4ed6", 107],
		tumblr : ["Tumblr", 108],
		twitter : ["Twitter", 109],
		ushi : ["\u4f18\u58eb\u7f51", 110],
		waakee : ["\u6316\u5ba2", 112],
		wealink : ["\u82e5\u90bb\u7f51", 113],
		woshao : ["\u6211\u70e7\u7f51", 115],
		xianguo : ["\u9c9c\u679c\u7f51",
			116],
		xiaomeisns : ["\u6821\u5a92\u91c7\u901a", 117],
		xinminmb : ["\u65b0\u6c11\u5fae\u535a", 118],
		xyweibo : ["\u5fae\u535a\u6821\u56ed", 119],
		yaolanmb : ["\u6447\u7bee\u5fae\u535a", 120],
		yijee : ["\u6613\u96c6\u7f51", 121],
		youdao : ["\u6709\u9053\u4e66\u7b7e", 122],
		zjol : ["\u6d59\u6c5f\u5fae\u535a", 124],
		xinhuamb : ["\u65b0\u534e\u5fae\u535a"],
		szmb : ["\u6df1\u5733\u5fae\u535a"],
		changshamb : ["\u5fae\u957f\u6c99"],
		hefeimb : ["\u5408\u80a5\u5fae\u535a"],
		wansha : ["\u73a9\u5565e\u65cf"],
		"189share" : ["\u624b\u673a\u5feb\u4f20"],
		diandian : ["\u70b9\u70b9\u7f51"],
		tianji : ["\u5929\u9645\u7f51"],
		jipin : ["\u5f00\u5fc3\u96c6\u54c1"],
		chezhumb : ["\u8f66\u4e3b\u5fae\u535a"],
		gplus : ["Google+"],
		yidongweibo : ["\u79fb\u52a8\u5fae\u535a"],
		youdaonote : ["\u6709\u9053\u7b14\u8bb0"],
		jschina : ["\u5fae\u6c5f\u82cf"],
		mingdao : ["\u660e\u9053"],
		jxcn : ["\u6c5f\u897f\u5fae\u535a"],
		qileke : ["\u5947\u4e50\u6536\u85cf"],
		sohukan : ["\u641c\u72d0\u968f\u8eab\u770b"],
		maikunote : ["\u9ea6\u5e93\u8bb0\u4e8b"],
		lezhimark : ["\u4e50\u77e5\u4e66\u7b7e"],
		"189mail" : ["189\u90ae\u7bb1"],
		wo : ["WO+\u5206\u4eab"],
		gmweibo : ["\u5149\u660e\u5fae\u535a"],
		jianweibo : ["\u5409\u5b89\u5fae\u535a"],
		qingbiji : ["\u8f7b\u7b14\u8bb0"],
		duankou : ["\u7aef\u53e3\u7f51"],
		qqim : ["QQ\u597d\u53cb"]
	};
	e.defaultBps = "bsharesync,sinaminiblog,qqmb,renren,qzone,sohuminiblog,douban,kaixin001,baiduhi,qqxiaoyou,neteasemb,ifengmb,email,facebook,twitter,tianya,clipboard".split(",");
	e.boldPlatforms = [];
	e.redPlatforms = ["bsharesync", "xinhuamb"];
	e.arrayIsHot = ["bsharesync", "qzone"];
	e.arrayIsNew = ["chinanews", "peoplemb", "moptk", "woshao"];
	e.arrayIsRec = ["renren", "sohuminiblog", "feixin", "tianya"];
	e.arrayIsAwd = e.isLite ?
		["bsharesync"] : "sinaminiblog,qqmb,renren,neteasemb,sohuminiblog,kaixin001,qzone,tianya,bsharesync".split(",");
	e.iL8n = {
		promoteHot : "\u70ed",
		promoteNew : "\u65b0",
		promoteRec : "\u63a8\u8350",
		rtnTxt : "\u9009\u62e9\u5176\u4ed6\u5e73\u53f0 >>",
		shareText : "\u5206\u4eab\u5230",
		shareTextShort : "\u5206\u4eab",
		shareTextPromote : "\u5206\u4eab\u6709\u793c",
		morePlats : "\u66f4\u591a\u5e73\u53f0...",
		morePlatsShort : "\u66f4\u591a...",
		whatsThis : "\u8fd9\u662f\u4ec0\u4e48\u5de5\u5177\uff1f",
		promote : "\u5206\u4eab\u6709\u793c",
		promoteShort : "\u5956",
		searchHint : "\u8f93\u5165\u5e73\u53f0\u5173\u952e\u5b57\u67e5\u8be2",
		closeHint : "30\u5206\u949f\u5185\u4e0d\u518d\u51fa\u73b0\u6b64\u5206\u4eab\u6846",
		loadFailed : "\u7f51\u7edc\u592a\u6162\u65e0\u6cd5\u52a0\u8f7d\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
		loadFailed2 : "\u5f88\u62b1\u6b49\uff0c\u65e0\u6cd5\u8fde\u63a5\u670d\u52a1\u5668\u3002\u8bf7\u7a0d\u540e\u91cd\u8bd5\uff01",
		notSupport : "\u4e0d\u652f\u6301\uff01",
		copySuccess : "\u590d\u5236\u6210\u529f\uff01\u60a8\u53ef\u4ee5\u7c98\u8d34\u5230QQ/MSN\u4e0a\u5206\u4eab\u7ed9\u60a8\u7684\u597d\u53cb\uff01",
		copyTip : "\u8bf7\u6309Ctrl+C\u590d\u5236\uff0c\u7136\u540e\u60a8\u53ef\u4ee5\u7c98\u8d34\u5230QQ/MSN\u4e0a\u5206\u4eab\u7ed9\u60a8\u7684\u597d\u53cb\uff01",
		bookmarkTip : "\u6309\u4e86OK\u4ee5\u540e\uff0c\u8bf7\u6309Ctrl+D\uff08Macs\u7528Command+D\uff09\u3002",
		confirmClose : "\u5173\u95ed\u540e\uff0c\u8be5\u5206\u4eab\u6309\u94ae30\u5206\u949f\u5c06\u4e0d\u518d\u51fa\u73b0\uff0c\u60a8\u4e5f\u65e0\u6cd5\u4f7f\u7528\u5206\u4eab\u529f\u80fd\uff0c\u786e\u5b9a\u5417\uff1f"
	}
})();
