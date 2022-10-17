<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/Rafa410/
 * @since             1.0.0
 * @package           Agenda
 *
 * @wordpress-plugin
 * Plugin Name:       Agenda Vue
 * Plugin URI:        https://github.com/Rafa410/agenda-vue
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.0.2
 * Author:            Rafa Soler
 * Author URI:        https://github.com/Rafa410/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       agenda
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'AGENDA_VERSION', '1.0.2' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-agenda-activator.php
 */
function activate_agenda() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-agenda-activator.php';
	Agenda_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-agenda-deactivator.php
 */
function deactivate_agenda() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-agenda-deactivator.php';
	Agenda_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_agenda' );
register_deactivation_hook( __FILE__, 'deactivate_agenda' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-agenda.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_agenda() {

	$plugin = new Agenda();
	$plugin->run();

}
run_agenda();
