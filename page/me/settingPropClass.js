// page/me/settingPropClass.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myInfo: {},
    prop_classes: [],
    newPropClass: '',
    config:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = wx.getStorageSync('MY_INFO');
    let prop_classes = getApp().globalData.BOOKING_PROP_CLASSES;
    if (prop_classes.length==0)
    {
      prop_classes = getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT;
    }
    let strConfig = myInfo.config;
    if (strConfig == '') {
      strConfig = "{}";
    }
    let config = JSON.parse(strConfig);
    this.setData({
      myInfo: myInfo,
      prop_classes: prop_classes,
      config:config
    });
  },
  bindUpdateUserInfo: function (e) {

    var that = this;

    let config = this.data.config;
    config.prop_classes = this.data.prop_classes;
    console.log("this.data.prop_classes" + JSON.stringify(this.data.prop_classes));
    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/update',
      method: 'put',
      data: {
        userid: that.data.myInfo.userid,
        config: JSON.stringify(config)
      },
      success: function (res) {
        console.log("userid:" + res.data[0].userid);
        that.setData({
          newPropClass: '',
          buttonIsReady: false
        });

        getApp().globalData.BOOKING_PROP_CLASSES = that.data.prop_classes;
        //set userid 2 Storage
        wx.showToast({
          title: '更新用户信息成功',
        });

        getApp().reloadUserInfo();


      }
    });

  },

  tapDeletePropClass: function (e) {
    let theValue = e.target.dataset.propclass;
    console.log("deletPropClass:" + theValue);
    let tmp_prop_classes = this.data.prop_classes;
    this.removeByValue(tmp_prop_classes, theValue);

    this.setData({
      prop_classes: tmp_prop_classes,
      buttonIsReady: true
    })


  },
  removeByValue: function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == val) {
        arr.splice(i, 1);
        break;
      }
    }
  },
  inputPropClass: function (e) {
    //console.log("e.detail.value:" + e.detail.value);
    if (e.detail.value.length >= 1) {
      let tmp_prop_classes = e.detail.value;
      this.setData({
        newPropClass: tmp_prop_classes,
        buttonIsReady: true
      })
    }


  },

  tapAddPropClass: function (e) {
    if (this.data.newPropClass.length >= 1) {
      let tmp_prop_classes = this.data.prop_classes;
      if (tmp_prop_classes.length >= 6) {
        wx.showModal({
          title: '系统提示',
          content: '预约本类型最多能设置6个.',
        })
      } else {
        tmp_prop_classes.push(this.data.newPropClass);
      }
      this.setData({
        prop_classes: tmp_prop_classes,
        newPropClass:'',
        buttonIsReady: true
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