/* For Vue2 */

/*日历中的月账单*/
Vue.component('cal-month-bill', {
	data: function () {
		return {
			today: new Date()
		}
	},
	props: {
		year: {},
		month: {},
		fetching: {},
		month_repay_amount: {},
		month_unrepay_amount: {},
		month_invest_amount: {}
	},
	computed: {
		month_repay_amount_show: function () { // 已收本息（元）
			return Util.numberFormat(this.month_repay_amount / 100, 2);
		},
		month_unrepay_amount_show: function () { // 待收本息（元）
			return Util.numberFormat(this.month_unrepay_amount / 100, 2);
		},
		month_invest_amount_show: function () { // 新增投资（元）
			return Util.numberFormat(this.month_invest_amount / 100, 2);
		},
		isFuture: function () {
			var cur = new Date(this.year + '/' + (this.month+1) + '/01').getTime();
			if (cur > this.$data.today.getTime()) {
				return true;
			} else {
				return false;
			}
		},
		noResult: function () {
			if (+this.month_repay_amount === 0 && +this.month_unrepay_amount === 0 && +this.month_invest_amount === 0 ) {
				return true;
			} else {
				return false;
			}
		},
		title: function () {
			if (this.$data.today.getFullYear() === this.year &&
				this.$data.today.getMonth() === this.month ) {
				return '本';
			} else {
				return this.month + 1;
			}
		},
		jumpLink: function () {
			return '/user/calendar/month_bill#' + this.year + 'x' + this.month;
		}
	},
	template: '<section class="month-bill l-m-container">\
							<header>\
								<h2>\
									<div class="l-m-container">{{title}}月账单<a :href="jumpLink">月账单<i class="iconfont">&#xe630;</i></a></div>\
								</h2>\
							</header>\
							<ul class="l-m-container" :class="{\'no\': noResult}">\
								<li :class="{\'f\': isFuture}"><span class="key">已收本息（元）</span><span class="value" :class="{\'s\': month_repay_amount > 0 }" v-text="month_repay_amount_show"></span></li>\
								<li><span class="key">待收本息（元）</span><span class="value" v-text="month_unrepay_amount_show"></span></li>\
								<li :class="{\'f\': isFuture}"><span class="key">新增投资（元）</span><span class="value" v-text="month_invest_amount_show"></span></li>\
								<transition name="fade">\
								<p class="l-h-center no-result" v-if="!fetching && noResult">\
									{{title}}月无记录\
								</p>\
								<p class="l-h-center no-result" v-if="fetching">\
									正在加载...\
								</p>\
								</transition>\
							</ul>\
						</section>'
});

/*日历中的日总结*/
Vue.component('cal-day-sum', {
	data: function () {
		return {
			today: new Date()
		}
	},
	props: {
		value: {},
		year: {},
		month: {}
	},
	computed: {
		dayTitle: function () {
			if (this.$data.today.getFullYear() === this.year &&
				this.$data.today.getMonth() === this.month && 
				this.$data.today.getDate() === this.value.day) {
				return '今日';
			} else {
				return this.value.day + '日';
			}
		},
		typeTitle: function () {
			if (this.value.type === 'repay') {
				return '还款';
			} else {
				return '投资';
			}
		}
	},
	methods: {
		checkDetail: function () { // 查看详情
			var tab = 1;
			if (this.value.type === 'invest') {
				tab = 3;
			} else if (this.value.repay_amount === 0) {
				tab = 2;
			}
			window.location.href = '/user/calendar/daily_bill?year=' + this.year + '&month=' +(this.month+1) + '&day=' + this.value.day + '&tab=' + tab;
		}
	},
	template: '<section class="day-sum-card" @click="checkDetail">\
							<div class="l-m-container l-flex l-flex-vc">\
								<div class="main">\
									<h2 class="title"><span v-text="dayTitle"></span><span v-text="typeTitle"></span>（元）</h2>\
									<p class="line" v-if="value.type === \'invest\'">\
										<span class="key">新增投资：</span><span class="value">{{value.invest_amount | fen2yuan | numberFormat}}</span>\
									</p>\
									<p class="line" v-if="value.type === \'repay\'">\
										<span class="key">已收本息：</span><span class="value s">{{value.repay_amount | fen2yuan | numberFormat}}</span>\
									</p>\
									<p class="line" v-if="value.type === \'repay\'">\
										<span class="key">待收本息：</span><span class="value">{{value.unrepay_amount | fen2yuan | numberFormat}}</span>\
									</p>\
								</div>\
								<div class="icon">\
									<i class="iconfont">&#xe664;</i>\
								</div>\
							</div>\
						</section>'
});

/*工资日新功能*/
Vue.component('new-feature', {
	data: function () {
		return {
			hideFeatureTips: false
		}
	},
	methods: {
		handleHideFeatureTips: function () { // 关闭新功能提示
			var key = 'salaryDay';
			localStorage.setItem(key, 1);
			this.$data.hideFeatureTips = true;
		}
	},
	computed: {
		showFeatureTips: function () { // 是否显示新功能介绍
			if(Util.isSupportedLs()) {
				var key = 'salaryDay';
				if (localStorage.getItem(key)) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	},
	template: '<transition name="fade">\
							<section class="new-feature" v-if="!hideFeatureTips && showFeatureTips">\
								<div class="l-m-container">\
									<h2>「工资日」新功能</h2>\
									<section class="feature l-flex">\
										<img src="https://s1.lantouzi.com/img/201610/02fb7cec7dfc051d0de477a3d374c32f.png" class="img">\
										<div class="card">\
											<h3>投资即获现金奖励</h3>\
											<p>工资日投资即获现金奖励，现金奖励金额为投资金额（不包含满减券）的0.1%，限投资懒人计划、斗牛计划和享乐计划</p>\
										</div>\
									</section>\
									<section class="feature l-flex">\
										<img src="https://s1.lantouzi.com/img/201610/83ea5d074a936c416517c3072cae8cf8.png" class="img">\
										<div class="card">\
											<h3>设置「工资日」</h3>\
											<p>点选日历中任意一天，可将选中当天及其后两天设置为工资日，当月设置，下月生效</p>\
										</div>\
									</section>\
									<a class="salary-day-btn" @click="handleHideFeatureTips">立即设置</a>\
								</div>\
							</section>\
						</transition>'
});

/*日账单-汇总*/
Vue.component('daily-bill-sum', {
	data: function () {
		return {
			today: new Date()
		}
	},
	props: {
		type: {},
		value: {},
		year: {},
		month: {},
		day:{}
	},
	computed: {
		sumName: function () {
			if (this.type === 1) {
				return '已收本息';
			} else if (this.type === 2) {
				return '待收本息';
			} else if (this.type === 3) {
				return '新增投资';
			} else {
				return '';
			}
		},
		sumTitle: function () {
			if (this.$data.today.getFullYear() === this.year &&
				this.$data.today.getMonth() === this.month-1 && 
				this.$data.today.getDate() === this.day) {
				return '今日';
			} else {
				return this.month + '月' + this.day + '日';
			}
		},
		valueToShow: function () {
			return Util.numberFormat(this.value / 100, 2);
		}
	},
	template: '<section class="daily-bill-sum">\
							<div class="container l-flex" :class="{\'s\': type===1}">\
								<div class="key">{{sumTitle}}<span v-text="sumName"></span>（元）</div><div class="value" v-text="valueToShow"></div>\
							</div>\
						 </section>'
});

/*日账单*/
Vue.component('daily-bill-card', {
	props: {
		type: {},
		value: {}
	},
	methods: {
		jump: function () {
			if (this.value.jump_url && this.value.jump_url.length>0) {
				window.location.href = this.value.jump_url;
			} else {
				return false;
			}
		}
	},
	template: '<div class="daily-bill-card" :class="{\'s\': type===1}" @click="jump">\
							<div class="title-container">\
								<h2 class="title" v-text="value.title"></h2>\
								<h3 class="sub-title l-flex" v-if="type!==3">\
									<span class="left">还款情况<span v-text="value.repay_cur_num"></span>/<span v-text="value.repay_total_num"></span>笔</span>\
									<span class="right" v-if="+value.is_repay_ahead === 1">提前还款</span>\
								</h3>\
							</div>\
							<ul class="main">\
								<template v-for="item in value.items">\
									<li>\
										<div class="l-flex">\
											<span class="key" v-text="item.name"></span>\
											<span class="value" v-text="item.value"></span>\
										</div>\
									</li>\
								</template>\
							</ul>\
						 </div>'
});

/*月账单*/
Vue.component('month-bill-card', {
	data: function () {
		return {
			year: new Date().getFullYear(),
			month: new Date().getMonth()
		}
	},
	props: {
		value: {}
	},
	computed: {
		curMonth: function () { // card日期的月
			return new Date(this.value.date.replace(/\-/g, '/')).getMonth();
		},
		curYear: function () { // card日期的年
			return new Date(this.value.date.replace(/\-/g, '/')).getFullYear();
		},
		isCurMonth: function () { // card日期的月是否是当前月
			if (this.curYear === this.$data.year && this.curMonth === this.$data.month) {
				return true;
			} else {
				return false;
			}
		},
		showYear: function () { // 是否显示年标记
			if (this.curMonth === 0 ) {
				return true;
			} else {
				return false;
			}
		},
		title: function () { // card的Title
			if (this.isCurMonth) {
				return '本月';
			} else {
				return this.curYear + '年' + (this.curMonth + 1) + '月';
			}
		},
		cardId: function () {
			return this.curYear + 'x' + this.curMonth;
		}
	},
	methods: {
		jump: function () {
			window.location.href = '/user/calendar?year=' + this.curYear + '&month=' + (this.curMonth + 1);
		}
	},
	template: '<div class="month-bill-card" :class="{\'s\':isCurMonth}" @click="jump" :id="cardId">\
							<div class="year-tips" v-if="showYear"><span v-text="curYear"></span>年</div>\
							<div class="title-container">\
								<h2 class="title"><span v-text="title"></span>账单</h2>\
							</div>\
							<ul class="main">\
								<template v-for="item in value.bill">\
									<li>\
										<div class="l-flex">\
											<span class="key" v-text="item.name"></span>\
											<span class="value" v-text="item.value" :class="{\'s\': +item.type === 1}"></span>\
										</div>\
									</li>\
								</template>\
							</ul>\
						 </div>'
});
