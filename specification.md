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
customers.licenseInfo.products[].connectionInfo.serverPassword
customers.licenseInfo.products[].connectionInfo.password
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
customer licenseInfo.products[].productId -> product names
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

The backend returns a single nested diff object (not an array).

Leaf diff node (terminal node):
{
  "old": <JsonValue>,
  "new": <JsonValue>
}

Nested diff node:
{
  "key": <LeafDiffNode | NestedDiffNode>
}

Rules:

objects are compared recursively; nesting can be arbitrarily deep
arrays of scalar values are atomic — compared in full as old/new pair, not per element
arrays of objects are diffed recursively on the backend and appear as nested objects keyed by match labels (e.g. "id=10", "new:id=15", "old:#1", "best_match#1")
scalar values are serialised to strings by the backend
missing values are represented by the string "<missing>"
for password changes backend returns { "old": "Old", "new": "New" } — UI must not attempt to reveal actual password values
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
GET /dictionary/countries
GET /dictionary/countries/{id}
POST /dictionary/countries
PUT /dictionary/countries/{id}
DELETE /dictionary/countries/{id}
GET /dictionary/cities
GET /dictionary/cities/{id}
POST /dictionary/cities
PUT /dictionary/cities/{id}
DELETE /dictionary/cities/{id}
GET /dictionary/districts
GET /dictionary/districts/{id}
POST /dictionary/districts
PUT /dictionary/districts/{id}
DELETE /dictionary/districts/{id}
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
POST /customers/moveLicense/{dstId}  body: { srcId: string }
4.3 Working days
GET /workingDays/{countryId}
POST /workingDays/{countryId}
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
    "description": "string",
    "isBlocked": true
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
  "licenseInfo": {
    "products": [
      {
        "productId": "string",
        "hardwareKey": "string",
        "licenseKey": "string",
        "licenseData": {
          "connectionsCount": 5,
          "endDate": "2026-12-31"
        },
        "connectionInfo": {
          "connectionTypeId": "string",
          "host": "string",
          "port": 8020,
          "serverUsername": "string",
          "username": "string"
        }
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
  ]
}

with hash added in GET by id / POST response / PUT payload / PUT response.

5.7.2 Write-only fields not returned by backend

Inside customer write payloads only:

licenseInfo.products[].connectionInfo.serverPassword
licenseInfo.products[].connectionInfo.password
users[].password

These are never returned in any GET/POST-response/PUT-response.

5.7.3 Reference rules
generalInfo.responsibleId -> /employees
generalInfo.statusId -> /dictionary/customerStatus
generalInfo.groupId -> /dictionary/customerGroups
contactInfo.geo.countryId -> /countries
contactInfo.geo.cityId -> /cities
contactInfo.geo.districtId -> /districts
licenseInfo.products[].connectionInfo.connectionTypeId -> /dictionary/integrationTypes
users[].allowedProducts[] -> product IDs (must be from licenseInfo.products[].productId with hasUsers = true)
5.7.4 Customer user rules
customer users are edited only inside customer, no separate endpoints
users[].password:
required when creating new user
optional when editing existing user
never returned by backend
allowedProducts can contain only products listed in licenseInfo.products[] where hasUsers = true
5.7.5 Customer license rules

Products are tracked exclusively via licenseInfo.products[]. There is no separate top-level products[] field.

licenseInfo.products[] item:

{
  "productId": "string",
  "hardwareKey": "string",
  "licenseKey": "string",
  "licenseData": {
    "connectionsCount": 5,
    "endDate": "2026-12-31"
  },
  "connectionInfo": {
    "connectionTypeId": "string",
    "host": "string",
    "port": 8020,
    "serverUsername": "string",
    "username": "string"
  }
}

Validation rules:

licenseData keys must match licenseTemplate[].name of the corresponding product
value type must match licenseTemplate[].kind
required keys must match licenseTemplate[].required = true

Dynamic behavior:

Products are added/removed directly in licenseInfo.products[] via the License Info tab in the customer form.
Frontend creates a new empty license block when user adds a product via the "Add Product" selector.
Frontend allows removing a license block entirely when user removes a product.
License transfer:
  POST /customers/moveLicense/{dstId} with body { srcId } moves the license from the source customer to the destination customer
  The "Move License" action is available per-customer in the customer list
  A customer picker modal opens, allowing search by name; the source customer is excluded from the listbackend is responsible for actual removal/cleanup
5.7.6 Customer list display mapping

In customer table display:

group = resolved name by generalInfo.groupId
productTypes = resolved names from licenseInfo.products[].productId
status = resolved name by generalInfo.statusId
isBlocked = generalInfo.isBlocked
5.8 Working days
GET /workingDays/{countryId}
["2025-01-01", "2025-01-02"]
POST /workingDays/{countryId}
{
  "date": "2025-01-01",
  "action": "add | remove"
}

Rules:

backend returns non-working days (holidays/days off), not working days
action "add" = add date to holidays (mark as non-working)
action "remove" = remove date from holidays (mark as working)
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

GET /historyItem/{id} returns a single nested diff object:

{
  "generalInfo": {
    "name": {
      "ARM": {
        "old": "Old value",
        "new": "New value"
      }
    }
  },
  "items": {
    "id=10": {
      "price": {
        "old": "500",
        "new": "550"
      }
    },
    "new:id=15": {
      "name": {
        "old": "<missing>",
        "new": "Cola"
      }
    }
  }
}

A node is a leaf diff node when it contains exactly the keys "old" and "new".
All other non-empty objects are nested diff nodes.
Array-item match label keys (id=..., new:..., old:..., best_match#...) are backend-generated identifiers, not entity field names, and must be rendered as group headers.
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

user selects a country from the country dropdown (auto-selected if only one exists)
load non-working days from GET /workingDays/{countryId}
visually mark non-working days as red, working days as green
mark day as non-working via POST /workingDays/{countryId} with action add
mark day as working via POST /workingDays/{countryId} with action remove
8.5 History UI

History page must support:

global history list using GET /history
object-specific history access using GET /history/{objectId}
opening details of a single history item via GET /historyItem/{id}
display username by resolving userId
recursively render the nested diff tree returned by GET /historyItem/{id}:
  leaf diff nodes render as old/new value rows
  nested diff nodes render as labelled indented sections
  array-item match labels (id=..., new:..., old:..., best_match#...) render as group headers distinguished from ordinary field labels
  the string "<missing>" renders as a styled missing-value marker
  atomic array values (old/new are arrays) render as formatted JSON blocks
  password diffs display the provided old/new strings without any reveal logic
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
