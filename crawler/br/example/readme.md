<!--

 * @Author: maple
 * @Date: 2020-08-29 21:48:19
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 08:33:02
-->
彩种名||主源|开奖时间
-|-|-|-
Mega-Sena||http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/|星期三和星期六晚上8点
Lotofácil||http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/|星期一，星期三和星期五的晚上8点
Quina||http://loterias.caixa.gov.br/wps/portal/loterias/landing/quina/|每周抽奖6次：从星期一到星期六，晚上8点
Lotomania||http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/|星期二和星期五的晚上8点
Dia de Sorte||http://loterias.caixa.gov.br/wps/portal/loterias/landing/diadesorte|星期二和星期五的晚上8点
Timemania||http://loterias.caixa.gov.br/wps/portal/loterias/landing/timemania/|星期二，星期四和星期六晚上8点开始
Loteria Federal||http://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/|
Dupla Sena||	http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/|星期二，星期四和星期六晚上8点



可以通过api拿数据。

有api并且一次能获取的包含 breakdown 的数据，那就用 crawl() 一次搞定。
如果是其他情况，就用 crawl('result') , crawl('breakdown') 两次来。有更特殊的情况可以拆分更多次。

## Mega-Sena

http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598746146161

http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598746947545&concurso=2292



```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA2cDIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENLvRYQFRkW-zr7p-lEFiSUZupl5afn6ETXPZsx_Nmf-k109-uH6UahmuAc4mxo4-rs4WRoYA6GBKVQBPk-CFeDxRUFuaESVT1qwZ7qiIgCmNr_R/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598758488820&concurso=2123
```

scope.urlBusca = document.getElementById("urlBuscarResultado").value;

```
<input type="hidden" value="dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/"
				ng-model="urlBuscarResultado" id="urlBuscarResultado" />
```

```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/res
```

```

<base href="http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/res/id%3DbuscaResultado/c%3DcacheLevelPage/%3D/!ut/p/a1/jZC9DoJAEISfxQcwOyKiFhQHGH4CkWjU8xpz4vGTIBpBC59eNDYWKrvVbL7JZJYEcRKVvBWZbIpTJcunFsbOGITw4CKAr03A9FmsrYP1EBZaYNsCtss8fRwC0CcafMfynPE0Anyjmx9fhuGfP-gQoF0iO8pInGWT94sqPRG_qJp4cTD31zqRC1Vfy0Ye2ntiJjLJVahuqoxlpoibtCHxGeLG9ghs7lhTDNvF6A38-sIL-FHzfFzxe8jSpZ_1HvsmDSA!/">


```

```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/!ut/p/a1/jZC9DoJAEISfxQcwOyKiFhQHGH4CkWjU8xpz4vGTIBpBC59eNDYWKrvVbL7JZJYEcRKVvBWZbIpTJcunFsbOGITw4CKAr03A9FmsrYP1EBZaYNsCtss8fRwC0CcafMfynPE0Anyjmx9fhuGfP-gQoF0iO8pInGWT94sqPRG_qJp4cTD31zqRC1Vfy0Ye2ntiJjLJVahuqoxlpoibtCHxGeLG9ghs7lhTDNvF6A38-sIL-FHzfFzxe8jSpZ_1HvsmDSA!dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598758488820&concurso=2123
```



## 完整

```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/res/!ut/p/a1/jZC9DoJAEISfxQcwOyKiFhQHGH4CkWjU8xpz4vGTIBpBC59eNDYWKrvVbL7JZJYEcRKVvBWZbIpTJcunFsbOGITw4CKAr03A9FmsrYP1EBZaYNsCtss8fRwC0CcafMfynPE0Anyjmx9fhuGfP-gQoF0iO8pInGWT94sqPRG_qJp4cTD31zqRC1Vfy0Ye2ntiJjLJVahuqoxlpoibtCHxGeLG9ghs7lhTDNvF6A38-sIL-FHzfFzxe8jSpZ_1HvsmDSA!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598763102128
```

base href

```
<base href="http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/res/id%3DbuscaResultado/c%3DcacheLevelPage/%3D/!ut/p/a1/jZC9DoJAEISfxQcwOyKiFhQHGH4CkWjU8xpz4vGTIBpBC59eNDYWKrvVbL7JZJYEcRKVvBWZbIpTJcunFsbOGITw4CKAr03A9FmsrYP1EBZaYNsCtss8fRwC0CcafMfynPE0Anyjmx9fhuGfP-gQoF0iO8pInGWT94sqPRG_qJp4cTD31zqRC1Vfy0Ye2ntiJjLJVahuqoxlpoibtCHxGeLG9ghs7lhTDNvF6A38-sIL-FHzfFzxe8jSpZ_1HvsmDSA!/">

```


```
<input type="hidden" value="dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/"
				ng-model="urlBuscarResultado" id="urlBuscarResultado" />
```





test

```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/res/
!ut/p/a1/jZC9DoJAEISfxQcwOyKiFhQHGH4CkWjU8xpz4vGTIBpBC59eNDYWKrvVbL7JZJYEcRKVvBWZbIpTJcunFsbOGITw4CKAr03A9FmsrYP1EBZaYNsCtss8fRwC0CcafMfynPE0Anyjmx9fhuGfP-gQoF0iO8pInGWT94sqPRG_qJp4cTD31zqRC1Vfy0Ye2ntiJjLJVahuqoxlpoibtCHxGeLG9ghs7lhTDNvF6A38-sIL-FHzfFzxe8jSpZ_1HvsmDSA!
/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1598763102128
```

```
http://loterias.caixa.gov.br/wps/portal/loterias/landing/diadesorte/
!ut/p/a1/jc5BDsIgFATQs3gCptICXdKSfpA2ujFWNoaVIdHqwnh-sXFr9c_qJ2-SYYGNLEzxmc7xkW5TvLz_IE6WvCoUwZPwArpTnZWD4SCewTGDlrQtZQ-gVGs401gj6wFw4r8-vpzGr_6BhZmIoocFYUO7toLemqYGz0H1AUsTZ7Cw4X7dj0hu9QIyUWUw
/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO5GE0Q8PTB11800G3/res/id=buscaResultado/c=cacheLevelPage/=/
```

