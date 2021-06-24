---
layout: default
title: API
permalink: /dev/api
parent: Hacking
nav_order: 8
---


1. TOC
{:toc}




## Add a new event

POST
{: .label .label-orange}

**`/event`**

> info "info"
> `Content-Type` has to be `multipart/form-data` to support image upload


**Params**

| title | `string` | event's title |
| description | `string` | event's description (html accepted and sanitized) |
| place_name | `string` | the name of the place |
| place_address | `string` | the address of the place |
| start_datetime | `integer` | start timestamp |
| multidate | `integer` | is a multidate event? |
| tags | `array` | List of tags |
| recurrent | `object` | Recurrent event details |
| recurrent.frequency | `string` | could be `1w` or `2w` |
| recurrent.type | `string` | not used |
| recurrent.days | `array` | array of days |
| image | `image` | Image |


---

## Get current authenticated user

GET
{: .label .label-green}

**`/api/user`**





**Response**
```json
{
   "description" : null,
   "recover_code" : "",
   "id" : 1,
   "createdAt" : "2020-01-29T18:10:16.630Z",
   "updatedAt" : "2020-01-30T22:42:14.789Z",
   "is_active" : true,
   "settings" : "{}",
   "email" : "eventi@cisti.org",
   "is_admin" : true
}
```
---

