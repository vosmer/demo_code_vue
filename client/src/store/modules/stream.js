export default {
    state: {
        stream: null,
        streams: null
    },
    mutations: {
        setStreams(state, streams) {
            state.streams = streams;
        },
        setStream(state, stream) {
            state.stream = stream;
        }
    },
    getters: {
        streams(state) {
            return state.streams;
        },
        stream(state) {
            return state.stream;
        }
    }
}