<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://github.com/Rafa410/
 * @since      1.0.0
 *
 * @package    Agenda
 * @subpackage Agenda/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Agenda
 * @subpackage Agenda/admin
 * @author     Rafa Soler <rafasoler10@gmail.com>
 */
class Agenda_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

		add_action( 'init', array( $this, 'register_custom_post_types' ));
		add_action( 'admin_menu', array( $this, 'add_plugin_to_admin_menu' ), 9 );
		add_action( 'add_meta_boxes_agenda_events', array( $this, 'setup_agenda_metaboxes' ));
		add_action( 'save_post_agenda_events', array( $this, 'save_agenda_metabox_data') );

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Agenda_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Agenda_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/agenda-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Agenda_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Agenda_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/agenda-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	 * Register a custom post typed for the agenda
	 * 
	 * @since 1.0.0
	 */
	public function register_custom_post_types() {
		$labels = array(
			'name' 					=> __( 'Events', 'agenda' ),
			'singular_name' 		=> __( 'Event', 'agenda' ),
			'add_new' 				=> __( 'Afegir event', 'agenda' ),
			'add_new_item' 			=> __( 'Afegir nou event', 'agenda' ),
			'edit_item' 			=> __( 'Editar event', 'agenda' ),
			'new_item' 				=> __( 'Nou event', 'agenda' ),
			'view_item' 			=> __( 'Veure event', 'agenda' ),
			'search_items' 			=> __( 'Cercar event', 'agenda' ),
			'not_found' 			=> __( 'No s\'han trobat events', 'agenda' ),
			'not_found_in_trash'	=> __( 'No s\'han trobat events a la paperera', 'agenda' ),
		);
		$args = array(
			'labels' 		=> $labels, 									// Specific labels for this post type, e.g. Plugin name
			'public' 		=> true, 										// Whether or not this post type is exposed to the public
			'show_in_menu'	=> $this->plugin_name, 							// Where to show this post type in the admin menu
			'supports' 		=> array( 'title', 'editor', 'custom_fields'),	// Features this post type supports
			'has_archive' 	=> false, 										// We don't need an archive since we build our own templates using The Loop
			'menu_icon' 	=> 'dashicons-calendar', 						// Icon to use for this post type in the admin menu
			'rewrite'     	=> array(									
				'slug' 		=> _x( 'events', 'slug', 'agenda' )			// Custom slug (URL) for this post type
			),
			'show_in_rest' 	=> true, 										// Allow Gutenberg editor to use this post type
		);
		
		register_post_type( 'agenda_events', $args );
	}

	/**
	 * Add the admin menu for the plugin
	 * 
	 * @since 1.0.0
	 */
	 public function add_plugin_to_admin_menu() {
		add_menu_page( 
			$this->plugin_name, 
			__( 'Agenda', 'agenda' ),
			'administrator',
			$this->plugin_name,
			array( $this, 'display_plugin_admin_dashboard' ),
			'dashicons-calendar',
		);

	}

	/**
	 * Display the admin dashboard
	 * 
	 * @since 1.0.0
	 */
	public function display_plugin_admin_dashboard() {
    	require_once 'partials/' . $this->plugin_name . '-admin-display.php';
	}

	public function setup_agenda_metaboxes() {
		add_meta_box(
			'agenda_event_metaboxes', 
			__( 'Camps personalitzats pels anuncis', 'agenda' ), 
			array($this,'agenda_event_metaboxes'), 
			'agenda_events',
			'normal',
			'high' 
		);
	}

	public function agenda_event_metaboxes($post) {
		wp_nonce_field( 'agenda_events_meta_box', 'agenda_events_meta_box_nonce' );

		?>

		<div class="agenda_field_containers">
			<ul class="event_data_metaboxes">
				<li>
					<label for="event_summary"><?= __( 'Resum de l\'event', 'agenda' ) ?></label>
					<textarea 
						name="event_summary" 
						id="event_summary" >
						<?= get_post_meta( $post->ID, 'event_summary', true ) ?>
					</textarea>
					<small><?= __( 'Si no s\'introdueix un resum, es generarà automàticament a partir del contingut.', 'noticeboard' ) ?></small>
				</li>

				<li>
					<label for="event_date"><?= __( 'Data', 'agenda' ) ?><sup>*</sup></label>
					<input 
						class="w-auto"
						type="date" 
						name="event_date" 
						id="event_date" 
						value="<?= get_post_meta( $post->ID, 'event_date', true ); ?>" 
						placeholder="<?= __( 'Data de l\'event', 'agenda' ) ?>">
				</li>

				<li>
					<label for="event_time"><?= __( 'Hora', 'agenda' ) ?></label>
					<input 
						type="time" 
						name="event_time" 
						id="event_time" 
						value="<?= get_post_meta( $post->ID, 'event_time', true ); ?>" 
						placeholder="<?= __( 'Hora de l\'event', 'agenda' ) ?>">
				</li>

				<li>
					<label for="event_duration"><?= __( 'Durada', 'agenda' ) ?></label>
					<input 
						type="number" 
						name="event_duration" 
						id="event_duration" 
						value="<?= get_post_meta( $post->ID, 'event_duration', true ); ?>" 
						placeholder="<?= __( 'Durada de l\'event en minuts', 'agenda' ) ?>">
				</li>

				<li>
					<label for="event_location"><?= __( 'Lloc', 'agenda' ) ?></label>
					<input 
						type="text" 
						name="event_location" 
						id="event_location" 
						value="<?= get_post_meta( $post->ID, 'event_location', true ); ?>" 
						placeholder="<?= __( 'Lloc de l\'event', 'agenda' ) ?>">
				</li>

				<li>
					<label for="event_link"><?= __( 'Enllaç', 'agenda' ) ?></label>
					<input 
						type="url" 
						name="event_link" 
						id="event_link" 
						value="<?= get_post_meta( $post->ID, 'event_link', true ); ?>" 
						placeholder="https://www.example.com">
						<small><?= __( 'Opcional. Només quan l\'informació de l\'event està a una pàgina externa', 'agenda' ) ?></small>
				</li>

			</ul>
		</div>

		<?php
	
	}

	function save_agenda_metabox_data( $post_id ) {
		/*
		 * We need to verify this came from our screen and with proper authorization,
		 * because the save_post action can be triggered at other times
		 */
	
		// Check if our nonce is set
		if ( ! isset( $_POST['agenda_events_meta_box_nonce'] ) ) {
			return;
		}

		// Verify that the nonce is valid
		if ( ! wp_verify_nonce( $_POST['agenda_events_meta_box_nonce'], 'agenda_events_meta_box' ) ) {
			return;
		}

		// If this is an autosave, our form has not been submitted, so we don't want to do anything
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check the user's permissions
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		
		// Make sure that it is set
		if ( 
			!isset( $_POST['event_summary'] ) || 
			!isset( $_POST['event_date'] ) || 
			!isset( $_POST['event_time'] ) || 
			!isset( $_POST['event_duration'] ) || 
			!isset( $_POST['event_location'] ) ||
			!isset( $_POST['event_link'] )
		) {
			return;
		}
		
		/* Now it's safe to save the data */

		// Sanitize user input.
		$summary = sanitize_text_field( $_POST['event_summary'] );
		$date = sanitize_text_field( $_POST['event_date'] );
		$time = sanitize_text_field( $_POST['event_time'] );
		$duration = sanitize_text_field( $_POST['event_duration'] );
		$location = sanitize_text_field( $_POST['event_location'] );
		$link = sanitize_url( $_POST['event_link'] );

		// Update the meta field in the database
		update_post_meta( $post_id, 'event_summary', $summary );
		update_post_meta( $post_id, 'event_date', $date );
		update_post_meta( $post_id, 'event_time', $time );
		update_post_meta( $post_id, 'event_duration', $duration );
		update_post_meta( $post_id, 'event_location', $location );
		update_post_meta( $post_id, 'event_link', $link );
	}

}
