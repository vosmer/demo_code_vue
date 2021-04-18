<template>
    <div class="control-panel">
        <div class="table-emulator-table ribbon">
            <slot name="ribbonSlot"></slot>
        </div>
    </div>
</template>
<script>
    import Bus from '../../services/bus';
    import scroll from '../../directives/scroll.js';

    export default {
        name: 'controlPanel',
        directives: {
            scroll
        },
        data() {
            return {
                scrollEvents: [],
            };
        },
        beforeRouteEnter(from, to, next) {
            next();//if you use beforeRouteEnter this must be fired or reroute to another location
        },
        created() {
            let _that = this;
        },
        methods: {
            handleScroll(evt, el) {
                let _that = this;
            },
        },
        watch: {
            '$route'(newRoute,oldRoute){
                this.currentRouteName = newRoute.name;
            }
        }
    }
</script>
