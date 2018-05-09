var util = require('../../util/util.js');
let server = require('server.js');
let page_userid1 = "";
let page_userid2 = "";
Page({
  pageBookingId: 0,
  pageSelectedTime: '',
  data: {
    userid2: "",
    userid2Name: "",
    userid2isNew: false,
    real_name_focus: false,
    bookings: [],
    bookingStatus: '确认预约时间和内容',
    buttonIsReady: true,
    mobileIsReady: false,
    realNameIsReady: true,
    weekdayLabels: ["", "一", "二", "三", "四", "五", "六", "日"],
    minute: 0,
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    hour_format: '上午8点',
    hourLabels: ["早上6点", "早上7点", "上午8点", "上午9点", "上午10点", "上午11点", "中午12点", "下午1点", "下午2点", "下午3点", "下午4点", "下午5点", "晚上6点", "晚上7点", "晚上8点", "晚上9点", "夜里10点"],
    pickerTimeArray: [],
    pickerTimeArrayDay: [],

    qrcodeURL: '',
    prop_class: '未知',
    memo1: ''


  },

  onLoad(options) {

    //console.log("options:"+JSON.stringify(options));
    let curDate = new Date();
    let endDate = new Date();
    endDate.setTime(endDate.getTime() + 200 * 24 * 3600 * 1000);
    //
    this.setData({
      year: options.year,
      month: options.month,
      day: options.day,
      weekday: options.weekday,
      selectedUserid2: options.userid2,
      curYear: curDate.getFullYear(),
      curMonth: curDate.getMonth() + 1,
      curDay: curDate.getDate(),
      endYear: endDate.getFullYear(),
      endMonth: endDate.getMonth() + 1,
      endDay: endDate.getDate()
    })

    var that = this;
    console.log("options:"+JSON.stringify(options));
    if (options.userid2 != '') {
      page_userid2 = options.userid2;
      this.initSelectedUserid2(options.userid2);
    }
    if (options.selectedTime) {
      this.pageSelectedTime = options.selectedTime;
      console.log("this.pageSelectedTime:" + this.pageSelectedTime);
    }
    this.initPropClass();
    this.initSelectedTime();
    page_userid1 = getApp().globalData.userid;
  },


  bindNewBooking: function (e) {

    var that = this;

    if (this.data.weekday == "") {
      wx.showModal({
        title: '系统提示：',
        content: '请先选择预约时间.',
      })
      return;
    }

    var mobile = that.data.mobile;


    var myreg = /^((1)+\d{10})$/
    if (!myreg.test(mobile)) {

      wx.showModal({
        title: '系统提示',
        content: '请输入正确的手机号',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            that.setData({
              mobile_focus: true
            });
          }
        }
      })
      return;
    }
    if (this.data.userid2isNew) {

      if (this.data.userid2Name == "") {
        wx.showModal({
          title: '系统提示',
          content: '请输入新用户的真实姓名',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.setData({
                real_name_focus: true
              });
            }
          }
        });
        return;
      }

      //update new user info
      wx.request({
        url: getApp().globalData.SERVER_URL + '/user/update',
        method: 'put',
        data: {
          userid: that.data.userid2,
          real_name: that.data.userid2Name
        },
        success: function (res) {
          console.log("userid2:" + res.data[0].userid);

        }
      });


    }


    //发起网络请求 restAPI add new booking to database;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/create',
      method: 'post',
      data: {
        userid1: getApp().globalData.userid,
        userid2: this.data.userid2,
        status: 1,//default status is approved
        year: this.data.year,
        month: this.data.month,
        day: this.data.day,
        weekday: this.data.weekday,
        hour: this.data.hour,
        minute: this.data.minute,
        prop_class: this.data.prop_class,
        memo1: this.data.memo1

      }, success: function (res) {
        //console.log("add date success:");
        if (res.statusCode == 200 && res.data[0].result == 'success') {
          that.pageBookingId = res.data[0].id;
          //show booked item info
          that.setData({
            bookingStatus: "预约信息输入完成。",
            buttonIsReady: false

          });
          server.refreshBooking(getApp().globalData.userid, function () { });
          wx.redirectTo({
            url: '/page/booking/bookingDetails?isNew=true&bookingId=' + res.data[0].id,
          })
        } else {
          wx.showModal({
            title: '系统提示',
            content: '错误：' + JSON.stringify(res),
          })
        }
      },
      fail: function (err) {
        wx.showModal({
          title: '系统提示',
          content: '错误：' + JSON.stringify(err),
        })
      }
    })


  },
  bindShowMyQrcode: function (e) {
    wx.navigateTo({
      url: '/page/booking/showMyQrcode',
    })
  },
  tapSelectTime: function (e) {

  },

  initSelectedTime: function () {
    let curDate = new Date();
    curDate.setDate(curDate.getDate() + 1);
    let weekday = curDate.getDay();
    if (weekday == 0) {
      weekday = 7;
    }
    let year = curDate.getFullYear();
    let month = (curDate.getMonth() + 1);
    let day = curDate.getDate();
    let hour = "8";
    if (this.pageSelectedTime.length > 0) {
      var theSelectedTime = this.pageSelectedTime.split(",");
      if (theSelectedTime.length == 5) {
        year = theSelectedTime[0];
        month = theSelectedTime[1];
        day = theSelectedTime[2];
        hour = theSelectedTime[3];
        weekday = theSelectedTime[4];
      }
      this.setData({
        date: year + "/" + month + "/" + day,
        year: year,
        month: month,
        month_format: month + "月",
        day: day,
        day_format: day + "号",
        weekday: weekday,
        hour: hour,
        hour_format: util.formatHour(hour),
        weekday_format: util.formatWeekday(weekday),
      })
    } else {
      this.setData({
        date: year + "/" + month + "/" + day,
        year: year,
        month: month,
        month_format: "",
        day: day,
        day_format: "",
        weekday: "",
        hour: hour,
        hour_format: "",
        weekday_format: "请选择预约时间",
      })
    }


  },
  bindDateChange: function (e) {
    let that = this;
    wx.redirectTo({
      url: '/page/booking/qrBookingTime?source=booking&userid2='+page_userid2+'&userid1=' + page_userid1,
    })
  },

  inputMobile: function (e) {

    //Check for the correct phone number
    var mobile = e.detail.value;
    if (mobile.length == 11) {

      var myreg = /^((1)+\d{10})$/
      if (myreg.test(mobile)) {
        this.setData({
          mobile_focus: false
        });

        console.log("mobile:" + mobile);
       
        //wx.showNavigationBarLoading();
        this.getOrCreateUserInfoByMobile(mobile);

      } else {
        this.setData({
          mobileIsReady: false
        })
        return "请输入正确的手机号";
      }
      this.setData({
        mobile: mobile,
        mobileIsReady: true
      })
    } else {
      this.setData({
        mobile: mobile,
        mobileIsReady: false,
        qrcodeURL: ''
      })
    }



  },
  inputRealName: function (e) {

    //Check for the correct phone number
    this.setData({
      userid2Name: e.detail.value

    })

  },
  inputMemo1: function (e) {
    this.setData({
      memo1: e.detail.value
    });
  },
  getOrCreateUserInfoByMobile: function (mobile) {
    var that = this;
    //Check if the user exists ,if not exists then create the user
    wx.showLoading({
      title: '数据加载中......',
    })
    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByMobile',
      method: 'post',
      data: {
        mobile: mobile,
        appid:getApp().globalData.APPID_2
      },
      success: function (res) {
        var tmpUserid = res.data[0].myInfo.userid;
        console.log("userid2:" + tmpUserid);
        console.log("userid2Name:" + res.data[0].myInfo.real_name);
        let isNewUser = ("" == res.data[0].myInfo.real_name) ? true : false;
        that.setData({
          userid2: tmpUserid,
          userid2isNew: isNewUser,
          userid2Name: res.data[0].myInfo.real_name
        })
        
      },
      complete:function(e){
        wx.hideLoading();
      }
    });

  },

  initSelectedUserid2: function (userid2) {
    let that = this;
    //get userinfo info by userid
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getUserInfoByUserid',
      method: 'post',
      data: {
        userid: userid2
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data[0].result == 'success') {

          console.log("userid1 real_name:" + res.data[0].myInfo.real_name);
          that.setData({
            mobile: res.data[0].myInfo.mobile,
            userid2: res.data[0].myInfo.userid,
            userid2Name: res.data[0].myInfo.real_name,
            mobileIsReady: true,
            realNameIsReady: true
          })


        }

      }
    });

  },
  initPropClass: function (e) {
    var that = this;
    //console.log("tapPropClass:"+JSON.stringify(e));

    let prop_classes = getApp().globalData.BOOKING_PROP_CLASSES;
    if (prop_classes.length == 0) {
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }

    that.setData({
      prop_class: prop_classes[0]
    });


  },

  tapPropClass: function (e) {
    var that = this;
    //console.log("tapPropClass:"+JSON.stringify(e));

    let prop_classes = getApp().globalData.BOOKING_PROP_CLASSES;
    if (prop_classes.length == 0) {
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }
    wx.showActionSheet({
      itemList: prop_classes,
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        let prop_class = prop_classes[res.tapIndex];
        if (!res.cancel) {
          that.setData({
            prop_class: prop_classes[res.tapIndex]
          });
        }
      }
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
    //console.log("onShow");
    //check wether current uesr enters the mobile

    if (getApp().globalData.mobile == '') {
      wx.showModal({
        title: '系统提示',
        content: '请先完善用户信息，然后再用该功能.',
        showCancel: true,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/page/me/update',
            })
          }
          if (res.cancel) {
            console.log("cancel");
            wx.switchTab({
              url: '/page/me/me',
            })
          }
        }
      });

    }
    //get params

    if (getApp().globalData.params.year) {
      this.setData({
        year: getApp().globalData.params.year,
        month: getApp().globalData.params.month,
        day: getApp().globalData.params.day,
        hour: getApp().globalData.params.hour
      });
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //show booked item info
    this.setData({
      mobile: "",
      userid2Name: ""
    })
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
    wx.stopPullDownRefresh();
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
