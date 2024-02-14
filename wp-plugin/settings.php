<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );
// https://codex.wordpress.org/Settings_API

// Fires as an admin screen or script is being initialized. Register out settings
  add_action('network_admin_menu', 'wpgancio_settings_init');
  add_action('admin_menu', 'wpgancio_settings_init');

add_action('add_meta_boxes_event', 'wpgancio_remove_meta_boxes', 10, 2);
function wpgancio_remove_meta_boxes () {
  remove_meta_box('postcustom', 'event', 'normal');
}

function wpgancio_settings_init() {
  

  if (!is_network_admin()) {
    add_options_page(
      'Gancio',
      'Gancio',
      'manage_options',
      'wpgancio',
      'wpgancio_options_page_html');
  } else {
    add_submenu_page(
      'settings.php',
      'Gancio',
      'Gancio',
      'manage_network_options',
      'wpgancio',
      'wpgancio_network_options_page_html');
  }

  // register a new settings page
  add_settings_section('wpgancio_settings', __('Settings'), false, 'wpgancio');

  // register a new field in the 'wpgancio_settings' section
  add_settings_field('wpgancio_instance_url',
    __('Instance URL', 'wpgancio'),
    'wpgancio_instance_url_cb', 'wpgancio',
    'wpgancio_settings'
  );

  register_setting('wpgancio', 'wpgancio_instance_url', 'wpgancio_instance_url_validate');
  register_setting('wpgancio', 'wpgancio_client_id');
  register_setting('wpgancio', 'wpgancio_client_secret');
  register_setting('wpgancio', 'wpgancio_token');
}


add_action( 'update_option_wpgancio_instance_url', 'wpgancio_update_options', 15, 2);
add_action( 'update_site_option_wpgancio_instance_url', 'wpgancio_update_options', 15, 2);
function wpgancio_update_options ($old_value, $instance_url) {
  if (!is_network_admin()) {
    $redirect_uri = admin_url('options-general.php?page=wpgancio');
    $client_id = get_option('wpgancio_client_id');
  } else {
    $redirect_uri = network_admin_url('settings.php?page=wpgancio');
    $client_id = get_site_option('wpgancio_client_id');
  }

  wp_redirect(add_query_arg(array(
    "response_type" => "code",
    "redirect_uri" => $redirect_uri,
    "scope" => "event:write",
    "client_id" => $client_id ), "{$instance_url}/oauth/authorize"));
  // return $instance_url;
  exit;
}


add_action( 'network_admin_edit_wpgancio_instance_url', 'wpgancio_instance_url_save_settings' );

function wpgancio_instance_url_save_settings(){

	// check_admin_referer( 'misha-validate' ); // Nonce security check

  if (isset($_POST['wpgancio_instance_url'])) {
    update_site_option( 'wpgancio_instance_url', $_POST['wpgancio_instance_url'] );
  } else {
    delete_site_option( 'wpgancio_instance_url');
  }


	wp_redirect( add_query_arg( array(
		'page' => 'wpgancio',
		'updated' => true ), network_admin_url('settings.php?page=wpgancio')
	));

  exit;

}



// Fires before the administration menu loads in the admin, add our options page

function wpgancio_instance_url_validate ($instance_url) {


  if (!is_network_admin()) {
    $old_instance_url = get_option('wpgancio_instance_url');
    if ($instance_url === $old_instance_url) {
      return $instance_url;
    }
  } else {
    $old_instance_url = get_site_option('wpgancio_instance_url');
    if ($instance_url === $old_instance_url) {
      return $instance_url;
    }
  }

  if (!is_network_admin()) {
    $redirect_uri = get_site_url(null, '/wp-admin/options-general.php?page=wpgancio');
  } else {
    $redirect_uri = get_site_url(null, '/wp-admin/network/settings.php?page=wpgancio');
  }

  // create this WP instance as a new client in selected gancio instance
  $response = wp_remote_post("$instance_url/api/client", array(
    'method' => 'POST',
    'body' => array(
      'client_name' => 'WPGancio',
      'redirect_uris' => esc_html($redirect_uri),
      'scopes' => 'event:write',
      'website' => 'https://gancio.org'
    )
  ));

  if (is_wp_error($response)) {
    add_settings_error('wpgancio_messages', 'wpgancio_messages',
      $response->get_error_message());
  } else {
    $data = json_decode( wp_remote_retrieve_body($response), true);
    if (!is_network_admin()) {
      update_option('wpgancio_client_secret', sanitize_key($data['client_secret']));
      update_option('wpgancio_client_id', sanitize_key($data['client_id']));
    } else {
      update_site_option('wpgancio_client_secret', sanitize_key($data['client_secret']));
      update_site_option('wpgancio_client_id', sanitize_key($data['client_id']));
    }
    return $instance_url;
  }
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
  if (is_network_admin()) {
    $instance_url = get_site_option( 'wpgancio_instance_url' );
  } else {
    $instance_url = get_option( 'wpgancio_instance_url' );
  }

// output the field
?>

  <input id="wpgancio_instance_url"
    value="<?php echo esc_attr($instance_url); ?>"
    name="wpgancio_instance_url">

  <p class="description">Instance URL you want to publish events to.</p>

  <?php
}


/**
 * top level menu:
 * callback functions
 */
function wpgancio_options_page_html() {
  // check user capabilities
 if (! current_user_can('manage_options')) { return; }

  // show error/update messages
  $code = sanitize_key(isset($_GET['code']) ? $_GET['code'] : '');
  if ( $code ) {
    update_option('wpgancio_code', $code);
    $instance_url = get_option('wpgancio_instance_url');

    $response = wp_remote_post($instance_url . "/oauth/token", array(
      'body' => array(
        'client_id' => get_option('wpgancio_client_id'),
        'client_secret' => get_option('wpgancio_client_secret'),
        'scope' => 'event:write',
        'grant_type' => 'authorization_code',
        'code' => $code
      )));
    if (is_wp_error($response)) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response->get_error_message());
      settings_errors('wpgancio_messages');
    } elseif ($response['response']['code'] != 200) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', wp_remote_retrieve_body($response));
      settings_errors('wpgancio_messages');
    } else {
      $data = json_decode(wp_remote_retrieve_body($response), true);
      update_option('wpgancio_token', sanitize_key($data['access_token']));
      update_option('wpgancio_refresh', sanitize_key($data['refresh_token']));
      add_settings_error('wpgancio_messages', 'wpgancio_messages', 'Association completed!', 'success');
      settings_errors('wpgancio_messages');
    }
  }
  wpgancio_general_options_page_html();
}


function wpgancio_network_options_page_html() {
  // check user capabilities
 if (! current_user_can('manage_site_options')) { return; }

  // show error/update messages
  $code = sanitize_key(isset($_GET['code']) ? $_GET['code'] : '');
  if ( $code ) {
    update_site_option('wpgancio_code', $code);
    $instance_url = get_site_option('wpgancio_instance_url');

    $response = wp_remote_post($instance_url . "/oauth/token", array(
      'body' => array(
        'client_id' => get_site_option('wpgancio_client_id'),
        'client_secret' => get_site_option('wpgancio_client_secret'),
        'scope' => 'event:write',
        'grant_type' => 'authorization_code',
        'code' => $code
      )));

    if (is_wp_error($response)) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', $response->get_error_message());
      settings_errors('wpgancio_messages');
    } elseif (wp_remote_retrieve_response_code($response) != 200) {
      add_settings_error('wpgancio_messages', 'wpgancio_messages', wp_remote_retrieve_body($response));
      settings_errors('wpgancio_messages');
    } else {
      $data = json_decode(wp_remote_retrieve_body($response), true);
      update_site_option('wpgancio_token', sanitize_key($data['access_token']));
      update_site_option('wpgancio_refresh', sanitize_key($data['refresh_token']));
      add_settings_error('wpgancio_messages', 'wpgancio_messages', 'Association completed!', 'success');
      settings_errors('wpgancio_messages');
    }
  }
  wpgancio_general_options_page_html();
}

function wpgancio_general_options_page_html () {
?>
 <div class="wrap">

 <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
 <?php if (!is_network_admin()) { ?>
<form action="options.php" method="post">
 <?php } else { ?>
 <form action="edit.php?action=wpgancio_instance_url" method="post">
 <?php }

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
