<?php
/**
 * Customise login screen
 *
 * @package itereon
 */

/**
 * Changing the logo link from wordpress.org to root domain
 */
function itereon_login_url() {
	return home_url();
}

add_filter( 'login_headerurl', 'itereon_login_url' );

/**
 * Changing the alt text on the logo to show your site name
 */
function itereon_login_title() {
	return get_option( 'blogname' );
}

add_filter( 'login_headertext', 'itereon_login_title' );

/**
 * Styles for login page
 */
function itereon_login_stylesheet() {
	wp_enqueue_style( 'itereon-login', IT_CSS . 'login.min.css' );
}

add_action( 'login_enqueue_scripts', 'itereon_login_stylesheet' );
