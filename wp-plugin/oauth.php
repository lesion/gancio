<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );

// eventorganizer / triggered after an event has been updated
// http://codex.wp-event-organiser.com/hook-eventorganiser_save_event.html
add_action('eventorganiser_save_event', 'wpgancio_save_event', 15);
add_action('wp_trash_post', 'delete_post', 15);

function delete_post ($post_id) {
  $post = get_post($post_id);
  $instance_url = get_option('wpgancio_instance_url');

  if ($post->post_type == 'event') {
    $gancio_id = get_post_meta($post_id, 'gancio_id', TRUE);
    if ($gancio_id) {
      $body['id'] = $gancio_id;
      $http = _wp_http_get_object();
      $response = $http->request( "${instance_url}/api/event/${gancio_id}", array(
        'method' => 'DELETE',
        'headers' => array (
          'Authorization' => 'Bearer ' . get_option('wpgancio_token')
        )));
    }
  }
}

function wpgancio_save_event ($post_id) {
  $event = get_post( $post_id );

  // do not save if it's a draft
  if ($event->post_status != 'publish') {
    return;
  }

  $gancio_id = get_post_meta($post_id, 'gancio_id', TRUE);

  // image_path
  $date = eo_get_schedule_start( 'U', $post_id );

  // get place details
  $venue_id = eo_get_venue($post_id);
  $place_name = eo_get_venue_name($venue_id);
  $place_address = eo_get_venue_address($venue_id);
  $instance_url = get_option('wpgancio_instance_url');

  $body = array (
    'title' => $event->post_title,
    'description' => $event->post_content,
    'start_datetime' => intval($date),
    'place_name' => $place_name,
    'place_address' => "${place_address['address']}${place_address['city']}"
  );

  // add image if specified
  $image_url = get_the_post_thumbnail_url($post_id);
  if ($image_url) {
    $body['image_url'] = $image_url;
  }

  // update
  if ($gancio_id) {
    $body['id'] = $gancio_id;
    $http = _wp_http_get_object();
    $response = $http->request( $instance_url . '/api/event', array(
      'method' => 'PUT',
      'headers' => array (
        'Authorization' => 'Bearer ' . get_option('wpgancio_token')
      ), 'body' => $body ));
  } else { // or create
    $response = wp_remote_post($instance_url . '/api/event', array(
      'headers' => array (
        'Authorization' => 'Bearer ' . get_option('wpgancio_token')
      ), 'body' => $body ));
  }

  if ( is_wp_error( $response ) ) {
    $error_message = $response->get_error_message();
    echo "<div class='error notice'><p>${error_message}</p></div>";
    return;
  }
  $data = json_decode(wp_remote_retrieve_body($response));
  update_post_meta($post_id, 'gancio_id', $data->id);
}
