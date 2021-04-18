<template>
    <div class="authorization-form">
        <h1 class="intro">{{ $t('authorization.headers.intro') }}</h1>
        <h3 class="version">{{ $t('authorization.headers.version') }}: {{ version }}</h3>
        <hr />
        <el-form ref="form" v-model="formData">
            <h2 class="form-title">{{ $t('authorization.titles.form') }}:</h2>
            <el-form-item :label="$t('authorization.labels.login')" class="is-required">
                <span slot="label">{{ $t('authorization.labels.login') }}</span>
                <el-input v-model="formData.login"
                          :placeholder="$t('authorization.placeholders.login')"
                          :class="{'invalid': valid.login === false}"
                ></el-input>
                <span class="invalid-message"
                      v-if="valid.login === false"
                >{{ $t('authorization.errors.login') }}</span>
            </el-form-item>
            <el-form-item :label="$t('authorization.labels.password')" class="is-required">
                <el-input v-model="formData.password"
                          type="password"
                          :placeholder="$t('authorization.placeholders.password')"
                          :class="{'invalid': valid.password === false}"
                          @keyup.enter.native="submitFrom"
                ></el-input>
                <span class="invalid-message"
                      v-if="valid.password === false"
                >{{ $t('authorization.errors.password') }}</span>

            </el-form-item>
            <el-button class="submit" size="big" @click="submitFrom">{{ $t('authorization.actions.enter') }}</el-button>
        </el-form>
    </div>
</template>
<script>
    import UserModel from '../../models/user';
    import Bus from '../../services/bus';
    import SessionStorage from '../../services/session-storage';
    import LocalStorage from '../../services/local-storage';
    import Utils from '../../utils';
    import Api from "../../services/api";
    import Version from "../../services/version";

    export default {
        name: 'authorization',
        props: ['value'],
        beforeRouteEnter(from, to, next) {
            next();//if you use beforeRouteEnter this must be fired or reroute to another location
        },
        data() {
            return {
                formData: {
                    login: null,
                    password: null,
                },
                valid: {
                    login: true,
                    password: true,
                },
            };
        },
        mounted() {
            let _that = this;
            LocalStorage.remove('currentUser');
            UserModel.getUpdatedCurrentUser().then((loggedUser) => {
                if (loggedUser) {
                    let firstPageName = SessionStorage.get('firstEnteredPage');
                    Bus.$emit('auth:logIn');
                    if (firstPageName && firstPageName !== '') {
                        if (firstPageName === 'primary') {
                            _that.$router.replace({name: 'personal-settings'});
                        } else {
                            _that.$router.replace({name: firstPageName});
                        }
                    } else {
                        _that.$router.replace({name: 'personal-settings'});
                    }
                } else {
                    throw 'not authorized'
                }
            }).catch((error) => {
                if (error.message) {
                    console.error('readCurrentAccount:', error.message);
                } else {
                    console.error('readCurrentAccount:', error);
                }
            }).finally(() => {
            });
        },
        computed: {
            version: function () {
                return Version.get();
            },
        },
        methods: {
            submitFrom() {
                let _that = this;
                _that.valid.login = Utils.validate('empty', _that.formData.login);
                _that.valid.password = Utils.validate("passwordEES", _that.formData.password);
                if (
                        _that.valid.login === true
                        && _that.valid.password === true
                ) {
                    UserModel.login(_that.formData).then((loggedUser) => {
                        if (loggedUser) {
                            Bus.$emit('auth:logIn');
                            _that.$router.replace({name: 'personal-settings'});
                        }
                    }).catch((error)=> {
                        _that.$notify.error({
                            title: _that.$t('server.errors.user_login.title'),
                            message: _that.$t('server.errors.user_login.message')
                        });
                    }).finally(() => {

                    });
                }
            },
        },
        watch: {
            value: {
                handler(newValue) {
                    let _that = this;
                },
                deep: true
            },
        },
    }
</script>
