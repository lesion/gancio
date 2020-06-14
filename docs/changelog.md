---
layout: default
title: Changelog
permalink: /changelog
nav_order: 10
---


All notable changes to this project will be documented in this file.


### 0.23.0
- send AP Event Object instead of Note
- show only future unconfirmed events in admin panel
- new polish locale
- add friendly instances (an additional menu is shown)
- use user's logo not project's logo in federation
- start WPGancio plugin
- support media upload via url (API only)
- confirm before remove a resource
- confirm before remove a friendly instance
- event description supports some html tag
- fix redirect after login

### 0.22.0
- add admin announcement support (fix #74)
- each instance has a specific timezone you can choose from admin's panel
- refactoring language management (you can choose a default instance's language):
  usually UX language is choosen looking at Accepted-Language header but there
  are messages not generated from an http request (eg. sending events via AP).
  In those cases a default instance's language is choosen (default 'en').
- use lazy loaded images
- better mobile experience for admins
- single day only recurring events
- fix user block in fediverse moderation
- filter and linkify content from fediverse
- add a lot of help strings in admin panel
- use html2text for event description in og: meta
- update deps
- fix a moment.js typo from/to issue
- fix #73 

### 0.21.0
- a new recurring events logic (a la taskwarrior):
  - each occurrence of a recurring event could be personalized.
  - occurrence of recurring events are skippable.
  - occurrence generation could be paused.
- support `h-event` microformats! in homepage and in any single event's page
- add a background task manager (email, recurring events creation)
- sanitize html content coming from fediverse and event description with dompurify
  - also remove `fbclid` params in links
- front end search optimization
- use oauth2 for everything, password flow for webclient, this also fix
  some issue with authentication
- clickable tags / places @ home (to add them as filters)
- use a cleaner menububble for the new editor
- add local smtp and sendmail options on configuration setup
- check permission for resource removal request from fediverse
- add resource from fediverse also when inReplyTo is another resource
- automatic API documentation inclusion in docs
- split moderation in another tab inside admin panel
- use axios instead of fetch everywhere
- lot of ux improvements & error handling
- search links in event description with linkifyjs while add/edit events
- remove text templates for emails and use html2text instead
- fix email unique index for users!



### 0.20.0
- New layout (navbar/footer/visible filters)
- two month calendar on large display
- admin could edit title, description, about, favicon & logo directly form admin panel
- new add event layout => https://demo.gancio.org/add
- new editor to describe events (bold, italic, link) supported also using copy/paste
- the editor also support live markdown (try using ### at line start)
- start oauth2 server implementation (documentation: https://gancio.org/dev/oauth)
- add fediverse moderation
- fix embedding an event via iframe
- images converted in .webp
- new catalan translation, thanks @fadelkon

### 0.17.14
- [locale] add catalan
- [fix] fedi outbox

### 0.17.12
- [ui] add admin section on event page in mobile #63
- [fix] remove username from users

### 0.17.11
- [refactor] s/fed_user/ap_user
- [fedi] admin moderation

### 0.17.10
- [refactor] s/comment/resource/
- [refactor] remove `username` field
- [doc] about and federation

### 0.17.8
- [fix] use thumb in head og:img only

### 0.17.7
- [fix] #58 wrong url for RSS feed

### 0.17.5
- [fedi] comments moderation
- [fedi] user moderation
- [fedi] instance moderation
- [hotfix] cli setup
- [doc] fix debian upgrade
- [fix] comment ap_id key length
- [fix] fediverse signature
- [fedi] better /inbox /followers response

### 0.17.0
- [feat] add rss link @homepage
- [ui] add lot of explanation text
- [ui] show copied messages
- [admin] show n of unconfirmed users/events
- [ui] spinner while event image is loading
- [fedi] add follow me dialog in event
- [fix] do not add reminders in full ics export
- [fix] remove spaces from hashtags sent via AP
- [fix] #56 unconfirmed event sent via ap
- [fix] localPosts/comments in fediverse stats

### 0.16.0
- [feat] embed event as widget in external website
- [fedi] instances moderation in admin
- [fix] toggle event visibility by owner
- [fedi] manage unboost
- [refactoring] auth as middleware

### 0.15.7
- [fix] minor

### 0.15.6
- [fix] tags in event

### 0.15.5
- [model] migrations setup
- [feat] embeddable event widget/iframe

### 0.15.2
- [fix] delete event
- [fix] wrong html hierarchy

### 0.15.0
- [fix] backtop icon on mobile
- [fix] webfinger nodeinfo return real node info
- [fix] register email confirmation
- [feat] add federation settings (enable comments/boost/like)
- [feat] new event page layout
- [feat] could download .ics of event
- [feat] add cors to feed requests
- [refactoring] settings middleware, cleaning codebase

### 0.14.18
- [improve] better quality for images
- [fix] password recovery email
- [feat] new action field for notification 
- [feat] add DEBUG env variable in docker-compose.yml
- [style] fixed width in confirmation events table
- [fix] #38 timezone issue in rss export and using tor...

### 0.14.17
- [fix] image previews from external website
- [fix] docker-compose postgresql docs
- [improve] export white logo to fediverse