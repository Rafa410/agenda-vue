const { __, _x, _n, _nx } = wp.i18n;

Vue.component('month-indicator', {
    props: ['month', 'year'],
    emits: ['change-month'],
    methods: {
        getMonthName(month) {
            return [
                __('Gener', 'agenda'),
                __('Febrer', 'agenda'),
                __('Març', 'agenda'),
                __('Abril', 'agenda'),
                __('Maig', 'agenda'),
                __('Juny', 'agenda'),
                __('Juliol', 'agenda'),
                __('Agost', 'agenda'),
                __('Setembre', 'agenda'),
                __('Octubre', 'agenda'),
                __('Novembre', 'agenda'),
                __('Desembre', 'agenda'),
            ][month];
        },
    },
    template: `
        <div class="month-indicator d-flex align-items-center justify-content-evenly">
            <button @click="$emit('change-month', -1)" class="btn"><b-icon icon="chevron-left" /></button>
                <h2 class="fs-4 mb-0">
                    <span>{{ getMonthName(month) }} {{ year }}</span>
                </h2>
            <button @click="$emit('change-month', 1)" class="btn"><b-icon icon="chevron-right" /></button>
        </div>
    `,
});

Vue.component('days-of-week', {
    data() {
        return {
            daysOfWeek: [
                _x('Dl', 'Abbreviation of the first day of the week', 'agenda'),
                _x('Dt', 'Abbreviation of the second day of the week', 'agenda'),
                _x('Dm', 'Abbreviation of the third day of the week', 'agenda'),
                _x('Dj', 'Abbreviation of the fourth day of the week', 'agenda'),
                _x('Dv', 'Abbreviation of the fifth day of the week', 'agenda'),
                _x('Ds', 'Abbreviation of the sixth day of the week', 'agenda'),
                _x('Dg', 'Abbreviation of the seventh day of the week', 'agenda'),
            ],
        };
    },
    template: `
        <div class="days-of-week my-3">
            <span v-for="day in daysOfWeek">
                {{ day }}
            </span>
        </div>
    `,
});

Vue.component('date-grid', {
    emits: ['update:event', 'create:event'],
    props: ['month', 'year', 'cachedEvents', 'isUpdating'],
    data() {
        return {
            events: [],
        };
    },
    created() {
        // Get events for the current month
        this.events = this.cachedEvents[this.getDateKey()] || [];
    },
    computed: {
        daysInMonth() {
            return new Date(this.year, this.month + 1, 0).getDate();
        },
        firstDayOfMonth() {
            return new Date(this.year, this.month, 1).getDay();
        },
    },
    methods: {
        getDateKey(year = this.year, month = this.month) {
            return `${year}-${+month + 1}`;
        },
        formatDateTime(day) {
            // Add leading zero if needed
            const formatedMonth = (+this.month + 1).toString().padStart(2, '0');
            const formatedDay = day.toString().padStart(2, '0');
            return `${this.year}-${formatedMonth}-${formatedDay}`;
        },
        getSingleDateEvents(day) {
            return this.events.filter((event) => event.event_date === this.formatDateTime(day));
        },
    },
    watch: {
        isUpdating(isUpdating) {
            if (!isUpdating) {
                this.events = this.cachedEvents[this.getDateKey()] || [];
            }
        },
    },
    template: `
        <div class="date-grid" :style="{ '--first-day-of-month': firstDayOfMonth}">
            <single-date 
                v-for="day in daysInMonth" 
                :key="day" 
                :day="day" 
                :month="month"
                :year="year"
                :events="getSingleDateEvents(day)"
                :isUpdating="isUpdating"
                @update:events="$emit('update:events', $event)"
                @create:event="$emit('create:event', $event)">
            </single-date>
        </div>
    `,
});

Vue.component('single-date', {
    emits: ['update:events', 'create:event'],
    props: {
        day: {
            type: Number,
            required: true,
        },
        month: {
            type: Number,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        events: {
            type: Array,
            default: () => [],
        },
        isUpdating: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            isOpen: false,
            modifiedEvents: [],
            event_title_state: null,
            event_date_state: null,
            newEvent: {
                title: '',
                event_summary: '',
                event_date: null,
                event_time: null,
                event_duration: null,
                event_location: '',
                event_url: '',
            },
            currentLocale: 'ca',
        };
    },

    created() {
        // Clone events so the user can edit them without affecting the original
        this.modifiedEvents = JSON.parse(JSON.stringify(this.events));
    },

    computed: {
        hasEvents() {
            return this.events.length > 0;
        },
        singleEvent() {
            return this.events.length === 1;
        },
    },

    watch: {
        events(newEvents) {
            // Clone events
            this.modifiedEvents = JSON.parse(JSON.stringify(newEvents));
        },
    },

    methods: {
        formatDateTime(day) {
            // Add leading zero if needed
            const formatedMonth = (+this.month + 1).toString().padStart(2, '0');
            const formatedDay = day.toString().padStart(2, '0');
            return `${this.year}-${formatedMonth}-${formatedDay}`;
        },

        formatLocalizedDate(date, locale = 'ca', customOptions) {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...customOptions,
            };
            return new Date(date).toLocaleDateString(locale, options);
        },

        htmlDecode(input) {
            const doc = new DOMParser().parseFromString(input, 'text/html');
            return doc.documentElement.textContent;
        },

        onClose() {
            this.isOpen = false;
        },

        onOk() {
            if (this.singleEvent) {
                if (!this.modifiedEvents[0].title) {
                    this.event_title_state = false;
                }
                if (!this.modifiedEvents[0].event_date) {
                    this.event_date_state = false;
                }
                if (this.modifiedEvents[0].title && this.modifiedEvents[0].event_date) {
                    this.$emit('update:events', this.modifiedEvents);

                    // Close the modal once the events have been updated
                    const unwatch = this.$watch('isUpdating', (isUpdating) => {
                        if (!isUpdating) {
                            this.onClose();
                            unwatch();
                        }
                    });
                }
            } else if (!this.hasEvents) {
                // Add new event

                if (!this.newEvent.title) {
                    this.event_title_state = false;
                }
                if (!this.newEvent.event_date) {
                    this.event_date_state = false;
                }
                if (this.newEvent.title && this.newEvent.event_date) {
                    // Check mandatory fields
                    this.$emit('create:event', this.newEvent);

                    // Close the modal once the event have been created
                    const unwatchIsUpdating = this.$watch('isUpdating', (isUpdating) => {
                        if (!isUpdating) {
                            this.onClose();
                            unwatchIsUpdating();
                        }
                    });
                }
            }
        },

        onShow() {
            // This is called just before the popover is shown
            this.modifiedEvents = JSON.parse(JSON.stringify(this.events));
            this.event_title_state = null;
            this.event_date_state = null;
            this.newEvent = {
                title: '',
                event_summary: '',
                event_date: null,
                event_time: null,
                event_duration: null,
                event_location: '',
                event_url: '',
            };
        },

        onShown() {
            // Called just after the popover has been shown
            // Transfer focus to the first input
            this.focusRef(this.$refs.event_title);
        },

        onHidden() {
            // Called just after the popover has finished hiding
            // Bring focus back to the button
            this.focusRef(this.$refs.button);
        },

        focusRef(ref) {
            this.$nextTick(() => {
                this.$nextTick(() => {
                    (ref.$el || ref).focus();
                });
            });
        },
    },
    template: `
        <div :id="'date-' + day" class="single-date" :class="{ 'has-events': hasEvents }">

            <button 
                :id="'events-' + day + 'trigger'" 
                class="btn-unstyled rounded-circle" 
                @click="isOpen = !isOpen"
                ref="button">
                <time :datetime="formatDateTime(day)">
                    {{ day }}
                </time>
            </button>

            <b-popover 
                v-if="singleEvent || !hasEvents"" 
                :target="'events-' + day + 'trigger'" 
                triggers="click"
                :show.sync="isOpen"
                placement="auto"
                :container="'date-' + day"
                ref="popover"
                @show="onShow"
                @shown="onShown"
                @hidden="onHidden"
                custom-class="scrollable"
            >

                <template #title>
                    <strong v-if="singleEvent" class="pe-3 me-auto">
                        {{ __('Event del', 'agenda') }} {{ formatLocalizedDate(formatDateTime(day)) }}
                    </strong>
                    <strong v-else class="pe-3 me-auto">
                        {{ __('Crear nou event', 'agenda') }}
                    </strong>

                    <b-link
                        v-if="singleEvent" 
                        :href="'/wp-admin/post.php?post=' + events[0].id + '&action=edit'" 
                        target="_blank"
                        class="external-link p-1"
                        v-b-tooltip
                        :title="__('Veure tots els detalls', 'agenda')">
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                    </b-link>

                    <button 
                        @click="onClose" 
                        class="btn popover-close p-1" 
                        v-b-tooltip
                        :title="__('Tancar', 'agenda')">
                        <span class="d-inline-block" aria-hidden="true">&times;</span>
                    </button>
                </template>

                <div>
                    <b-form-group
                        :label=" htmlDecode( __('Títol de l&#8217;event', 'agenda') )"
                        label-for="event_title"
                        :state="event_title_state"
                        class="mb-1"
                        :invalid-feedback="__('El títol és obligatori', 'agenda')"
                    >
                        <b-form-input
                            ref="event_title"
                            id="event_title"
                            v-model="modifiedEvents[0]?.title ?? newEvent.title"
                            :state="event_title_state"
                            size="sm"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Resum', 'agenda')"
                        label-for="event_summary"
                        class="mb-1"
                    >
                        <b-form-input
                            ref="event_summary"
                            id="event_summary"
                            v-model="modifiedEvents[0]?.event_summary ?? newEvent.event_summary"
                            size="sm"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Data', 'agenda')"
                        label-for="event_date"
                        class="mb-1"
                        :state="event_date_state"
                        :invalid-feedback="__('Introdueix una data', 'agenda')"
                    >
                        <b-form-datepicker
                            ref="event_date"
                            id="event_date"
                            v-model="modifiedEvents[0]?.event_date ?? newEvent.event_date"
                            :state="event_date_state"
                            size="sm"
                            :locale="currentLocale"
                            :placeholder="htmlDecode(__('Selecciona la data de l&#8217;event', 'agenda'))"
                        ></b-form-datepicker>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Hora', 'agenda')"
                        label-for="event_time"
                        class="mb-1"
                    >
                        <b-form-timepicker
                            ref="event_time"
                            id="event_time"
                            v-model="modifiedEvents[0]?.event_time ?? newEvent.event_time"
                            size="sm"
                            :locale="currentLocale"
                            :placeholder="htmlDecode(__('Selecciona la hora de l&#8217;event', 'agenda'))"
                        ></b-form-timepicker>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Durada', 'agenda')"
                        label-for="event_duration"
                        class="mb-1"
                    >
                        <b-form-input
                            type="number"
                            ref="event_duration"
                            id="event_duration"
                            v-model="modifiedEvents[0]?.event_duration ?? newEvent.event_duration"
                            size="sm"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Ubicació', 'agenda')"
                        label-for="event_location"
                        class="mb-1"
                    >
                        <b-form-input
                            ref="event_location"
                            id="event_location"
                            v-model="modifiedEvents[0]?.event_location ?? newEvent.event_location"
                            size="sm"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        :label=" __('Enllaç', 'agenda')"
                        label-for="event_link"
                        class="mb-1"
                    >
                        <b-form-input
                            type="url"
                            ref="event_link"
                            id="event_link"
                            v-model="modifiedEvents[0]?.event_link ?? newEvent.event_link"
                            size="sm"
                            placeholder="https://"
                        ></b-form-input>
                    </b-form-group>

                    <div class="d-flex justify-content-between mt-3">
                        <b-button @click="onClose" size="sm" variant="outline-danger">
                            {{ __('Cancelar', 'agenda') }}
                        </b-button>
                        <b-button @click="onOk" size="sm" variant="outline-primary">Ok</b-button>
                    </div>
                </div>

            </b-popover>

        </div>
    `,
});

Vue.component('date-grid-skeleton', {
    props: ['month', 'year'],
    computed: {
        daysInMonth() {
            return new Date(this.year, this.month + 1, 0).getDate();
        },
        firstDayOfMonth() {
            return new Date(this.year, this.month, 1).getDay();
        },
    },
    template: `
        <div class="date-grid" :style="{ '--first-day-of-month': firstDayOfMonth}">
            <div class="single-date" v-for="day in daysInMonth">
                <b-skeleton type="avatar"></b-skeleton>
            </div>
        </div>
    `,
});

const app = new Vue({
    el: '#calendar-monthly-view-admin',
    data: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        cachedEvents: {},
        isLoading: true,
        isUpdating: false,
    },
    methods: {

        /**
         * Given a date, returns the key to access the events object
         * 
         * @param {number} year - The current year
         * @param {number} month - The current month
         * @returns {string} Key used to access the events object
         */
        getDateKey(year = this.currentYear, month = this.currentMonth) {
            return `${year}-${month + 1}`;
        },

        /**
         * Given a date, returns the events for that date and caches them
         * 
         * @param {number} year - The current year
         * @param {number} month - The current month
         * @param {boolean} cache - Whether to get the events from the cache or not
         * @returns {Promise<any>} Promise that resolves with the requested events
         */
        async getEvents(year = this.currentYear, month = this.currentMonth, cache = true) {
            const key = this.getDateKey(year, month);

            // Check if we have cached events for this month & year
            if (cache && key in this.cachedEvents) {
                console.debug('cache hit:', key);
                return this.cachedEvents[key];
            }

            // Build query params for the API
            const params = new URLSearchParams({
                month: month + 1,
                year,
            });
            console.debug('cache miss:', params.toString());

            // Fetch events from the API
            const events = await fetch(`/wp-json/agenda/v1/events?${params.toString()}`).then(
                (response) => response.json()
            );

            // Cache the events for this month & year
            this.cachedEvents[key] = events;

            return events;
        },

        /**
         * Updates the specified events
         * 
         * @param {any[]} modifiedEvents - Array of events to be updated 
         */
        async updateEvents(modifiedEvents) {
            this.isUpdating = true;

            Promise.all(
                modifiedEvents.map(async (event) => {
                    // Get fields to update
                    const {
                        id,
                        title,
                        event_summary,
                        event_date,
                        event_time,
                        event_duration,
                        event_location,
                        event_link,
                    } = event;

                    // Update events with the API
                    const response = await fetch(`/wp-json/wp/v2/agenda_events/${event.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-WP-Nonce': wpApiSettings.nonce, // This is required by WP for security reasons
                            // We don't need to set authentication here since it is already handled by WP using cookies
                        },
                        body: JSON.stringify({
                            id,
                            title,
                            event_summary,
                            event_date,
                            event_time,
                            event_duration,
                            event_location,
                            event_link,
                        }),
                    });
                    return response.json();
                })
            )
                .then((data) => {
                    console.log(data);
                    // Refresh cached events
                    this.getEvents(this.currentYear, this.currentMonth, false)
                        .catch((error) => {
                            console.error(error);
                        })
                        .finally(() => {
                            this.isUpdating = false;
                        });
                })
                .catch((err) => {
                    console.error(err);
                    this.isUpdating = false;
                });
        },

        /**
         * Creates a new event
         * 
         * @param {any} event - Event to be created
         */
        async createEvent(event) {
            this.isUpdating = true;

            // Create events with the API
            const response = await fetch('/wp-json/wp/v2/agenda_events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce, // This is required by WP for security reasons
                    // We don't need to set authentication here since it is already handled by WP using cookies
                },
                body: JSON.stringify({
                    title: event.title,
                    event_summary: event.event_summary,
                    event_date: event.event_date,
                    event_time: event.event_time,
                    event_duration: event.event_duration,
                    event_location: event.event_location,
                    event_link: event.event_link,
                }),
            });

            response.json().then((data) => {
                console.log(data);
                this.createToast(data.id);

                // Refresh cached events
                this.getEvents(this.currentYear, this.currentMonth, false)
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.isUpdating = false;
                    });
            });
        },

        /**
         * Preloads and saves in cache the events for the surrounding months
         * 
         * @param {number} month -
         * @param {number} year -
         * @param {number} amount - 
         * @returns {Promise<any>} Promise that resolves with the requested events
         */
        preloadSurroundingMonths(month = this.currentMonth, year = this.currentYear, amount = 1) {
            const surroundingMonths = [];

            for (let i = 0; i < amount; i++) {
                const prevMonth = new Date(year, month - 1 - i, 1);
                const nextMonth = new Date(year, month + 1 + i, 1);

                surroundingMonths.push({
                    month: prevMonth.getMonth(),
                    year: prevMonth.getFullYear(),
                });
                surroundingMonths.push({
                    month: nextMonth.getMonth(),
                    year: nextMonth.getFullYear(),
                });
            }

            return Promise.all(
                surroundingMonths.map((date) => {
                    return this.getEvents(date.year, date.month);
                })
            );
        },

        /**
         * Updates the current month and loads events accordingly
         * 
         * @param {number} n - Number of months to go backwards (<0) or forwards (>0)
         */
        updateDate(n) {
            this.currentMonth += n;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            } else if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }

            this.getEvents().then((events) => {
                this.preloadSurroundingMonths();
            });
        },

        /**
         * Generates a notification toast when an event is created
         * 
         * @param {number} eventId - ID of the newly created event
         */
        createToast(eventId) {
            console.log('createToast root', eventId);
            this.$root.$bvToast.toast(
                'Per revisar els detalls del event i publicar-ho, fes clic a aquest enllaç.',
                {
                    variant: 'success',
                    title: 'Esborrany creat correctament',
                    href: `/wp-admin/post.php?post=${eventId}&action=edit`,
                    autoHideDelay: 5000,
                    noAutoHide: true,
                }
            );
        },
    },
    mounted() {
        this.getEvents().then((events) => {
            this.isLoading = false;
            this.preloadSurroundingMonths();
        });
    },
    template: `
        <div class="wrap">
            <h1>Agenda</h1>
            <div class="calendar text-center p-3 my-4 mx-auto">
                <month-indicator @change-month="updateDate" :month="currentMonth" :year="currentYear" />
                <days-of-week />

                <b-skeleton-wrapper :loading="isLoading">
                    <template #loading>
                        <date-grid-skeleton :month="currentMonth" :year="currentYear" />
                    </template>

                    <date-grid 
                        :month="currentMonth" 
                        :year="currentYear" 
                        :cachedEvents="cachedEvents" 
                        :isUpdating="isUpdating"
                        @update:events="updateEvents"
                        @create:event="createEvent" />
                </b-skeleton-wrapper>

            </div>
        </div>
    `,
});
