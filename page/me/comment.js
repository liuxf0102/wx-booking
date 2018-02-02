// page/me/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentLength: 0,
    commentMax: 200,
    comment:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.server_getCommentList();
  },
  server_getCommentList() {
    wx.showLoading({
      title: '数据加载中',
    })
    var that = this;
    
    console.log("server_getCommentList userid:");

    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/comment/list',
      method: 'post',
      data: {
       
      }, success: function (res) {
        //console.log(res);
        //that.setData({
        //  bookings: res.data[0].data
        //});
        //wx.setStorageSync(getApp().SCONST.BOOKING, res.data[0].data);
        console.log("get comment finished.");
        wx.stopPullDownRefresh();

        that.setData(
          {
            comments: res.data[0].data
          }
        )
        wx.hideLoading();
      }
    })
  },
  inputComment: function (e) {
    //console.log("memo1:"+e.detail.value);
    let comment = e.detail.value;

    this.setData({
      comment: comment,
      commentLength: comment.length,
      buttonIsReady: true
    });

  },
  bindComment: function (e) {
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/comment/create',
      method: 'post',
      data: {
        userid2:getApp().globalData.userid,
        comment: that.data.comment,

      },
      success: function (res) {
        console.log("id:" + res.data[0].data);
        
        that.setData({
          buttonIsReady: false
        });

        //set userid 2 Storage
        wx.showToast({
          title: '保存成功',
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