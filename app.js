//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this;
    //console.log("App 0");

  },

  userInfoReadyCallback: function (res) {
    console.log("userInfoReadyCallback");
    this.globalData.userInfo = res.userInfo;
  },



  reloadUserInfo: function () {

    wx.getUserInfo({
      success: function (res) {
        // console.log("App 60");
        getApp().globalData.userInfo = res.userInfo;
        var openid = getApp().globalData.openid;
        var unionid = getApp().globalData.unionid;
        //set UserInfo 2 db :open_id,nickName,
        //   console.log("App 61");
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
              getApp().globalData.mobile = res.data[0].myInfo.mobile;
              wx.setStorageSync('MY_INFO', res.data[0].myInfo)
            }
          });
        }
      }
    })
  },

  formidCollect: function (formid) {
    let formids = getApp().globalData.formids;
    console.log("formid:" + formid);
    // "the formId is a mock one" will be set for formid
    if (!(formid.indexOf("formId") > 0)) {
      
      formids.push(formid);
    }
    getApp().globalData.formids = formids;
  },
  formids2Server: function () {
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/appendFormids',
      data: {
        userid: getApp().globalData.userid,
        formids: JSON.stringify(getApp().globalData.formids)

      },
      method: 'put', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        if (res.statusCode == 200 && res.data[0].result == 'success') {
          // success
          //console.log('成功' + JSON.stringify(res));
          getApp().globalData.formids = [];
        }
        // console.log(e.detail.formid);
      },
      fail: function (err) {
        // fail
        console.log('失败' + err);
      },
      complete: function () {
        // complete
      }
    });


  },
  globalData: {
    formids: [],
    userInfo: null,
    userid: '',
    unionid: '',
    openid: '',
    mobile: '',
    nickName: '',
    icon: '',
    gender: '',
    params: {},
    version: "V2.1.1",
    SERVER_URL: 'https://www.4exam.cn',
    //SERVER_URL: 'http://127.0.0.1:8081'


  },
  //Storage object 
  SCONST: { "MY_INFO": "MY_INFO", "BOOKING": "BOOKING", "ROTA": "ROTA" }

})