import Version from '../../version';

function get() {
    return Version;
    if (process.env && process.env.staticVersion) {
        return process.env.staticVersion;
    } else {
        return '1.0.0'
    }
}

export default {
    get
}