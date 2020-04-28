<?php
/*
Plugin Name: WPGancio
Plugin URI:  https://gancio.org
Description:
Version:     1.0
Author:
Author URI:  https://gancio.org
License:     GPL2
License URI: https://

Copyright YEAR PLUGIN_AUTHOR_NAME (email : your email address)
(Plugin Name) is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
(Plugin Name) is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with (WPGancio). If not, see (http://link to your plugin license).
*/


defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );
/**
 * @internal never define functions inside callbacks.
 * these functions could be run multiple times; this would result in a fatal error.
 */

/**
 * custom option and settings
 */
function wpgancio_settings_init() {
  // register a new setting for "wpgancio" page
  register_setting( 'wpgancio', 'wpgancio_options' );
 
  // register a new section in the "wpgancio" page
  add_settings_section(
    'wpgancio_section_developers',
    __( 'Gancio settings.', 'wpgancio' ),
    'wpgancio_section_developers_cb',
    'wpgancio');
 
  // register a new field in the "wporg_section_developers" section, inside the "wporg" page
  add_settings_field(
    'wpgancio_field_url', // as of WP 4.6 this value is used only internally
    // use $args' label_for to populate the id inside the callback
    __( 'Instance URL', 'wpgancio' ),
    'wpgancio_field_url_cb',
    'wpgancio',
    'wpgancio_section_developers',
    [
      'label_for' => 'wpgancio_field_url',
      'class' => 'wpgancio_row',
      'wpgancio_custom_data' => 'custom',
    ]
  );
}

/**
 * register our wpgancio_settings_init to the admin_init action hook
 */
add_action( 'admin_init', 'wpgancio_settings_init' );
add_action( 'update_option_wpgancio_options', 'wpgancio_update_options', 15, 2);

function wpgancio_update_options ($old_value, $new_value) {
  $instance_url = $new_value['wpgancio_field_url'];
  $redirect_uri = get_site_url(null, '/wp-admin/options-general.php?page=wpgancio' );
  // wp_redirect(get_option('wpgancio_field_url'));
  $response = wp_remote_post( "$instance_url/api/client", array(
    'method' => 'POST',
    'body' => array(
      'client_name' => 'WPGancio',
      'redirect_uris' => $redirect_uri,
      'scopes' => 'event:write',
      'website' => 'https://gancio.org'
    )
  ));

  if ( is_wp_error( $response ) ) {
    $error_message = $response->get_error_message();
    echo "Something went wrong: $error_message";
    exit;
  }
  $data = json_decode( wp_remote_retrieve_body($response), true);
  // var_dump($data);
  update_option('wpgancio_client_secret', $data['client_secret']);
  update_option('wpgancio_client_id', $data['client_id']);
  wp_redirect($instance_url . "/authorize?response_type=code&redirect_uri=$redirect_uri&scope=event:write&client_id=" . get_option('wpgancio_client_id'));
  exit;
};

function wpgancio_update_event ($post_id) {
  $event = get_post( $post_id );
  $date = eo_get_schedule_start( 'U', $post_id );
  $venue_id = eo_get_venue($post_id);
  $place_name = eo_get_venue_name($venue_id);
  $place_address = eo_get_venue_address($venue_id);
  $options = get_option( 'wpgancio_options' );
  $instance_url = $options['wpgancio_field_url'];
  $response = wp_remote_post($instance_url . '/api/event', array(
   'headers' => array (
     'Authorization' => 'Bearer ' . get_option('wpgancio_token')
   ),
   'body' => array(
     'title' => $event->post_title,
     'description' => $event->post_content,
     'start_datetime' => intval($date),
     'place_name' => $place_name,
     'place_address' => $place_address
   )
  ));
  if ( is_wp_error( $response ) ) {
    $error_message = $response->get_error_message();
    echo "Something went wrong: $error_message";
    exit;
  }
  var_dump($response);
  $data = wp_remote_retrieve_body($response);
  // syslog(1, "sono qua!");
}

add_action('eventorganiser_save_event', 'wpgancio_update_event', 15);

/**
 * custom option and settings:
 * callback functions
 */
 
// developers section cb 
// section callbacks can accept an $args parameter, which is an array.
// $args have the following keys defined: title, id, callback.
// the values are defined at the add_settings_section() function.
function wpgancio_section_developers_cb( $args ) {
 ?>
 <p id="<?php echo esc_attr( $args['id'] ); ?>"><?php esc_html_e( 'Follow the white rabbit.', 'wporg' ); ?></p>
 <?php
}

// instance url field cb
// field callbacks can accept an $args parameter, which is an array.
// $args is defined at the add_settings_field() function.
// wordpress has magic interaction with the following keys: label_for, class.
// the "label_for" key value is used for the "for" attribute of the <label>.
// the "class" key value is used for the "class" attribute of the <tr> containing the field.
// you can add custom key value pairs to be used inside your callbacks.
function wpgancio_field_url_cb( $args ) {
 // get the value of the setting we've registered with register_setting()
 $options = get_option( 'wpgancio_options' );
 // output the field
 ?>
 <input id="<?php echo esc_attr( $args['label_for'] ); ?>" value="<?php echo $options[ $args['label_for'] ]; ?>"
 data-custom="<?php echo esc_attr( $args['wpgancio_custom_data'] ); ?>"
 name="wpgancio_options[<?php echo esc_attr( $args['label_for'] ); ?>]"
 >
 <p class="description">
 <?php esc_html_e( 'Insert your gancio instance URL', 'wpgancio' ); ?>
 </p>
 <?php
}


function wpgancio_options_page() {
  // add top level menu page
  add_options_page(
  'Gancio',
  'Gancio',
  'manage_options',
  'wpgancio',
  'wpgancio_options_page_html'
  );
}

/**
 * register our wporg_options_page to the admin_menu action hook
 */
add_action( 'admin_menu', 'wpgancio_options_page' );

/**
 * top level menu:
 * callback functions
 */
function wpgancio_options_page_html() {
  $code = $_GET['code'];
  if ( $code ) {
    update_option('wpgancio_code', $code);
    $options = get_option( 'wpgancio_options' );
    $instance_url = $options['wpgancio_field_url'];
    $response = wp_remote_post($instance_url . "/oauth/token", array(
      'body' => array(
        'client_id' => get_option('wpgancio_client_id'),
        'client_secret' => get_option('wpgancio_client_secret'),
        'scope' => 'event:write',
        'grant_type' => 'authorization_code',
        'code' => $code,
        'state' => 'antani'
      )));
    if ( is_wp_error( $response ) ) {
      $error_message = $response->get_error_message();
      echo "Something went wrong: $error_message";
      exit;
    }
    $data = json_decode( wp_remote_retrieve_body($response), true);
    update_option('wpgancio_token', $data['access_token']);
    update_option('wpgancio_refresh', $data['refresh_token']);
  }

  // check user capabilities
  if ( ! current_user_can( 'manage_options' ) ) { return; }

  // add error/update messages
  // check if the user have submitted the settings
  // wordpress will add the "settings-updated" $_GET parameter to the url
  if ( isset( $_GET['settings-updated'] ) ) {
    // add settings saved message with the class of "updated"
    add_settings_error( 'wpgancio_messages', 'wpgancio_message', __( 'Settings Saved', 'wpgancio' ), 'updated' );
  }

  // show error/update messages
  settings_errors( 'wpgancio_messages' );

?>

 <div class="wrap">
 <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
 <form action="options.php" method="post">
 <?php
 // output security fields for the registered setting "wpgancio"
 settings_fields( 'wpgancio' );
 // output setting sections and their fields
 // (sections are registered for "wpgancio", each field is registered to a specific section)
 do_settings_sections( 'wpgancio' );
 // output save settings button
 submit_button( 'Save Settings' );
 ?>
 </form>
 </div>
 <?php
}


