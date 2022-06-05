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
    props: ['month', 'year'],
    computed: {
        daysInMonth() {
            return new Date(this.year, this.month + 1, 0).getDate();
        },
        firstDayOfMonth() {
            return new Date(this.year, this.month, 1).getDay();
        },
    },
    methods: {
        formatDateTime(day) {
            return `${this.year}-${this.month + 1}-${day}`;
        },
    },
    template: `
        <div class="date-grid">
            <div class="single-date" v-for="day in daysInMonth" :style="{ '--first-day-of-month': firstDayOfMonth}">
                <time :datetime="formatDateTime(day)">
                    {{ day }}
                </time>
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
    },
    methods: {
        async getEvents(month = this.currentMonth, year = this.currentYear) {
            const key = `${year}-${month + 1}`;

            // Check if we have cached events for this month & year
            if (key in this.cachedEvents) {
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
                    return this.getEvents(date.month, date.year);
                })
            );
        },
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
            this.preloadSurroundingMonths();
        });
    },
    template: `
        <div class="wrap">
            <h1>Agenda</h1>
            <div class="calendar text-center p-3 my-4 mx-auto">
                <month-indicator @change-month="updateDate" :month="currentMonth" :year="currentYear" />
                <days-of-week />
                <date-grid :month="currentMonth" :year="currentYear" />
            </div>
        </div>
    `,
});
