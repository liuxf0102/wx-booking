// pages/booking/bookingList.js
let util = require('../../util/util.js');
let m_login = require('m_login.js');
var startX, endX;
var moveFlag = true;// 判断左右华东超出菜单最大值时不再执行滑动事件
var page_userid1 = "";
var page_bookingPendingCountMap = new Map();
var page_bookingApprovedCountMap = new Map();
var page_source = "";
Page({

  theCurrentPageLongTime: 0,
  //pageScene: '1005-1004-1020',
  pageScene: '',

  pageShowWeekData: true,
  pageFullDay: [],

  /**
   * 页面的初始数据
   */
  data: {
    version: getApp().globalData.version,
    userInfo: {},
    myInfo: {},
    hasUserInfo: false,
    bookings: [],
    selectedYearmd: '',
    selectedYearmdStr: '',
    selectedYear: 0,
    selectedMonth: 0,
    selectedDay: 0,
    selectedWeekday: 0,
    day: [0, 0, 0, 0, 0, 0, 0],
    dayBooking: [0, 0, 0, 0, 0, 0, 0],
    dayBookingPendingApproval: [0, 0, 0, 0, 0, 0, 0],
    dayBookingUnfinished: [0, 0, 0, 0, 0, 0, 0],
    dayBookingKeyTask: [0, 0, 0, 0, 0, 0, 0],
    dayClass: ['', '', '', '', '', '', ''],
    dayFlag: ['', '', '', '', '', '', ''],
    today: '',
    curYear: '',
    curMonth: '',
    time: '0:0',
    buttonDisabled: true,
    showWeekData: true,
    hourConfig: [{ 'h': 8, 'c': 1 }, { 'h': 18, 'c': 4 }],
  },

  server_getBookingList() {
    console.log("getBookingList:");
    wx.showLoading({
      title: '数据加载中...',
    })
    var that = this;
    console.log("server_getBookingList userid1:" + page_userid1);
    if (page_userid1 == '') {
      return;
    }
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/list',
      method: 'post',
      data: {
        userid: page_userid1

      }, success: function (res) {
        //  console.log(res);
        let tmpBookings = res.data[0].data;
        for (let i = 0; i < tmpBookings.length; i++) {
          let key = tmpBookings[i].year + "-" + util.formatNumber(tmpBookings[i].month) + "-" + util.formatNumber(tmpBookings[i].day) + "-" + util.formatNumber(tmpBookings[i].hour);
          if (tmpBookings[i].status == 0) {
            if (page_bookingPendingCountMap.has(key)) {
              // console.log("key:"+key);
              let value = (page_bookingPendingCountMap.get(key) - 0) + 1;
              page_bookingPendingCountMap.set(key, value);
            } else {
              page_bookingPendingCountMap.set(key, 1);
            }
          }
          //
          if (tmpBookings[i].status == 1) {
            if (page_bookingApprovedCountMap.has(key)) {
              // console.log("key:"+key);
              let value = (page_bookingApprovedCountMap.get(key) - 0) + 1;
              page_bookingApprovedCountMap.set(key, value);
            } else {
              page_bookingApprovedCountMap.set(key, 1);
            }
          }


        }
        // console.log(page_bookingPendingCountMap);
        //that.setData({
        //  bookings: res.data[0].data
        //});

        console.log("getUserBooking finished.");
        wx.stopPullDownRefresh();
        that.setSelectedBookings('week');


      },
      fail: function (err) {
        wx.showToast({
          title: '系统提示:' + err,
        })
      }
      , complete: function () {
        wx.hideLoading();
      }
    })
  },

  server_getUserRotaList() {
    wx.showLoading({
      title: '数据加载中...',
    })
    var that = this;
    //console.log("server_getUserRotaList userid:" + getApp().globalData.userid);
    if (getApp().globalData.userid == '') {
      return;
    }
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/rota/list',
      method: 'post',
      data: {
        userid: page_userid1

      }, success: function (res) {
        //console.log(res);
        //that.setData({
        //  bookings: res.data[0].data
        //});
        wx.setStorageSync("USERID1ROTA", res.data[0].data);
        //  console.log("getUserRota finished:" + JSON.stringify(res.data[0].data));
        wx.stopPullDownRefresh();
        //that.setSelectedBookings();
        that.initDayFlag();

      },
      fail: function (err) {
        wx.showToast({
          title: '系统提示:' + err,
        })
      }, complete: function (res) {
        wx.hideLoading();
      }
    })
  },

  touchStart: function (e) {
    startX = e.touches[0].pageX; // 获取触摸时的原点
    moveFlag = true;
  },
  // 触摸移动事件
  touchMove: function (e) {
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if (moveFlag) {
      if (endX - startX > 120) {
        console.log("move right");
        this.move2right();
        moveFlag = false;
      }
      if (startX - endX > 120) {
        console.log("move left");
        this.move2left();
        moveFlag = false;
      }
    }

  },
  // 触摸结束事件
  touchEnd: function (e) {
    moveFlag = true; // 回复滑动事件
  },

  move2left() {
    let curDate = new Date();
    if (this.theCurrentPageLongTime < curDate.getTime() + 200 * 24 * 3600 * 1000) {
      this.initWeekday(this.theCurrentPageLongTime + 7 * 24 * 3600 * 1000);
      this.setSelectedBookings();
    }
  },
  move2right() {
    let curDate = new Date();
    if (this.theCurrentPageLongTime > curDate.getTime() - 200 * 24 * 3600 * 1000) {

      this.initWeekday(this.theCurrentPageLongTime - 7 * 24 * 3600 * 1000);
      this.setSelectedBookings();
    }
  },


  setSelectedBookings() {
    wx.showLoading({
      title: '数据处理中...',
    })
    var bookItems = [];
    var tmpFullDay = this.pageFullDay;
    var tmpHourConfig = this.data.hourConfig;
    let selectedWeekday = this.data.selectedWeekday;

    // console.log("selectedWeekday:" + selectedWeekday);
    for (let i = 0; i < tmpFullDay.length; i++) {
      //check time

      //  console.log("");
      if (!this.data.showWeekData) {
        if (tmpFullDay[i].weekday == selectedWeekday) {
          for (let h = 0; h < tmpHourConfig.length; h++) {

            //console.log("h:"+h);
            let currentDate = new Date();
            let keyCurrent = currentDate.getFullYear() + "-" + util.formatNumber((currentDate.getMonth() + 1)) + "-" + util.formatNumber(currentDate.getDate()) + "-" + util.formatNumber(currentDate.getHours());
            let key = tmpFullDay[i].year + "-" + util.formatNumber(tmpFullDay[i].month) + "-" + util.formatNumber(tmpFullDay[i].day) + "-" + util.formatNumber(tmpHourConfig[h].h);
            //   console.log("key:" + key + " keyCurrent:" + keyCurrent);
            let isWorkday = true;
            console.log("tmpFullDay:" + JSON.stringify(tmpFullDay[i]));
            if (tmpFullDay[i].weekday > 5) {
              isWorkday = false;
              if (this.data.dayFlag[tmpFullDay[i].weekday - 1] == "班") {
                isWorkday = true;
              }
            } else {
              if (this.data.dayFlag[tmpFullDay[i].weekday - 1] == "休") {
                isWorkday = false;
              }
            }
            //check wether the time is valid.
            if (key > keyCurrent && isWorkday) {
              let bookItem = {};
              let tmpCapacity = tmpHourConfig[h].c;
              if (page_bookingApprovedCountMap.has(key)) {
                // console.log("key:" + key + ":value" + page_bookingApprovedCountMap.get(key));
                tmpCapacity = tmpCapacity - page_bookingApprovedCountMap.get(key);
              }
              bookItem.hour_format = util.formatHour(tmpHourConfig[h].h);
              bookItem.capacity = tmpCapacity;
              let pending = ""
              let pendingCount = 0;
              let approvedCount = 0;
              if (page_bookingPendingCountMap.has(key) || page_bookingApprovedCountMap.has(key)) {
                if (page_bookingPendingCountMap.get(key)) {
                  pendingCount = (page_bookingPendingCountMap.get(key) - 0)
                }
                if (page_bookingApprovedCountMap.get(key)) {
                  approvedCount = (page_bookingApprovedCountMap.get(key) - 0)
                }

                // console.log("key:" + key + ":value" + page_bookingApprovedCountMap.get(key));
                pending = "(批准:" + approvedCount + "/申请:" + (approvedCount + pendingCount) + ")";
              }
              bookItem.pending = pending;
              if (tmpCapacity > 0) {
                bookItem.action = "选定时间";
                bookItem.action_class = "action-green";
              } else {
                bookItem.action = "预约已满";
                bookItem.action_class = "action-red";
              }
              bookItem.year = tmpFullDay[i].year;
              bookItem.month = tmpFullDay[i].month;
              bookItem.day = tmpFullDay[i].day;
              //console.log("tmpFullDay[i].day:" + tmpFullDay[i].day);
              bookItem.seletectedTime = tmpFullDay[i].year + "," + tmpFullDay[i].month + "," + tmpFullDay[i].day + "," + tmpHourConfig[h].h + "," + tmpFullDay[i].weekday;
              bookItem.week_format = util.formatWeekday(tmpFullDay[i].weekday);
              bookItems.push(bookItem);
            }
          }
        }
      } else {
        for (let h = 0; h < tmpHourConfig.length; h++) {
          let currentDate = new Date();
          let keyCurrent = currentDate.getFullYear() + "-" + util.formatNumber((currentDate.getMonth() + 1)) + "-" + util.formatNumber(currentDate.getDate()) + "-" + util.formatNumber(currentDate.getHours());
          let key = tmpFullDay[i].year + "-" + util.formatNumber(tmpFullDay[i].month) + "-" + util.formatNumber(tmpFullDay[i].day) + "-" + util.formatNumber(tmpHourConfig[h].h);
          //  console.log("key:" + key + " keyCurrent:" + keyCurrent);
          let isWorkday = true;
          // console.log("tmpFullDay:" + JSON.stringify(tmpFullDay[i]));
          if (tmpFullDay[i].weekday > 5) {
            isWorkday = false;
            if (this.data.dayFlag[tmpFullDay[i].weekday - 1] == "班") {
              isWorkday = true;
            }
          } else {
            if (this.data.dayFlag[tmpFullDay[i].weekday - 1] == "休") {
              isWorkday = false;
            }
          }
          if (key > keyCurrent && isWorkday) {

            let bookItem = {};
            //console.log("h:"+h);


            let tmpCapacity = tmpHourConfig[h].c;
            if (page_bookingApprovedCountMap.has(key)) {
              //console.log("key:" + key + ":value" + page_bookingApprovedCountMap.get(key));
              tmpCapacity = tmpCapacity - page_bookingApprovedCountMap.get(key);
            }
            bookItem.hour_format = util.formatHour(tmpHourConfig[h].h);
            bookItem.capacity = tmpCapacity;
            let pending = ""
            
            let pendingCount = 0;
            let approvedCount = 0;
            if (page_bookingPendingCountMap.has(key) || page_bookingApprovedCountMap.has(key)) {
              if (page_bookingPendingCountMap.get(key)) {
                pendingCount = (page_bookingPendingCountMap.get(key) - 0)
              }
              if (page_bookingApprovedCountMap.get(key))
              {
                approvedCount = (page_bookingApprovedCountMap.get(key)-0)
              }
              
              // console.log("key:" + key + ":value" + page_bookingApprovedCountMap.get(key));
              pending = "(批准:" + approvedCount + "/申请:" + (approvedCount + pendingCount) + ")";
            }
            bookItem.pending = pending;
            if (tmpCapacity > 0) {
              bookItem.action = "选定时间";
              bookItem.action_class = "action-green";
            } else {
              bookItem.action = "预约已满";
              bookItem.action_class = "action-red";
            }
            bookItem.year = tmpFullDay[i].year;
            bookItem.month = tmpFullDay[i].month;
            bookItem.day = tmpFullDay[i].day;
            bookItem.weekday = tmpFullDay[i].weekday;
            //console.log("tmpFullDay[i].day:" + tmpFullDay[i].day);
            bookItem.seletectedTime = tmpFullDay[i].year + "," + tmpFullDay[i].month + "," + tmpFullDay[i].day + "," + tmpHourConfig[h].h + "," + tmpFullDay[i].weekday;
            bookItem.week_format = util.formatWeekday(tmpFullDay[i].weekday);
            bookItems.push(bookItem);
          }
        }
      }
    }


    let preWeekDay = -1;
    let changeBgcolor = 0;
    for (let i = 0; i < bookItems.length; i++) {
      console.log("bookItems:" + bookItems[i].weekday);
      if (preWeekDay == -1) {
        bookItems[i].bgcolor = ""
      } else {
        if (bookItems[i].weekday == preWeekDay) {
          if (changeBgcolor % 2 == 0) {
            bookItems[i].bgcolor = ""
          } else {
            bookItems[i].bgcolor = "bgcolor_eee"
          }
        } else {
          if (changeBgcolor % 2 == 0) {
            bookItems[i].bgcolor = "bgcolor_eee"

          } else {
            bookItems[i].bgcolor = ""
          }
          changeBgcolor++;
          console.log("bgcolor:" + changeBgcolor);
        }
      }
      preWeekDay = bookItems[i].weekday;
    }
    this.setData(
      {
        bookings: bookItems
      }
    );
    wx.hideLoading();
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 
    page_bookingPendingCountMap = new Map();
    page_bookingApprovedCountMap = new Map();
    var that = this;
    this.initWeekday(new Date().getTime());
    if (options.userid1) {
      page_userid1 = options.userid1;
      that.server_getBookingList();
      that.server_getUserRotaList();
      that.getUserid1Data();
    }
    if (options.source) {
      page_source = options.source;
    }


  },

  getUserid1Data: function () {
    let userid1Info = wx.getStorageSync("USERID1_INFO");
    console.log("useid1 config:" + userid1Info.config);
    let config = userid1Info.config;
    if(config==undefined || config=="")
    {
      config={};
    }
    let timeCapacities = [];
    if (config.hour_capacity) {
      timeCapacities = config.hour_capacity;
      if (timeCapacities.length == 0) {
        timeCapacities = getApp().globalData.BOOKING_HOUR_CAPACITY_DEFAULT;
      }
    } else {
      timeCapacities = getApp().globalData.BOOKING_HOUR_CAPACITY_DEFAULT;
    }
    //console.log("timeCapacities:" + timeCapacities);
    this.setData({
      hourConfig: timeCapacities
    });


  },



  initWeekday: function (theLongTime) {
    var curDate = new Date();
    curDate.setTime(theLongTime)
    //console.log("theCurrentPageLongTime:" + curDate);
    var t = "选择预约时间:" + curDate.getFullYear() + "年" + (curDate.getMonth() + 1) + "月";

    this.setData({
      curYear: curDate.getFullYear(),
      curMonth: curDate.getMonth() + 1,
    });



    this.theCurrentPageLongTime = theLongTime;
    this.setData({
      selectedYear: curDate.getFullYear(),
      selectedMonth: curDate.getMonth() + 1
    });


    var selectedDay = curDate.getDate();
    var curWeekday = curDate.getDay();
    //fixed sunday weekday 0 to 7
    if (curWeekday == 0) {
      curWeekday = 7;
    }
    var tmpDay = [0, 0, 0, 0, 0, 0, 0];
    var tmpDayClass = ['', '', '', '', '', '', ''];
    var tmpFullDay = [{}, {}, {}, {}, {}, {}, {}];
    for (var i = 1; i <= curWeekday; i++) {
      var curDay = curDate.getDate();
      tmpFullDay[curWeekday - i].year = curDate.getFullYear();
      tmpFullDay[curWeekday - i].month = (curDate.getMonth() + 1);
      tmpFullDay[curWeekday - i].day = curDay;
      let tmpWeekday = curDate.getDay();
      //fixed sunday weekday 0 to 7
      if (tmpWeekday == 0) {
        tmpWeekday = 7;
      }
      tmpFullDay[curWeekday - i].weekday = tmpWeekday;
      curDate.setDate(curDate.getDate() - 1);
      tmpDay[curWeekday - i] = curDay;
      //set tmpDayClass
      // console.log("curDay:" + (curWeekday - i)+":"+ curDay);

      if (curDate.getTime() > (new Date().getTime() - 25 * 3600 * 1000)) {
        tmpDayClass[curWeekday - i] = 'text-day-count-blue';

      } else {
        tmpDayClass[curWeekday - i] = 'text-day-count';
      }

    }
    curDate.setTime(theLongTime)
    for (var i = curWeekday - 1; i < 7; i++) {
      var curDay = curDate.getDate();
      tmpFullDay[i].year = curDate.getFullYear();
      tmpFullDay[i].month = (curDate.getMonth() + 1);
      tmpFullDay[i].day = curDay;

      let tmpWeekday = curDate.getDay();
      //fixed sunday weekday 0 to 7
      if (tmpWeekday == 0) {
        tmpWeekday = 7;
      }
      tmpFullDay[i].weekday = tmpWeekday;
      curDate.setDate(curDate.getDate() + 1);
      tmpDay[i] = curDay;

      // console.log("curDay:" +i+":"+ curDay);
      //set tmpDayClass
      if (curDate.getTime() > new Date().getTime()) {
        tmpDayClass[i] = 'text-day-count-blue';

      } else {
        tmpDayClass[i] = 'text-day-count';
      }

    }
    //console.log("tmpDay:" + tmpDay.join(" "));
    // console.log("tmpDayClass:" + tmpDayClass.join(" "));
    //let tmp=tmpFullDay.join(" ");
    let tmp = tmpFullDay;
    //console.log("tmpFullDay:" + JSON.stringify(tmp));


    this.setData({
      selectedDay: selectedDay,
      selectedWeekday: curWeekday,
      day: tmpDay,
      dayClass: tmpDayClass
    });
    this.pageFullDay = tmpFullDay;
    //check wether the current week cross the month
    //console.log("this.data.selectedMonth:" + (this.data.selectedMonth));

    if ((new Date().getMonth() + 1) - this.data.selectedMonth == 1 && ((selectedDay - 0) > 20)) {
      //console.log("cross month:");
      this.setData({
        curYear: curDate.getFullYear(),
        curMonth: (this.data.selectedMonth - 0) + 1,
      });
    }
    if ((new Date().getMonth() + 1) - this.data.selectedMonth == -1 && ((selectedDay - 0) < 10)) {
      // console.log("cross month 2:");
      this.setData({
        curYear: curDate.getFullYear(),
        curMonth: (this.data.selectedMonth - 0) - 1,
      });
    }


    wx.setNavigationBarTitle({ title: t })
    console.log("initWeekDay finished.");
    this.initDayFlag();
  },



  setWeekDay: function (e) {

    var curDate = new Date();
    curDate.setTime(this.theCurrentPageLongTime);
    var curWeekday = curDate.getDay();
    //fixed sunday weekday 0 to 7
    if (curWeekday == 0) {
      curWeekday = 7;
    }
    var selectedWeekday = e.currentTarget.dataset.idx;
    var diffDay = (selectedWeekday - curWeekday);
    // console.log("curWeekday:" + curWeekday + ":selectWeekday" + selectedWeekday + ":diffDay:" + diffDay);
    curDate.setDate(curDate.getDate() + diffDay);
    //console.log("selDate:" + curDate);

    console.log("setWeekday");
    if (this.data.showWeekData) {
      this.pageShowWeekData = false;
      this.setData({ showWeekData: false });
    } else {
      this.pageShowWeekData = true;
      this.setData({ showWeekData: true });
    }
    //if change day 
    console.log("selectedWeekday:" + selectedWeekday);
    console.log("Data selectedWeekday:" + this.data.selectedWeekday);
    if (selectedWeekday != this.data.selectedWeekday) {
      this.pageShowWeekData = false;
      this.setData({ showWeekData: false });
    }

    this.initWeekday(this.theCurrentPageLongTime + diffDay * 24 * 3600 * 1000);
    this.setSelectedBookings();
  },


  tapBookingDetails: function (e) {
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target));
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target.dataset.bookingid));
    wx.navigateTo({
      url: '/page/booking/bookingDetails?bookingId=' + e.target.dataset.bookingid,
    })

  },
  bindNewBooking: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/page/booking/booking?year=' + that.data.selectedYear + '&month=' + that.data.selectedMonth + '&day=' + that.data.selectedDay + '&weekday=' + that.data.selectedWeekday + '&userid2=' + that.data.selectedUserid2,
    });
  },

  selectedUserid2: function (e) {
    //console.log("selectedUserid2:" + JSON.stringify(e.target.dataset.userid));
    let selectedUserid2 = e.target.dataset.userid;
    let selectedUserid2Name = e.target.dataset.name;
    if (selectedUserid2 == this.data.selectedUserid2) {
      selectedUserid2 = "";
      selectedUserid2Name = "";
    } else {
      selectedUserid2Name = ":" + selectedUserid2Name;
    }
    this.setData({
      selectedUserid2: selectedUserid2,
      selectedUserid2Name: selectedUserid2Name
    });
    if (selectedUserid2Name != "") {
      wx.showToast({
        title: '已经选中用户\n\r' + selectedUserid2Name,
      });
    } else {
      wx.showToast({
        title: '取消选中用户\n\r' + selectedUserid2Name,
      })
    }
  },


  initDayFlag: function () {

    //get rota from storage
    let rota_all = wx.getStorageSync("USERID1ROTA") || [];
    let tmpDayFlag = ['', '', '', '', '', '', ''];
    for (let i = 0; i < rota_all.length; i++) {

      let theRotaDay = new Date(rota_all[i].day);
      //console.log("rota_all:" + rota_all[i].day);
      //check wether booking Day is last week or  week ahead
      if (theRotaDay.getTime() > this.theCurrentPageLongTime - 7 * 24 * 3600 * 1000 && theRotaDay.getTime() < this.theCurrentPageLongTime + 7 * 24 * 3600 * 1000) {
        let tmpDay = this.data.day;
        for (let t = 0; t < tmpDay.length; t++) {
          if (tmpDay[t] == theRotaDay.getDate()) {
            //console.log("tmpDay[]:" +t+":"+ tmpDay[t]);
            tmpDayFlag[t] = rota_all[i].flag;
          }
        }

      }

    }
    // console.log("tmpDayFlag:" + tmpDayFlag.join(" "));
    this.setData({
      dayFlag: tmpDayFlag
    });

  },
  tapSelectedTime: function (e) {
    let seltectedTime = e.currentTarget.dataset.seltectedtime;
    let capacity = e.currentTarget.dataset.capacity;
    if ((capacity - 0) < 1) {
      wx.showToast({
        title: '请选择其他时间。',
      })
      return;
    }
    console.log("seltectedTime" + JSON.stringify(seltectedTime));

    if (page_source == "booking") {
      wx.redirectTo({
        url: '/page/booking/booking?selectedTime=' + seltectedTime
      })
    }
    if (page_source == "qrBookingNew") {
      wx.redirectTo({
        url: '/page/booking/qrBookingNew?userid1='+page_userid1+'&selectedTime=' + seltectedTime
      })
    }
  },


  formSubmit: function (e) {
    var that = this
    //console.log("formid:"+e.detail.formid);
    let formid = e.detail.formId;
    getApp().formidCollect(formid);
  },
  bindShowMyQrcode: function (e) {
    wx.navigateTo({
      url: '/page/booking/showMyQrcode',
    })
  },
  bindGoBack: function (e) {
    console.log("userid1:" + page_userid1);
    wx.redirectTo({
      url: '/page/booking/qrBookingNew?userid1=' + page_userid1,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    let curDate = new Date();
    let curDate_format = curDate.getFullYear() + "/" + (curDate.getMonth() + 1) + "/" + curDate.getDate();
    this.setData({
      today: curDate_format
    })
    // this.setSelectedBookings();


    // console.log("onShow");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh :" + page_userid1);
    wx.redirectTo({
      url: '/page/booking/qrBookingTime?userid1=' + page_userid1,
    })

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})