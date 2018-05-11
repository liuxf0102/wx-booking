const login = function (callback) {

  // 登录
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      //console.log("App 10");
      if (res.code) {
        //发起网络请求

        wx.request({
          url: getApp().globalData.SERVER_URL + "/weixin/getUserInfo",
          data: {
            js_code: res.code,
          },
          method: "post",
          success: function (res) {
            //console.log("openid:" + JSON.stringify(res.data[0].data));
            var tmp_openid = JSON.parse(res.data[0].data).openid;
            console.log("openid:" + tmp_openid);
            getApp().globalData.openid = tmp_openid;
            initMyInfo(tmp_openid, callback);




          }
        });


      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }

    }
  })
}

const initMyInfo = function (openid, callback) {

  if (openid != "") {
    //发起网络请求 restAPI QRCode

    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByOpenid',
      method: 'post',
      data: {
        openid: openid,
        nick_name: '',
        icon: '',
        gender: '',
        appid: getApp().globalData.APPID
      },
      success: function (res) {

        //console.log("getOrCreateUserInfoByUnionid userid from serverdb :" + res.data[0].myInfo.userid);
        //console.log("getOrCreateUserInfoByUnionid userid:" + JSON.parse(res.data[0].myInfo.job_title).k);
        //set userid 2 Storage
        //getApp().globalData.userid = res.data[0].myInfo.userid;
        //getApp().globalData.mobile = res.data[0].myInfo.mobile;
        let myInfo = res.data[0].myInfo;
        getApp().initGlobalData(myInfo);

        callback(myInfo);
        wx.hideLoading();
      }
    });
  }
}

exports.login = login;
