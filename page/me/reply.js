// page/me/reply.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    replyLength: 0,
    replyMax: 200,
    reply: "",
    id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    this.setData({ 'id': id });
  },
  inputReply: function (e) {
    //console.log("memo1:"+e.detail.value);
    let reply = e.detail.value;

    this.setData({
      reply: reply,
      replyLength: reply.length,
      buttonIsReady: true
    });

  },
  bindReply: function (e) {
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/comment/update',
      method: 'put',
      data: {
        id: that.data.id,
        reply: that.data.reply,
        status: 1
      },
      success: function (res) {
        console.log("id:" + res);

        that.setData({
          reply: '',
          buttonIsReady: false
        });

        //set userid 2 Storage
        wx.showToast({
          title: '保存提交成功',
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