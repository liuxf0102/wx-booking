let util = require('../../util/util.js');
// page/booking/memo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memo2Length: 0,
    memo2Max: 200,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.bookingId;
    if (id != 'undefined') {
      this.initBooking(id);
    }
  },

  initBooking: function (id) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/byId',
      method: 'post',
      data: {
        id: id,
        linkedUserid: 'userid1'
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
  
  inputMemo2: function (e) {
    //console.log("memo2:"+e.detail.value);
    let memo2 = e.detail.value;

    this.setData({
      memo2: memo2,
      memo2Length: memo2.length,
      buttonIsReady: true
    });

  },
  inputMemo2_1: function (e) {
    //console.log("memo2:"+e.detail.value);
    let memo2_1 = e.detail.value;

    this.setData({
      memo2_1: memo2_1,
      memo2_1Length: memo2_1.length,
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
          buttonIsReady: false
        });

        //set userid 2 Storage
        wx.showModal({
          title: '系统提示',
          content: '更新成功.',
          showCancel: false
        });
        wx.navigateTo({
          url: '/page/booking/qrBookingDetails?bookingId=' + res.data[0].id,
        })


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