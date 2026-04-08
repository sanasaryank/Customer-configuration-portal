endpoint: "/customers/{id}"
```json
{
  "hash": "string",
  "generalInfo": {
    "responsibleId": "string",
    "statusId": "string",
    "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "legalName": { "ARM": "string", "ENG": "string", "RUS": "string" },
    "crmLink": "string",
    "groupId": "string",
    "brandName": "string",
    "tin": "string",
    "bankAccount": "string",
    "description": "string",
    "isBlocked": "boolean"
  },
  "contactInfo": {
    "address": "string",
    "legalAddress": "string",
    "geo": {
      "countryId": "string",
      "cityId": "string",
      "districtId": "string",
      "lat": "number",
      "lng": "number"
    },
    "phone": "string",
    "email": "string"
  },
  "licenseInfo": {
    "licenses": [
      {
        "name": "string",
        "hardwareKey": "string",
        "appId": "string",
        "products": [
          {
            "productId": "string",
            "licenseModeId": "string",
            "licenseTypeId": "string",
            "endDate": "number",
            "track": "boolean",
            "licenseKey": "string",
            "licenseData": {}
          }
        ],
        "connectionInfo": {
          "connectionTypeId": "string",
          "host": "string",
          "port": "number",
          "serverUsername": "string",
          "username": "string",
          "serverPassword": "string?",
          "password": "string?"
        }
      }
    ]
  },
  "users": [
    {
      "id": "string?",
      "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
      "restoreEmail": "string",
      "username": "string",
      "password": "string?",
      "allowedProducts": ["string"],
      "isBlocked": "boolean"
    }
  ]
}
```

endpoint: "/employees/{id}"
```json
{
  "hash": "string",
  "username": "string",
  "password": "string?",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "role": "string",
  "isBlocked": "boolean",
  "description": "string"
}
```

endpoint: "/products/{id}"
```json
{
  "hash": "string",
  "groupId": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "isBlocked": "boolean",
  "licenseTemplate": [
    {
      "name": "string",
      "kind": "string",
      "required": "boolean"
    }
  ],
  "hasUsers": "boolean",
  "description": "string"
}
```

endpoint: "/validators/{id}"
```json
{
  "hash": "string",
  "version": "string",
  "endpoint": "string",
  "schema": {},
  "method_rules": {
    "POST": {
      "forbid_fields": ["string"],
      "add_required": ["string"],
      "remove_required": ["string"]
    },
    "PUT": {
      "forbid_fields": ["string"],
      "add_required": ["string"],
      "remove_required": ["string"]
    },
    "PATCH": {
      "forbid_fields": ["string"],
      "add_required": ["string"],
      "remove_required": ["string"]
    }
  }
}
```

endpoint: "/dictionary/integrationTypes/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/restaurantTypes/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/hotelTypes/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/menuTypes/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/priceSegments/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/productGroups/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/customerGroups/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/customerStatus/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/licenseTypes/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/countries/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean"
}
```

endpoint: "/dictionary/cities/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean",
  "countryId": "string"
}
```

endpoint: "/dictionary/districts/{id}"
```json
{
  "hash": "string",
  "name": { "ARM": "string", "ENG": "string", "RUS": "string" },
  "description": "string",
  "isBlocked": "boolean",
  "cityId": "string"
}
```

endpoint: "/customers/moveLicense/{dstId}" POST
```json
{
  "source": {
    "srcId": "string",
    "license": "string",
    "productId": "string"
  },
  "destination": {
    "license": "string"
  }
}
```

endpoint: "/customers/renewLicense/{customerId}" POST
```json
[
  {
    "productId": "string",
    "endDate": "number",
    "track": "boolean"
  }
]
```

endpoint: "/workingDays/{countryId}" POST
```json
{
  "date": "string",
  "action": "add | remove"
}
```
