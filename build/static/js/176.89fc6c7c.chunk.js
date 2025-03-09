"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[176],{849:(t,e,n)=>{n.d(e,{q:()=>a});let r={};function a(){return r}},1620:(t,e,n)=>{n.d(e,{k:()=>i});var r=n(849),a=n(2316);function i(t,e){const n=(0,r.q)(),i=e?.weekStartsOn??e?.locale?.options?.weekStartsOn??n.weekStartsOn??n.locale?.options?.weekStartsOn??0,o=(0,a.a)(t,e?.in),s=o.getDay(),u=(s<i?7:0)+s-i;return o.setDate(o.getDate()-u),o.setHours(0,0,0,0),o}},2227:(t,e,n)=>{n.d(e,{fr:()=>l});const r={lessThanXSeconds:{one:"moins d\u2019une seconde",other:"moins de {{count}} secondes"},xSeconds:{one:"1 seconde",other:"{{count}} secondes"},halfAMinute:"30 secondes",lessThanXMinutes:{one:"moins d\u2019une minute",other:"moins de {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"environ 1 heure",other:"environ {{count}} heures"},xHours:{one:"1 heure",other:"{{count}} heures"},xDays:{one:"1 jour",other:"{{count}} jours"},aboutXWeeks:{one:"environ 1 semaine",other:"environ {{count}} semaines"},xWeeks:{one:"1 semaine",other:"{{count}} semaines"},aboutXMonths:{one:"environ 1 mois",other:"environ {{count}} mois"},xMonths:{one:"1 mois",other:"{{count}} mois"},aboutXYears:{one:"environ 1 an",other:"environ {{count}} ans"},xYears:{one:"1 an",other:"{{count}} ans"},overXYears:{one:"plus d\u2019un an",other:"plus de {{count}} ans"},almostXYears:{one:"presqu\u2019un an",other:"presque {{count}} ans"}};var a=n(7576);const i={date:(0,a.k)({formats:{full:"EEEE d MMMM y",long:"d MMMM y",medium:"d MMM y",short:"dd/MM/y"},defaultWidth:"full"}),time:(0,a.k)({formats:{full:"HH:mm:ss zzzz",long:"HH:mm:ss z",medium:"HH:mm:ss",short:"HH:mm"},defaultWidth:"full"}),dateTime:(0,a.k)({formats:{full:"{{date}} '\xe0' {{time}}",long:"{{date}} '\xe0' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},defaultWidth:"full"})},o={lastWeek:"eeee 'dernier \xe0' p",yesterday:"'hier \xe0' p",today:"'aujourd\u2019hui \xe0' p",tomorrow:"'demain \xe0' p'",nextWeek:"eeee 'prochain \xe0' p",other:"P"};var s=n(9494);const u=["MMM","MMMM"],c={preprocessor:(t,e)=>{if(1===t.getDate())return e;return e.some((t=>t.isToken&&u.includes(t.value)))?e.map((t=>t.isToken&&"do"===t.value?{isToken:!0,value:"d"}:t)):e},ordinalNumber:(t,e)=>{const n=Number(t),r=e?.unit;if(0===n)return"0";let a;return a=1===n?r&&["year","week","hour","minute","second"].includes(r)?"\xe8re":"er":"\xe8me",n+a},era:(0,s.o)({values:{narrow:["av. J.-C","ap. J.-C"],abbreviated:["av. J.-C","ap. J.-C"],wide:["avant J\xe9sus-Christ","apr\xe8s J\xe9sus-Christ"]},defaultWidth:"wide"}),quarter:(0,s.o)({values:{narrow:["T1","T2","T3","T4"],abbreviated:["1er trim.","2\xe8me trim.","3\xe8me trim.","4\xe8me trim."],wide:["1er trimestre","2\xe8me trimestre","3\xe8me trimestre","4\xe8me trimestre"]},defaultWidth:"wide",argumentCallback:t=>t-1}),month:(0,s.o)({values:{narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["janv.","f\xe9vr.","mars","avr.","mai","juin","juil.","ao\xfbt","sept.","oct.","nov.","d\xe9c."],wide:["janvier","f\xe9vrier","mars","avril","mai","juin","juillet","ao\xfbt","septembre","octobre","novembre","d\xe9cembre"]},defaultWidth:"wide"}),day:(0,s.o)({values:{narrow:["D","L","M","M","J","V","S"],short:["di","lu","ma","me","je","ve","sa"],abbreviated:["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],wide:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"]},defaultWidth:"wide"}),dayPeriod:(0,s.o)({values:{narrow:{am:"AM",pm:"PM",midnight:"minuit",noon:"midi",morning:"mat.",afternoon:"ap.m.",evening:"soir",night:"mat."},abbreviated:{am:"AM",pm:"PM",midnight:"minuit",noon:"midi",morning:"matin",afternoon:"apr\xe8s-midi",evening:"soir",night:"matin"},wide:{am:"AM",pm:"PM",midnight:"minuit",noon:"midi",morning:"du matin",afternoon:"de l\u2019apr\xe8s-midi",evening:"du soir",night:"du matin"}},defaultWidth:"wide"})};var d=n(8612);const l={code:"fr",formatDistance:(t,e,n)=>{let a;const i=r[t];return a="string"===typeof i?i:1===e?i.one:i.other.replace("{{count}}",String(e)),n?.addSuffix?n.comparison&&n.comparison>0?"dans "+a:"il y a "+a:a},formatLong:i,formatRelative:(t,e,n,r)=>o[t],localize:c,match:{ordinalNumber:(0,n(9343).K)({matchPattern:/^(\d+)(i\xe8me|\xe8re|\xe8me|er|e)?/i,parsePattern:/\d+/i,valueCallback:t=>parseInt(t)}),era:(0,d.A)({matchPatterns:{narrow:/^(av\.J\.C|ap\.J\.C|ap\.J\.-C)/i,abbreviated:/^(av\.J\.-C|av\.J-C|apr\.J\.-C|apr\.J-C|ap\.J-C)/i,wide:/^(avant J\xe9sus-Christ|apr\xe8s J\xe9sus-Christ)/i},defaultMatchWidth:"wide",parsePatterns:{any:[/^av/i,/^ap/i]},defaultParseWidth:"any"}),quarter:(0,d.A)({matchPatterns:{narrow:/^T?[1234]/i,abbreviated:/^[1234](er|\xe8me|e)? trim\.?/i,wide:/^[1234](er|\xe8me|e)? trimestre/i},defaultMatchWidth:"wide",parsePatterns:{any:[/1/i,/2/i,/3/i,/4/i]},defaultParseWidth:"any",valueCallback:t=>t+1}),month:(0,d.A)({matchPatterns:{narrow:/^[jfmasond]/i,abbreviated:/^(janv|f\xe9vr|mars|avr|mai|juin|juill|juil|ao\xfbt|sept|oct|nov|d\xe9c)\.?/i,wide:/^(janvier|f\xe9vrier|mars|avril|mai|juin|juillet|ao\xfbt|septembre|octobre|novembre|d\xe9cembre)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^av/i,/^ma/i,/^juin/i,/^juil/i,/^ao/i,/^s/i,/^o/i,/^n/i,/^d/i]},defaultParseWidth:"any"}),day:(0,d.A)({matchPatterns:{narrow:/^[lmjvsd]/i,short:/^(di|lu|ma|me|je|ve|sa)/i,abbreviated:/^(dim|lun|mar|mer|jeu|ven|sam)\.?/i,wide:/^(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^d/i,/^l/i,/^m/i,/^m/i,/^j/i,/^v/i,/^s/i],any:[/^di/i,/^lu/i,/^ma/i,/^me/i,/^je/i,/^ve/i,/^sa/i]},defaultParseWidth:"any"}),dayPeriod:(0,d.A)({matchPatterns:{narrow:/^(a|p|minuit|midi|mat\.?|ap\.?m\.?|soir|nuit)/i,any:/^([ap]\.?\s?m\.?|du matin|de l'apr\xe8s[-\s]midi|du soir|de la nuit)/i},defaultMatchWidth:"any",parsePatterns:{any:{am:/^a/i,pm:/^p/i,midnight:/^min/i,noon:/^mid/i,morning:/mat/i,afternoon:/ap/i,evening:/soir/i,night:/nuit/i}},defaultParseWidth:"any"})},options:{weekStartsOn:1,firstWeekContainsDate:4}}},2316:(t,e,n)=>{n.d(e,{a:()=>a});var r=n(2440);function a(t,e){return(0,r.w)(e||t,t)}},2440:(t,e,n)=>{n.d(e,{w:()=>a});var r=n(4524);function a(t,e){return"function"===typeof t?t(e):t&&"object"===typeof t&&r._P in t?t[r._P](e):t instanceof Date?new t.constructor(e):new Date(e)}},3441:(t,e,n)=>{n.d(e,{k5:()=>h});var r=n(5043),a={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},i=r.createContext&&r.createContext(a),o=["attr","size","title"];function s(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n={};for(var r in t)if(Object.prototype.hasOwnProperty.call(t,r)){if(e.indexOf(r)>=0)continue;n[r]=t[r]}return n}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}function u(){return u=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},u.apply(this,arguments)}function c(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function d(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?c(Object(n),!0).forEach((function(e){l(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function l(t,e,n){return(e=function(t){var e=function(t,e){if("object"!=typeof t||!t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var r=n.call(t,e||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function m(t){return t&&t.map(((t,e)=>r.createElement(t.tag,d({key:e},t.attr),m(t.child))))}function h(t){return e=>r.createElement(f,u({attr:d({},t.attr)},e),m(t.child))}function f(t){var e=e=>{var n,{attr:a,size:i,title:c}=t,l=s(t,o),m=i||e.size||"1em";return e.className&&(n=e.className),t.className&&(n=(n?n+" ":"")+t.className),r.createElement("svg",u({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},e.attr,a,l,{className:n,style:d(d({color:t.color||e.color},e.style),t.style),height:m,width:m,xmlns:"http://www.w3.org/2000/svg"}),c&&r.createElement("title",null,c),t.children)};return void 0!==i?r.createElement(i.Consumer,null,(t=>e(t))):e(a)}},4524:(t,e,n)=>{n.d(e,{_P:()=>i,my:()=>r,w4:()=>a});Math.pow(10,8);const r=6048e5,a=864e5,i=Symbol.for("constructDateFrom")},7576:(t,e,n)=>{function r(t){return function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const n=e.width?String(e.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}n.d(e,{k:()=>r})},8612:(t,e,n)=>{function r(t){return function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const r=n.width,a=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],i=e.match(a);if(!i)return null;const o=i[0],s=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],u=Array.isArray(s)?function(t,e){for(let n=0;n<t.length;n++)if(e(t[n]))return n;return}(s,(t=>t.test(o))):function(t,e){for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&e(t[n]))return n;return}(s,(t=>t.test(o)));let c;c=t.valueCallback?t.valueCallback(u):u,c=n.valueCallback?n.valueCallback(c):c;return{value:c,rest:e.slice(o.length)}}}n.d(e,{A:()=>r})},9343:(t,e,n)=>{function r(t){return function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const r=e.match(t.matchPattern);if(!r)return null;const a=r[0],i=e.match(t.parsePattern);if(!i)return null;let o=t.valueCallback?t.valueCallback(i[0]):i[0];o=n.valueCallback?n.valueCallback(o):o;return{value:o,rest:e.slice(a.length)}}}n.d(e,{K:()=>r})},9494:(t,e,n)=>{function r(t){return(e,n)=>{let r;if("formatting"===(n?.context?String(n.context):"standalone")&&t.formattingValues){const e=t.defaultFormattingWidth||t.defaultWidth,a=n?.width?String(n.width):e;r=t.formattingValues[a]||t.formattingValues[e]}else{const e=t.defaultWidth,a=n?.width?String(n.width):t.defaultWidth;r=t.values[a]||t.values[e]}return r[t.argumentCallback?t.argumentCallback(e):e]}}n.d(e,{o:()=>r})},9734:(t,e,n)=>{n.d(e,{GP:()=>Z});const r={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}};var a=n(7576);const i={date:(0,a.k)({formats:{full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},defaultWidth:"full"}),time:(0,a.k)({formats:{full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},defaultWidth:"full"}),dateTime:(0,a.k)({formats:{full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},defaultWidth:"full"})},o={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"};var s=n(9494);const u={ordinalNumber:(t,e)=>{const n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},era:(0,s.o)({values:{narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},defaultWidth:"wide"}),quarter:(0,s.o)({values:{narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},defaultWidth:"wide",argumentCallback:t=>t-1}),month:(0,s.o)({values:{narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},defaultWidth:"wide"}),day:(0,s.o)({values:{narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},defaultWidth:"wide"}),dayPeriod:(0,s.o)({values:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},defaultWidth:"wide",formattingValues:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},defaultFormattingWidth:"wide"})};var c=n(8612);const d={code:"en-US",formatDistance:(t,e,n)=>{let a;const i=r[t];return a="string"===typeof i?i:1===e?i.one:i.other.replace("{{count}}",e.toString()),n?.addSuffix?n.comparison&&n.comparison>0?"in "+a:a+" ago":a},formatLong:i,formatRelative:(t,e,n,r)=>o[t],localize:u,match:{ordinalNumber:(0,n(9343).K)({matchPattern:/^(\d+)(th|st|nd|rd)?/i,parsePattern:/\d+/i,valueCallback:t=>parseInt(t,10)}),era:(0,c.A)({matchPatterns:{narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},defaultMatchWidth:"wide",parsePatterns:{any:[/^b/i,/^(a|c)/i]},defaultParseWidth:"any"}),quarter:(0,c.A)({matchPatterns:{narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},defaultMatchWidth:"wide",parsePatterns:{any:[/1/i,/2/i,/3/i,/4/i]},defaultParseWidth:"any",valueCallback:t=>t+1}),month:(0,c.A)({matchPatterns:{narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},defaultParseWidth:"any"}),day:(0,c.A)({matchPatterns:{narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},defaultParseWidth:"any"}),dayPeriod:(0,c.A)({matchPatterns:{narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},defaultMatchWidth:"any",parsePatterns:{any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},defaultParseWidth:"any"})},options:{weekStartsOn:0,firstWeekContainsDate:1}};var l=n(849),m=n(2316);function h(t){const e=(0,m.a)(t),n=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return n.setUTCFullYear(e.getFullYear()),+t-+n}var f=n(2440);var g=n(4524);function w(t,e){const n=(0,m.a)(t,e?.in);return n.setHours(0,0,0,0),n}function b(t,e,n){const[r,a]=function(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];const a=f.w.bind(null,t||n.find((t=>"object"===typeof t)));return n.map(a)}(n?.in,t,e),i=w(r),o=w(a),s=+i-h(i),u=+o-h(o);return Math.round((s-u)/g.w4)}function v(t,e){const n=(0,m.a)(t,e?.in);return n.setFullYear(n.getFullYear(),0,1),n.setHours(0,0,0,0),n}function p(t,e){const n=(0,m.a)(t,e?.in);return b(n,v(n))+1}var y=n(1620);function M(t,e){return(0,y.k)(t,{...e,weekStartsOn:1})}function k(t,e){const n=(0,m.a)(t,e?.in),r=n.getFullYear(),a=(0,f.w)(n,0);a.setFullYear(r+1,0,4),a.setHours(0,0,0,0);const i=M(a),o=(0,f.w)(n,0);o.setFullYear(r,0,4),o.setHours(0,0,0,0);const s=M(o);return n.getTime()>=i.getTime()?r+1:n.getTime()>=s.getTime()?r:r-1}function P(t,e){const n=k(t,e),r=(0,f.w)(e?.in||t,0);return r.setFullYear(n,0,4),r.setHours(0,0,0,0),M(r)}function j(t,e){const n=(0,m.a)(t,e?.in),r=+M(n)-+P(n);return Math.round(r/g.my)+1}function W(t,e){const n=(0,m.a)(t,e?.in),r=n.getFullYear(),a=(0,l.q)(),i=e?.firstWeekContainsDate??e?.locale?.options?.firstWeekContainsDate??a.firstWeekContainsDate??a.locale?.options?.firstWeekContainsDate??1,o=(0,f.w)(e?.in||t,0);o.setFullYear(r+1,0,i),o.setHours(0,0,0,0);const s=(0,y.k)(o,e),u=(0,f.w)(e?.in||t,0);u.setFullYear(r,0,i),u.setHours(0,0,0,0);const c=(0,y.k)(u,e);return+n>=+s?r+1:+n>=+c?r:r-1}function x(t,e){const n=(0,l.q)(),r=e?.firstWeekContainsDate??e?.locale?.options?.firstWeekContainsDate??n.firstWeekContainsDate??n.locale?.options?.firstWeekContainsDate??1,a=W(t,e),i=(0,f.w)(e?.in||t,0);i.setFullYear(a,0,r),i.setHours(0,0,0,0);return(0,y.k)(i,e)}function S(t,e){const n=(0,m.a)(t,e?.in),r=+(0,y.k)(n,e)-+x(n,e);return Math.round(r/g.my)+1}function O(t,e){return(t<0?"-":"")+Math.abs(t).toString().padStart(e,"0")}const C={y(t,e){const n=t.getFullYear(),r=n>0?n:1-n;return O("yy"===e?r%100:r,e.length)},M(t,e){const n=t.getMonth();return"M"===e?String(n+1):O(n+1,2)},d:(t,e)=>O(t.getDate(),e.length),a(t,e){const n=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];default:return"am"===n?"a.m.":"p.m."}},h:(t,e)=>O(t.getHours()%12||12,e.length),H:(t,e)=>O(t.getHours(),e.length),m:(t,e)=>O(t.getMinutes(),e.length),s:(t,e)=>O(t.getSeconds(),e.length),S(t,e){const n=e.length,r=t.getMilliseconds();return O(Math.trunc(r*Math.pow(10,n-3)),e.length)}},D="midnight",T="noon",Y="morning",q="afternoon",E="evening",N="night",H={G:function(t,e,n){const r=t.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if("yo"===e){const e=t.getFullYear(),r=e>0?e:1-e;return n.ordinalNumber(r,{unit:"year"})}return C.y(t,e)},Y:function(t,e,n,r){const a=W(t,r),i=a>0?a:1-a;if("YY"===e){return O(i%100,2)}return"Yo"===e?n.ordinalNumber(i,{unit:"year"}):O(i,e.length)},R:function(t,e){return O(k(t),e.length)},u:function(t,e){return O(t.getFullYear(),e.length)},Q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return O(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return O(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){const r=t.getMonth();switch(e){case"M":case"MM":return C.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){const r=t.getMonth();switch(e){case"L":return String(r+1);case"LL":return O(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){const a=S(t,r);return"wo"===e?n.ordinalNumber(a,{unit:"week"}):O(a,e.length)},I:function(t,e,n){const r=j(t);return"Io"===e?n.ordinalNumber(r,{unit:"week"}):O(r,e.length)},d:function(t,e,n){return"do"===e?n.ordinalNumber(t.getDate(),{unit:"date"}):C.d(t,e)},D:function(t,e,n){const r=p(t);return"Do"===e?n.ordinalNumber(r,{unit:"dayOfYear"}):O(r,e.length)},E:function(t,e,n){const r=t.getDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){const a=t.getDay(),i=(a-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(i);case"ee":return O(i,2);case"eo":return n.ordinalNumber(i,{unit:"day"});case"eee":return n.day(a,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(a,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(a,{width:"short",context:"formatting"});default:return n.day(a,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){const a=t.getDay(),i=(a-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(i);case"cc":return O(i,e.length);case"co":return n.ordinalNumber(i,{unit:"day"});case"ccc":return n.day(a,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(a,{width:"narrow",context:"standalone"});case"cccccc":return n.day(a,{width:"short",context:"standalone"});default:return n.day(a,{width:"wide",context:"standalone"})}},i:function(t,e,n){const r=t.getDay(),a=0===r?7:r;switch(e){case"i":return String(a);case"ii":return O(a,e.length);case"io":return n.ordinalNumber(a,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){const r=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(r,{width:"narrow",context:"formatting"});default:return n.dayPeriod(r,{width:"wide",context:"formatting"})}},b:function(t,e,n){const r=t.getHours();let a;switch(a=12===r?T:0===r?D:r/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(a,{width:"narrow",context:"formatting"});default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},B:function(t,e,n){const r=t.getHours();let a;switch(a=r>=17?E:r>=12?q:r>=4?Y:N,e){case"B":case"BB":case"BBB":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(a,{width:"narrow",context:"formatting"});default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},h:function(t,e,n){if("ho"===e){let e=t.getHours()%12;return 0===e&&(e=12),n.ordinalNumber(e,{unit:"hour"})}return C.h(t,e)},H:function(t,e,n){return"Ho"===e?n.ordinalNumber(t.getHours(),{unit:"hour"}):C.H(t,e)},K:function(t,e,n){const r=t.getHours()%12;return"Ko"===e?n.ordinalNumber(r,{unit:"hour"}):O(r,e.length)},k:function(t,e,n){let r=t.getHours();return 0===r&&(r=24),"ko"===e?n.ordinalNumber(r,{unit:"hour"}):O(r,e.length)},m:function(t,e,n){return"mo"===e?n.ordinalNumber(t.getMinutes(),{unit:"minute"}):C.m(t,e)},s:function(t,e,n){return"so"===e?n.ordinalNumber(t.getSeconds(),{unit:"second"}):C.s(t,e)},S:function(t,e){return C.S(t,e)},X:function(t,e,n){const r=t.getTimezoneOffset();if(0===r)return"Z";switch(e){case"X":return z(r);case"XXXX":case"XX":return F(r);default:return F(r,":")}},x:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"x":return z(r);case"xxxx":case"xx":return F(r);default:return F(r,":")}},O:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+A(r,":");default:return"GMT"+F(r,":")}},z:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+A(r,":");default:return"GMT"+F(r,":")}},t:function(t,e,n){return O(Math.trunc(+t/1e3),e.length)},T:function(t,e,n){return O(+t,e.length)}};function A(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";const n=t>0?"-":"+",r=Math.abs(t),a=Math.trunc(r/60),i=r%60;return 0===i?n+String(a):n+String(a)+e+O(i,2)}function z(t,e){if(t%60===0){return(t>0?"-":"+")+O(Math.abs(t)/60,2)}return F(t,e)}function F(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";const n=t>0?"-":"+",r=Math.abs(t);return n+O(Math.trunc(r/60),2)+e+O(r%60,2)}const J=(t,e)=>{switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});default:return e.date({width:"full"})}},X=(t,e)=>{switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});default:return e.time({width:"full"})}},L={p:X,P:(t,e)=>{const n=t.match(/(P+)(p+)?/)||[],r=n[1],a=n[2];if(!a)return J(t,e);let i;switch(r){case"P":i=e.dateTime({width:"short"});break;case"PP":i=e.dateTime({width:"medium"});break;case"PPP":i=e.dateTime({width:"long"});break;default:i=e.dateTime({width:"full"})}return i.replace("{{date}}",J(r,e)).replace("{{time}}",X(a,e))}},Q=/^D+$/,G=/^Y+$/,B=["D","DD","YY","YYYY"];function $(t){return t instanceof Date||"object"===typeof t&&"[object Date]"===Object.prototype.toString.call(t)}function I(t){return!(!$(t)&&"number"!==typeof t||isNaN(+(0,m.a)(t)))}const K=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,R=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,U=/^'([^]*?)'?$/,V=/''/g,_=/[a-zA-Z]/;function Z(t,e,n){const r=(0,l.q)(),a=n?.locale??r.locale??d,i=n?.firstWeekContainsDate??n?.locale?.options?.firstWeekContainsDate??r.firstWeekContainsDate??r.locale?.options?.firstWeekContainsDate??1,o=n?.weekStartsOn??n?.locale?.options?.weekStartsOn??r.weekStartsOn??r.locale?.options?.weekStartsOn??0,s=(0,m.a)(t,n?.in);if(!I(s))throw new RangeError("Invalid time value");let u=e.match(R).map((t=>{const e=t[0];if("p"===e||"P"===e){return(0,L[e])(t,a.formatLong)}return t})).join("").match(K).map((t=>{if("''"===t)return{isToken:!1,value:"'"};const e=t[0];if("'"===e)return{isToken:!1,value:tt(t)};if(H[e])return{isToken:!0,value:t};if(e.match(_))throw new RangeError("Format string contains an unescaped latin alphabet character `"+e+"`");return{isToken:!1,value:t}}));a.localize.preprocessor&&(u=a.localize.preprocessor(s,u));const c={firstWeekContainsDate:i,weekStartsOn:o,locale:a};return u.map((r=>{if(!r.isToken)return r.value;const i=r.value;(!n?.useAdditionalWeekYearTokens&&function(t){return G.test(t)}(i)||!n?.useAdditionalDayOfYearTokens&&function(t){return Q.test(t)}(i))&&function(t,e,n){const r=function(t,e,n){const r="Y"===t[0]?"years":"days of the month";return`Use \`${t.toLowerCase()}\` instead of \`${t}\` (in \`${e}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}(t,e,n);if(console.warn(r),B.includes(t))throw new RangeError(r)}(i,e,String(t));return(0,H[i[0]])(s,i,a.localize,c)})).join("")}function tt(t){const e=t.match(U);return e?e[1].replace(V,"'"):t}}}]);
//# sourceMappingURL=176.89fc6c7c.chunk.js.map