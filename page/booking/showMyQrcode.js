// page/booking/qrBooking.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    myInfo: {},
    qrcodeURL:""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo={};
        myInfo.nickName = getApp().globalData.useriNickName;
        myInfo.real_name = getApp().globalData.real_name;
    this.setData({

      myInfo:myInfo
    })
    this.initQrcodeURL();
  },

  initQrcodeURL:function(){
    let that=this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/qrcode',
      method: 'post',
      data: {
        userid1: getApp().globalData.userid,
      }, success: function (res) {
        console.log("qrcodeURL:" + res.data[0].qrcode);
        //let qrcode = res.data[0].qrcode;

        that.setData({
          qrcodeURL: res.data[0].qrcode
        });
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