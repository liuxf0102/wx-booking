// page/booking/bookingDetails.js
let util = require('../../util/util.js');
let server = require('server.js');
let m_login = require('m_login.js');
var sliderWidth = 96
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["详细信息", "预约历史"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    booking: {},
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [8, 9, 10, 13, 14, 15],
    hourLabels: ["上午8点", "上午9点", "上午10点", "下午1点", "下午2点", "下午3点"],
    datePickerDisabled: true,
    memo2Length: 0,
    memo2Max: 200,
    buttonDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    
    let myInfo = wx.getStorageSync('MY_INFO') || {};
    if (myInfo.userid) {
      console.log("getUnionid userid from storage.");
      getApp().initGlobalData(myInfo);
    }else{
      m_login.login(function (myInfo) {
        
      });
    }
    //console.log("options:" + JSON.stringify(options));
    if(options.bookingNext){
      this.setData({
        bookingNext:true
      });
    }
    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    server.refreshBooking(getApp().globalData.userid, function () { });
    //console.log(map.get(8));
    
    let id = options.bookingId;
    if (id != 'undefined') {
      this.initBooking(id);
    }
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    if (e.currentTarget.id==1)
    {
      wx.redirectTo({
        url: '/page/booking/qrBookingList',
      })
    }
  },
  initBooking: function (id) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/byId',
      method: 'post',
      data: {
        id: id,
        linkedUserid:'userid1'
      }, success: function (res) {
        //console.log(JSON.stringify(res.data[0]));
        let booking = res.data[0].data;
        let cTime = new Date();
        cTime.setTime(booking.c_time);
        let c_time_format = util.formatTime(cTime);
        booking.c_time_format = c_time_format;
        booking.hour_format = util.formatHour(booking.hour);
        booking.weekday_format = util.formatWeekday(booking.weekday);
        booking.status_format = util.formatBookingStatus(booking.status);
        that.setData({
          booking: booking,
          memo2Length: booking.memo2.length
        });
        console.log("booking userid1:" + booking.userid1);
        if (getApp().globalData.userid == booking.userid1) {
          that.setData({
            datePickerDisabled: false
          })
        }

      }
    })
  },
  tapBooking: function (bookingId) {
    var that = this;
    wx.showActionSheet({
      itemList: ['审核通过', '取消预约', '用户爽约', '完成履约'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);

        let status = 0;
        if (res.tapIndex == 0) {
          status = 1;
        } else if (res.tapIndex == 1) {
          status = 2;
        } else if (res.tapIndex == 2) {
          status = 3;
        } else if (res.tapIndex == 3) {
          status = 4;
        } else {
          status = 0;
        }



        if (!res.cancel) {
          //发起网络请求 
          wx.request({
            url: getApp().globalData.SERVER_URL + '/booking/update',
            method: 'put',
            data: {
              id: that.data.booking.id,
              status: status
            },
            success: function (res) {
              console.log("id:" + res.data[0].id);
              that.initBooking(res.data[0].id);
              //set userid 2 Storage
              wx.showModal({
                title: '系统提示',
                content: '更新成功.',
                showCancel: false
              });



            }
          });

        }
      }
    });
  },
  bindDateChange: function (e) {

    let that = this;
    this.setData({
      date: e.detail.value
    })
    let times = e.detail.value.split("-");
    if (times.length == 3) {
      console.log("weekday:" + new Date(e.detail.value).getDay())
      console.log("selectedDay:" + times.join(","));
      let weekday = new Date(e.detail.value).getDay();
      if (weekday == 0) {
        weekday = 7;
      }

      let booking = that.data.booking;
      booking.year = times[0];
      booking.month = times[1];
      booking.day = times[2];
      booking.weekday_format = util.formatWeekday(weekday);
      this.setData({
        year: times[0],
        month: times[1],
        day: times[2],
        weekday: weekday,
        booking: booking,
      })
    }

    wx.showActionSheet({
      itemList: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        if (!res.cancel) {

          let booking = that.data.booking;
          booking.hour_format = that.data.hourLabels[res.tapIndex],
            that.setData({
              booking: booking,
              hour: that.data.hours[res.tapIndex]
            })


          wx.showModal({
            title: '调整预约时间',
            content: '你要将预约时间调整为:' + that.data.booking.weekday_format + " " + that.data.month + "-" + that.data.day + " " + that.data.booking.hour_format + "吗?",
            success: function (res) {
              if (res.confirm) {
                wx.request({
                  url: getApp().globalData.SERVER_URL + '/booking/update',
                  method: 'put',
                  data: {
                    id: that.data.booking.id,
                    year: that.data.year,
                    month: that.data.month,
                    day: that.data.day,
                    weekday: that.data.weekday,
                    hour: that.data.hour
                  },
                  success: function (res) {
                    console.log("id:" + res.data[0].id);
                    that.initBooking(res.data[0].id);
                    //set userid 2 Storage
                    wx.showModal({
                      title: '系统提示',
                      content: '更新成功.',
                      showCancel: false
                    });



                  }
                });


                return;
              }
            }
          });
        }
      }
    });
  },
  tapMemo2:function (e){
    wx.navigateTo({
      url: '/page/booking/qrMemo2?bookingId=' + this.data.booking.id,
    })
    
  },
  inputMemo2: function (e) {
    //console.log("memo2:"+e.detail.value);
    let memo2 = e.detail.value;

    this.setData({
      memo2: memo2,
      memo2Length: memo2.length,
      buttonDisabled: false
    });

  },
  bindUpdateMemo2: function (e) {
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/update',
      method: 'put',
      data: {
        id: that.data.booking.id,
        memo2: that.data.memo2
      },
      success: function (res) {
        console.log("id:" + res.data[0].id);
        that.initBooking(res.data[0].id);
        that.setData({
          buttonDisabled: true
        });

        //set userid 2 Storage
        wx.showModal({
          title: '系统提示',
          content: '更新成功.',
          showCancel: false
        });



      }
    });


  },

  bindNewBookingQR:function(e){
    wx.redirectTo({
      url: '/page/booking/qrBookingNew?userid1='+this.data.booking.userid1,
    })
  },
  formSubmit: function (e) {
    var that = this
    //console.log("formid:"+e.detail.formid);
    let formid = e.detail.formId;
    getApp().formidCollect(formid);
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    getApp().formids2Server();
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