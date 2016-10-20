/* For Vue2 */

/* 日历 */
Vue.component('date-table', {
	props: {
		year: {},
		month: {},
		showOtherMonthDay: {},
		hideHeader: {},
		hideToday: {},
		handleClickSelf: {}
	},
	data: function () {
		return {
			today: new Date(),
			days: [],
			weeks: {
				sun: '日',
				mon: '一',
				tue: '二',
				wed: '三',
				thu: '四',
				fri: '五',
				sat: '六'
			}
		}
	},
	computed: {
		rows: function () {
			var rows = [ [], [], [], [], [], [] ];
			var count = 1;
			this.$data.days = [];
			var date = new Date(this.year, this.month, 1); // 标准时间
			var firstDayOfMonth = this.getFirstDayOfMonth(date.getFullYear(), date.getMonth()); // 本月第一天的星期
			var dateCountOfMonth = this.getDayCountOfMonth(date.getFullYear(), date.getMonth()); // 本月的天数
			var dateCountOfPrevMonth = this.getDayCountOfMonth(date.getMonth() === 11 ? date.getFullYear() - 1 : date.getFullYear(), date.getMonth() === 0 ? 11 : date.getMonth() - 1); // 上个月有多少天
			
			for (var i = 0; i < 6; i++) { // 行
				var row = rows[i];

				for (var j = 0; j < 7; j++) { // 列
					var cell = row[j];
					if (!cell) {
						cell = { row: i, cell: j, type: 'cur-month' , customClass: '', selected: false};
					}
					if (i === 0) { // 第一行
						if (j >= firstDayOfMonth) { // 本月范围
							cell.text = count++;
							cell.month = this.month;
							this.$data.days.push(cell);
						} else { // 上个月的范围
							cell.text = dateCountOfPrevMonth - (firstDayOfMonth - j % 7) + 1;
							cell.type = 'prev-month';
						}
					} else {
						if (count <= dateCountOfMonth) { // 本月范围内
							cell.text = count++;
							this.$data.days.push(cell);
						} else { // 下个月的范围
							cell.text = count++ - dateCountOfMonth; 
							cell.type = 'next-month';
						}
					}
					Vue.set(row, j, cell);
				}
			}
			return rows;
		}
	},
	methods: {
		getDayCountOfMonth: function (year, month) { // 获取某个月的天数
			var lastDay=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))){
				return 29;
			} else {
				return lastDay[month];
			}
		},
		getFirstDayOfMonth : function () { // 获取本月第一天的星期数
			var firstDayName = new Date(this.year, this.month, 1).getDay();
			return firstDayName === 0 ? 7 : firstDayName;
		},
		handleClick: function (item) { // 处理用户点击日历的事件
			if (this.handleClickSelf) { // 如果完全交给外部处理，则只发送事件即可
				this.$emit('user-click-date', item);
			} else { // 否则处理一些基本逻辑
				if (item.type === 'cur-month') {
					this.clearSelected();
					item.selected = true;
					this.$emit('user-click-date', item);
				}
			}
		},
		clearSelected: function (item) { // 清除选中
			this.$data.days.forEach( function(ele, index) {
				ele.selected = false;
			});
		}
	},
	mounted: function () {
		this.$on('set-date-style', function (data) { // 为某一天设置样式，原样式会被覆盖
			var vm = this;
			if (vm.$data.days[data.day-1]) {
				Vue.nextTick(function () {
					vm.$data.days[data.day-1].customClass = data.style;
				});
			}
		});
		this.$on('add-date-style', function (data) { // 为某一天设置样式，增量式添加
			var vm = this;
			if (vm.$data.days[data.day-1]) {
				Vue.nextTick(function () {
					vm.$data.days[data.day-1].customClass = vm.$data.days[data.day-1].customClass + ' ' + data.style;
				});
			}
		});
		this.$on('clear-date-style', function (data) { // 清除某一天指定的样式，如果data是空则清除所有的样式
			this.$data.days.forEach( function(ele, index) {
				if (data.style && data.style.length>0) {
					ele.customClass = ele.customClass.replace(data.style,'');
				} else {
					ele.customClass = '';
				}
			});
		});
	},
	template: '<transition>\
							<table\
								cellspacing="0"\
								cellpadding="0"\
								class="date-table">\
								<tbody>\
								<tr v-if="!hideHeader">\
									<th>{{ weeks.sun }}</th>\
									<th>{{ weeks.mon }}</th>\
									<th>{{ weeks.tue }}</th>\
									<th>{{ weeks.wed }}</th>\
									<th>{{ weeks.thu }}</th>\
									<th>{{ weeks.fri }}</th>\
									<th>{{ weeks.sat }}</th>\
								</tr>\
									<tr\
										class="date-table-row"\
										v-for="row in rows">\
										<td\
											v-for="cell in row"\
											@click="handleClick(cell)"\
											:class="[cell.customClass, { today: cell.text === today.getDate() && month === today.getMonth() && year === today.getFullYear() && cell.type === \'cur-month\' && !hideToday, selected: cell.selected && cell.type === \'cur-month\' }]"\
											><div>{{ cell.type === \'cur-month\' ? cell.text : (showOtherMonthDay ? cell.text : \'\') }}</div></td>\
									</tr>\
								</tbody>\
							</table>\
						 </transition>'
});
