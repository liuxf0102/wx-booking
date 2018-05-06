// page/me/settingTime.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    hour_format: '上午8点',
    pickerTimeArray: ["早上6点", "早上7点", "上午8点", "上午9点", "上午10点", "上午11点", "中午12点", "下午1点", "下午2点", "下午3点", "下午4点", "下午5点", "晚上6点", "晚上7点", "晚上8点", "晚上9点", "夜里10点"],
    config: {},
    timeCapacities: [{ 'h': 8, 'c': 1 }, { 'h': 9, 'c': 2 }],
    timeCapacity: 1,
    hour: 8,
    config: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = wx.getStorageSync('MY_INFO');
    console.log("userid:" + myInfo.userid);
    let strConfig = myInfo.config;
    if (strConfig == '') {
      strConfig = "{}";
    }
    let config = JSON.parse(strConfig);
    let timeCapacities = [];
    if (config.hour_capacity) {
      timeCapacities = config.hour_capacity;
      if (timeCapacities.length==0)
      {
        timeCapacities = getApp().globalData.BOOKING_HOUR_CAPACITY_DEFAULT;
      }
    }else{
      timeCapacities = getApp().globalData.BOOKING_HOUR_CAPACITY_DEFAULT;
    } 
    console.log("config:" + JSON.stringify(config));
    timeCapacities.sort(function (a, b) {
      return a.h - b.h;
    })
    this.setData({
      config: config,
      timeCapacities: timeCapacities
    });


  },
  bindDateChange: function (e) {
    let that = this;
    // if(true)
    // return; 
    console.log("selectedData:" + e.detail.value);
    let hour = this.data.hours[e.detail.value];
    let hour_format = this.data.pickerTimeArray[e.detail.value];
    that.setData({
      hour: hour,
      hour_format: hour_format
    });
  },
  bindAddTimeCapacity: function (e) {

    var that = this;
    let hour = this.data.hour;
    let timeCapacities = this.data.timeCapacities;
    let timeCapacity = this.data.timeCapacity;
    let hourCapacity = {};
    console.log("hour:" + hour + ":capacity" + timeCapacity);
    hourCapacity.h = hour;
    hourCapacity.c = timeCapacity;

    this.removeHourCapactiy(timeCapacities, hour);
    timeCapacities.push(hourCapacity);

    let config = this.data.config;
    config.hour_capacity = timeCapacities;
    console.log("config" + JSON.stringify(config));
    timeCapacities.sort(function(a,b){
      return a.h-b.h;
    })
    //发起网络请求 
    this.setData({
      timeCapacities: timeCapacities
    });


  },
  removeHourCapactiy: function (hourArray, hour) {
    let i = hourArray.length;

    while (i--) {
      //console.log(hour + ":" + i + "=" + hourArray[i].h);
      if (hour === hourArray[i].h) {
        hourArray.splice(i, 1);
      }
    }

  },

  tapDelete: function (e) {
    let theValue = e.target.dataset.propclass;
    console.log("delete:" + theValue);
    let tmpTimeCapacities = this.data.timeCapacities;
    this.removeHourCapactiy(tmpTimeCapacities, theValue);
    console.log("tmpTimeCapacities:" + JSON.stringify(tmpTimeCapacities));
    let config = this.data.config;
    config.hour_capacity = tmpTimeCapacities;
    console.log("config" + JSON.stringify(config));

    this.setData({
      timeCapacities: tmpTimeCapacities
    });
  },
  bindSave: function (e) {

    var that = this;
    let config = this.data.config;
    let userid = getApp().globalData.userid;
    console.log("userid:" + userid);
    console.log("config:" + JSON.stringify(config));
    //发起网络请求 
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/update',
      method: 'put',
      data: {
        userid: userid,
        config: JSON.stringify(config)
      },
      success: function (res) {
        console.log("userid:" + res.data[0]);
        that.setData({
          buttonIsReady: false
        });


        //set userid 2 Storage
        wx.showToast({
          title: '设置预约时间成功。',
        });

        getApp().reloadUserInfo();


      }
    });

  },
  inputTimeCapacity: function (e) {
    if (e.detail.value.length >= 1) {
      this.setData({
        timeCapacity: e.detail.value,

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