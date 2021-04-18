<template>
    <div class="ui-page-vue">
        <h1>{{ $t('admin.routes.dashboard') }}</h1>
        <router-link class="btn btn-default"
                     :to="{ name: 'admin-users' }"
                     tag="div"
        >
            <span class="btn-label">{{ $t('admin.labels.users') }}</span>
        </router-link>
    </div>
</template>
<script>

    export default {
        name: 'dashboard',
        beforeRouteEnter(from, to, next) {
            next();//if you use beforeRouteEnter this must be fired or reroute to another location
        },
        data() {
            return {
                input: '',
                activeNames: ['buttons'],
            };
        },
        methods: {
        }
    }
</script>
