// page/booking/qrBookingList.js
let util = require('../../util/util.js');
var sliderWidth = 96
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["帮助中心", "预约历史"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0,
    bookings: []
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.server_getBookingList();
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    console.log("e.currentTarget.id:" + e.currentTarget.id);
    
  },
  server_getBookingList() {
    wx.showLoading({
      title: '数据加载中...',
    })
    var that = this;
    console.log("server_getBookingList userid:" + getApp().globalData.userid);
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/list',
      method: 'post',
      data: {
        userid2: getApp().globalData.userid,
        linkedUserid:'userid1'
      }, success: function (res) {
        let bookings = res.data[0].data;
        //console.log("bookings:" + JSON.stringify(res.data[0]));
        //let applyItem={};
        for (let i = 0; i < bookings.length; i++) {
          bookings[i].hour_format = util.formatHour(bookings[i].hour);
          bookings[i].status_format = util.formatBookingStatus(bookings[i].status);
          //format location
          let location = bookings[i].job_location;
          
          if (bookings[i].memo2.length>0)
          {
            location = bookings[i].memo2;
          }
          if (bookings[i].memo2_1.length > 0) {
            location = "[回]"+bookings[i].memo2_1;
          }
          if (location.length > 12) {
            location = location.substring(0, 12);
          }
          bookings[i].location_format = location;
          
          // applyItem.userid1 = bookings[i].userid1;
          // applyItem.real_name = bookings[i].real_name;
          // applyItem.nick_name = bookings[i].nick_name;
          // applyItem.icon = bookings[i].icon;

        }
        //sort by c_time
        bookings.sort(function(a,b){
          //console.log("sort1:"+(b.year * 1000000 + b.month * 10000 + b.day * 100 + b.hour));
          //console.log("sort2:" + (a.year * 1000000 + a.month * 10000 + a.day * 100 + a.hour));
          return (b.year * 1000000 + b.month * 10000 + b.day * 100 + b.hour) - (a.year * 1000000 + a.month * 10000 + a.day * 100 + a.hour);
        })
        //console.log(res);
        that.setData({
          bookings: bookings,
         
        });
        console.log("getUserBooking finished.");
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }
    })
  },
  tapBookingDetails:function(e){
    //console.log("tapBookingDetails:"+JSON.stringify(e));
    let bookingId = e.currentTarget.dataset.bookingid;
    if(bookingId){
    wx.redirectTo({
      url: '/page/booking/qrBookingDetails?bookingNext=true&bookingId='+bookingId,
    });
    }
  },
  tapHome:function(e)
  {
    console.log("tapHome");
    wx.switchTab({
      url: '/page/me/me',
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
    wx.showLoading({
      title: '数据加载中...',
    })
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