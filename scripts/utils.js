exports.JSONStringify = (data) => JSON.stringify(data, null, 2)

exports.thousands = (num) => {
  var str = num.toString()
  var reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
  return str.replace(reg, '$1,')
}
