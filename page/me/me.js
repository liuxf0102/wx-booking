// pages/aboutme/aboutme.js
//获取应用实例
const app = getApp();
Page({
  /**
 * 页面的初始数据
 */
  data: {

    myInfo: { },
    version:getApp().globalData.version

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = wx.getStorageSync('MY_INFO') || {};
    let that = this;
    if (myInfo.userid) {
      console.log("get userid from cache：" + JSON.stringify(myInfo));
      getApp().initGlobalData(myInfo);


    } else {
      m_login.login(function (myInfo) {
        console.log("getUnionid userid from server db：" + JSON.stringify(myInfo));
        console.log("init myInfo");
        getApp().initGlobalData(myInfo);
        wx.setStorageSync('MY_INFO', myInfo);
        that.setData({
          myInfo: myInfo
        });
      });
    }
  },


  bindUpdateMyInfo: function (e) {
    console.log("redirectTo:" + e.currentTarget.id);
    wx.navigateTo({
      url: '/page/me/update',
    })
  },
  bindShowMyQrcode:function(e)
  {
    wx.navigateTo({
      url: '/page/booking/showMyQrcode',
    })
  },
  bindHelp: function (e) {
   // console.log("redirectTo:" + e.currentTarget.id);
    wx.navigateTo({
      url: '/page/me/help',
    })
  },
  bindComment: function (e) {
    // console.log("redirectTo:" + e.currentTarget.id);
    wx.navigateTo({
      url: '/page/me/comment',
    })
  },
  bindAbout: function (e) {
    //console.log("redirectTo:" + e.currentTarget.id);
    wx.navigateTo({
      url: '/page/me/about',
    })
  },
  bindQrcode:function(e){
    wx.navigateTo({
      url: '/page/booking/showMyQrcode',
    })
  },
  bindUserid2Page:function(e){
    wx.redirectTo({
      url: '/page/booking/qrBookingList',
    })
  },
  bindBookingPropClass:function(e){
    wx.navigateTo({
      url: '/page/me/settingPropClass',
    })
  },
  bindBookingTime: function (e) {
    wx.navigateTo({
      url: '/page/me/settingTime',
    })
  },
  bindBookingApproval: function (e) {
    wx.navigateTo({
      url: '/page/me/setApproval',
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