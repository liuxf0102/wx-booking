// page/booking/bookingDetails.js
let util = require('../../util/util.js');
let server = require('server.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    booking: {},
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [8, 9, 10, 13, 14, 15],
    hourLabels: ["上午8点", "上午9点", "上午10点", "下午1点", "下午2点", "下午3点"],
    datePickerDisabled: true,
    memo1Length: 0,
    memo2_1Length: 0,
    memo1Max: 200,
    bookingHistory: [],
    buttonDisabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options:" + JSON.stringify(options));

    //console.log(map.get(8));
    var that = this;
    let id = options.bookingId;
    if (id != 'undefined') {
      this.initBooking(id);
    }
    let curDate = new Date();
    let endDate = new Date();
    endDate.setTime(endDate.getTime() + 200 * 24 * 3600 * 1000);
    //
    this.setData({
      curYear: curDate.getFullYear(),
      curMonth: curDate.getMonth() + 1,
      curDay: curDate.getDate(),
      endYear: endDate.getFullYear(),
      endMonth: endDate.getMonth() + 1,
      endDay: endDate.getDate()
    })

  },
  initBooking: function (id) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/byId',
      method: 'post',
      data: {
        id: id

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
        //booking.prop_class_format = util.formatBookingClass(booking.prop_class);
        that.setData({
          booking: booking,
          memo1Length: booking.memo1.length,
          memo2_1Length: booking.memo2_1.length
        });
        console.log("booking userid1:" + booking.userid1);
        if (getApp().globalData.userid == booking.userid1) {
          that.setData({
            datePickerDisabled: false
          })
        };

        //init booking history
        that.initBookingHistory(booking.userid2);

      }
    })
  },
  initBookingHistory: function (userid2) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/list',
      method: 'post',
      data: {
        userid1: getApp().globalData.userid,
        userid2: userid2
      }, success: function (res) {
        //console.log(JSON.stringify(res.data[0]));
        let bookingHistory = res.data[0].data;

        for (let i = 0; i < bookingHistory.length; i++) {
          bookingHistory[i].status_format = util.formatBookingStatus(bookingHistory[i].status);
        }
        //sort
        bookingHistory.sort(function (a, b) {
          return (b.year * 10000 + b.month * 100 + b.day) - (a.year * 10000 + a.month * 100 + a.day);
        });
        that.setData({
          bookingHistory: bookingHistory
        });
      }
    })
  },
  tapBooking: function () {
    var that = this;
    if(getApp().globalData.userid==''){
      return;
    }
    wx.showActionSheet({
      itemList: ['审核通过', '取消预约', '用户爽约', '完成履约'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);

        let status = 0;
        if (res.tapIndex == 0) {
          status = 1;
        } else if (res.tapIndex == 1) {
          status = -1;
        } else if (res.tapIndex == 2) {
          status = 3;
        } else if (res.tapIndex == 3) {
          status = 4;
        } else {
          status = 0;
        }

        let status_format = ['审核通过', '取消预约', '用户爽约', '完成履约'];

        if (!res.cancel) {
          wx.showModal({
            title: '系统提示',
            content: '你要将状态修改为[' + status_format[res.tapIndex] + ']吗?',
            success: function (res) {
              if (res.confirm) {

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

                    wx.showToast({
                      title: '更新成功.',
                    })
                    //refreshBooking
                    server.refreshBooking(getApp().globalData.userid, function () { });


                  }
                });

              }
            }

          })

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
            content: '时间调整为:' + that.data.booking.weekday_format + " " + that.data.month + "-" + that.data.day + " " + that.data.booking.hour_format + "吗?",
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

                    wx.showToast({
                      title: '更新成功.',
                    })

                    //refreshBooking
                    server.refreshBooking(getApp().globalData.userid, function () { });

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
  tapMemo1: function (e) {
    wx.redirectTo({
      url: '/page/booking/memo1?bookingId=' + this.data.booking.id,
    })
  },
  tapMemo2_1: function (e) {
    wx.redirectTo({
      url: '/page/booking/memo2_1?bookingId=' + this.data.booking.id,
    })
  },
  tapPropClass: function (e) {
    var that = this;
    //console.log("tapPropClass:"+JSON.stringify(e));
    
    let prop_classes = getApp().globalData.BOOKING_PROP_CLASSES;
    if (prop_classes.length==0){
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }
    wx.showActionSheet({
      itemList: prop_classes,
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        let prop_class = prop_classes[res.tapIndex];
        if (!res.cancel) {
          wx.showModal({
            title: '系统提示',
            content: '预约类型修改为[' + prop_classes[res.tapIndex] + ']吗?',
            success: function (res) {
              if (res.confirm) {

                //发起网络请求 
                wx.request({
                  url: getApp().globalData.SERVER_URL + '/booking/update',
                  method: 'put',
                  data: {
                    id: that.data.booking.id,
                    prop_class: prop_class
                  },
                  success: function (res) {
                    console.log("id:" + res.data[0].id);
                    that.initBooking(res.data[0].id);
                    //set userid 2 Storage

                    wx.showToast({
                      title: '更新成功.',
                    })
                    //refreshBooking
                    server.refreshBooking(getApp().globalData.userid, function () { });
                  }
                });

              }
            }

          })

        }
      }
    });
  },
  tapBookingDetails: function (e) {
    console.log("tapBookineDetails:" + JSON.stringify(e));
    let bookingId = e.target.dataset.bookingid;
    if (bookingId) {
      wx.redirectTo({
        url: '/page/booking/bookingDetails?bookingId=' + bookingId,
      });
    }
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
    if (this.data.booking.id) {
      this.initBooking(this.data.booking.id);
    }
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