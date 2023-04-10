'use strict';
const fs = require('fs');
const readline = require('readline');
// 読み込み用のCSVファイル
const srcPath = './popu_source.csv';
// 出力用のテキストファイル
const dstPath = './popu_ranking.txt'
// ファイルを読み込むStream
const rs = fs.createReadStream(srcPath);
// Streamを行単位に読み込むオブジェクト
const rl = readline.createInterface({input : rs});
// 年代別の連想配列　[年代 => 総人口]
const rows = new Map();

rl.on('line', lineString => {
  // ダブルクオートを取り除く
  lineString = lineString.replaceAll('\"',"");
  // カンマで配列に分割する
  const arr = lineString.split(',');
  // ガード句で不必要な行は飛ばす
  if (!(arr[1] === '男女計' && arr[3] === '総人口' && arr[5] !== '総数')) {
    return;
  }
  const ageStr = arr[5];
  let age = ageStr.replace(/歳|以上/g, '');
  age = parseInt(age);
  // 年齢の数値の１桁目の切り捨てが年代の数値となる
  let period = Math.floor(age * 0.1) / 0.1;
  let text = null;
  if (period === 0) {
    text = '10歳未満';
  } else if (period === 100) {
    text = '100歳以上';
  } else {
    text = period + '代'
  }
  // 人口の集計
  const value = parseInt(arr[11]);
  if (!rows.has(text)) {
    rows.set(text, value);
  } else {
    rows.set(text, rows.get(text) + value);
  }
}).on('close', () => {
  const resultArr = Array.from(rows);
  // 人口多い順（降順に並べ替え）
  resultArr.sort(function (a, b) {
    return b[1] - a[1];
  });
  fs.appendFileSync(dstPath, `2019年10月1日現在の年代別総人口ランキング [千人]\n`, 'utf8');
  let i = 1;
  for (const row of resultArr) {
    // console.log(row);
    fs.appendFileSync(dstPath, `${i}位: ${row[0]} ${row[1]}\n`, 'utf8');
    i++;
  }
});
