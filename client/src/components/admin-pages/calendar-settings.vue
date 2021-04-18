<template>
    <div class="ui-page-vue page-admin-common-settings" v-if="access_granted">
        <h1>{{ $t('admin.routes.calendar_settings') }}</h1>
        <admin-calendar v-model="calendarSettings" :saved-exclusions="savedCalendar"></admin-calendar>
        <div class="ui-actions">
            <el-button
                    :icon="(isSaving ? 'el-icon-loading' : '')"
                    @click="save"
                    class="action"
                    :class="{'disabled': !canSave }"
            >
                {{ $t('common.actions.save') }}
            </el-button>
            <el-button
                    @click="cancel"
                    class="action"
                    :class="{'disabled': !canSave }"
            >
                {{ $t('common.actions.undo') }}
            </el-button>
        </div>
    </div>
    <div v-else>
        <el-alert type="warning">
            {{ $t('client.errors.access_denied') }}
        </el-alert>
    </div>
</template>
<script>
    import AdminCalendar from "../partials/admin-calendar.vue";
    import SettingsModel from '../../models/settings';
    import UserModel from '../../models/user';
    import moment from 'moment';

    export default {
        name: 'admin-calendar-settings',
        components: {
            AdminCalendar
        },
        data() {
            return {
                calendarSettings: [],
                savedCalendar: [],
                currentUser: null,
                access_granted: false,
                isSaving: false,
            };
        },
        beforeRouteEnter(from, to, next) {
            next();//if you use beforeRouteEnter this must be fired or reroute to another location
        },
        mounted() {
            this.currentUser = UserModel.getCurrentUser();
            this.access_granted = this.currentUser && this.currentUser.permissions.admin.shiftsAndCalendar.calendar;
            let _that = this;
            SettingsModel.getCalendarSettings().then((res) => {
                _that.savedCalendar = res;
                _that.calendarSettings = _.cloneDeep(_that.savedCalendar);
            }).catch((error) => {
                _that.$message({
                    message: _that.$t('admin_common_settings.errors.get_calendar_settings_failed'),
                    type: 'error'
                });
            }).finally(() => {
            });
        },
        computed: {
            unsaved() {
                let lst = [];
                _.each(this.calendarSettings, (item) => {
                    if (_.find(this.savedCalendar, {date: item.date}) === undefined) {
                        lst.push(item);
                    }
                });
                _.each(this.savedCalendar, (item) => {
                    if (_.find(this.calendarSettings, {date: item.date}) === undefined) {
                        lst.push({ date: item.date, dayType: (item.dayType === 'work') ? 'weekend' : '' });
                    }
                });
                return lst;
            },
            canSave() {
                return this.unsaved.length > 0;
            }
        },
        methods: {
            save() {
                if (this.unsaved.length > 0) {
                    const _that = this;
                    this.isSaving = true;
                    SettingsModel.updateCalendarExclusions(_.map(this.unsaved, (item) => {
                        return {calendarExclusion: {exclusion: moment(item.date, 'DD.MM.YYYY').format('YYYY-MM-DD') }};
                    })).then((res) => {
                        _that.savedCalendar = _.cloneDeep(_that.calendarSettings);
                    }).catch((error) => {
                        _that.$message({
                            message: _that.$t('admin_common_settings.errors.set_calendar_settings_failed'),
                            type: 'error'
                        });
                    }).finally(() => {
                        _that.isSaving = false;
                    });
                }
            },
            cancel() {
                this.calendarSettings = _.cloneDeep(this.savedCalendar);
            }
        },
        beforeRouteLeave(to, from, next) {
            let _that = this;
            if (_that.canSave) {
                _that.$confirm(_that.$t('admin.labels.confirm_lose_changes'), this.$t('admin.labels.warning'), {
                    confirmButtonText: _that.$t('admin.labels.ok'),
                    cancelButtonText: _that.$t('admin.labels.cancel'),
                    type: 'warning'
                }).then(() => {
                    next();
                }).catch(() => {
                });
            } else {
                next();
            }
        }
    }
</script>
