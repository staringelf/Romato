const fs = require('fs');

exports.moment = require('moment');

exports.slug = require('slugs');

//A handy debugging utility
exports.show = (obj) => JSON.stringify(obj, null, 2);

//inserting an svg
exports.icon = (name) => fs.readFileSync(`public/images/icons/${name}.svg`);

exports.isEmpty = (obj) => {
    for(const key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};

exports.formatTime = (timeStr) => {
  const timeArr = timeStr.split(':');
  timeArr[0] = timeArr[0]%12;
  const newTimeStr = timeArr.join(':');
  return newTimeStr;
}

exports.projectName = 'Romato' || 'Oishi';