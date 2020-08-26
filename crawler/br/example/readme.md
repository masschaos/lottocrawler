彩种名|主源|开奖时间
-|-|-
Mega-Sena|http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/|星期三和星期六晚上8点
Lotofácil|http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/|星期一，星期三和星期五的晚上8点
Quina|http://loterias.caixa.gov.br/wps/portal/loterias/landing/quina/|每周抽奖6次：从星期一到星期六，晚上8点
Lotomania|http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/|星期二和星期五的晚上8点
Dia de Sorte|http://loterias.caixa.gov.br/wps/portal/loterias/landing/diadesorte|星期二和星期五的晚上8点
Timemania|http://loterias.caixa.gov.br/wps/portal/loterias/landing/timemania/|星期二，星期四和星期六晚上8点开始
Loteria Federal|http://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/|
Dupla Sena|	http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/|星期二，星期四和星期六晚上8点

可以通过api拿数据。

有api并且一次能获取的包含 breakdown 的数据，那就用 crawl() 一次搞定。
如果是其他情况，就用 crawl('result') , crawl('breakdown') 两次来。有更特殊的情况可以拆分更多次。
