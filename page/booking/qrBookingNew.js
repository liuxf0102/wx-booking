// page/booking/qrBookingNew.js
let util = require('../../util/util.js');
let m_login = require('m_login.js');
var sliderWidth = 96
Page({
  pageUserid1: "",
  pageScene: '900',
  pageSelectedTime:'',

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
    userInfo2RealNameIsReady: false,
    userInfo2MobileIsReady: false,
    userInfo1: {},
    myInfo: {},
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [6,7,8, 9, 10,11,12,13, 14, 15,16,17,18,19,20,21,22],
    hour_format: '上午8点',
    hourLabels: ["早上6点", "早上7点", "上午8点", "上午9点", "上午10点", "上午11点", "中午12点", "下午1点", "下午2点", "下午3点", "下午4点", "下午5点", "晚上6点", "晚上7点", "晚上8点", "晚上9点", "夜里10点"],
    pickerTimeArray: [],
    pickerTimeArrayDay: [],
    selectedTimeArray: [7, 2],
    memo2: "",
    prop_class: "未知",
    prop_classes: [],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (options.userid1) {
      this.pageScene = options.userid1;
    }
    console.log("scene:" + this.pageScene);
    let myInfo = wx.getStorageSync('MY_INFO') || {};
    if (myInfo.userid) {
      console.log("getUnionid userid from storage.");
      getApp().initGlobalData(myInfo);
      let userInfo2MobileIsReady = false;
      if (myInfo.mobile.length > 0) {
        userInfo2MobileIsReady = true;
      }
      this.setData({
        myInfo: myInfo,
        userInfo2MobileIsReady: userInfo2MobileIsReady
      });


    } else {
      m_login.login(function (myInfo) {


        let userInfo2MobileIsReady = false;
        if (myInfo.mobile.length > 0) {
          userInfo2MobileIsReady = true;
        }
        that.setData({
          userInfo2MobileIsReady: userInfo2MobileIsReady
        });

      });
    }
    if (options.selectedTime) {
      this.pageSelectedTime = options.selectedTime;
      console.log("this.pageSelectedTime:" + this.pageSelectedTime);
    }
    this.initQrcodeScene();
    this.initSelectedTime();
    this.initPropClass();
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

  initQrcodeScene: function () {

    let that = this;
    if (this.pageScene !== '') {
      wx.showLoading({
        title: '数据加载中...',
      })
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
          wx.hideLoading();
          if (res.statusCode == 200 && res.data[0].result == 'success') {

            console.log("userid1 real_name:" + res.data[0].myInfo.real_name);
            let strConfig = res.data[0].myInfo.config;
            if (strConfig == '') {
              strConfig = "{}";
            }
            let config = JSON.parse(strConfig);
            if (config.prop_classes && config.prop_classes.length > 0) {
              let prop_classes = config.prop_classes;
              that.setData({
                prop_classes: prop_classes
              });
            }

            //set userid1Info to storage
            wx.setStorageSync("USERID1_INFO", res.data[0].myInfo);

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

  
  initSelectedTime: function () {
    let curDate = new Date();
    curDate.setDate(curDate.getDate() + 1);
    let weekday = curDate.getDay();
    if (weekday == 0) {
      weekday = 7;
    }
    let year = curDate.getFullYear();
    let month =  (curDate.getMonth() + 1);
    let day = curDate.getDate();
    let hour="8";
    if(this.pageSelectedTime.length>0){
      var theSelectedTime = this.pageSelectedTime.split(",");
      if (theSelectedTime.length==5){
      year = theSelectedTime[0];
      month = theSelectedTime[1];
      day = theSelectedTime[2];
      hour = theSelectedTime[3];
      weekday = theSelectedTime[4];
      }
      this.setData({
        date: year + "/" + month + "/" + day,
        year: year,
        month: month,
        month_format: month + "月",
        day: day,
        day_format: day + "号",
        weekday: weekday,
        hour: hour,
        hour_format: util.formatHour(hour),
        weekday_format: util.formatWeekday(weekday),
      })
    }else{
      this.setData({
        date: year + "/" + month + "/" + day,
        year: year,
        month: month,
        month_format: "",
        day: day,
        day_format:"",
        weekday: "",
        hour: hour,
        hour_format: "",
        weekday_format: "请选择预约时间",
      })
    }

    
  },
  bindDateChange: function (e) {
    //console.log("ddd");
    wx.redirectTo({
      url: '/page/booking/qrBookingTime?source=qrBookingNew&userid1=' + this.pageUserid1,
    })
  },

  bindNewBookingQR: function (e) {
    var that = this;
    //console.log("formids:"+JSON.stringify(getApp().globalData.formids));
    if(this.data.weekday=="")
    {
      wx.showModal({
        title: '系统提示：',
        content: '请先选择预约时间.',
      })
      return;
    }


    wx.showModal({
      title: '预约信息确认',
      content: ' 对方姓名:' + this.data.userInfo1.real_name + '\n\r时间:' + this.data.weekday_format + ' ' + this.data.month + '月' + this.data.day + '号 ' + this.data.hour_format + '\n\r预约类型:' + this.data.prop_class,
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
              minute: 0,
              memo2: that.data.memo2,
              prop_class: that.data.prop_class


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
                //reload userInfo
                m_login.login(function (myInfo) {
                  getApp().initGlobalData(myInfo);

                  let userInfo2MobileIsReady = false;
                  if (myInfo.mobile.length > 0) {
                    userInfo2MobileIsReady = true;
                  }
                  that.setData({
                    myInfo: myInfo,
                    userInfo2MobileIsReady: userInfo2MobileIsReady
                  });
                  //set myInfo 2 storage
                  wx.setStorageSync('MY_INFO', myInfo);
                });

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
                        { userInfo2MobileIsReady: true }
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
            { userInfo2MobileIsReady: true }
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
  inputMemo2: function (e) {
    this.setData({
      memo2: e.detail.value
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
        userInfo2MobileIsReady: false
      });
    }
    this.setData({
      mobile: mobile
    });


  },
  initPropClass: function (e) {
    var that = this;
    //console.log("tapPropClass:"+JSON.stringify(e));

    let prop_classes = getApp().globalData.BOOKING_PROP_CLASSES;
    if (prop_classes.length == 0) {
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }

    that.setData({
      prop_class: prop_classes[0]
    });


  },

  tapPropClass: function (e) {
    var that = this;
    //console.log("tapPropClass:"+JSON.stringify(e));

    let prop_classes = this.data.prop_classes;
    if (prop_classes.length == 0) {
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }
    wx.showActionSheet({
      itemList: prop_classes,
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        let prop_class = prop_classes[res.tapIndex];
        if (!res.cancel) {
          that.setData({
            prop_class: prop_classes[res.tapIndex]
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  formSubmit: function (e) {
    var that = this
    //console.log("formid:"+e.detail.formid);
    let formid = e.detail.formId;
    getApp().formidCollect(formid);
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
    getApp().formids2Server();
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