// pages/booking/bookingList.js

var startX, endX;
var moveFlag = true;// 判断左右华东超出菜单最大值时不再执行滑动事件

Page({

  theCurrentPageLongTime: 0,
  //pageScene: '1000-1000-1020',
  pageScene: '',
  pageUserid1: '',
  pageUserid2: '',
  pageBookingId:'',
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
    day: [0, 0, 0, 0, 0, 0, 0],
    dayBooking: [0, 0, 0, 0, 0, 0, 0]
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

    this.initWeekday(this.theCurrentPageLongTime + 7 * 24 * 3600 * 1000);
    this.setSelectedBookings();
  },
  move2right() {
    this.initWeekday(this.theCurrentPageLongTime - 7 * 24 * 3600 * 1000);
    this.setSelectedBookings();
  },

  setSelectedBookings() {

    console.log("setSelectedBooking:year" + this.data.selectedYear + "month:" + this.data.selectedMonth + "day:" + this.data.selectedDay + "weekday:" + this.data.selectedWeekday)

    var bookings_all = wx.getStorageSync(getApp().SCONST.BOOKING) || [];
    var selectedBookings = [];
    var tmpDayBooking = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < bookings_all.length; i++) {



      for (var t = 0; t < this.data.day.length; t++) {
        //console.log(this.data.day[t]);
        if (this.data.day[t] == bookings_all[i].day) {
          //console.log("right:" + tmpDayBooking[t]);
          tmpDayBooking[t]++;
          //console.log("right:" + tmpDayBooking[t]);
          //console.log("t:" + t + "dayBooking:" + this.data.daybooking[t]);
          //this.data.daybooking[t]++;
        }
      }


      if (bookings_all[i].year == this.data.selectedYear && bookings_all[i].month == this.data.selectedMonth && bookings_all[i].day == this.data.selectedDay) {


        selectedBookings.push(bookings_all[i]);
      }
    };

    console.log("daybooking:" + tmpDayBooking);

    this.setData(
      {
        bookings: selectedBookings,
        dayBooking: tmpDayBooking
      }
    )
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let scene = decodeURIComponent(options.scene);
    //console.log("scene:" + typeof scene);
    if (typeof scene !== 'undefined' && scene !== 'undefined') {
      this.pageScene = scene;
    }
    console.log("scene:" + this.pageScene);
    // 
    var that = this;

    this.initWeekday(new Date().getTime());
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log("App 10");
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
                  console.log("App 30");
                  //if (res.authSetting['scope.userInfo']) {

                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                      // 可以将 res 发送给后台解码出 unionId
                      console.log("App 40");
                      // console.log("encryptedData:" + res.encryptedData);
                      getApp().globalData.userInfo = res.userInfo

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
          nick_name: getApp().globalData.userInfo.nickName
        },
        success: function (res) {

          console.log("getOrCreateUserInfoByUnionid userid:" + res.data[0].myInfo.userid);
          //set userid 2 Storage
          getApp().globalData.userid = res.data[0].myInfo.userid;
          getApp().globalData.mobile = res.data[0].myInfo.mobile;

          wx.setStorageSync('MY_INFO', res.data[0].myInfo)
          that.server_getBookingList();
          //init qrcode scene
          that.initQrcodeScene();
        }
      });
    }
  },



  initWeekday: function (theLongTime) {

    var curDate = new Date();
    curDate.setTime(theLongTime)
    console.log("theCurrentPageLongTime:" + curDate);
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
    for (var i = 1; i <= curWeekday; i++) {
      var curDay = curDate.getDate();
      curDate.setDate(curDate.getDate() - 1);
      tmpDay[curWeekday - i] = curDay;
    }
    curDate.setTime(theLongTime)
    for (var i = curWeekday - 1; i < 7; i++) {
      var curDay = curDate.getDate();
      curDate.setDate(curDate.getDate() + 1);
      tmpDay[i] = curDay;
    }
    console.log("tmpDay:" + tmpDay.join(" "));



    this.setData({
      selectedDay: selectedDay,
      selectedWeekday: curWeekday,
      day: tmpDay
    });


    wx.setNavigationBarTitle({ title: t })
    console.log("initWeekDay finished.");
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
    console.log("curWeekday:" + curWeekday + ":selectWeekday" + selectedWeekday + ":diffDay:" + diffDay);
    curDate.setDate(curDate.getDate() + diffDay);
    console.log("selDate:" + curDate);
    this.initWeekday(this.theCurrentPageLongTime + diffDay * 24 * 3600 * 1000);
    console.log("setWeekday");
    this.setSelectedBookings();
  },

  initQrcodeScene: function () {

    let that = this;
    if (this.pageScene !== '') {

      let scenes = this.pageScene.split("-");
      console.log("scenes:" + scenes.join(','));
      if (scenes.length>=1){
        this.pageUserid1 = scenes[0];
      }
      if (scenes.length >= 2) {
        this.pageUserid2 = scenes[1];
      }
      if (scenes.length >= 3) {
        this.pageBookingId = scenes[2];
      }
      
      console.log("pageScene userid2:" + this.pageUserid2);
      //check whether mobile userid and unionid userid is linked
      if (this.pageUserid2 == getApp().globalData.userid) {
        console.log("mobile and unionid is linked");
        wx.showModal({
          title: '预约信息扫码成功.',
          content: '点击确认后，查看预约信息。',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/page/booking/bookingDetails?bookingId='+that.pageBookingId,
              })

              return;
            }
          }
        });
      } else {
        //Check whether unionid users' mobile is empty.
        //console.log("userid1 mobile:" + typeof getApp().globalData.mobile);
        //console.log("userid1 mobile:" + typeof getApp().globalData.mobile.length);
        if (getApp().globalData.mobile == '') {
          //is new user

          //get userid2 info by userid
          wx.request({
            url: getApp().globalData.SERVER_URL + '/user/getUserInfoByUserid',
            method: 'post',
            data: {
              userid: this.pageUserid1
            },
            success: function (res) {
              if (res.statusCode == 200 && res.data[0].result == 'success') {

                console.log("userid1 real_name:" + res.data[0].myInfo.real_name);
                console.log("userid1 mobile:" + res.data[0].myInfo.mobile);
                wx.showModal({
                  title:'信息确认',
                  content: '预约登记信息:预约人：' + res.data[0].myInfo.real_name + "[" + res.data[0].myInfo.nick_name + "], " + "预约时间:" + that.pageBookingTime,
                  showCancel: true,
                  success: function (res) {
                    if (res.confirm) {
                      console.log("user confirmed ");
                      //link current user to the userid2
                      

                    } else {
                      console.log("user canceled ");
                    }
                  }
                });

              }

            }
          });

        } else {
          //is not a new user
          wx.showModal({
            title:'信息不匹配',
            content: '扫描的预约登记，不是本人的预约登记!请核对预约信息后再重新扫描.',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                return;
              }
            }
          });
        }

      }


    }
  },

  tapGoBookingDetails:function(e)
  {
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target.dataset));
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target.dataset.bookingid));
    wx.navigateTo({
      url: '/page/booking/bookingDetails?bookingId=' + e.target.dataset.bookingid,
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
    console.log("onPullDownRefresh");
    this.server_getBookingList();
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