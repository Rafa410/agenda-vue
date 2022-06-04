<?php

/**
 * Fired during plugin activation
 *
 * @link       https://github.com/Rafa410/
 * @since      1.0.0
 *
 * @package    Agenda
 * @subpackage Agenda/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Agenda
 * @subpackage Agenda/includes
 * @author     Rafa Soler <rafasoler10@gmail.com>
 */
class Agenda_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
		// Clear the permalinks after the registering custom post types.
    	flush_rewrite_rules();
	}

}
