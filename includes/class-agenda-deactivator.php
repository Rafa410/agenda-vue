<?php

/**
 * Fired during plugin deactivation
 *
 * @link       https://github.com/Rafa410/
 * @since      1.0.0
 *
 * @package    Agenda
 * @subpackage Agenda/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Agenda
 * @subpackage Agenda/includes
 * @author     Rafa Soler <rafasoler10@gmail.com>
 */
class Agenda_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		// Unregister the custom post type, so the rules are no longer in memory.
		unregister_post_type( 'agenda_event' );
		// Clear the permalinks to remove our post type's rules from the database.
		flush_rewrite_rules();
	}

}
