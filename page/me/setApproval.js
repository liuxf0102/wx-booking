// page/me/setApproval.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needApproval: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = wx.getStorageSync('MY_INFO');
    let needApproval = true;

    let strConfig = myInfo.config;
    if (strConfig == '') {
      strConfig = "{}";
    }
    console.log("config:" + strConfig);
    let config = JSON.parse(strConfig);
    if (config.hasOwnProperty("need_approval"))
    {
      console.log("need_approval:" + config.need_approval);
      needApproval = config.need_approval;
    }

    this.setData({
      needApproval: needApproval,
    });
  },
  listenerSwitch: function (e) {
    let curValue=e.detail.value;
    console.log("curValue:"+curValue);
    var that = this;

    let myInfo = wx.getStorageSync('MY_INFO');
    let needApproval = true;

    let strConfig = myInfo.config;
    if (strConfig == '') {
      strConfig = "{}";
    }
    console.log("config:" + strConfig);
    let config = JSON.parse(strConfig);
    config.need_approval = curValue;
        //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/update',
      method: 'put',
      data: {
        userid: myInfo.userid,
        config: JSON.stringify(config)
      },
      success: function (res) {
        console.log("userid:" + res.data[0].userid);
        //set userid 2 Storage
        wx.showToast({
          title: '更新数据成功。',
        });

        getApp().reloadUserInfo();


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