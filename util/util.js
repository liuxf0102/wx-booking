const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();


  return [year, month, day].map(formatNumber).join('-');
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatHour = hour => {
  hour = hour.toString();
  let map = new Map();
  map.set("8", "上午8点");
  map.set("9", "上午9点");
  map.set("10", "上午10点");
  map.set("13", "下午1点");
  map.set("14", "下午2点");
  map.set("15", "下午3点");
  // console.log("hour:"+hour);
  if (map.has(hour)) {
    return map.get(hour);
  } else {
    console.warn("formatHour warnning:" + hour);
    return "";
  }
}


const formatWeekday = week => {
  week = week.toString();
  let map = new Map();
  map.set("1", "周一");
  map.set("2", "周二");
  map.set("3", "周三");
  map.set("4", "周四");
  map.set("5", "周五");
  map.set("6", "周六");
  map.set("7", "周日");

  if (map.has(week)) {
    return map.get(week);
  } else {
    console.warn("formatWeek warnning:" + week);
    return "";
  }
}

const formatBookingStatus = n => {
  n = n.toString();
  let map = new Map();
  map.set("0", "待审核");
  map.set("1", "审核通过");
  map.set("-1", "已取消");
  map.set("3", "用户爽约");
  map.set("4", "已完成");
  //console.log("n:" + n);
  if (map.has(n)) {
    return map.get(n);
  } else {
    console.warn("formatWeek warnning:" + n);
    return "";
  }
}
const formatBookingClass = n => {
  n = n.toString();
  let map = new Map();
  map.set("0", "修复");
  map.set("1", "治疗");
  map.set("2", "拔牙");
  map.set("3", "洗牙");
  map.set("4", "换药");
  //console.log("n:" + n);
  if (map.has(n)) {
    return map.get(n);
  } else {
    console.warn("formatWeek warnning:" + n);
    return "未知";
  }
}


module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatHour: formatHour,
  formatWeekday: formatWeekday,
  formatBookingStatus: formatBookingStatus,
  formatBookingClass: formatBookingClass
}
