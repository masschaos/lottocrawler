# LOTTO CRAWLER

开发上手指南

## 项目结构

* server.js 生产服务启动入口
* dev.js 开发总体调试入口
* scheduler.js 调度器，完整跑一遍爬虫的函数
* .env.example 环境变量范例
* .env 本地开发调试时的环境变量，首次请复制 .env.example 生成
* util 工具函数集
* pptr puppeeter 封装
* inner 内部 API 封装
* crawler 业务爬虫
  * uk 国家文件夹，使用两位国家标准代码
    * latest 最近结果爬虫
    * history 历史结果爬虫

## 跑通一遍

```bash
# clone repo
git clone https://github.com/masschaos/lottocrawler.git

cd lottocrawler

# install npm packages
npm ci

# create .env
cp .env.example .env

# run dev mode
npm run dev
```

## 爬虫接口

本项目会不断的新写不同国家和地区的爬虫，新增的爬虫要符合如下接口定义，让调度程序去调度。
爬虫只负责抓取数据，调度程序负责执行时间点和向服务器提交数据。

### 普通抓取

在`crawler/国家代码`文件夹内，需要 export 一个 Map (key为彩票id，值为爬虫列表)
能让 `router.js` 的如下代码通过：
```javascript
const crawlerMap = require('./crawler/国家代码')
const crawlers = crawlerMap.get(lotteryID)
// 爬虫列表中的爬虫需要实现一个 async function crawl() ,作用是返回该彩票最新一期开奖数据
for (const crawler of crawlers) {
  const data = await crawler.crawl()
  console.log(data)
}
```

在国家文件夹内，只要能实现上述代码，则该国家的最新结果爬虫就算完成。

### 分步抓取

有的国家公布彩票结果的网站会分步公布相应的内容，比如先公布抽奖结果，过一段时间再公布每个奖级的中奖情况，
最后再在合适的时间更新下期奖池的一些信息。

对于此类国家，我们需要调整 crawler 的方法，让它支持分步抓取。我们的彩种配置数据中会有如下调度信息：
```json
[
  {
    "id": "result",
    "dataType": "result",
    "delay": 0
  },
  {
    "id": "breakdown",
    "dataType": "breakdown",
    "delay": 300
  }
]
```
这个信息表示，此彩种会在结果公布300秒（5分钟）后公布中奖明细。
这个配置需要写爬虫的人，在写爬虫前，如果目标不是调用api而是抓取网页，要观察它开奖瞬间的情况有没有分步公布。
如果分步公布，则要把规则记录下来，写在注释中，供最后配置。

此种情况下 crawler 要实现 crawler.crawl(id) ，让上面的每个id当参数传入时，返回正确的结果。

目前 dataType 有三种， result 则返回 result 对象。 breakdown 和 other 返回时放在一个 Object 中加上 drawTime，如：
```json
{
  "drawTime": "20200820183000",
  "breakdown": []
}
```

### 爬虫中的异常处理

我们要求在爬虫代码中，有异常一概抛出，如果没有抛出异常，则**必须**返回正确的结果。
不能因为异常没有处理而返回残缺的结果。

## 爬取方式

在写爬虫之前，你需要分析目标网站有没有公开的 api 可供调用，如果有的话直接用 axios进行调用。

如果没有借口可供调用，我们则统一使用 `puppeteer` 框架进行网页抓取，调用 `pptr` 文件夹
中的方法来获取一个 page 对象。

## 异常处理

所有的异常必须被处理，我们这里把异常分为三类分别说明：

### 由事实分析出的业务异常

这种情况下程序本身没有抛出异常，但是我们从数据的内容中可以推断出一些我们不希望发生的情况。
我们把两种重要的业务异常放到了 `util/error.js` 中：

**SiteClosedError**
有的网站遵循当地法律，在非营业时间不能访问，我们可以根据抓取到的特定文本或特征判断这种状态。

**DrawingError**
有的网站在彩票的最新结果开奖直播过程中，不会显示上一期结果，而是直接显示正在开奖中，
导致我们抓取不到任何一期的结果。

使用如下方式抛出这两种预定义的异常，我们的调度程序会对这些异常做特殊处理。
```javascript
const { SiteClosedError } = require('./util/error')
throw new SiteClosedError(lotteryID)
```

### 可预期的异常

有时候我们可以预期一定会发生一些异常，我们要求爬虫自行处理这些异常或者解释它们后重新抛出。

比如捕获到域名解析失败，BadGateway，网络超时等异常，应该在爬虫内做重试两次的策略。

我们使用 `verror` 包来 wrap 异常并重新抛出。示例如下：
```javascript
const VError = require('verror')
try {
  // Do something
} catch (err) {
  if ( err.name === 'something' ) {
      throw new VError(err,'上游接口有更改，请检查爬虫')
  } else {
      throw new VError(err,'在xx环节发生错误，请检查爬虫')
  }
}
```

### 预期外的异常

由于调度程序知道自己正在执行哪个爬虫，所以对预期外的异常爬虫不必处理。
在生产运行过程中碰到预期外的异常，会分析原因并添加适当的处理代码。

我们碰到的最常见也是最重要的一种预期外异常是目标网站改版，改变了元素结构。
在前边把所有可预期异常挑出来，就是为了监控这类异常情况，及时作出调整减少对我们业务的影响。

再次强调一遍，如果爬虫没有抛出异常，必须保证返回结果是正确的。

## 开发规范

我们遵循 `standard.js` 规范，在此之外，还有一些额外的规范，它们都被配置在了 ESLint 中，等历史代码全部修复后，将会启用 pr 和 ci 时自动检查。

这里先说一些无法自动检查的规范：
- 代码要简洁清晰，易读是我们衡量代码质量最重要的维度。
- 必要的地方要有注释，可以使用中文注释。
- 必要的地方需要打印日志，可以选择 debug 和 info 级别，错误一律抛出异常不用打印日志。

根据编辑器不同，我们需要做如下配置去辅助检查我们的代码：

### VS Code

安装 `ESLint` 插件。

在系统配置中添加如下内容让其在保存时自动纠正错误：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

你还可以选择性安装 `JavaScript standardjs styled snippets` 这个插件为你提供一些片段。

### WebStorm

理论上你不需要做任何事情，它会自动监测到 ESLint 并启用。如果你需要自动修复，可以去设置里搜索 eslint
然后开启自动修复的选项。

### 关于 console.log

在项目上线后，运行过程中打印的 console.log 的 debug 信息会导致日志可读性下降。
而且，`console.log` 在输出日志信息时，并不会自动带上时间戳、进程等信息。

因此，在代码提交前，我们应该把所有的 `console.log` 删除，或者替换成 `log.debug` 用于 debug 调试。

而对于开发过程中，希望使用 `console.log` 进行调试代码，又不希望看到红色警告。可以在文件头头部加入`/* eslint-disable no-console */`避免错误显示。但是在提交代码前，需要将这条指令和 `console.log` 一并删除。

## Review 指南

我们的项目成员之间需要互相 Review 代码，按照如下规则进行：
1. 检查代码是否符合规范，目前我们提交 pr 时 ci 会自己检查配置到 eslint 里边的规范。将来如果有额外的无法配置的规范需要检查下，现在什么都不需要做。
2. 通读一遍代码，检查代码是否符合业务逻辑。
3. 在演示环境跑一遍代码，我们预置了一个跑国家的脚本 `npm run country xx`，检查能否正常执行。检查 debug 打出来的每步提交数据是否有问题。在跑之前联系闻嘉做好 staging 该国家的配置。
4. 使用 api 客户端工具，检查 /results  /lotteries/{lotteryID}/results /results/{id}/breakdown 等接口是否正常。
5. 如果有代码风格方面的问题，可以和我们讨论，将其补充为第一步的规范内容对未来的代码一律进行检查。

