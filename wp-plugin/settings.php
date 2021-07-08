<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );
// https://codex.wordpress.org/Settings_API

// Fires as an admin screen or script is being initialized. Register out settings
add_action( 'admin_init', 'wpgancio_settings_init' );
function wpgancio_settings_init() {

  // register a new settings page
  add_settings_section('wpgancio_settings', __('Settings'), FALSE, 'wpgancio');

  // register a new field in the 'wpgancio_settings' section
  add_settings_field('wpgancio_instance_url', __( 'Instance URL', 'wpgancio' ),
    'wpgancio_instance_url_cb', 'wpgancio',
    'wpgancio_settings');

  register_setting( 'wpgancio', 'wpgancio_instance_url', 'wpgancio_instance_url_validate' );
}

add_action( 'update_option_wpgancio_instance_url', 'wpgancio_update_options', 15, 2);
function wpgancio_update_options ($old_value, $instance_url) {
  $redirect_uri = get_site_url(null, '/wp-admin/options-general.php?page=wpgancio' );
  $query = join('&', array(
    'response_type=code',
    'redirect_uri=' . esc_url($redirect_uri),
    'scope=event:write',
    'client_id=' . get_option('wpgancio_client_id'),
  ));

  wp_redirect("${instance_url}/authorize?${query}");
  exit;
}

// Fires before the administration menu loads in the admin, add our options page
add_action( 'admin_menu', 'wpgancio_options_page' );

function wpgancio_instance_url_validate ($instance_url) {
  $redirect_uri = get_site_url(null, '/wp-admin/options-general.php?page=wpgancio' );

  // create this WP instance as a new client in selected gancio instance
  $response = wp_remote_post( "$instance_url/api/client", array(
    'method' => 'POST',
    'body' => array(
      'client_name' => 'WPGancio',
      'redirect_uris' => esc_html($redirect_uri),
      'scopes' => 'event:write',
      'website' => 'https://gancio.org'
    )
  ));

  if ( is_wp_error( $response ) ) {
    add_settings_error('wpgancio_messages', 'wpgancio_messages',
      $response->get_error_message());
  } else {
    $data = json_decode( wp_remote_retrieve_body($response), true);
    update_option('wpgancio_client_secret', sanitize_key($data['client_secret']));
    update_option('wpgancio_client_id', sanitize_key($data['client_id']));
    return $instance_url;
  }
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

// instance url field cb
// field callbacks can accept an $args parameter, which is an array.
// $args is defined at the add_settings_field() function.
// wordpress has magic interaction with the following keys: label_for, class.
// the "label_for" key value is used for the "for" attribute of the <label>.
// the "class" key value is used for the "class" attribute of the <tr> containing the field.
// you can add custom key value pairs to be used inside your callbacks.
function wpgancio_instance_url_cb( $args ) {
  // get the value of the setting we've registered with register_setting()
  $instance_url = get_option( 'wpgancio_instance_url' );
  // output the field
  ?>

  <input id="wpgancio_instance_url"
    value="<?php echo esc_attr($instance_url); ?>"
    name="wpgancio_instance_url">

  <p class="description">
    <?php esc_html( 'Insert your gancio instance URL', 'wpgancio' ); ?>
  </p>

  <?php
}


/**
 * top level menu:
 * callback functions
 */
function wpgancio_options_page_html() {
  // check user capabilities
  if ( ! current_user_can( 'manage_options' ) ) { return; }

  // show error/update messages
  $code = sanitize_key($_GET['code']);
  if ( $code ) {
    update_option('wpgancio_code', $code);
    $instance_url = get_option( 'wpgancio_instance_url' );

    $response = wp_remote_post($instance_url . "/oauth/token", array(
      'body' => array(
        'client_id' => get_option('wpgancio_client_id'),
        'client_secret' => get_option('wpgancio_client_secret'),
        'scope' => 'event:write',
        'grant_type' => 'authorization_code',
        'code' => $code
      )));
    if ( is_wp_error( $response ) ) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response->get_error_message());
      settings_errors( 'wpgancio_messages' );
    } else if ( $response['response']['code'] == 500 ) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', wp_remote_retrieve_body($response));
      settings_errors( 'wpgancio_messages' );
    } else {
      $data = json_decode( wp_remote_retrieve_body($response), true);
      update_option('wpgancio_token', sanitize_key($data['access_token']));
      update_option('wpgancio_refresh', sanitize_key($data['refresh_token']));
      add_settings_error('wpgancio_messages', 'wpgancio_messages', 'Association completed!', 'success');
      settings_errors( 'wpgancio_messages' );
    }
  }


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
