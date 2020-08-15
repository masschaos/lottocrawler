/**
 * @Author: maple
 * @Date: 2020-08-16 00:32:04
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 03:51:02
 */
const fs = require('fs')
const util = require('util')
const path = require('path')
const moment = require('moment')

// const jokerGet = require('./jokerplus')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// const translation = '抽奖年份;抽奖日;开彩日期;在周期中画数字;止赎日期;球1;球2;球3;球4;球5;星1;星2;升序赢球;升序获胜;法国第1亿欧元大赛的获胜者数量;欧洲排名第一的百万欧元获奖者数量;排名报告1百万欧元;百万欧元排名法国排名第二的获胜者;欧洲百万富翁数量在欧洲排名第二;排名报告2百万欧元;法国排名3百万欧元的获奖者人数;欧洲百万富翁数量在欧洲排名第三;排名报告3百万欧元;法国排名第4的欧洲百万大奖获奖人数;欧洲排名第4的欧洲百万大奖获奖人数;排名报告4百万欧元;该行的获奖人数5法国百万欧元;该行中的获奖者数量欧洲5百万欧元;排名报告5百万欧元;欧洲百万富翁排名法国的6位获奖者;欧洲百万富翁数量在欧洲排名第6位获胜者;排名报告6百万欧元;法国排名7百万欧元的获奖者数量;欧洲排名7的欧洲百万富翁中的获胜者数量;排名报告7百万欧元;法国排名第8的欧洲百万大奖获奖人数;欧洲排名第8的欧洲百万大奖获奖人数;排名报告8百万欧元;法国排名第9的欧洲百万大奖获奖人数;欧洲百万富翁数量在欧洲排名第9位获胜者;排名报告9百万欧元;法国排名前10的欧洲百万富翁的获奖人数;欧洲排名前10位的百万欧元获奖者数量;排名报告10百万欧元;法国获奖者排名11百万欧元;欧洲获奖者排名11百万欧元;排名报告11百万欧元;法国获奖者排名12百万欧元;欧洲获奖者排名12百万欧元;排名报告12百万欧元;法国获奖者排名13百万欧元;欧洲获奖者排名13百万欧元;排名报告13百万欧元;1星以上的获胜者数量+;排名报告1星+;2星以上的获胜者数量+;排名报告2星+;3星以上的获胜者数量+;排名报告3星+;4星以上的获胜者数量+;排名报告4星+;5星以上的获胜者数量+;排名报告5星+;6星以上的获胜者数量+;排名报告6星+;Etoile排名7的获胜者数量+;排名报告7星+;8星以上的获胜者数量+;排名报告8星+;9星以上的获胜者数量+;排名报告9星+;10星以上的获胜者数量+;排名报告10星+;我的百万号码;欧元百万特别开奖号码'.split(';')
// function test (firstline, line) {
//   console.log(firstline)
//   const ts = firstline.split(';')
//   const tmps = line.split(';')

//   for (let i = 0; i < translation.length; i++) {
//     console.log(`${i}. [${ts[i]}] - ${translation[i]}: ${tmps[i]}`)
//   }
// }

async function lineDeal (line) {
  const result = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    breakdown: [
      {
        name: 'main',
        detail: [
          [
            {
              name: 'Bons n°',
              value: '5+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '0'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '/'
            },
            {
              name: 'Gains EuroMillions®',
              value: '/'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '/'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '5+1'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '0'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '2'
            },
            {
              name: 'Gains EuroMillions®',
              value: '293190,70€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '0'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '5'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '0'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '2'
            },
            {
              name: 'Gains EuroMillions®',
              value: '68523,50€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '/'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '4+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '2'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '31'
            },
            {
              name: 'Gains EuroMillions®',
              value: '1376,90€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '0'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '4+1'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '88'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '530'
            },
            {
              name: 'Gains EuroMillions®',
              value: '148,30€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '28'
            },
            {
              name: 'Gains Etoile+',
              value: '79,80€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '228,10€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '3+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '284'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '1726'
            },
            {
              name: 'Gains EuroMillions®',
              value: '48,10€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '88'
            },
            {
              name: 'Gains Etoile+',
              value: '9,00€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '57,10€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '4'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '211'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '1237'
            },
            {
              name: 'Gains EuroMillions®',
              value: '47,20€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '/'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '2+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '5030'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '26334'
            },
            {
              name: 'Gains EuroMillions®',
              value: '11,00€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '1644'
            },
            {
              name: 'Gains Etoile+',
              value: '1,20€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '12,20€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '3+1'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '4797'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '27592'
            },
            {
              name: 'Gains EuroMillions®',
              value: '11,80€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '1670'
            },
            {
              name: 'Gains Etoile+',
              value: '3,20€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '15,00€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '3'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '10771'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '59707'
            },
            {
              name: 'Gains EuroMillions®',
              value: '10,10€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '/'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '1+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '27703'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '144296'
            },
            {
              name: 'Gains EuroMillions®',
              value: '5,00€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '9458'
            },
            {
              name: 'Gains Etoile+',
              value: '2,60€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '7,60€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '0+2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '/'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '/'
            },
            {
              name: 'Gains EuroMillions®',
              value: '/'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '14940'
            },
            {
              name: 'Gains Etoile+',
              value: '7,80€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '7,80€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '2+1'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '80775'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '435472'
            },
            {
              name: 'Gains EuroMillions®',
              value: '5,30€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '27688'
            },
            {
              name: 'Gains Etoile+',
              value: '2,30€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '7,60€'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '2'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '173340'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '916256'
            },
            {
              name: 'Gains EuroMillions®',
              value: '4,00€'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '/'
            },
            {
              name: 'Gains Etoile+',
              value: '/'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '/'
            }
          ],
          [
            {
              name: 'Bons n°',
              value: '0+1'
            },
            {
              name: 'Grilles gagnantes en France',
              value: '/'
            },
            {
              name: 'Grilles gagnantes en Europe',
              value: '/'
            },
            {
              name: 'Gains EuroMillions®',
              value: '/'
            },
            {
              name: 'Grilles gagnantes Etoile+',
              value: '236254'
            },
            {
              name: 'Gains Etoile+',
              value: '2,40€'
            },
            {
              name: 'Gains EuroMillions® Etoile+',
              value: '2,40€'
            }
          ]
        ]
      }
    ],
    other: [],
    name: 'EuroMillions-My million',
    lotteryID: 'fr-euromillions-my-million',
    issue: ''
  }

  result.breakdown[0].detail.forEach(function (value, index) {
    // console.log(value)
    for (let i = 0; i < value.length; i++) {
      if (i === 0) {
        continue
      }
      value[i].value = null
    }
  })

  const tmps = line.split(';')

  // console.log(tmps[2])
  // date
  const dateTmps = tmps[2].split('/')
  const date = moment()
  date.set('years', parseInt(dateTmps[2]))
  date.set('months', parseInt(dateTmps[1]) - 1)
  date.set('date', parseInt(dateTmps[0]))
  result.drawTime = date.format('YYYYMMDD210500')

  // // numbers
  // const joker = await jokerGet.joker(date.format('YYYY-MM-DD'))
  // const nums = [tmps[4], tmps[5], tmps[6], tmps[7], tmps[8]].sort()
  result.numbers = `${tmps[12].split('-').filter(s => s).join(',')}|${tmps[13].split('-').filter(s => s).join(',')}|${tmps[73].replace(/ /g, '')}`

  // breakdown
  let j = 0
  for (let i = 14, k = 53; j < 15; i += 3, j++, k += 2) {
    let status = true
    if ([0, 2, 6, 9, 13].indexOf(j) > -1) {
      status = false
    }

    let n = parseInt(tmps[i])
    let t = parseInt(tmps[i + 1])
    let u = tmps[i + 2]

    if (j === 11 || j === 14) {
      n = '/'
      t = '/'
      u = '/'
      i -= 3
    }

    if (n === 0 && t === 0) {
      u = '/'
    }

    if (t === 0) {
      t = '/'
    }

    let a = parseInt(tmps[k])
    let b = tmps[k + 1]
    if (a === 0 && t === '/') {
      a = '/'
    }
    if (b === '0') {
      b = '/'
    }
    let c = t === '/' ? b : parseFloat(b.replace(',', '.')) + parseFloat(u.replace(',', '.'))
    // console.log(b, u)
    if (b === '/') {
      c = '/'
    }

    if (a === 0 && b === 0) {
      c = '/'
    }
    result.breakdown[0].detail[j][1].value = n.toString()
    result.breakdown[0].detail[j][2].value = t.toString()
    result.breakdown[0].detail[j][3].value = u === '/' ? '/'
      : `${parseFloat(u.replace(',', '.')).toFixed(2).replace('.', ',')}€`

    if (status) {
      result.breakdown[0].detail[j][4].value = a.toString()
      result.breakdown[0].detail[j][5].value = b === '/' ? '/'
        : `${parseFloat(b.replace(',', '.')).toFixed(2).replace('.', ',')}€`
      result.breakdown[0].detail[j][6].value = c === '/' ? '/'
        : `${parseFloat(c.toString().replace(',', '.')).toFixed(2).replace('.', ',')}€`
    } else {
      k -= 2
      result.breakdown[0].detail[j][4].value = '/'
      result.breakdown[0].detail[j][5].value = '/'
      result.breakdown[0].detail[j][6].value = '/'
    }
  }

  // result.breakdown[0].detail[j][1].value = result.breakdown[0].detail[j - 1][1].value
  // result.breakdown[0].detail[j][2].value = result.breakdown[0].detail[j - 1][2].value

  // for (let i = 38, j = 0; i < 45; i += 2, j++) {
  //   const n = parseInt(tmps[i])
  //   let t = tmps[i + 1]
  //   if (n === 0) {
  //     t = '/'
  //   }

  //   result.breakdown[1].detail[j][1].value = n.toString()
  //   result.breakdown[1].detail[j][2].value = t === '/' ? '/'
  //     : `${parseFloat(t.replace(',', '.')).toFixed(2).replace('.', ',')}€`

  //   result.other[0].value = tmps[31].replace(/ /g, '').split(',').sort().join('|')
  // }

  return result
}

async function main (filename) {
  const text = await readFile(path.join('csv', filename), 'utf-8')
  const lines = text.split('\n')

  console.log(`文件数量: ${lines.length - 1}`)

  // test(lines[0], lines[2])

  const list = []
  for (const line of lines.slice(1)) {
    if (line.length < 10) continue
    const data = await lineDeal(line)
    // await writeFile('test.json', JSON.stringify(data, 2, ' '))
    list.push(data)
    // break
  }
  return list
  // await writeFile(path.join('result', 'euro.json'), JSON.stringify(list))
}

// main('euromillions_202002.csv')

async function done () {
  const list1 = await main('euromillions_202002.csv')
  const list2 = await main('euromillions_201902.csv')
  await writeFile(path.join('result', 'euro.json'), JSON.stringify(list1.concat(list2)))
}

done()
