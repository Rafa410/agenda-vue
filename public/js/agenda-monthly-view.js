const { __, _x, _n, _nx, sprintf } = wp.i18n;

Vue.component('month-indicator', {
    props: ['month', 'year'],
    emits: ['change-month'],
    methods: {
        getMonthName(month) {
            return [
                __('January', 'agenda'),
                __('February', 'agenda'),
                __('March', 'agenda'),
                __('April', 'agenda'),
                __('May', 'agenda'),
                __('June', 'agenda'),
                __('July', 'agenda'),
                __('August', 'agenda'),
                __('September', 'agenda'),
                __('October', 'agenda'),
                __('November', 'agenda'),
                __('December', 'agenda'),
            ][month];
        },
    },
    template: `
        <div class="month-indicator d-flex align-items-center justify-content-between">
            <button @click="$emit('change-month', -1)" class="btn"><b-icon icon="chevron-double-left" /></button>
                <h2 class="fs-4 mb-0">
                    <span>{{ getMonthName(month) }} {{ year }}</span>
                </h2>
            <button @click="$emit('change-month', 1)" class="btn"><b-icon icon="chevron-double-right" /></button>
        </div>
    `,
});

Vue.component('days-of-week', {
    data() {
        return {
            daysOfWeek: [
                _x('Mo', 'Abbreviation of the first day of the week', 'agenda'),
                _x('Tu', 'Abbreviation of the second day of the week', 'agenda'),
                _x('We', 'Abbreviation of the third day of the week', 'agenda'),
                _x('Th', 'Abbreviation of the fourth day of the week', 'agenda'),
                _x('Fr', 'Abbreviation of the fifth day of the week', 'agenda'),
                _x('Sa', 'Abbreviation of the sixth day of the week', 'agenda'),
                _x('Su', 'Abbreviation of the seventh day of the week', 'agenda'),
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
    props: ['month', 'year', 'cachedEvents'],
    computed: {
        events() {
            return this.cachedEvents[this.getDateKey()] || [];
        },
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
    template: `
        <div class="date-grid" :style="{ '--first-day-of-month': firstDayOfMonth}">
            <single-date 
                v-for="day in daysInMonth" 
                :key="day" 
                :day="day" 
                :month="month"
                :year="year"
                :events="getSingleDateEvents(day)">
            </single-date>
        </div>
    `,
});

Vue.component('single-date', {
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
    },

    data() {
        return {
            isOpen: false,
            currentLocale: wpSettings?.locale ? wpSettings.locale.replace('_', '-') : 'en',
        };
    },

    computed: {
        hasEvents() {
            return this.events.length > 0;
        },
        singleEvent() {
            return this.events.length === 1;
        },
    },

    methods: {
        formatDateTime(day) {
            // Add leading zero if needed
            const formatedMonth = (+this.month + 1).toString().padStart(2, '0');
            const formatedDay = day.toString().padStart(2, '0');
            return `${this.year}-${formatedMonth}-${formatedDay}`;
        },

        formatLocalizedDate(date, locale, customOptions) {
            locale = locale || this.currentLocale;
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...customOptions,
            };
            return new Date(date).toLocaleDateString(locale, options);
        },

        formatTime(event_time, event_duration, locale) {
            locale = locale || this.currentLocale;
            const startTime = (endTime = new Date(
                `${this.formatDateTime(this.day)} ${event_time}`
            ));
            const options = {
                hour: '2-digit',
                minute: '2-digit',
            };

            let formatedTime = startTime.toLocaleTimeString(locale, options);

            if (event_duration) {
                endTime.setMinutes(endTime.getMinutes() + event_duration);
                formatedTime += ` - ${endTime.toLocaleTimeString(locale, options)}`;
            }

            return formatedTime;
        },

        htmlDecode(input) {
            const doc = new DOMParser().parseFromString(input, 'text/html');
            return doc.documentElement.textContent;
        },

        getSingleEventUrl(eventId) {
            return `${wpSettings?.site_url || ''}/?p=${eventId}`;
        },

        onClose() {
            this.isOpen = false;
        },
    },
    template: `
        <div :id="'date-' + day" class="single-date" :class="{ 'has-events': hasEvents }">

            <template v-if="hasEvents">

                <button 
                    :id="'events-' + day + '-trigger'" 
                    class="btn-unstyled" 
                    @click="isOpen = !isOpen">
                    <time :datetime="formatDateTime(day)">
                        {{ day }}
                    </time>
                </button>

                <b-popover 
                    v-if="singleEvent" 
                    :target="'events-' + day + '-trigger'" 
                    triggers="click blur"
                    :show.sync="isOpen"
                    placement="auto"
                    :container="'date-' + day"
                    ref="popover"
                    custom-class="scrollable"
                >

                    <template #title>
                        <strong v-if="singleEvent" class="pe-3 me-auto">
                            {{ events[0]?.title }}
                        </strong>

                        <b-link
                            v-if="singleEvent" 
                            :href="getSingleEventUrl(events[0].id)"" 
                            target="_blank"
                            class="external-link link-dark p-1"
                            data-bs-toggle="tooltip"
                            :title="__('View event details', 'agenda')">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                        </b-link>

                        <button 
                            @click="onClose" 
                            class="btn popover-close p-1" 
                            :title="__('Close', 'agenda')">
                            <span class="d-inline-block" aria-hidden="true">&times;</span>
                        </button>
                    </template>

                    <div>

                        <template v-if="events[0]?.event_summary">
                            <p class="lh-sm">{{ events[0].event_summary }}</p>
                            <hr>
                        </template>

                        <p v-if="events[0]?.event_date" class="d-flex align-items-center gap-2">
                            <b-icon icon="calendar2-date" />
                            {{ formatLocalizedDate(events[0].event_date, currentLocale) }}
                        </p>

                        <p v-if="events[0]?.event_time" class="d-flex align-items-center gap-2">
                            <b-icon icon="clock" />
                            {{ formatTime(events[0].event_time, events[0].event_duration) }}
                        </p>

                        <p v-if="events[0]?.event_location" class="d-flex align-items-center gap-2">
                            <b-icon icon="pin-map" />
                            {{ events[0].event_location }}
                        </p>


                        <template v-if="events[0]?.event_link">
                            <a :href="events[0].event_link" target="_blank" class="btn btn-sm btn-outline-dark d-flex align-items-center gap-2">
                                <b-icon class="fs-5" icon="link45deg" />
                                {{ events[0].event_link }}
                            </a>
                        </template>

                    </div>

                </b-popover>

            </template>

            <button v-else disabled class="btn-unstyled text-dark">
                <time :datetime="formatDateTime(day)">
                    {{ day }}
                </time>
            </button>

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
    el: '#calendar-monthly-view',
    data: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        cachedEvents: {},
        isLoading: true,
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
                return this.cachedEvents[key];
            }

            // Build query params for the API
            const params = new URLSearchParams({
                month: month + 1,
                year,
            });

            // Fetch events from the API
            const events = await fetch(
                `${wpSettings.api_url}agenda/v1/events?${params.toString()}`
            ).then((response) => response.json());

            // Cache the events for this month & year
            this.cachedEvents[key] = events;

            return events;
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
    },
    mounted() {
        this.getEvents().then((events) => {
            this.isLoading = false;
            this.preloadSurroundingMonths();
        });
    },
    template: `
        <div class="calendar-monthly-view text-center p-lg-3 my-4 mx-auto">
            <month-indicator @change-month="updateDate" :month="currentMonth" :year="currentYear" />
            <days-of-week />

            <b-skeleton-wrapper :loading="isLoading">
                <template #loading>
                    <date-grid-skeleton :month="currentMonth" :year="currentYear" />
                </template>

                <date-grid 
                    :month="currentMonth" 
                    :year="currentYear" 
                    :cachedEvents="cachedEvents" />
            </b-skeleton-wrapper>

        </div>
    `,
});

/************************************************/

// const app = new Vue({
//     el: '#calendar-monthly-view',
//     data: {
//         message: 'Agenda monthly view',
//     },
//     methods: {
//         // https://bootstrap-vue.org/docs/components/popover
//         getEvents() {
//             // fetch('/api/events')
//         },
//     },
// });
