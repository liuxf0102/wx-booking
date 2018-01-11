//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log("index onload 0");
    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log("index onload 1");
    } else if (this.data.canIUse) {
      console.log("index onload 20");
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log("index onload 21");
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }

    } else {
      console.log("index onload 30");
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log("index onload 31");
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    };
    console.log("index onload 40");

  },


  onReady: function () {
    this.getUserInfo();
  },

  getUserInfo: function () {
    var that= this;
    wx.getUserInfo({
      success: function (res) {
        console.log("App 60");
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        getApp().reloadUserInfo();
      }
    })
  },


})
