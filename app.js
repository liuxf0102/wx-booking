//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this;
    console.log("App 0");
  
  },

  userInfoReadyCallback: function (res) {
    console.log("userInfoReadyCallback");
    this.globalData.userInfo = res.userInfo;
  },

  getAccessToken: function () {
    var that = this;
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      data: {
        appid: 'wx5699f282563037ea',
        secret: '9f8dc89e304f4f0082598c60df5e1519',
        grant_type: 'client_credential'
      }, success: function (res) {
        console.log("access_token:" + res.data.access_token);
        that.globalData.accessToken = res.data.access_token;


      }
    });
  },

  reloadUserInfo: function () {

    wx.getUserInfo({
      success: function (res) {
        console.log("App 60");
        getApp().globalData.userInfo = res.userInfo;
        var openid = getApp().globalData.openid;
        var unionid = getApp().globalData.unionid;
        //set UserInfo 2 db :open_id,nickName,
        console.log("App 61");
        if (unionid != "") {
          //发起网络请求 restAPI QRCode
          wx.request({
            url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByUnionid',
            method: 'post',
            data: {
              unionid: unionid,
              openid: openid,
              nick_name: getApp().globalData.userInfo.nickName
            },
            success: function (res) {
              
              console.log("userid:" + res.data[0].myInfo.userid);
              //set userid 2 Storage
              getApp().globalData.userid = res.data[0].myInfo.userid;
              wx.setStorageSync('MY_INFO', res.data[0].myInfo)
            }
          });
        }
      }
    })
  },

  globalData: {
    userInfo: null,
    userid: '',
    unionid:'',
    openid: '',
    mobile:'',
    session_key:'',
    accessToken: '',
    SERVER_URL:'https://www.4exam.cn'
    //SERVER_URL: 'http://10.6.217.17:8081'
    //SERVER_URL: 'http://192.168.31.123:8081'
  },
  //Storage object 
  SCONST: { "MY_INFO": "MY_INFO", "BOOKING": "BOOKING" }

})