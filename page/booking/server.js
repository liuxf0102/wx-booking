const refreshBooking=function(userid,cb)  {
  
  console.log("userid:" + userid);
  //发起网络请求 restAPI dates
  wx.request({
    url: getApp().globalData.SERVER_URL + '/booking/list',
    method: 'post',
    data: {
      userid: userid

    }, success: function (res) {
      //console.log(res);
      //that.setData({
      //  bookings: res.data[0].data
      //});
      wx.setStorageSync(getApp().SCONST.BOOKING, res.data[0].data);
      console.log("refreshBooking finished.");
      cb();
     
    }
  })

}

module.exports = {
  refreshBooking: refreshBooking
}