=== WPGancio ===
Contributors: lesion, nutria
Donate link: https://gancio.org
Tags: events, gancio, fediverse, AP, activity pub
Requires at least: 4.7
Tested up to: 6.5
Stable tag: 1.12
Requires PHP: 7.0
License: AGPLv3 or later
License URI: https://www.gnu.org/licenses/agpl-3.0.html

This plugin allows you to [embed](https://gancio.org/usage/embed) a list of events or a single event from your [Gancio](https://gancio.org) website using a shortcode.

== Description ==
This plugin allows you to [embed](https://gancio.org/usage/embed) a list of events or a single event from your [Gancio](https://gancio.org) website using a shortcode.
It also allows you to connects a [Gancio](https://gancio.org) instance to a your wordpress website to automatically push events published on Wordpress:
for this to work an event manager plugin is required, [Event Organiser](https://wp-event-organiser.com/) and [The Events Calendar](https://theeventscalendar.com/products/wordpress-events-calendar/) are supported. Adding another plugin it's an easy task and you have a guide available in the repo that shows you how to do it.
 

== Changelog ==

= 1.12 = 
* Restore Event Organizer functionality

= 1.11 =
* Add support to The Events Calendar WordPress plugin

= 1.10 =
* Add PHP 8.2 compatibility 

= 1.8 =
* Allow `collection` and `maxlength` attribute to shortcode

= 1.7 =
* Fix merge event tags while posting to an instance

= 1.6 =
* Support MU installation

= 1.4 =
use `WP_GANCIO_DEFAULT_INSTANCEURL` as default instance url

= 1.3 =
* Update [webcomponent](https://gancio.org/usage/embed) script

= 1.2 =
* Enqueue [webcomponent](https://gancio.org/usage/embed) script
* Allow gancio-event and gancio-events tag
* Add [gancio-event] and [gancio-events] shortcodes

= 1.0 =
* First release
