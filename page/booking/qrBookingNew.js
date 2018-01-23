// page/booking/qrBookingNew.js
let util = require('../../util/util.js');
var sliderWidth = 96
Page({
  pageUserid1: "",
  //pageScene: '1000',
  pageScene: '',
  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["扫码预约", "预约历史"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    buttonIsReady: true,
    userInfo1IsReady: false,
    mobileIsReady: false,
    userInfo1: {},
    myInfo: {},
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [8, 9, 10, 13, 14, 15],
    hourLabels: ["上午8点", "上午9点", "上午10点", "下午1点", "下午2点", "下午3点"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中...',
    })
    var that = this;


    let curDate = new Date();
    let endDate = new Date();
    endDate.setTime(endDate.getTime() + 200 * 24 * 3600 * 1000);
    //
    this.setData({
      curYear: curDate.getFullYear(),
      curMonth: curDate.getMonth() + 1,
      curDay: curDate.getDate(),
      endYear: endDate.getFullYear(),
      endMonth: endDate.getMonth() + 1,
      endDay: endDate.getDate()
    })


    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    let scene = decodeURIComponent(options.scene);
    //console.log("scene:" + typeof scene);
    if (typeof scene !== 'undefined' && scene !== 'undefined') {
      this.pageScene = scene;
    }
    if(options.userid1)
    {
      this.pageScene = options.userid1;
    }
    console.log("scene:" + this.pageScene);
    this.wxlogin();
    this.initQrcodeScene();
    this.initSelectedTime();
  },
  tabClick: function (e) {
    wx.showLoading({
      title: '数据加载中...',
    })
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    if (e.currentTarget.id == 1) {
      wx.redirectTo({
        url: '/page/booking/qrBookingList',
      })
    }
  },
  wxlogin: function () {
    var that = this;
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

              var tmp_session_key = JSON.parse(res.data[0].data).session_key;

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

                      //发起网络请求

                      wx.request({
                        url: getApp().globalData.SERVER_URL + "/weixin/getUnionid",
                        data: {
                          sessionKey: tmp_session_key,
                          iv: res.iv,
                          encryptedData: res.encryptedData
                        },
                        method: "post",
                        success: function (res) {
                          var unionid = res.data[0].unionid;
                          getApp().globalData.unionid = unionid;
                          console.log("unionid:" + unionid);
                          that.initMyInfo(unionid);


                        }
                      });



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

  },

  initQrcodeScene: function () {

    let that = this;
    if (this.pageScene !== '') {

      let scenes = this.pageScene.split("-");
      console.log("scenes:" + scenes.join(','));
      if (scenes.length >= 1) {
        this.pageUserid1 = scenes[0];
      }

      //get userinfo info by userid
      wx.request({
        url: getApp().globalData.SERVER_URL + '/user/getUserInfoByUserid',
        method: 'post',
        data: {
          userid: this.pageUserid1
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data[0].result == 'success') {

            console.log("userid1 real_name:" + res.data[0].myInfo.real_name);
            that.setData({
              userInfo1: res.data[0].myInfo,
              userInfo1IsReady: true
            })


          }

        }
      });






    } else {
      wx.showModal({
        title: '系统提示',
        content: '没有扫描到预约信息，将返回到预约本小程序主页',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/page/me/me',
            })
          }
        },
      })
    }
  },

  initMyInfo: function (unionid) {
    var that = this;
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
        },
        success: function (res) {

          console.log("getOrCreateUserInfoByUnionid userid:" + res.data[0].myInfo.userid);
          //console.log("getOrCreateUserInfoByUnionid userid:" + JSON.parse(res.data[0].myInfo.job_title).k);
          //set userid 2 Storage
          getApp().globalData.userid = res.data[0].myInfo.userid;
          getApp().globalData.mobile = res.data[0].myInfo.mobile;

          var myreg = /^((1)+\d{10})$/;
          that.setData({
            myInfo: res.data[0].myInfo,
            hour_format: that.data.hourLabels[0],
            mobileIsReady: myreg.test(res.data[0].myInfo.mobile),
            real_name: res.data[0].myInfo.real_name,
            mobile: res.data[0].myInfo.mobile
          });
          wx.hideLoading();
        }
      });
    }
  },
  initSelectedTime: function () {
    let curDate = new Date();
    curDate.setDate(curDate.getDate() + 7);
    let weekday = curDate.getDay();
    if (weekday == 0) {
      weekday = 7;
    }
    this.setData({
      date: curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDate(),
      year: curDate.getFullYear(),
      month: (curDate.getMonth() + 1),
      day: curDate.getDate(),
      weekday: weekday,
      weekday_format: util.formatWeekday(weekday),

    })
  },
  bindDateChange: function (e) {

    let that = this;
    this.setData({
      date: e.detail.value
    })
    let times = e.detail.value.split("-");
    if (times.length == 3) {
      console.log("weekday:" + new Date(e.detail.value).getDay())
      console.log("selectedDay:" + times.join(","));
      let weekday = new Date(e.detail.value).getDay();
      if (weekday == 0) {
        weekday = 7;
      }


      this.setData({
        year: times[0],
        month: times[1],
        day: times[2],
        weekday: weekday,
        weekday_format: util.formatWeekday(weekday),

      })
    }

    wx.showActionSheet({
      itemList: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        if (!res.cancel) {


          that.setData({
            hour_format: that.data.hourLabels[res.tapIndex],
            hour: that.data.hours[res.tapIndex]
          })



        }
      }
    });
  },

  bindNewBookingQR: function (e) {
    var that = this;

    wx.showModal({
      title: '预约信息确认',
      content: '对方姓名：' + this.data.userInfo1.real_name + "[" + this.data.userInfo1.nick_name + "]" + ' 预约时间:' + this.data.weekday_format + ' ' + this.data.day + '号' + this.data.hour_format,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          that.setData({
            buttonIsReady: false
          });
          //check mobile 
          //发起网络请求 restAPI add new booking to database;
          wx.request({
            url: getApp().globalData.SERVER_URL + '/booking/create',
            method: 'post',
            data: {
              userid1: that.data.userInfo1.userid,
              userid2: getApp().globalData.userid,
              status: 0,//default status is approved
              year: that.data.year,
              month: that.data.month,
              day: that.data.day,
              weekday: that.data.weekday,
              hour: that.data.hour,
              minute: 0


            }, success: function (res) {
              //console.log("add date success:");
              if (res.statusCode == 200 && res.data[0].result == 'success') {
                that.pageBookingId = res.data[0].id;
                //show booked item info

                wx.redirectTo({
                  url: '/page/booking/qrBookingDetails?isNew=true&bookingId=' + res.data[0].id,
                })
              } else {
                wx.showModal({
                  title: '系统提示',
                  content: '错误：' + JSON.stringify(res),
                })
              }
            },
            fail: function (err) {
              wx.showModal({
                title: '系统提示',
                content: '错误：' + JSON.stringify(err),
              })
            }
          })

          //update real_name
          if (that.data.mobile != that.data.myInfo.mobile || that.data.real_name != that.data.myInfo.real_name) {
            console.log("update user real_name and mobile :" + that.data.mobile);
            //update new user info
            wx.request({
              url: getApp().globalData.SERVER_URL + '/user/update',
              method: 'put',
              data: {
                userid: getApp().globalData.userid,
                real_name: that.data.real_name,
                mobile: that.data.mobile
              },
              success: function (res) {
                console.log("userid2:" + res.data[0].userid);

              }
            });
          }

        } else {

          return;
        }
      }
    })



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
        var mobileUserInfo = res.data[0].myInfo;
        //console.log("mobileUserInfo:" + JSON.stringify(mobileUserInfo));

        if (result === 'success') {
          if (mobileUserInfo.unionid == '' && that.data.myInfo.mobile == '') {
            //show mobile userinfo and merge userInfo
            wx.showModal({
              title: '信息确认',
              content: '你的姓名是' + mobileUserInfo.real_name + '，手机号是：' + mobileUserInfo.mobile + '吗？',
              success: function (res) {
                if (res.confirm) {
                  let myInfo = that.data.myInfo;
                  myInfo.real_name = mobileUserInfo.real_name;
                  myInfo.mobile = mobileUserInfo.mobile;
                  that.setData(
                    { myInfo: myInfo }
                  );
                  //merge userinfo
                  wx.request({
                    url: getApp().globalData.SERVER_URL + '/user/mergeUnionid2mobileid',
                    method: 'put',
                    data: {
                      userid: mobileUserInfo.userid,
                      unionid: getApp().globalData.unionid,
                      openid: getApp().globalData.openid,
                      nick_name: getApp().globalData.nickName,
                      icon: getApp().globalData.icon,
                      gender: getApp().globalData.gender
                    },
                    success: function (res) {
                      //console.log("userid:" + res.data[0].userid);
                      //set userid 2 Storage
                      getApp().reloadUserInfo();
                      that.setData(
                        { mobileIsReady: true }
                      );
                      wx.showModal({
                        title: '系统提示',
                        content: '更新手机号成功',
                        showCancel: false

                      });
                    }
                  });
                } else {
                  return;
                }
              }
            })

          } else {
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
          }

          return;
        } else {
          that.setData(
            { mobileIsReady: true }
          )
        }

      }
    });

  },
  inputRealName: function (e) {
    this.setData({
      real_name: e.detail.value
    });
  },
  inputMobile: function (e) {

    //Check for the correct phone number
    var mobile = e.detail.value;
    if (mobile.length == 11) {

      var myreg = /^((1)+\d{10})$/
      if (myreg.test(mobile)) {
        // console.log("mobile:" + mobile);
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
    wx.stopPullDownRefresh();
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