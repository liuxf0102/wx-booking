const  login= function (callback) {
  
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
            // 获取用户信息
            wx.getSetting({
              success: res => {
                // console.log("App 30");
                //if (res.authSetting['scope.userInfo']) {

                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  withCredentials: true,
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    //console.log("App 40");
                    // console.log("encryptedData:" + res.encryptedData);
                    getApp().globalData.userInfo = res.userInfo;
                    getApp().globalData.nickName = res.userInfo.nickName;
                    getApp().globalData.icon = res.userInfo.avatarUrl;
                    getApp().globalData.gender = res.userInfo.gender;
                    //console.log("userInfo:" + JSON.stringify(res.userInfo));



                  }
                })
                //}
              }
            });


          }
        });


      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }

    }
  })
}

const initMyInfo = function (unionid,callback) {
  
  if (unionid != "") {
    //发起网络请求 restAPI QRCode
    var openid = getApp().globalData.openid;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByUnionid',
      method: 'post',
      data: {
        unionid: unionid,
        openid: openid,
        nick_name: getApp().globalData.userInfo.nickName,
        icon: getApp().globalData.userInfo.avatarUrl,
        gender: getApp().globalData.userInfo.gender,
        appid: getApp().globalData.APPID
      },
      success: function (res) {

        //console.log("getOrCreateUserInfoByUnionid userid from serverdb :" + res.data[0].myInfo.userid);
        //console.log("getOrCreateUserInfoByUnionid userid:" + JSON.parse(res.data[0].myInfo.job_title).k);
        //set userid 2 Storage
        //getApp().globalData.userid = res.data[0].myInfo.userid;
        //getApp().globalData.mobile = res.data[0].myInfo.mobile;
        let myInfo = res.data[0].myInfo;
        

        callback(myInfo);
        wx.hideLoading();
      }
    });
  }
}

exports.login = login;
