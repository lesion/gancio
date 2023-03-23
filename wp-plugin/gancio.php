<?php
/*
Plugin Name: WPGancio
Plugin URI:  https://gancio.org
Description: Connects an user of a gancio instance to a Wordpress user so that published events are automatically pushed with Gancio API.
Version:     1.7
Author:      Gancio
License:  AGPL 3.0

WPGancio is free software: you can redistribute it and/or modify it under the
terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the license, or any later version.

WPGancio is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with (WPGancio). If not, see (https://www.gnu.org/licenses/agpl-3.0.html).
*/

defined('ABSPATH') or die('Nope, not accessing this');
define('WPGANCIO_DIR', plugin_dir_path(__FILE__));
require_once(WPGANCIO_DIR . 'settings.php');

require_once(WPGANCIO_DIR . 'wc.php');
require_once(WPGANCIO_DIR . 'oauth.php');



/**
 * What does WPGancio do?
 * This plugin connects a user of a gancio instance to a Wordpress user so that events published
 * on Wordpress are automatically inserted.
 * It requires an event manager plugin, only Event Organiser (https://wp-event-organiser.com/) is
 * supported until now but to add another plugin it's easy.
 */