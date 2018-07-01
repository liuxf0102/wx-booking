// page/me/settingTime.js
let page_day = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    hour_format: '上午8点',
    pickerTimeArray: ["早上6点", "早上7点", "上午8点", "上午9点", "上午10点", "上午11点", "中午12点", "下午1点", "下午2点", "下午3点", "下午4点", "下午5点", "晚上6点", "晚上7点", "晚上8点", "晚上9点", "夜里10点"],

    timeCapacities: [],
    timeCapacity: 1,
    hour: 8,
    theSelectedDay:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let myInfo = wx.getStorageSync('MY_INFO');
    let config = myInfo.config;
    console.log("userid:" + myInfo.userid);
    console.log("config:" + JSON.stringify(config));
    let timeCapacities = getApp().globalData.BOOKING_HOUR_CAPACITY_DEFAULT;
    if (config.hour_capacity) {
      timeCapacities = config.hour_capacity;
    }

    timeCapacities.sort(function (a, b) {
      return a.h - b.h;
    })
   
    if (options.day) {
      page_day = options.day;
    }
    this.setData({
      timeCapacities: timeCapacities,
      theSelectedDay: page_day
    });
    this.getUserRotaData();
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


    timeCapacities.sort(function (a, b) {
      return a.h - b.h;
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

    this.setData({
      timeCapacities: tmpTimeCapacities
    });
  },
  getUserRotaData() {
    let userid = getApp().globalData.userid;
    console.log("userid:" + userid);
    if (userid == "") {
      console.error("userid is empty");
      return;
    }
    let that = this;
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/rota/list',
      method: 'post',
      data: {
        userid: userid,
        day: page_day

      }, success: function (res) {
        console.log(res.data[0]);
        if (res.data[0].result == "success") {
          if (res.data[0].data.length == 1) {
            let strTimeCapacities = res.data[0].data[0].memo;
            console.log("strTimeCapacities:" + strTimeCapacities);
            if (strTimeCapacities != "") {
              let timeCapacities = (JSON.parse(strTimeCapacities)).hour_capacity;
              if (timeCapacities){
              that.setData({
                timeCapacities: timeCapacities
              });
              }
            }
          }
        }

      },
      fail: function (err) {
        wx.showToast({
          title: '系统提示:' + err,
        })
      }, complete: function (res) {
        wx.hideLoading();
      }
    })
  },
  bindSave: function (e) {

    var that = this;
    let timeCapacities = this.data.timeCapacities;
    let userid = getApp().globalData.userid;
    console.log("userid:" + userid);
    let hourCapacity={};
    hourCapacity.hour_capacity = timeCapacities;
    console.log("timeCapacities:" + JSON.stringify(hourCapacity));
    //发起网络请求 
    let day = page_day;
    let flag = "自"
    wx.request({
      url: getApp().globalData.SERVER_URL + '/rota/updateOrCreate',
      method: 'put',
      data: {
        userid: getApp().globalData.userid,
        day: day,
        flag: flag,
        memo: JSON.stringify(hourCapacity)
      }, success: function (res) {
        //console.log("add date success:");
        if (res.statusCode == 200 && res.data[0].result == 'success') {
          //show booked item info
          wx.showModal({
            title: '系统提示',
            content: '更新成功',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({

                });

                getApp().globalData.FLAG_RELOAD=true;
              }
            }
          });

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