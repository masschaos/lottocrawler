<!--
 * @Author: maple
 * @Date: 2020-08-07 20:00:33
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 21:58:38
-->
# 用法

```
node history
```

## 文件目录
```
├── history
│   ├── tmp --------------------- 中间文件层，生成多个以 id 为名称的 json文件
│   ├── jp-bingo5.JSON
│   ├── jp-kisekaeqoochan.JSON
│   ├── jp-loto6.JSON
│   ├── jp-loto7.JSON
│   ├── jp-miniloto.JSON
│   ├── jp-numbers3.JSON
│   └── jp-numbers4.JSON
```

## history/tmp 文件夹

中间文件层，生成多个以 id 为名称的 json 文件。用于重复获取历史信息 & 重复爬取失败的文件。如果需要强制重新爬取，需要删除 tmp 文件夹