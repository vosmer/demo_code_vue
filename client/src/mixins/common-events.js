export default {
    created(){
        this.handleCreate();
    },
    beforeDestroy() {
        this.handleDestroy();
    },
    data() {
        return {
            debug: false,
        };
    },
    methods: {
        handleCreate() {
             if (this.debug) {
                 console.info('CREATED');
             }
        },
        handleDestroy() {
            if (this.debug) {
                console.info('DESTROYED');
            }
        }
    }
};

