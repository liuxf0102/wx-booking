// page/me/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentLength: 0,
    commentMax: 200,
    comment: "",
    status:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(getApp().globalData.userid==999){
      this.setData({status:0});
    }
    this.server_getCommentList();
  },
  server_getCommentList() {
    wx.showLoading({
      title: '数据加载中',
    })
    var that = this;

    console.log("server_getCommentList status:" + this.data.status);

    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/comment/list',
      method: 'post',
      data: {
        status:this.data.status
      }, success: function (res) {
        //console.log(res);
        //that.setData({
        //  bookings: res.data[0].data
        //});
        //wx.setStorageSync(getApp().SCONST.BOOKING, res.data[0].data);
        //console.log("get comment finished.");
        let comments = res.data[0].data;
        //sort
        comments.sort(function (a, b) {

          return b.m_time - a.m_time;

        });

        for (let i = 0; i < comments.length; i++) {
          let t1 = new Date();
          t1.setTime(comments[i].c_time);
          comments[i].c_time_format = ((t1.getMonth() + 1) + "月" + t1.getDate() + "号" + t1.getHours() + ":" + t1.getMinutes());
        }
        wx.stopPullDownRefresh();

        that.setData(
          {
            comments: comments
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
        userid2: getApp().globalData.userid,
        comment: that.data.comment,

      },
      success: function (res) {
        console.log("id:" + res.data[0].data);

        that.setData({
          comment: '',
          buttonIsReady: false
        });

        //set userid 2 Storage
        wx.showToast({
          title: '保存提交成功',
        });


      }
    });


  },
  bindReply: function (e) {
    //console.log("bindReply:e:" + JSON.stringify(e));
    if (getApp().globalData.userid == '999') {
      wx.navigateTo({
        url: '/page/me/reply?id=' + e.currentTarget.dataset.id,
      })
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
    this.server_getCommentList();
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