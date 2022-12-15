<?php
defined( 'ABSPATH' ) or die( 'Nope, not accessing this' );


/**
 * ADD gancio-event / gancio-events as allowed tags in post and tinymce-editor
 */
function add_gancio_events_to_kses_allowed($the_allowed_tags)
{
  $the_allowed_tags['gancio-events'] = array('tags' => true, 'places' => true, 'theme' => true, 'id' => true, 'baseurl' => true);
  $the_allowed_tags['gancio-event'] = array('id' => true, 'url' => true);
  return $the_allowed_tags;
}
add_filter('wp_kses_allowed_html', 'add_gancio_events_to_kses_allowed', 10, 1);

function tinymce_init( $init ) {
  $ext = 'gancio-event[id,url],gancio-events[baseurl,places,tags,theme,max]';
  if ( isset( $init['extended_valid_elements'] ) ) {
    $init['extended_valid_elements'] .= ',' . $ext;
  } else {
    $init['extended_valid_elements'] = $ext;
  }
  return $init;
}
add_filter('tiny_mce_before_init', 'tinymce_init');

/** ADD SHORTCODES */
function gancio_event_handler_function( $atts, $content, $tag) {
  $a = shortcode_atts( array(
    'baseurl' => 'https://demo.gancio.org',
    'id' => 0
  ), $atts);
  return '<gancio-event baseurl="' . $a['baseurl'] . '" id=' . $a['id'] . '></gancio-event>';
}

function gancio_events_handler_function( $atts, $content, $tag) {
  $a = shortcode_atts( array(
    'baseurl' => 'https://demo.gancio.org',
    'places' => '',
    'tags' => '',
    'theme' => 'dark',
    'max' => null
  ), $atts);
  return '<gancio-events baseurl="' . $a['baseurl'] . '" theme="' . $a['theme'] . '" places="' . $a['places'] . '" tags="' . $a['tags'] . '"></gancio-events>';
}

add_action( 'init', function () {
  global $allowedposttags;
  $allowedposttags['gancio-event'] = array(
      'id' => array(),
      'baseurl' => array(),
      'theme' => array()
  );
  add_shortcode('gancio-event', 'gancio_event_handler_function');
  add_shortcode('gancio-events', 'gancio_events_handler_function');
});


/** ADD WEB COMPONENT SCRIPT */
add_action('wp_enqueue_scripts', 'add_gancio_custom_js');
function add_gancio_custom_js() {
    wp_enqueue_script('gancio-wc', plugins_url('/js/gancio-events.es.js', __FILE__));
}

