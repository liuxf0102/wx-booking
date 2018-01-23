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
        //set userid 2 Storage
        wx.showToast({
          title: '更新用户信息成功',
        });

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
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
});