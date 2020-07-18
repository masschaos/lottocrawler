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

## 开发规范

## 爬虫接口

在国家文件夹内，爬虫需要实现如下接口：

另外，
