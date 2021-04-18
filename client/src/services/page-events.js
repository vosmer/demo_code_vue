import Vue from 'vue';
import Bus from './bus';

function handleScroll(evt) {
    if (window.scrollY > 60) {
        Bus.$emit('scrolled_down:60', evt);
    }
}
function init() {
    window.addEventListener('scroll', handleScroll);
}
function destroy() {
    window.removeEventListener('scroll', handleScroll);
}
function addScrollBroadcast(scrollDistance, direction, broadcastName) {
    var direction = typeof(direction) == "undefined"? 'down': direction;
    var broadcastName = typeof(broadcastName) == "undefined"? 'scrolled_' + direction + ':' + scrollDistance: broadcastName;
    return window.addEventListener('scroll', (evt) => {
        if (direction === 'down') {
            if (window.scrollY >= scrollDistance) {
                Bus.$emit(broadcastName, evt);
            }
        } else if (direction === 'up') {
            if (window.scrollY < scrollDistance) {
                Bus.$emit(broadcastName, evt);
            }
        } else {
            if (window.scrollX > scrollDistance) {
                Bus.$emit(broadcastName, evt);
            }
        }
    });
}
function dispatchCreatedScrollEvent(evt) {
    window.addEventListener('scroll', evt);
}

export default {
    init,
    destroy,
    addScrollBroadcast,
    dispatchCreatedScrollEvent
}
