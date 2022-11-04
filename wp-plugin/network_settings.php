<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );
// https://codex.wordpress.org/Settings_API

if (!is_network_admin()) { return; }

// Fires before the administration menu loads in the admin, add our options page
// add_action( 'admin_menu', 'wpgancio_options_page' );
add_action('network_admin_menu', 'wpgancio_network_options_page');
add_action('network_admin_edit_wpgancio', 'wpgancio_update');
// add_action( 'update_option_wpgancio_instance_url', 'wpgancio_update_options', 15, 2);

function wpgancio_update () {
  $instance_url = get_site_option('wpgancio_instance_url');
  // // check_admin_referer( $this->settings_slug . '-page-options' );

  // function wpgancio_update_options ($old_value, $instance_url) {
    $redirect_uri = network_admin_url('settings.php?page=wpgancio');
    $query = join('&', array(
      'response_type=code',
      'redirect_uri=' . esc_url($redirect_uri),
      'scope=event:write',
      'client_id=' . get_site_option('wpgancio_client_id'),
    ));
  
    wp_redirect("${instance_url}/oauth/authorize?${query}");
    exit;
}

function wpgancio_network_options_page () {
  add_submenu_page('settings.php', 'Gancio', 'Gancio', 'manage_options', 'wpgancio', 'wpgancio_network_options_page_html');
}

// function wpgancio_options_page() {
//   // add top level menu page
//   add_options_page(
//     'Gancio',
//     'Gancio',
//     'manage_options',
//     'wpgancio',
//     'wpgancio_options_page_html'
//   );
// }

// instance url field cb
// field callbacks can accept an $args parameter, which is an array.
// $args is defined at the add_settings_field() function.
// wordpress has magic interaction with the following keys: label_for, class.
// the "label_for" key value is used for the "for" attribute of the <label>.
// the "class" key value is used for the "class" attribute of the <tr> containing the field.
// you can add custom key value pairs to be used inside your callbacks.

/**
 * top level menu:
 * callback functions
 */
function wpgancio_network_options_page_html() {
  // check user capabilities
 if (! current_user_can('manage_network_options')) { return; }

  // show error/update messages
  $code = sanitize_key(isset($_GET['code']) ? $_GET['code'] : '');
  if ( $code ) {
    update_site_option('wpgancio_code', $code);
    $instance_url = get_site_option( 'wpgancio_instance_url' );

    $response = wp_remote_post($instance_url . "/oauth/token", array(
      'body' => array(
        'client_id' => get_site_option('wpgancio_client_id'),
        'client_secret' => get_site_option('wpgancio_client_secret'),
        'scope' => 'event:write',
        'grant_type' => 'authorization_code',
        'code' => $code
      )));
    if (is_wp_error( $response ) ) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response->get_error_message());
      settings_errors( 'wpgancio_messages' );
    } elseif ( $response['response']['code'] != 200 ) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response['response']['code'] . ' ' . wp_remote_retrieve_body($response));
      settings_errors( 'wpgancio_messages' );
    } else {
      $data = json_decode( wp_remote_retrieve_body($response), true);
      update_site_option('wpgancio_token', sanitize_key($data['access_token']));
      update_site_option('wpgancio_refresh', sanitize_key($data['refresh_token']));
      add_settings_error('wpgancio_messages', 'wpgancio_messages', 'Association completed!', 'success');
      settings_errors( 'wpgancio_messages' );
    }
  }


?>

 <div class="wrap">

 <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
 <form action="edit.php?action=wpgancio" method="post">
 <?php

  // output security fields for the registered setting "wpgancio"
  settings_fields('wpgancio');

  // output setting sections and their fields
  // (sections are registered for "wpgancio", each field is registered to a specific section)
  do_settings_sections('wpgancio');

  // output save settings button
  submit_button('Save Settings');
 ?>
 </form>
 </div>
 <?php
}
