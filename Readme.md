Frontend specification for AI generation

Use this document as the single source of truth for generating the frontend. Do not invent additional endpoints, fields, business rules, or flows. If something is not explicitly defined here, keep the implementation conservative and configurable.

1. Goal

Build a multilingual admin frontend for managing:

employees
countries
cities
districts
products
customers
working days
history
dictionary entities

The frontend is CRUD-oriented, list-and-form based, with modal forms for all entities except workingDays.

2. Global rules
2.1 Naming
Use camelCase for all API fields and frontend fields.
Exception: translation object keys must remain exactly:
ARM
ENG
RUS
2.2 Authentication
POST /login uses only header:
Authorization: Basic base64(login:password)
Login response:
200 OK
body is empty
backend sets server-side cookie/session
Frontend must not store token anywhere.
All authenticated requests must use:
credentials: include
Logout endpoint exists:
POST /logout
response 200 OK
Current user endpoint:
GET /me
2.3 Data loading
Backend returns full lists.
Frontend performs sorting, filtering, and paging in memory.
List responses are plain arrays:
[ ... ]
2.4 CRUD response rule

For all CRUD entities except workingDays:

GET /entity returns array of objects without hash
GET /entity/{id} returns object with top-level hash
POST /entity returns created object in same shape as GET /entity/{id}
PUT /entity/{id} returns updated object in same shape as GET /entity/{id}
DELETE /entity/{id} returns 200 OK

hash is a normal top-level field.

2.5 Password rule

For all write-only password fields:

if field is not sent in update payload -> do not change value
if field is sent as "" -> also do not change value
backend never returns password fields in responses

This applies to:

employees.password
customers.users[].password
customers.connectionInfo.serverPassword
customers.connectionInfo.password
2.6 Blocking rule
isBlocked exists for all entities except:
history
workingDays
Block/unblock is done via normal PUT, by changing isBlocked.
Delete is still available and uses confirm dialog.
2.7 i18n rule

Application languages:

Armenian
Russian
English

Default language:

Armenian

Language selection must be available:

on login screen
from anywhere in the application

All static texts must come from a single central dictionary.

All dynamic translation objects with shape:

{
  "ARM": "string",
  "ENG": "string",
  "RUS": "string"
}

must be displayed in the currently selected language.

Fallback order for dynamic translations:

selected language
ARM
first non-empty of ENG / RUS
—
2.8 ID-to-name resolution rule

Whenever backend returns only IDs, frontend must resolve and display linked names itself. Examples:

history userId -> employee username
customer groupId -> customer group name
customer statusId -> customer status name
product groupId -> product group name
customer products[] -> product names
responsibleId -> employee name/username
2.9 Modal rule

All entities except workingDays use:

list page
create/edit modal over the list page

workingDays uses a dedicated page, not a modal.

3. Common reusable types
3.1 Translation
{
  "ARM": "string",
  "ENG": "string",
  "RUS": "string"
}
3.2 Current user (GET /me)
{
  "id": "string",
  "username": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "role": "admin | superadmin"
}
3.3 History detail item
{
  "oldState": {
    "field": "string",
    "value": {}
  },
  "newState": {
    "field": "string",
    "value": {}
  }
}

Rules:

field may contain nested path like field1->field2->field3
value is json (any)
if value is array -> display as array
if value is object -> render structured JSON / tree / formatted block
if primitive -> render plain value
4. Endpoints
4.1 Auth
POST /login
POST /logout
GET /me
4.2 Main entities
GET /employees
GET /employees/{id}
POST /employees
PUT /employees/{id}
DELETE /employees/{id}
GET /countries
GET /countries/{id}
POST /countries
PUT /countries/{id}
DELETE /countries/{id}
GET /cities
GET /cities/{id}
POST /cities
PUT /cities/{id}
DELETE /cities/{id}
GET /districts
GET /districts/{id}
POST /districts
PUT /districts/{id}
DELETE /districts/{id}
GET /products
GET /products/{id}
POST /products
PUT /products/{id}
DELETE /products/{id}
GET /customers
GET /customers/{id}
POST /customers
PUT /customers/{id}
DELETE /customers/{id}
4.3 Working days
GET /workingDays
POST /workingDays
4.4 History
GET /history
GET /history/{objectId}
GET /historyItem/{id}
4.5 Dictionaries
GET /dictionary/integrationTypes
GET /dictionary/integrationTypes/{id}
POST /dictionary/integrationTypes
PUT /dictionary/integrationTypes/{id}
DELETE /dictionary/integrationTypes/{id}
GET /dictionary/restaurantTypes
GET /dictionary/restaurantTypes/{id}
POST /dictionary/restaurantTypes
PUT /dictionary/restaurantTypes/{id}
DELETE /dictionary/restaurantTypes/{id}
GET /dictionary/hotelTypes
GET /dictionary/hotelTypes/{id}
POST /dictionary/hotelTypes
PUT /dictionary/hotelTypes/{id}
DELETE /dictionary/hotelTypes/{id}
GET /dictionary/menuTypes
GET /dictionary/menuTypes/{id}
POST /dictionary/menuTypes
PUT /dictionary/menuTypes/{id}
DELETE /dictionary/menuTypes/{id}
GET /dictionary/priceSegments
GET /dictionary/priceSegments/{id}
POST /dictionary/priceSegments
PUT /dictionary/priceSegments/{id}
DELETE /dictionary/priceSegments/{id}
GET /dictionary/productGroups
GET /dictionary/productGroups/{id}
POST /dictionary/productGroups
PUT /dictionary/productGroups/{id}
DELETE /dictionary/productGroups/{id}
GET /dictionary/customerGroups
GET /dictionary/customerGroups/{id}
POST /dictionary/customerGroups
PUT /dictionary/customerGroups/{id}
DELETE /dictionary/customerGroups/{id}
GET /dictionary/customerStatus
GET /dictionary/customerStatus/{id}
POST /dictionary/customerStatus
PUT /dictionary/customerStatus/{id}
DELETE /dictionary/customerStatus/{id}
5. Entity schemas
5.1 Dictionary entities

Applies to:

integration types
restaurant types
hotel types
menu types
price segments
product groups
customer groups
customer status
List / POST payload base shape
{
  "id": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "description": "string",
  "isBlocked": true
}
GET by id / POST response / PUT payload / PUT response
{
  "id": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "description": "string",
  "isBlocked": true,
  "hash": "string"
}
5.2 Countries
{
  "id": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "description": "string",
  "isBlocked": true
}

with hash added in GET by id / POST response / PUT payload / PUT response.

5.3 Cities
{
  "id": "string",
  "countryId": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "description": "string",
  "isBlocked": true
}

with hash added in GET by id / POST response / PUT payload / PUT response.

5.4 Districts
{
  "id": "string",
  "cityId": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "description": "string",
  "isBlocked": true
}

with hash added in GET by id / POST response / PUT payload / PUT response.

5.5 Employees
Response shape
{
  "id": "string",
  "username": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "role": "admin | superadmin",
  "isBlocked": true,
  "description": "string"
}

with hash added in GET by id / POST response / PUT payload / PUT response.

Write-only field rules
password is required on create
password is optional on edit
password is never returned by backend
POST example
{
  "id": "string",
  "username": "string",
  "password": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "role": "admin",
  "isBlocked": false,
  "description": "string"
}
PUT example
{
  "id": "string",
  "username": "string",
  "password": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "role": "admin",
  "isBlocked": false,
  "description": "string",
  "hash": "string"
}
5.6 Products
{
  "id": "string",
  "groupId": "string",
  "name": {
    "ARM": "string",
    "ENG": "string",
    "RUS": "string"
  },
  "isBlocked": true,
  "licenseTemplate": [
    {
      "name": "string",
      "kind": "string | number | date | time | datetime | boolean",
      "required": true
    }
  ],
  "hasUsers": true,
  "description": "string"
}

with hash added in GET by id / POST response / PUT payload / PUT response.

Rules:

groupId references /dictionary/productGroups
hasUsers = true means this product may be assigned to customers.users[].allowedProducts
frontend should allow assigning user products only for products where hasUsers = true
5.7 Customers
5.7.1 Response shape
{
  "id": "string",
  "generalInfo": {
    "responsibleId": "string",
    "statusId": "string",
    "name": {
      "ARM": "string",
      "ENG": "string",
      "RUS": "string"
    },
    "legalName": {
      "ARM": "string",
      "ENG": "string",
      "RUS": "string"
    },
    "crmLink": "string",
    "groupId": "string",
    "brandName": "string",
    "tin": "string",
    "bankAccount": "string",
    "description": "string"
  },
  "contactInfo": {
    "address": "string",
    "legalAddress": "string",
    "geo": {
      "countryId": "string",
      "cityId": "string",
      "districtId": "string",
      "lat": 40.75123456,
      "lng": 40.75123456
    },
    "phone": "string",
    "email": "string"
  },
  "connectionInfo": {
    "connectionTypeId": "string",
    "host": "string",
    "port": 8020,
    "serverUsername": "string",
    "username": "string"
  },
  "products": ["string"],
  "licenseInfo": {
    "hardwareKey": "string",
    "products": [
      {
        "productId": "string",
        "licenseKey": "string",
        "licenseData": {
          "connectionsCount": 5,
          "endDate": "2026-12-31"
        },
        "movedFrom": "string",
        "movedTo": "string"
      }
    ]
  },
  "users": [
    {
      "id": "string",
      "name": {
        "ARM": "string",
        "ENG": "string",
        "RUS": "string"
      },
      "restoreEmail": "string",
      "username": "string",
      "allowedProducts": ["string"],
      "isBlocked": true
    }
  ],
  "isBlocked": true
}

with hash added in GET by id / POST response / PUT payload / PUT response.

5.7.2 Write-only fields not returned by backend

Inside customer write payloads only:

connectionInfo.serverPassword
connectionInfo.password
users[].password

These are never returned in any GET/POST-response/PUT-response.

5.7.3 Reference rules
generalInfo.responsibleId -> /employees
generalInfo.statusId -> /dictionary/customerStatus
generalInfo.groupId -> /dictionary/customerGroups
contactInfo.geo.countryId -> /countries
contactInfo.geo.cityId -> /cities
contactInfo.geo.districtId -> /districts
connectionInfo.connectionTypeId -> /dictionary/integrationTypes
products[] -> product IDs
users[].allowedProducts[] -> product IDs
5.7.4 Customer user rules
customer users are edited only inside customer, no separate endpoints
users[].password:
required when creating new user
optional when editing existing user
never returned by backend
allowedProducts can contain only products with hasUsers = true
5.7.5 Customer license rules

Each product may have its own license block.

licenseInfo.products[] item:

{
  "productId": "string",
  "licenseKey": "string",
  "licenseData": {
    "connectionsCount": 5,
    "endDate": "2026-12-31"
  },
  "movedFrom": "string",
  "movedTo": "string"
}

Validation rules:

licenseData keys must match licenseTemplate[].name of the corresponding product
value type must match licenseTemplate[].kind
required keys must match licenseTemplate[].required = true

Dynamic behavior:

if product is added to customers.products[] and that product has licenseTemplate, frontend must create or request corresponding block in licenseInfo.products[]
if product is removed from customers.products[], frontend must not delete corresponding licenseInfo.products[] item
instead, frontend shows that license block as disabled
backend is responsible for actual removal/cleanup
5.7.6 Customer list display mapping

In customer table display:

group = resolved name by generalInfo.groupId
productTypes = resolved names from products[]
status = resolved name by generalInfo.statusId
isBlocked = root isBlocked
5.8 Working days
GET /workingDays
{
  "dates": ["2025-01-01", "2025-01-02"]
}
POST /workingDays
{
  "date": "2025-01-01",
  "action": "add | remove"
}

Rules:

this is the only date-like structure using string day format YYYY-MM-DD
no hash
no userId
no delete endpoint
frontend should work as calendar/day-management UI
5.9 History
History list item
{
  "id": 123,
  "date": 1710000000,
  "userId": "string",
  "actionType": "create | update | delete",
  "objectType": "string",
  "objectId": "string"
}

Rules:

date is Unix timestamp in seconds
userId always references /employees
frontend resolves and displays employee username
History endpoints
GET /history -> all history list items
GET /history/{objectId} -> history list items only for one object
GET /historyItem/{id} -> diff array
History details response
[
  {
    "oldState": {
      "field": "generalInfo->name->ARM",
      "value": "Old value"
    },
    "newState": {
      "field": "generalInfo->name->ARM",
      "value": "New value"
    }
  }
]
6. Date and time rules
6.1 Unix timestamp unit

All long / numeric timestamps use:

seconds, not milliseconds
6.2 Conversion rule

Except for workingDays, backend dates are treated as Unix timestamps. Frontend must not apply hidden business reinterpretation. Use standard formatting only.

7. Required fields

Only mark clearly obvious required fields at this stage. Do not invent strict validation beyond the contract.

Obvious required examples
login username/password in Basic auth header
employee create password
customer user create password
IDs required where relationship is mandatory
translation object fields should exist, even if some language values may be empty
license fields required according to licenseTemplate.required

Everything else can remain configurable / backend-driven.

8. UI structure
8.1 Routes

Implement at least these routes:

/login
/customers
/handbooks/employees
/handbooks/workingDays
/handbooks/integrationTypes
/handbooks/restaurantTypes
/handbooks/hotelTypes
/handbooks/menuTypes
/handbooks/priceSegments
/handbooks/productGroups
/handbooks/customerGroups
/handbooks/customerStatus
/handbooks/countries
/handbooks/cities
/handbooks/districts
/products
/history
8.2 List pages

Every list page should support:

in-memory search/filter
in-memory sorting
in-memory paging
create button
row actions: edit, delete, block/unblock, history where relevant
localized display for translation objects
ID resolution for related entities
8.3 Modal forms

Use modal forms for all CRUD entities except workingDays. Form behavior:

create mode
edit mode
load full object for edit (GET /{id})
submit via POST or PUT
include hash on edit payloads
8.4 Working days page

Dedicated page with calendar/day management UI. Capabilities:

load all dates from GET /workingDays
visually mark active working days
add day via POST /workingDays with action add
remove day via POST /workingDays with action remove
8.5 History UI

History page must support:

global history list using GET /history
object-specific history access using GET /history/{objectId}
opening details of a single history item via GET /historyItem/{id}
display username by resolving userId
display diff values depending on actual JSON type
9. Suggested frontend behavior for AI implementation
9.1 Data layer

Generate a reusable API client with:

base request wrapper
credentials: include
centralized error handling
entity-specific service modules
9.2 Dictionaries cache

Load and cache reference datasets used in ID resolution:

employees
countries
cities
districts
products
all dictionary entities
9.3 Rendering helpers

Create helpers for:

translation resolution with fallback
timestamp formatting
ID-to-name lookup
rendering JSON values in history details
building select options from dictionaries
9.4 Form helpers

Create reusable form controls for:

translation object editor
dictionary select
async dependent selects (country -> city -> district)
dynamic customer user subforms
dynamic product license sections
password fields with update-safe behavior
9.5 Safe update behavior

For password fields on edit:

do not prefill from backend
keep fields empty by default
send only if user entered non-empty value
if empty string remains in UI, omit from request payload
10. Recommended screen-level requirements
10.1 Login screen
username input
password input
language selector
submit using Basic auth header
on success call GET /me
route into app
10.2 App shell
sidebar navigation
top bar with current user, current language, logout button
route guard based on authenticated session
10.3 Employees page

Columns:

username
localized name
role
isBlocked
description

Actions:

create
edit
delete
block/unblock
history
10.4 Countries / Cities / Districts / Dictionaries pages

Standard CRUD lists with localized names and descriptions. For cities resolve and display country name. For districts resolve and display city name.

10.5 Products page

Columns:

localized name
product group
hasUsers
isBlocked
description

Form:

localized name
group select
hasUsers toggle
isBlocked toggle
description
editable licenseTemplate[]
10.6 Customers page

Main complexity page. Use tabbed or sectioned modal:

general info
contact info
connection info
products
license info
users

Important behaviors:

responsible employee selector
customer status selector
customer group selector
geo selectors with linked country/city/district
connection type selector
products multiselect
users subtable/subforms
users allowedProducts filtered by hasUsers = true
license blocks by product
disable stale license blocks for removed products
10.7 History page

Columns:

date
username
actionType
objectType
objectId

Details modal/drawer:

render diff list from GET /historyItem/{id}
11. Exact contract reminders
Do not change translation keys from ARM/ENG/RUS
Do not return/store tokens client-side
Do not expect passwords in responses
Do not delete customer license blocks on frontend when product is removed
Do not create separate CRUD for customer users
Do not implement backend paging/filtering assumptions
Do not invent extra endpoints for block/history/logout
12. Final implementation directive for AI

Generate a production-ready frontend that follows this contract exactly. Prefer clear modular architecture, reusable CRUD patterns, centralized i18n, and safe form handling. Where possible, abstract shared logic, but keep entity-specific business rules explicit for:

customers
products
workingDays
history
auth
