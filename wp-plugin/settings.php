<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );


// Fires as an admin screen or script is being initialized. Register out settings
add_action( 'admin_init', 'wpgancio_settings_init' );
function wpgancio_settings_init() {
  register_setting( 'wpgancio', 'wpgancio_options' );

  // register a new settings page
  add_settings_section('wpgancio_settings', __('Settings'), FALSE, 'wpgancio');

  // register a new field in the 'wpgancio_settings' section
  add_settings_field('wpgancio_field_url', __( 'Instance URL', 'wpgancio' ),
    'wpgancio_field_url_cb', 'wpgancio',
    'wpgancio_settings', [ 'label_for' => 'wpgancio_field_url' ] );
}

add_action( 'update_option_wpgancio_options', 'wpgancio_update_options', 15, 2);

// Fires before the administration menu loads in the admin, add our options page
add_action( 'admin_menu', 'wpgancio_options_page' );

function wpgancio_update_options ($old_value, $new_value) {
  $instance_url = $new_value['wpgancio_field_url'];
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
    update_option('wpgancio_client_secret', $data['client_secret']);
    update_option('wpgancio_client_id', $data['client_id']);
    $query = join('&', array(
      'response_type=code',
      'redirect_uri=' . esc_html($redirect_uri),
      'scope=event:write',
      'client_id=' . get_option('wpgancio_client_id'),
      'state=antani'
    ));

    wp_redirect("${instance_url}/authorize?${query}");
    exit;
  }
};



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

function wpgancio_field_url_cb( $args ) {
  // get the value of the setting we've registered with register_setting()
  $options = get_option( 'wpgancio_options' );
  // output the field
  ?>

  <input id="<?php echo esc_attr( $args['label_for'] ); ?>"
    value="<?php echo $options[ $args['label_for'] ]; ?>"
    name="wpgancio_options[<?php echo esc_attr( $args['label_for'] ); ?>]">

  <p class="description">
    <?php esc_html_e( 'Insert your gancio instance URL', 'wpgancio' ); ?>
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
  //settings_errors( 'wpgancio_messages' );

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
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response->get_error_message());
      settings_errors( 'wpgancio_messages' );
    } else if ( $response['response']['code'] == 500 ) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', wp_remote_retrieve_body($response));
      settings_errors( 'wpgancio_messages' );
    } else {
      $data = json_decode( wp_remote_retrieve_body($response), true);
      update_option('wpgancio_token', $data['access_token']);
      update_option('wpgancio_refresh', $data['refresh_token']);
      add_settings_error('wpgancio_messages', 'wpgancio_messages', 'TUTTO REGO MATCH!', 'success');
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
