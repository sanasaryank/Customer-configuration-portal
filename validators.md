endpoint: "/customers/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"generalInfo":{"kind":"object","fields":{"responsibleId":{"kind":"string"},"statusId":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"legalName":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"crmLink":{"kind":"string"},"groupId":{"kind":"string"},"brandName":{"kind":"string"},"tin":{"kind":"string"},"bankAccount":{"kind":"string"},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["responsibleId","statusId","name","legalName","crmLink","groupId","brandName","tin","bankAccount","description","isBlocked"],"allowExtra":false},"contactInfo":{"kind":"object","fields":{"address":{"kind":"string"},"legalAddress":{"kind":"string"},"geo":{"kind":"object","fields":{"countryId":{"kind":"string"},"cityId":{"kind":"string"},"districtId":{"kind":"string"},"lat":{"kind":"number"},"lng":{"kind":"number"}},"required":["countryId","cityId","districtId","lat","lng"],"allowExtra":false},"phone":{"kind":"string"},"email":{"kind":"string"}},"required":["address","legalAddress","geo","phone","email"],"allowExtra":false},"licenseInfo":{"kind":"object","fields":{"licenses":{"kind":"array","items":{"kind":"object","fields":{"name":{"kind":"string"},"hardwareKey":{"kind":"string"},"appId":{"kind":"string"},"products":{"kind":"array","items":{"kind":"object","fields":{"productId":{"kind":"string"},"licenseModeId":{"kind":"string"},"licenseTypeId":{"kind":"string"},"endDate":{"kind":"number"},"track":{"kind":"boolean"},"licenseKey":{"kind":"string"},"licenseData":{"kind":"object","allowExtra":true}},"required":["productId","licenseModeId","licenseTypeId","endDate","track","licenseKey","licenseData"],"allowExtra":false}},"connectionInfo":{"kind":"object","fields":{"connectionTypeId":{"kind":"string"},"host":{"kind":"string"},"port":{"kind":"number"},"serverUsername":{"kind":"string"},"username":{"kind":"string"},"serverPassword":{"kind":"string"},"password":{"kind":"string"}},"required":["connectionTypeId","host","port","serverUsername","username"],"allowExtra":false}},"required":["name","hardwareKey","appId","products","connectionInfo"],"allowExtra":false}}},"required":["licenses"],"allowExtra":false},"users":{"kind":"array","items":{"kind":"object","fields":{"id":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"restoreEmail":{"kind":"string"},"username":{"kind":"string"},"password":{"kind":"string"},"allowedProducts":{"kind":"array","items":{"kind":"string"}},"isBlocked":{"kind":"boolean"}},"required":["name","restoreEmail","username","allowedProducts","isBlocked"],"allowExtra":false}}},"required":["generalInfo","contactInfo","licenseInfo","users"],"allowExtra":false}
```

endpoint: "/employees/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"username":{"kind":"string"},"password":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"role":{"kind":"string","enum":["admin","superadmin"]},"isBlocked":{"kind":"boolean"},"description":{"kind":"string"}},"required":["username","name","role","isBlocked","description"],"allowExtra":false}
```

endpoint: "/products/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"groupId":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"isBlocked":{"kind":"boolean"},"licenseTemplate":{"kind":"array","items":{"kind":"object","fields":{"name":{"kind":"string"},"kind":{"kind":"string","enum":["string","number","date","time","datetime","boolean"]},"required":{"kind":"boolean"}},"required":["name","kind","required"],"allowExtra":false}},"hasUsers":{"kind":"boolean"},"description":{"kind":"string"}},"required":["groupId","name","isBlocked","licenseTemplate","hasUsers","description"],"allowExtra":false}
```

endpoint: "/validators/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"version":{"kind":"string"},"endpoint":{"kind":"string"},"schema":{"kind":"object","allowExtra":true},"method_rules":{"kind":"object","fields":{"POST":{"kind":"object","fields":{"forbid_fields":{"kind":"array","items":{"kind":"string"}},"add_required":{"kind":"array","items":{"kind":"string"}},"remove_required":{"kind":"array","items":{"kind":"string"}}},"required":[],"allowExtra":false},"PUT":{"kind":"object","fields":{"forbid_fields":{"kind":"array","items":{"kind":"string"}},"add_required":{"kind":"array","items":{"kind":"string"}},"remove_required":{"kind":"array","items":{"kind":"string"}}},"required":[],"allowExtra":false},"PATCH":{"kind":"object","fields":{"forbid_fields":{"kind":"array","items":{"kind":"string"}},"add_required":{"kind":"array","items":{"kind":"string"}},"remove_required":{"kind":"array","items":{"kind":"string"}}},"required":[],"allowExtra":false}},"required":[],"allowExtra":false}},"required":["version","endpoint","schema"],"allowExtra":false}
```

endpoint: "/dictionary/integrationTypes/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/productGroups/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/customerGroups/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/customerStatus/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/licenseTypes/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/countries/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"}},"required":["name","description","isBlocked"],"allowExtra":false}
```

endpoint: "/dictionary/cities/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"},"countryId":{"kind":"string"}},"required":["name","description","isBlocked","countryId"],"allowExtra":false}
```

endpoint: "/dictionary/districts/{id}"
```json
{"kind":"object","fields":{"hash":{"kind":"string"},"name":{"kind":"object","fields":{"ARM":{"kind":"string"},"ENG":{"kind":"string"},"RUS":{"kind":"string"}},"required":["ARM","ENG","RUS"],"allowExtra":false},"description":{"kind":"string"},"isBlocked":{"kind":"boolean"},"cityId":{"kind":"string"}},"required":["name","description","isBlocked","cityId"],"allowExtra":false}
```

endpoint: "/customers/moveLicense/{dstId}" POST
```json
{"kind":"object","fields":{"source":{"kind":"object","fields":{"srcId":{"kind":"string"},"license":{"kind":"string"},"productId":{"kind":"string"}},"required":["srcId","license","productId"],"allowExtra":false},"destination":{"kind":"object","fields":{"license":{"kind":"string"}},"required":["license"],"allowExtra":false}},"required":["source","destination"],"allowExtra":false}
```

endpoint: "/customers/renewLicense/{customerId}" POST
```json
{"kind":"array","items":{"kind":"object","fields":{"productId":{"kind":"string"},"endDate":{"kind":"number"},"track":{"kind":"boolean"}},"required":["productId","endDate","track"],"allowExtra":false}}
```

endpoint: "/workingDays/{countryId}" POST
```json
{"kind":"object","fields":{"date":{"kind":"string"},"action":{"kind":"string","enum":["add","remove"]}},"required":["date","action"],"allowExtra":false}
```
