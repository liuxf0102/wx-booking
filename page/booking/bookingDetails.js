// page/booking/bookingDetails.js
let util = require('../../util/util.js');
let server = require('server.js');
let m_login = require('m_login.js');
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
    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    hour_format: '上午8点',
    hourLabels: ["早上6点", "早上7点", "上午8点", "上午9点", "上午10点", "上午11点", "中午12点", "下午1点", "下午2点", "下午3点", "下午4点", "下午5点", "晚上6点", "晚上7点", "晚上8点", "晚上9点", "夜里10点"],
    pickerTimeArray: [],
    pickerTimeArrayDay: [],

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
    let myInfo = wx.getStorageSync('MY_INFO') || {};
    if (myInfo.userid) {
      console.log("getUnionid userid from storage.");
      getApp().initGlobalData(myInfo);
     
    } else {
      m_login.login(function (myInfo) {
        
      });
    }
    this.initPickerTimeArray();
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
          let memo1 = bookingHistory[i].memo1;

          //如果是待审核状态则显示对方的留言
          if (bookingHistory[i].status.toString() == "0" || memo1 == "") {

            memo1 = bookingHistory[i].memo2 == "" ? "" : "[留]" + bookingHistory[i].memo2
          }
          if (memo1.length > 16) {
            memo1 = memo1.substring(0, 16);
          }


          bookingHistory[i].memo1_format = memo1;
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

  initPickerTimeArray: function () {

    let pickerTimeArray = [["今天", "明天", "后天"], []];
    let dayArray = [];
    let dayArrayValue = [];

    for (let i = 0; i < 30; i++) {
      let curDate = new Date();
      curDate.setDate(curDate.getDate() + i);
      let weekday = curDate.getDay();
      if (weekday == 0) {
        weekday = 7;
      }
      let tmpDay = (curDate.getMonth() + 1) + "月" + curDate.getDate() + "日";
      let theDay = util.formatWeekday(weekday) + '  ' + tmpDay;
      if (i == 0) {
        theDay = "今天 " + theDay
      }
      if (i == 1) {
        theDay = "明天 " + theDay;
      }
      if (i == 2) {
        theDay = "后天 " + theDay;
      }

      dayArray.push(theDay);
      let theDayValue = curDate.getFullYear() + "/" + (curDate.getMonth() + 1) + "/" + curDate.getDate();
      dayArrayValue.push(theDayValue);
    }
    pickerTimeArray[0] = dayArray;
    pickerTimeArray[1] = this.data.hourLabels;
    this.setData({
      pickerTimeArray: pickerTimeArray,
      pickerTimeArrayDay: dayArrayValue
    }
    );

  },
  bindDateChange: function (e) {
    let that = this;
    // if(true)
    // return; 
    let theSelectedDay = this.data.pickerTimeArrayDay[e.detail.value[0]];
    let theSelectedTimeLabel = this.data.pickerTimeArray[1][e.detail.value[1]];
    let theSelectedTime = this.data.hours[e.detail.value[1]];
    console.log("day:" + theSelectedDay);
    console.log("time:" + theSelectedTime);


    let selectedDays = theSelectedDay.split("/");
    if (selectedDays.length == 3) {
      console.log("weekday:" + new Date(theSelectedDay).getDay())

      let weekday = new Date(theSelectedDay).getDay();
      if (weekday == 0) {
        weekday = 7;
      }


      this.setData({
        year: selectedDays[0],
        month: selectedDays[1],
        day: selectedDays[2],
        weekday: weekday,
        weekday_format: util.formatWeekday(weekday),

      })
    }
    that.setData({
      hour_format: theSelectedTimeLabel,
      hour: theSelectedTime
    })
    wx.showModal({
      title: '调整预约时间',
      content: '时间调整为:' + that.data.weekday_format + " " + that.data.month + "-" + that.data.day + " " + that.data.hour_format + "吗?",
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
  },

  // bindDateChange: function (e) {

  //   let that = this;
  //   this.setData({
  //     date: e.detail.value
  //   })
  //   let times = e.detail.value.split("-");
  //   if (times.length == 3) {
  //     console.log("weekday:" + new Date(e.detail.value).getDay())
  //     console.log("selectedDay:" + times.join(","));
  //     let weekday = new Date(e.detail.value).getDay();
  //     if (weekday == 0) {
  //       weekday = 7;
  //     }

  //     let booking = that.data.booking;
  //     booking.year = times[0];
  //     booking.month = times[1];
  //     booking.day = times[2];
  //     booking.weekday_format = util.formatWeekday(weekday);
  //     this.setData({
  //       year: times[0],
  //       month: times[1],
  //       day: times[2],
  //       weekday: weekday,
  //       booking: booking,
  //     })
  //   }

  //   wx.showActionSheet({
  //     itemList: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
  //     success: function (res) {
  //       //let selectedHour = that.data.hourLabels[res.tapIndex];
  //       //console.log("selectedHour:" + res.tapIndex);
  //       if (!res.cancel) {

  //         let booking = that.data.booking;
  //         booking.hour_format = that.data.hourLabels[res.tapIndex],
  //           that.setData({
  //             booking: booking,
  //             hour: that.data.hours[res.tapIndex]
  //           })


  //         wx.showModal({
  //           title: '调整预约时间',
  //           content: '时间调整为:' + that.data.booking.weekday_format + " " + that.data.month + "-" + that.data.day + " " + that.data.booking.hour_format + "吗?",
  //           success: function (res) {
  //             if (res.confirm) {
  //               wx.request({
  //                 url: getApp().globalData.SERVER_URL + '/booking/update',
  //                 method: 'put',
  //                 data: {
  //                   id: that.data.booking.id,
  //                   year: that.data.year,
  //                   month: that.data.month,
  //                   day: that.data.day,
  //                   weekday: that.data.weekday,
  //                   hour: that.data.hour
  //                 },
  //                 success: function (res) {
  //                   console.log("id:" + res.data[0].id);
  //                   that.initBooking(res.data[0].id);
  //                   //set userid 2 Storage

  //                   wx.showToast({
  //                     title: '更新成功.',
  //                   })

  //                   //refreshBooking
  //                   server.refreshBooking(getApp().globalData.userid, function () { });

  //                 }
  //               });


  //               return;
  //             }
  //           }
  //         });
  //       }
  //     }
  //   });
  // },
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