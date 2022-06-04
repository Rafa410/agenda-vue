const app = new Vue({
    el: '#calendar-monthly-view',
    data: {
        message: 'Agenda monthly view',
    },
    methods: {
        // https://bootstrap-vue.org/docs/components/popover
        getEvents() {
            // fetch('/api/events')
        },
    },
    template: `
        <div>
            <p>{{ message }}</h1>
        </div>
    `,
});
