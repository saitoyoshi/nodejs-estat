'use strict';
const fs = require('fs');
const readline = require('readline');
const srcPath = './popu_source.csv';
const dstPath = './popu_ranking.txt'
// ファイルを読み込むStream
const rs = fs.createReadStream(srcPath);
// Streamを行単位に読み込むオブジェクト
const rl = readline.createInterface({input : rs});
const rows = new Map();
rl.on('line', lineString => {
  // ダブルクオートを取り除く
  lineString =  lineString.replaceAll('\"',"");
  // カンマで配列に分割する
  const arr = lineString.split(',');
  if (!(arr[1] === '男女計' && arr[3] === '総人口' && arr[5] !== '総数')) {
    return;
  }
  const ageStr = arr[5];
  const value = parseInt(arr[11]);
  let age = ageStr.replace(/歳|以上/g, '');
  age = parseInt(age);
  let period = Math.floor(age * 0.1) / 0.1;
  let text = null;
  if (period === 0) {
    text = '10歳未満';
  } else if (period === 100) {
    text = '100歳以上';
  } else {
    text = period + '代'
  }
  if (!rows.has(text)) {
    rows.set(text, value);
  } else {
    rows.set(text, rows.get(text) + value);
  }
}).on('close', () => {
  const resultArr = Array.from(rows);
  resultArr.sort(function (a, b) {
    return b[1] - a[1];
  });
  let i = 1;
  for (const row of resultArr) {
    console.log(row);
    fs.appendFileSync(dstPath, `${i}位: ${row[0]} ${row[1]}\n`, 'utf8');
    i++;
  }
});
