<template>
    <div v-if="currentUser" class="personal-settings">
        <h1>{{ $t('personal_area.routes.personal_settings') }}</h1>
        <el-row>
            <el-col :span="12">
                <div class="field">
                    {{ $t('personal_area.labels.login') }} {{ currentUser.login }}
                </div>
                <div class="field">
                    <div class="change-password">
                        <span class="blue-link" @click="showChangePassForm = true">
                            {{ $t('personal_area.labels.change_password') }}
                        </span>
                    </div>
                </div>
                <div class="field caption">
                    {{ $t('personal_area.labels.your_data') }}
                </div>
                <div class="field">
                    {{ $t('personal_area.labels.full_name') }} {{ fullname }}
                </div>
                <div class="field" v-if="organization && organization.name">
                    {{ $t('personal_area.labels.enterprise') }} {{ organization.name }}
                </div>
                <div class="field" v-if="currentUser.roles">
                    {{ $t('personal_area.labels.roles') }} {{ userRoles }}
                </div>
            </el-col>
            <el-col :span="12">
                <el-button class="field btn feedback-btn" @click="showFeedbackForm" v-if="false">
                    <icon-help-circle title=""></icon-help-circle>{{ $t('personal_area.labels.ask_question') }}
                </el-button>
                <div class="field timezone">
                    {{ $t('personal_area.labels.timezone') }}
                    <el-select v-model="timezone">
                        <el-option
                                v-for="timezone in timezones"
                                :key="timezone.UTC"
                                :value="timezone.UTC"
                                :label="timezone.UTC + ':00, ' + timezone.name"
                        ></el-option>
                    </el-select>
                    <div>
                        <el-button @click="saveTimezone" :disabled="initialTimezone === timezone">
                            {{ $t('personal_area.labels.save') }}
                        </el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <hr class="special" />
        <hr class="special" />
        <br />
        <el-button class="field btn" @click="clearAccountData()" type="danger"><IconDelete></IconDelete>{{ $t('personal_area.labels.clear_app_data') }}<IconDelete></IconDelete></el-button>
        <modal-window
                :title="$t('personal_area.titles.change_password')"
                :show-fullscreen-btn="false"
                :visible="showChangePassForm"
                @closed="showChangePassForm = false"
        >
            <change-password></change-password>
        </modal-window>
    </div>
</template>

<script>
    import Bus from '../../services/bus';
    import LocalStorage from '../../services/local-storage';
    import SessionStorage from '../../services/session-storage';
    import UserModel from '../../models/user';
    import SettingsModel from '../../models/settings';
    import IconHelpCircle from 'vue-material-design-icons/HelpCircleOutline.vue';
    import ModalWindow from "../partials/modal-window.vue";
    import ChangePassword from "./change-password.vue";
    import IconDelete from 'vue-material-design-icons/DeleteForever.vue';

    export default {
        name: 'personal-settings',
        components: {
            ChangePassword,
            ModalWindow,
            IconHelpCircle,
            IconDelete,
        },
        data() {
            return {
                currentUser: null,
                showChangePassForm: false,
                organization: null,
                initialTimezone: "",
                timezone: "",
                timezones: []
            };
        },
        mounted() {
            this.currentUser = UserModel.getCurrentUser();
            if (this.currentUser) {
                if (!this.currentUser.timezone) {
                    this.currentUser.timezone = 3;
                }
                if (this.currentUser.timezone.UTC) {
                    this.timezone = this.currentUser.timezone.UTC;
                }
                else {
                    //TODO user.timezone in server response is number, not object. need fix (don't forget common-footer currentUser.timezone output)
                    this.timezone = "+" + this.currentUser.timezone;
                }
                this.timezones = SettingsModel.getTimezones();
                this.initialTimezone = this.timezone;
                this.organization = this.currentUser.division.enterprise;
            }
        },
        methods: {
            clearAccountData() {
                let _that = this;

                UserModel.clearUserSessionData().then((response) => {
                    UserModel.logout().then((response) => {
                        LocalStorage.remove('currentUser');
                        SessionStorage.remove('firstEnteredPage');
                        Bus.$emit('auth:logOut');
                    }).catch((error)=> {
                        _that.$notify.error({
                            title: _that.$t('server.errors.logout.title'),
                            message: _that.$t('server.errors.logout.message')
                        });
                    }).finally(()=> {
                        SessionStorage.clear();
                        LocalStorage.clear();
                    });
                    _that.$message({
                        message: _that.$t('ui.messages.cleared_user_session_data_successfully'),
                        type: 'success'
                    });
                }).catch((err) => {
                    console.error('Can not clear user session data', err);
                    _that.$message({
                        message: _that.$t('ui.messages.clear_user_session_data_failed'),
                        type: 'error'
                    });
                });
            },
            showFeedbackForm() {
                Bus.$emit('showFeedbackForm');
            },
            saveTimezone() {
                //TODO: save user's timezone to server
                let _that = this;
                _that.$confirm(_that.$t('personal_area.warning.save_timezone'), _that.$t('personal_area.warning.title'), {
                    confirmButtonText: _that.$t('admin.labels.yes'),
                    cancelButtonText: _that.$t('admin.labels.cancel'),
                    type: 'warning'
                }).then(() => {
                    UserModel.updateTimeZone(_that.timezone).then((response) => {
                        _that.currentUser.timezone = _.find(_that.timezones, {UTC: _that.timezone});
                        LocalStorage.set('currentUser', JSON.stringify(_that.currentUser));
                        _that.initialTimezone = _that.timezone;
                    }).catch((error) => {
                        _that.$notify({
                            type: 'error',
                            message: _that.$t(error)
                        });
                    }).finally(()=>{
                    
                    });

                }).catch(() => {
                    _that.timezone = _that.initialTimezone;
                });

            },
        },
        computed: {
            userRoles() {
                return _.map(this.currentUser.roles, (role) => { return role.description }).join(', ');
            },
            fullname() {
                let name = [];
                name.push(this.currentUser.lastName);
                name.push(this.currentUser.firstName);
                name.push(this.currentUser.midName);
                return name.join(' ');
            },
        },
    }
</script>
