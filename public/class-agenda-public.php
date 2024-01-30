<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://github.com/Rafa410/
 * @since      1.0.0
 *
 * @package    Agenda
 * @subpackage Agenda/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Agenda
 * @subpackage Agenda/public
 * @author     Rafa Soler <rafasoler10@gmail.com>
 */
class Agenda_Public {

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
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
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

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/agenda-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
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

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		// wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/agenda-public.js', array( 'jquery' ), $this->version, false );
		wp_register_script( 'polyfill-IntersectionObserver', 'https://polyfill.io/v3/polyfill.min.js?features=es2015%2CIntersectionObserver' );		
		wp_register_script( 'vue', "https://cdn.jsdelivr.net/npm/vue@2.6/dist/vue{$suffix}.js", array(), null, true );
		wp_register_script( 'bootstrap-vue', "https://cdn.jsdelivr.net/npm/bootstrap-vue@2/dist/bootstrap-vue{$suffix}.js", array(), null, true );
		wp_register_script( 'bootstrap-vue-icons', "https://cdn.jsdelivr.net/npm/bootstrap-vue@2/dist/bootstrap-vue-icons{$suffix}.js", array(), null, true );
		wp_register_script( 'agenda-monthly-view', plugin_dir_url( __FILE__ ) . 'js/agenda-monthly-view.js', array( 'vue', 'wp-i18n' ), $this->version, true );

		// Define some variables to be used in Vue.js
		wp_localize_script( 'agenda-monthly-view', 'wpSettings', array(
			'site_url' => site_url(),
			'api_url' => esc_url_raw( rest_url() ),
			'calendar_id' => wp_generate_password( 5, false ),
		) );

	}

	/**
	 * Register shortcodes
	 *
	 * @since    1.0.0
	 */
	function register_shortcodes() {
		add_shortcode( 'agenda', array( $this, 'shortcode_agenda_handler' ) );
		add_shortcode( 'agenda_archive', array( $this, 'shortcode_agenda_archive_handler' ) );
	}

	/**
	 * Generates the content of the agenda shortcode
	 * 
	 * @param array $atts Shortcode attributes
	 * 
	 * @return string
	 */
	function shortcode_agenda_handler( $atts ) {

		// Don't load the scripts if Elementor preview is active
		if ( is_plugin_active( 'elementor/elementor.php' ) && \Elementor\Plugin::$instance->preview->is_preview_mode() ) {
			return '<div id="agenda-vue-placeholder"></div>';
		}

		// Enqueue registered scripts
		// wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/agenda-public.js', array( 'jquery' ), $this->version, false );
		wp_enqueue_script( 'polyfill-IntersectionObserver' );
		wp_enqueue_script( 'vue' );
		wp_enqueue_script( 'bootstrap-vue' );
		wp_enqueue_script( 'bootstrap-vue-icons' );
		wp_enqueue_script( 'agenda-monthly-view' );

		$atts = shortcode_atts( array(
			'view' => 'monthly', // monthly | list

			// Specific settings for monthly view
			'month' => date( 'm' ), // Defaults to current month. Possible values: 1-12

			// Specific settings for list view
			'limit' => 3, // Maximum number of events to show
		), $atts, 'agenda' );

		$output = '';

		if ( $atts['view'] === 'monthly' ) {
			$output = $this->generate_monthly_view( $atts['month'] );
		} elseif ( $atts['view'] === 'list' ) {
			$output = $this->generate_list_view( $atts['limit'] );
		}

		return $output;
	}

	/**
	 * Generates the content of the agenda monthly view
	 * 
	 * @return string
	 */
	function generate_monthly_view($current_month) {
		$output = '<div id="calendar-monthly-view"></div>';
		return $output;
	}

	/**
	 * Generates the content of the agenda list view
	 * 
	 * @return string
	 */
	function generate_list_view($limit) {
		$args = array(
			'post_type' => 'agenda_events',
			'posts_per_page' => $limit,
			'meta_key' => 'event_date',
			'orderby' => 'meta_value',
			'order' => 'ASC',
			'meta_query' => array(
				array(
					'key' => 'event_date',
					'value' => date( 'Y-m-d' ),
					'compare' => '>=',
					'type' => 'DATE'
				)
			),
		);

		$query = new WP_Query( $args );

		$output = '<div class="calendar-list-view">';

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$ID = get_the_ID();

				$title = get_the_title();
				$summary = get_post_meta( $ID, 'event_summary', true ) ?: get_the_excerpt();
				$date = get_post_meta( $ID, 'event_date', true );
				$time = get_post_meta( $ID, 'event_time', true );
				$duration = get_post_meta( $ID, 'event_duration', true );
				$location = get_post_meta( $ID, 'event_location', true );
				$link = get_post_meta( $ID, 'event_link', true );

				$day = date( 'd', strtotime( $date ) );
				$month = wp_date( 'F', strtotime( $date ) );
				
				if ( strlen( $month ) > 5 ) {	
					$month = wp_date( 'M', strtotime( $date ) ); // Use short month name
				}
				
				ob_start();

				?>

				<div class="calendar-event d-flex my-3">
					<div class="event-date p-3 bg-secondary text-dark me-sm-2">
						<span class="day"><?= $day ?></span>
						<span class="month"><?= $month ?></span>
					</div>
					<div class="event-content p-2">
						<h3 class="title">
							<a class="text-decoration-none link-dark" href="<?= get_the_permalink() ?>">
								<?= $title ?>
							</a>
						</h3>
						<p class="description"><?= wp_trim_words( $summary, 45 ) ?></p>
					</div>
				</div>

				<?php

				$output .= ob_get_clean();

			}
		} else {
			$output .= '<p class="fw-light text-muted text-center">' . __( 'There are no upcoming events', 'agenda' ) . '</p>';
		}

		$output .= '</div>';

		wp_reset_postdata();

		return $output;
	}

	/**
	 * Generates the content of the agenda archive shortcode
	 * 
	 * @param array $atts Shortcode attributes
	 * 
	 * @return string
	 */
	function shortcode_agenda_archive_handler( $atts ) {
		// Don't load the scripts if Elementor preview is active
		if ( is_plugin_active( 'elementor/elementor.php' ) && \Elementor\Plugin::$instance->preview->is_preview_mode() ) {
			return '<div id="agenda-vue-placeholder"></div>';
		}

		// Enqueue registered scripts
		wp_enqueue_script( 'agenda-archive-view' );

		$atts = shortcode_atts( array(
			'posts_per_page' => 6, // Number of activities to show per page
		), $atts, 'agenda_archive' );

		$output = $this->generate_agenda_archive( $atts['posts_per_page'] );

		return $output;
	}

	/**
	 * Generates the content of the agenda archive
	 * 
	 * @param int $posts_per_page Number of activities to show per page
	 * 
	 * @return string
	 */
	function generate_agenda_archive( $posts_per_page ) {
		$args = array(
			'post_type' => 'agenda_events',
			'posts_per_page' => $posts_per_page,
			'meta_key' => 'event_date',
			'orderby' => 'meta_value',
			'order' => 'ASC',
			'meta_query' => array(
				array(
					'key' => 'event_date',
					'value' => date( 'Y-m-d' ),
					'compare' => '>=',
					'type' => 'DATE'
				)
			),
		);

		$query = new WP_Query( $args );

		$output = '<div id="agenda-archive">';

		if ( $query->have_posts() ) {

			$output .= '<div class="agenda-activities-list">';

			while ( $query->have_posts() ) {
				$query->the_post();
				$ID = get_the_ID();

				$title = get_the_title();
				$summary = get_post_meta( $ID, 'event_summary', true );
				$date = get_post_meta( $ID, 'event_date', true );
				$time = get_post_meta( $ID, 'event_time', true );
				$duration = get_post_meta( $ID, 'event_duration', true );
				$location = get_post_meta( $ID, 'event_location', true );
				$link = get_post_meta( $ID, 'event_link', true );

				if ( ! $summary ) {
					$summary = get_the_excerpt();
				}

				$summary = wp_trim_words( $summary, 50, ' [...]' );

				if ( ! $link ) {
					$link = get_the_permalink();
				}
				
				ob_start();
				?>

				<article id="activity-<?= $ID ?>" class="activity">
					<a href="<?= esc_url( $link ) ?>" class="activity__image d-block ratio ratio-1x1">
						<?= get_the_post_thumbnail( $ID, 'medium' ); ?>
					</a>
					<div class="activity__content">
						<h3 class="activity__title entry-title">
							<a href="<?= esc_url( $link ) ?>">
								<?= $title ?>
							</a>
						</h3>
						<p class="activity__summary"><?= $summary ?></p>
					</div>
				</article>

				<?php 
				$output .= ob_get_clean();
			}

			$output .= '</div>';

			// Pagination
			$output .= '<div class="agenda-activities-pagination">';
			$output .= paginate_links( array(
				'base' => get_pagenum_link( 1 ) . '%_%',
				'format' => 'page/%#%',
				'current' => max( 1, get_query_var( 'paged' ) ),
				'total' => $query->max_num_pages,
				// 'prev_text' => __( 'Previous', 'agenda' ),
				// 'next_text' => __( 'Next', 'agenda' ),
			) );
			$output .= '</div>';

		} else {
			$output .= '<p class="fw-light text-muted fs-5">' . __( 'There are no upcoming events', 'agenda' ) . '</p>';
		}

		$output .= '</div>';

		wp_reset_postdata();

		return $output;
	}

}
