<?php

/**
 * Provide a admin area view for the plugin's settings page
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://github.com/Rafa410/
 * @since      1.0.0
 *
 * @package    Agenda
 * @subpackage Agenda/admin/partials
 */
?>

<div class="wrap">
	<h2><?= __( 'Opcions de l\'agenda', 'agenda' ) ?></h2>
	<?php settings_errors(); ?>
	<form method="POST" action="options.php" class="card">
		<h3><?= __( 'Personalització', 'agenda' ) ?></h3>
		<?php
			// settings_fields( 'agenda_ui_settings' );
			// do_settings_sections( 'agenda_ui_settings' );
		?>
		<?php submit_button(); ?>
	</form>
</div>