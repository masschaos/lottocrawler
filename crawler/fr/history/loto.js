/**
 * @Author: maple
 * @Date: 2020-08-16 00:32:04
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 02:48:30
 */
const fs = require('fs')
const util = require('util')
const path = require('path')
const moment = require('moment')
const jokerGet = require('./jokerplus')
const log = require('../../../util/log')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// const translation = '抽奖年份;抽奖日;开彩日期;止赎日期;球1;球2;球3;球4;球5;幸运数字;升序组合;第1行获胜者的数量;排名报告1;排名第2的获胜者数;排名报告2;第3行获奖者人数;排名报告3;第4行获奖者人数;排名报告4;行获奖人数5;排名报告5;行获奖人数6;排名报告6;行优胜者数量7;排名报告7;行优胜者数量8;排名报告8;行优胜者数量9;排名报告9;中奖号码;获奖代码报告;获奖代码;球1秒平局;球2平局;球3秒平局;球4秒平局;球5秒平局;获胜组合第二次抽奖;1秒平局的获胜者数量;行报告1次抽奖;第2次平局的获胜者数量;第二次抽奖Rank2报告;3秒平局中奖人数;等级比率3次抽奖;第4次抽奖中的获胜者数量;排名报告4次抽签;百搭加数字;座右铭'.split(';')
// function test (firstline, line) {
//   log.debug(firstline)
//   const ts = firstline.split(';')
//   const tmps = line.split(';')

//   for (let i = 0; i < translation.length; i++) {
//     log.debug(`${i}. [${ts[i]}] - ${translation[i]}: ${tmps[i]}`)
//   }
// }

async function lineDeal (line) {
  const result = {
    drawTime: null,
    numbers: '3, 17, 30, 44, 47| 3 | 9262171 | 15, 25, 28, 42, 44',
    jackpot: [],
    breakdown: [
      {
        name: 'Tirage loto',
        detail: [
          [
            {
              name: 'Bons n°', value: '5+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '5'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '4+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '4'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '3+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '3'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '2+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '2'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '1+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '0+1'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ]
        ]
      },
      {
        name: 'Option 2nd tirage',
        detail: [
          [
            {
              name: 'Bons n°', value: '5'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '4'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: '618,30€'
            }
          ],
          [
            {
              name: 'Bons n°', value: '3'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ],
          [
            {
              name: 'Bons n°', value: '2'
            },
            {
              name: 'Grilles gagnantes* Loto®', value: null
            },
            {
              name: 'Gains par grille gagnantes* Loto®', value: null
            }
          ]
        ]
      }
    ],
    other: [
      {
        name: '10 codes gagnants à 20 000€',
        value: null
      }
    ],
    name: 'Loto',
    lotteryID: 'fr-loto',
    issue: ''
  }

  const tmps = line.split(';')

  log.debug(tmps[2])
  // date
  const dateTmps = tmps[2].split('/')
  const date = moment()
  date.set('years', parseInt(dateTmps[2]))
  date.set('months', parseInt(dateTmps[1]) - 1)
  date.set('date', parseInt(dateTmps[0]))
  result.drawTime = date.format('YYYYMMDD203500')

  // numbers
  const joker = await jokerGet.joker(date.format('YYYY-MM-DD'))
  const nums = [tmps[4], tmps[5], tmps[6], tmps[7], tmps[8]].sort()
  result.numbers = `${nums.join(',')}|${tmps[9]}|${joker[0]}|${tmps.slice(32, 37).join(',')}`

  // breakdown
  let j = 0
  for (let i = 11; i < 28; i += 2, j++) {
    const n = parseInt(tmps[i])
    let t = tmps[i + 1]
    if (n === 0) {
      t = '/'
    }

    result.breakdown[0].detail[j][1].value = n.toString()
    result.breakdown[0].detail[j][2].value = t === '/' ? '/'
      : `${parseFloat(t.replace(',', '.')).toFixed(2).replace('.', ',')}€`
  }

  result.breakdown[0].detail[j][1].value = result.breakdown[0].detail[j - 1][1].value
  result.breakdown[0].detail[j][2].value = result.breakdown[0].detail[j - 1][2].value

  for (let i = 38, j = 0; i < 45; i += 2, j++) {
    const n = parseInt(tmps[i])
    let t = tmps[i + 1]
    if (n === 0) {
      t = '/'
    }

    result.breakdown[1].detail[j][1].value = n.toString()
    result.breakdown[1].detail[j][2].value = t === '/' ? '/'
      : `${parseFloat(t.replace(',', '.')).toFixed(2).replace('.', ',')}€`

    result.other[0].value = tmps[31].replace(/ /g, '').split(',').sort().join('|')
  }

  return result
}

async function main (filename) {
  const text = await readFile(path.join('csv', filename), 'utf-8')
  const lines = text.split('\n')

  log.debug(`文件数量: ${lines.length - 1}`)
  const list = []
  for (const line of lines.slice(1)) {
    if (line.length < 10) continue
    list.push(await lineDeal(line))
  }

  await writeFile(path.join('result', 'loto.json'), JSON.stringify(list))
}

main('loto_201911.csv')
