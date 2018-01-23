// pages/booking/bookingList.js
let util = require('../../util/util.js');
var startX, endX;
var moveFlag = true;// 判断左右华东超出菜单最大值时不再执行滑动事件

Page({

  theCurrentPageLongTime: 0,
  //pageScene: '1005-1004-1020',
  pageScene: '',
  pageUserid1: '',
  pageUserid2: '',
  pageBookingId: '',

  /**
   * 页面的初始数据
   */
  data: {
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
    hours: [8, 9, 10, 13, 14, 15],
    day: [0, 0, 0, 0, 0, 0, 0],
    dayBooking: [0, 0, 0, 0, 0, 0, 0],
    dayClass: ['', '', '', '', '', '', ''],
    today: '',
    buttonDisabled: true
  },

  server_getBookingList() {
    var that = this;
    console.log("server_getBookingList userid:" + getApp().globalData.userid);
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/list',
      method: 'post',
      data: {
        userid: getApp().globalData.userid

      }, success: function (res) {
        //console.log(res);
        //that.setData({
        //  bookings: res.data[0].data
        //});
        wx.setStorageSync(getApp().SCONST.BOOKING, res.data[0].data);
        console.log("getUserBooking finished.");
        wx.stopPullDownRefresh();
        that.setSelectedBookings();
        that.setData(
          {
            selectedUserid2: '',
            selectedUserid2Name: ''
          }
        )
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
      if (endX - startX > 50) {
        console.log("move right");
        this.move2right();
        moveFlag = false;
      }
      if (startX - endX > 50) {
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
    if (this.theCurrentPageLongTime < curDate.getTime() + 200 * 24 * 3600 * 1000 ) {
      this.initWeekday(this.theCurrentPageLongTime + 7 * 24 * 3600 * 1000);
      this.setSelectedBookings();
    }
  },
  move2right() {
    let curDate = new Date();
    if (this.theCurrentPageLongTime>curDate.getTime() - 200 * 24 * 3600 * 1000 )  {

    this.initWeekday(this.theCurrentPageLongTime - 7 * 24 * 3600 * 1000);
    this.setSelectedBookings();
    }
  },

  setSelectedBookings() {

    //console.log("setSelectedBooking:year" + this.data.selectedYear + "month:" + this.data.selectedMonth + "day:" + this.data.selectedDay + "weekday:" + this.data.selectedWeekday)

    var bookings_all = wx.getStorageSync(getApp().SCONST.BOOKING) || [];
    var selectedBookings = [];
    var tmpDayBooking = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < bookings_all.length; i++) {

      let theBookingDay = new Date(bookings_all[i].year + "-" + bookings_all[i].month + "-" + bookings_all[i].day);

      //check wether booking Day is last week or  week ahead
      if (theBookingDay.getTime() > this.theCurrentPageLongTime - 7 * 24 * 3600 * 1000 && theBookingDay.getTime() < this.theCurrentPageLongTime + 7 * 24 * 3600 * 1000) {

        for (var t = 0; t < this.data.day.length; t++) {
          //console.log("all:" + this.data.day[t] + ":" + bookings_all[i].day);
          if (this.data.day[t] == bookings_all[i].day) {
            // console.log("right:" + tmpDayBooking[t]);
            tmpDayBooking[t]++;
            // console.log("right1:" + tmpDayBooking[t]);
            //console.log("t:" + t + "dayBooking:" + this.data.daybooking[t]);
            //this.data.daybooking[t]++;
          }
        }
      }

      if (bookings_all[i].year == this.data.selectedYear && bookings_all[i].month == this.data.selectedMonth && bookings_all[i].day == this.data.selectedDay) {
        //convert hour to hour_format
        //console.log("hour:" + bookings_all[i].hour);
        bookings_all[i].hour_format = util.formatHour(bookings_all[i].hour);
        bookings_all[i].status_format = util.formatBookingStatus(bookings_all[i].status);
        let prop_class_format = "";
        if (bookings_all[i].prop_class == "0") {
          prop_class_format = ":修";
        }
        if (bookings_all[i].prop_class == "1") {
          prop_class_format = ":治";
        }
        if (bookings_all[i].prop_class == "2") {
          prop_class_format = ":拔";
        }
        if (bookings_all[i].prop_class == "3") {
          prop_class_format = ":洗";
        }
        if (bookings_all[i].prop_class == "4") {
          prop_class_format = ":换";
        }
        bookings_all[i].prop_class_format = prop_class_format;
        let memo1 = bookings_all[i].memo1;
        if (memo1.length > 16) {
          memo1 = memo1.substring(0, 16);
        }
        bookings_all[i].memo1_format = memo1;

        //format show real_name
        let real_name = bookings_all[i].real_name;
        let nick_name = bookings_all[i].nick_name;
        let name_format = real_name;
        if (real_name != nick_name && nick_name != "") {
          name_format = name_format + "-" + nick_name;
        }
        if (name_format.length > 12) {
          name_format = name_format.substring(0, 12);
        }
        bookings_all[i].name_format = name_format;
        selectedBookings.push(bookings_all[i]);
      }
    };

    //console.log("daybooking:" + tmpDayBooking);
    //console.log("daybooking:"+this.data.hours.indexOf(15));

    //sort booking by hour
    selectedBookings.sort(function (a, b) {
      //console.log("a:"+a.hour+":b"+b.hour);
      return a.hour - b.hour
    });



    let curDate = new Date();
    let selectedDate = new Date(this.data.selectedYear + "-" + this.data.selectedMonth + "-" + this.data.selectedDay);
    //check wether selected Time > now Time 
    if (curDate.getTime() < selectedDate.getTime() + 24 * 3600 * 1000) {
      this.setData({
        buttonDisabled: false
      });
    } else {
      this.setData({
        buttonDisabled: true
      });
    }



    this.setData(
      {
        bookings: selectedBookings,
        dayBooking: tmpDayBooking,
      }
    );
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中...',
    })

    // 
    var that = this;

    this.initWeekday(new Date().getTime());
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //console.log("App 10");
        if (res.code) {
          //发起网络请求

          wx.request({
            url: getApp().globalData.SERVER_URL + "/weixin/getUserInfo",
            data: {
              js_code: res.code,
            },
            method: "post",
            success: function (res) {
              //console.log("openid:" + JSON.stringify(res.data[0].data));
              var tmp_openid = JSON.parse(res.data[0].data).openid;
              console.log("openid:" + tmp_openid);
              getApp().globalData.openid = tmp_openid;

              var tmp_session_key = JSON.parse(res.data[0].data).session_key;

              // 获取用户信息
              wx.getSetting({
                success: res => {
                  // console.log("App 30");
                  //if (res.authSetting['scope.userInfo']) {

                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                      // 可以将 res 发送给后台解码出 unionId
                      //console.log("App 40");
                      // console.log("encryptedData:" + res.encryptedData);
                      getApp().globalData.userInfo = res.userInfo;
                      getApp().globalData.nickName = res.userInfo.nickName;
                      getApp().globalData.icon = res.userInfo.avatarUrl;
                      getApp().globalData.gender = res.userInfo.gender;
                      //console.log("userInfo:" + JSON.stringify(res.userInfo));

                      //发起网络请求

                      wx.request({
                        url: getApp().globalData.SERVER_URL + "/weixin/getUnionid",
                        data: {
                          sessionKey: tmp_session_key,
                          iv: res.iv,
                          encryptedData: res.encryptedData
                        },
                        method: "post",
                        success: function (res) {
                          var unionid = res.data[0].unionid;
                          getApp().globalData.unionid = unionid;
                          console.log("unionid:" + unionid);
                          that.initMyInfo(unionid);


                        }
                      });


                      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                      // 所以此处加入 callback 以防止这种情况
                      //console.log("this.userInfoReadyCallback:" + this.userInfoReadyCallback)
                      //if (this.userInfoReadyCallback) {
                      //  console.log("App 50");
                      //  this.userInfoReadyCallback(res)
                      // }
                    }
                  })
                  //}
                }
              });


            }
          });


        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }

      }
    })




  },


  initMyInfo: function (unionid) {
    var that = this;
    if (unionid != "") {
      //发起网络请求 restAPI QRCode
      var openid = getApp().globalData.openid;
      wx.request({
        url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByUnionid',
        method: 'post',
        data: {
          unionid: unionid,
          openid: openid,
          nick_name: getApp().globalData.userInfo.nickName,
          icon: getApp().globalData.userInfo.avatarUrl,
          gender: getApp().globalData.userInfo.gender,
        },
        success: function (res) {

          console.log("getOrCreateUserInfoByUnionid userid:" + res.data[0].myInfo.userid);
          //console.log("getOrCreateUserInfoByUnionid userid:" + JSON.parse(res.data[0].myInfo.job_title).k);
          //set userid 2 Storage
          getApp().globalData.userid = res.data[0].myInfo.userid;
          getApp().globalData.mobile = res.data[0].myInfo.mobile;
          getApp().globalData.real_name = res.data[0].myInfo.real_name;
          wx.setStorageSync('MY_INFO', res.data[0].myInfo)
          that.server_getBookingList();

        }
      });
    }
  },



  initWeekday: function (theLongTime) {
    var curDate = new Date();
    curDate.setTime(theLongTime)
    //console.log("theCurrentPageLongTime:" + curDate);
    var t = "预约列表:" + curDate.getFullYear() + "年" + (curDate.getMonth() + 1) + "月";
    this.theCurrentPageLongTime = theLongTime;
    this.setData({
      selectedYear: curDate.getFullYear(),
      selectedMonth: curDate.getMonth() + 1,
    });
    var selectedDay = curDate.getDate();
    var curWeekday = curDate.getDay();
    //fixed sunday weekday 0 to 7
    if (curWeekday == 0) {
      curWeekday = 7;
    }
    var tmpDay = [0, 0, 0, 0, 0, 0, 0];
    var tmpDayClass = ['', '', '', '', '', '', ''];
    for (var i = 1; i <= curWeekday; i++) {
      var curDay = curDate.getDate();
      curDate.setDate(curDate.getDate() - 1);
      tmpDay[curWeekday - i] = curDay;
      //set tmpDayClass
     // console.log("curDay:" + (curWeekday - i)+":"+ curDay);
      
      if (curDate.getTime() > (new Date().getTime()-25*3600*1000)){
        tmpDayClass[curWeekday - i]='text-day-count-red'; 
      }else{
        tmpDayClass[curWeekday - i] = 'text-day-count'; 
      }

    }
    curDate.setTime(theLongTime)
    for (var i = curWeekday - 1; i < 7; i++) {
      var curDay = curDate.getDate();
      curDate.setDate(curDate.getDate() + 1);
      tmpDay[i] = curDay;
     // console.log("curDay:" +i+":"+ curDay);
      //set tmpDayClass
      if (curDate.getTime() > new Date().getTime()) {
        tmpDayClass[i] = 'text-day-count-red';
      }else{
        tmpDayClass[i] = 'text-day-count';
      }

    }
    //console.log("tmpDay:" + tmpDay.join(" "));
   // console.log("tmpDayClass:" + tmpDayClass.join(" "));


    this.setData({
      selectedDay: selectedDay,
      selectedWeekday: curWeekday,
      day: tmpDay,
      dayClass: tmpDayClass
    });


    wx.setNavigationBarTitle({ title: t })
    // console.log("initWeekDay finished.");
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
    this.initWeekday(this.theCurrentPageLongTime + diffDay * 24 * 3600 * 1000);
    //console.log("setWeekday");
    this.setSelectedBookings();
  },


  tapBookingDetails: function (e) {
    console.log("tapGoBookingDetails:" + JSON.stringify(e.target));
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target.dataset.bookingid));
    wx.navigateTo({
      url: '/page/booking/bookingDetails?bookingId=' + e.target.dataset.bookingid,
    })

  },
  bindNewBooking: function (e) {
    var that = this;
    wx.showActionSheet({
      itemList: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        if (!res.cancel) {
          wx.navigateTo({
            url: '/page/booking/booking?year=' + that.data.selectedYear + '&month=' + that.data.selectedMonth + '&day=' + that.data.selectedDay + '&weekday=' + that.data.selectedWeekday + '&hour=' + that.data.hours[res.tapIndex] + '&userid2=' + that.data.selectedUserid2,
          });
        }
      }
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
    let curDate_format = curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDate();
    this.setData({
      today: curDate_format
    })
    this.setSelectedBookings();
    this.setData({
      myInfo: wx.getStorageSync('MY_INFO')
    });
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
    //  console.log("onPullDownRefresh");
    wx.showLoading({
      title: '数据加载中...',
    })

    this.server_getBookingList();
    this.initWeekday(new Date().getTime());
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