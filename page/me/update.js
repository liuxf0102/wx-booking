Page({


  data: {
    showTopTips: false,
    myInfo: {},
    realName: "",
    mobile: "",
    jobLocation:"",
    realNameIsReady: false,
    mobileIsReady: false,
    buttonIsReady:true,
    tmpUserid: ""

  },
  bindUpdateUserInfo: function (e) {

    var that = this;


    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/update',
      method: 'put',
      data: {
        userid: that.data.myInfo.userid,
        real_name: that.data.realName,
        mobile: that.data.mobile,
        job_location: that.data.jobLocation

      },
      success: function (res) {
        console.log("userid:" + res.data[0].userid);
        that.setData({
          buttonIsReady:false
        });
        
        wx.showModal({
          title: '系统提示',
          content: '更新用户信息成功。',
          showCancel: false
        })


        getApp().reloadUserInfo();
        

      }
    });

  },



  getUserInfoByMobile: function (mobile) {
    var that = this;
    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/getUserInfoByMobile',
      method: 'post',
      data: {
        mobile: mobile,
      },
      success: function (res) {
        var result = res.data[0].result;
        console.log("result:" + result);

        if (result === 'success') {
          wx.showModal({
            title: '系统提示',
            content: '手机号已经被注册.',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                return;
              }
            }
          });

          return;
        } else {
          that.setData(
            { mobileIsReady: true }
          )
        }

      }
    });

  },


  onLoad: function () {

    this.setData({
      myInfo: wx.getStorageSync('MY_INFO')
    });

    if (this.data.myInfo.real_name != '') {
      this.setData({ realNameIsReady: true });
    };

    var myreg = /^((1)+\d{10})$/
    if (myreg.test(this.data.myInfo.mobile)) {
      this.setData({ mobileIsReady: true });

    }

  },
  inputRealName: function (e) {
    if(e.detail.value.length>=1)
    {
      this.setData({
        realName: e.detail.value,
        realNameIsReady:true
      })
    }else{
      this.setData({
        realNameIsReady: false
      })
    }

    
  },
  inputMobile: function (e) {

    //Check for the correct phone number
    var mobile = e.detail.value;
    if (mobile.length == 11) {

      var myreg = /^((1)+\d{10})$/
      if (myreg.test(mobile)) {
        console.log("mobile:" + mobile);
        //Check if the user exists ,if not exists then create the user

        this.getUserInfoByMobile(mobile);

      } else {
        return "请输入正确的手机号";
      }
    } else {
      this.setData({
        mobileIsReady: false
      });
    }
    this.setData({
      mobile: mobile
    });


  },
  inputJobLocation: function (e) {
    if (e.detail.value.length >= 1) {
      this.setData({
        jobLocation: e.detail.value
     })
    }


  },
  getUserInfo: function (e) {
    let that=this;
    console.log("getUserInfo:" + JSON.stringify(e));
    console.log("getUserInfo nickName:" + e.detail.userInfo.nickName);
    console.log("getUserInfo avatarUrl:" + e.detail.userInfo.avatarUrl);
    console.log("getUserInfo gender:" + e.detail.userInfo.gender);
    let userid = getApp().globalData.userid;
    let nickName = getApp().globalData.userNickName;
    let icon = getApp().globalData.userAvatarUrl;
    let gender = getApp().globalData.userGender;

    console.log("db userInfo userid:" + userid);
    console.log("db userInfo nickName:" + nickName);


    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/update',
      method: 'put',
      data: {
        userid: userid,
        nick_name: e.detail.userInfo.nickName,
        icon: e.detail.userInfo.avatarUrl,
        gender: e.detail.userInfo.gender

      },
      success: function (res) {
        console.log("userid:" + res.data[0].userid);
        getApp().reloadUserInfo();
        wx.showModal({
          title: '系统提示',
          content: '同步微信头像和昵称成功。',
          showCancel:false
        })
        that.setData({
          buttonIsReady: false
        });
      }
    });




  },
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
});