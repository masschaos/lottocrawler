<!--
 * @Author: maple
 * @Date: 2020-08-15 21:43:05
 * @LastEditors: maple
 * @LastEditTime: 2020-09-03 01:02:19
-->
# 法国数据处理

最新数据基于页面爬取。而 history 数据基于 csv 文件处理。
基于以下原因:
- csv 有若干不规则的链接
- 不同日期的 csv 格式可能不一致
- 直接自动化下载解压，需要引入额外的依赖

考虑手动下载 zip 文件，解压出 csv 之后，再放入 csv 运行。

## 运行方式

```bash
cd crawler/fr/history
# fr-loto
# 需要取消注释 jokerplus.js
node jokerplus && node fr-loto

# fr-euromillions-my-million
node fr-euromillions-my-million

# fr-keno-gagnantavie
node fr-keno-gagnantavie
```


## fr-loto

需要新运行 jokerplus.js 里面的 init 函数，取消注释掉的代码
初始化 jokerplus 数据

https://media.fdj.fr/static/csv/loto/loto_201911.zip
https://media.fdj.fr/static/csv/loto/loto_201902.zip
https://media.fdj.fr/static/csv/loto/loto_201703.zip
https://media.fdj.fr/static/csv/loto/loto_200810.zip
https://media.fdj.fr/static/csv/loto/loto_197605.zip

## fr-euromillions-my-million

https://media.fdj.fr/static/csv/euromillions/euromillions_202002.zip
https://media.fdj.fr/static/csv/euromillions/euromillions_201902.zip
https://media.fdj.fr/static/csv/euromillions/euromillions_201609.zip
https://media.fdj.fr/static/csv/euromillions/euromillions_201402.zip

## fr-keno-gagnantavie

https://media.fdj.fr/static/csv/keno/keno_201811.zip
https://media.fdj.fr/static/csv/keno/keno_201302.zip
https://media.fdj.fr/static/csv/keno/keno_199309.zip

## jockerplus
https://media.fdj.fr/static/csv/jokerplus/jokerplus_200603.zip
https://media.fdj.fr/static/csv/jokerplus/jokerplus_201902.zip
