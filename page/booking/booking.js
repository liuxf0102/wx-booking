var util = require('../../util/util.js');
Page({
  pageBookingId:0,
  data: {
    userid2: "",
    userid2Name: "",
    userid2isNew: false,
    real_name_focus:false,
    bookings: [],
    bookingStatus: '确认预约时间和内容',
    buttonDisabled: true,
    weekdayLabel: ["", "一", "二", "三", "四", "五", "六", "日"],
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 0,
    minute:0,
    hourLabel: "",
    qrcodeURL: '',
    showView: true

  },

  onLoad(options) {
    var curDate = new Date();

    var diffDay = 7;
    curDate.setDate(curDate.getDate() + diffDay);
    var curWeekday = curDate.getDay();
    //
    this.setData({
      year: curDate.getFullYear(),
      month: curDate.getMonth() + 1,
      day: curDate.getDate(),
      weekday: curWeekday
    })
    var that = this;

    //check wether current uesr enters the mobile

    if(getApp().globalData.mobile=='')
    {
      wx.showModal({
        title: '系统提示',
        content: '请先完善用户信息，然后再用该功能.',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
           wx.navigateTo({
             url: '/page/me/update',
           })
          }
        }
      });

    }
    
  },
 

  bindNewBooking: function (e) {

    var that = this;
    var mobile = that.data.mobile;
    console.log("mobile:" + mobile);

    var myreg = /^((1)+\d{10})$/
    if (!myreg.test(mobile)) {
      console.log("mobile:" + mobile);
      that.setData({
        mobile: '请输入手机号'
      }
      )
      return;
    }
    if (this.data.userid2isNew) {

      if(this.data.userid2Name=="")
      {
        wx.showModal({
          title:'系统提示',
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
        year: this.data.year,
        month: this.data.month,
        day: this.data.day,
        weekday: this.data.weekday,
        hour: this.data.hour,
        minute: this.data.minute

      }, success: function (res) {
        //console.log("add date success:");
        if(res.statusCode==200 && res.data[0].result=='success'){
          that.pageBookingId=res.data[0].id;
        //show booked item info
        that.setData({
          bookingStatus: "预约信息输入完成,请患者扫码确认.",
          buttonDisabled: true,
          showView: false
        });
        }
      }
    })

    //发起网络请求 restAPI create qrocode and return qrcodeURL

    wx.request({
      url: getApp().globalData.SERVER_URL + '/qrcode',
      method: 'post',
      data: {
        userid1: getApp().globalData.userid,
        userid2: this.data.userid2,
        bookingId: this.pageBookingId

      }, success: function (res) {
        console.log("qrcodeURL:" + res.data[0].qrcode);
        //let qrcode = res.data[0].qrcode;

        that.setData({
          qrcodeURL: res.data[0].qrcode
        });
      }
    });


  },

  tapSelectTime: function (e) {

  },


  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  inputMobile: function (e) {

    //Check for the correct phone number
    var mobile = e.detail.value;
    if (mobile.length == 11) {

      var myreg = /^((1)+\d{10})$/
      if (myreg.test(mobile)) {
        console.log("mobile:" + mobile);
        //Check if the user exists ,if not exists then create the user

        this.getOrCreateUserInfoByMobile(mobile);

      } else {
        this.setData({
          buttonDisabled: true
        })
        return "请输入正确的手机号";
      }
      this.setData({
        mobile: mobile,
        buttonDisabled: false
      })
    }else{
      this.setData({
        mobile: mobile,
        buttonDisabled: true,
        qrcodeURL:''
      })
    }
    


  },
  inputRealName: function (e) {

    //Check for the correct phone number
    this.setData({
      userid2Name: e.detail.value
      
    })

  },

  getOrCreateUserInfoByMobile: function (mobile) {
    var that = this;
    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByMobile',
      method: 'post',
      data: {
        mobile: mobile,
      },
      success: function (res) {
        var tmpUserid = res.data[0].myInfo.userid;
        console.log("userid2:" + tmpUserid);
        console.log("userid2Name:" + res.data[0].myInfo.real_name);
        let isNewUser = ("" == res.data[0].myInfo.real_name) ? true : false;
        that.setData({
          userid2: tmpUserid,
          userid2isNew: isNewUser,
          showView: true,
          userid2Name: res.data[0].myInfo.real_name
        })

      }
    });

  },



  setWeekDay: function (e) {

    var curDate = new Date();
    var curWeekday = curDate.getDay();
    var selectWeekday = 7;
    try {
      selectWeekday = e.currentTarget.dataset.idx;
    } catch (e) { }


    var diffDay = (7 - (curWeekday - selectWeekday));
    console.log("curWeekday:" + curWeekday + ":selectWeekday" + selectWeekday + ":diffDay:" + diffDay);
    curDate.setDate(curDate.getDate() + diffDay);
    console.log("selDate:" + curDate);
    //
    this.setData({
      year: curDate.getFullYear(),
      month: curDate.getMonth() + 1,
      day: curDate.getDate(),
      weekday: e.currentTarget.dataset.idx - 0
    })
  },
  goCalendar: function (e) {
    wx.navigateTo({
      url: '/page/calendar/calendar',
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
    console.log("onShow");

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //show booked item info
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
