<template>
    <div class="ui-page-vue page-admin-roles">
        <el-dialog
                :title="$t('common.dialog.roles.delete.confirm.title')"
                :visible.sync="confirmDeleteModalShow"
                width="30%"
        >
            <span>{{ $t('common.dialog.roles.delete.confirm.message') }}</span>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="deleteRole">{{ $t('common.actions.delete') }}</el-button>
                <el-button @click="closeConfirmDeleteRoleModal">{{ $t('common.actions.cancel') }}</el-button>
            </span>
        </el-dialog>
        <el-row v-if="currentUser.permissions.admin.roles">
            <el-col :span="8">
                <h1>{{ $t('admin.routes.roles') }}</h1>
                <div v-if="roles !== null">
                    <div class="ui-actions">
                        <el-button @click="add"
                                   class="action"
                                   :disabled="!nothingIsChanged()"
                        >
                            <icon-file-plus class="action-icon" :title="$t('common.actions.add')"></icon-file-plus>
                            {{ $t('common.actions.add') }}
                        </el-button>
                        <el-button @click="showConfirmDeleteRoleModal"
                                   class="action"
                                   :class="{'disabled': (!commonData.selectedRole || (commonData.selectedRole && commonData.selectedRole.isPredefined)) }"
                        >
                            <icon-delete class="action-icon"
                                         :title="$t('common.actions.delete')"
                            ></icon-delete>
                            {{ $t('common.actions.delete') }}
                        </el-button>
                        <el-button @click="save"
                                   :disabled="saveIsDisabled()"
                                   :class="CSSsave()"
                        >
                            <icon-content-save class="action-icon"
                                               :title="$t('common.actions.save')"
                            ></icon-content-save>
                            {{ $t('common.actions.save') }}
                        </el-button>
                        <el-button @click="cancel"
                                   :disabled="nothingIsChanged()"
                                   :class="CSScancel()"
                        >
                            <icon-backspace class="action-icon"
                                            :title="$t('common.actions.undo')"
                            ></icon-backspace>
                            {{ $t('common.actions.undo') }}
                        </el-button>
                    </div>
                    <roles-list
                        v-model="commonData"
                    ></roles-list>
                </div>
                <div class="total-stats">
                    <div class="stats-line">
                        {{ commonData.selectedRole ? $t('admin.labels.role_selected') + ": " : $t('admin.labels.no_role_selected') }}
                        <span class="value" v-if="commonData.selectedRole">{{ commonData.selectedRole.description }}</span>
                    </div>
                    <div class="stats-line">
                        {{ roles ? $t('admin.labels.total_roles') + ": " : $t('admin.labels.no_roles_found') }}
                        <span v-if="roles" class="value">{{ roles.length }}</span>
                    </div>
                </div>
            </el-col>
            <el-col :span="8">
                <h4 v-if="commonData.selectedRole !== null && functionsCollection !== null && functionsCollection.length>0">
                    {{ $t('admin.labels.functions') }}
                </h4>
                <role-permissions
                        v-model="commonData"
                        :readOnly="(commonData.selectedRole.isPredefined && commonData.selectedRole.isPredefined) ? true : false"
                        :functionsCollection="functionsCollection"
                        v-if="commonData.selectedRole !== null && functionsCollection !== null && functionsCollection.length>0"
                        ref="RolePermissions"
                ></role-permissions>
            </el-col>
        </el-row>
        <div v-else>
            <el-alert type="warning">
                {{ $t('client.errors.access_denied') }}
            </el-alert>
        </div>
    </div>
</template>
<script>

    import Vue from 'vue';
    import UserModel from '../../models/user';
    import RolesModel from '../../models/roles';
    import PermissionGroupsModel from '../../models/permission-groups';
    import Bus from '../../services/bus';
    import RolesList from '../partials/roles-list.vue';
    import RoleUsers from '../partials/role-users.vue';
    import RolePermissions from '../partials/role-permissions.vue';
    import RoleNoteTypes from '../partials/role-note-types.vue';
    //icons
    import IconFilePlus from "vue-material-design-icons/FilePlus.vue";
    import IconDelete from "vue-material-design-icons/Delete.vue";
    import IconContentSave from "vue-material-design-icons/ContentSave.vue";
    import IconBackspace from "vue-material-design-icons/Backspace.vue";
    import Utils from "../../utils";

    export default {
        name: 'roles',
        components: {
            RolesList,
            RoleUsers,
            RolePermissions,
            IconFilePlus,
            IconDelete,
            IconContentSave,
            IconBackspace,
            RoleNoteTypes,
        },
        beforeRouteEnter(from, to, next) {
            next();//if you use beforeRouteEnter this must be fired or reroute to another location
        },
        data() {
            return {
                roles: null,
                functionsCollection: null,
                preparedRoleObject: null,
                copiedRoleData: null,
                confirmDeleteModalShow: false,
                currentUser: null,
                access_granted: false,
                commonData: {
                    roles: null,
                    selectedRole: null,
                    listHasChanges: false,
                    permissionsHasChanges: false,
                }
            };
        },
        created() {
            this.currentUser = UserModel.getCurrentUser();
            if (this.currentUser.permissions.admin.roles) {
                let _that = this;
                let data = {};
                RolesModel.list(data).then((response) => {
                    _that.roles = response;
                    _that.commonData.roles = response;
                    _.forEach(_that.roles, (role) => {
                        role.isEdited = false;
                        role.showNameInput = false;
                    });
                }).catch((error) => {
                    console.error("edit-roles.vue: created(): ", error.message);
                    this.$notify.error({
                        title: _that.$t('admin.routes.roles'),
                        message: _that.$t(error.message)
                    });
                }).finally(() => {
                });
                PermissionGroupsModel.collection(data).then((res) => {
                    _that.functionsCollection = res;
                }).catch((error) => {
                    console.error("can not get permissions collection: ", error.message);
                    this.$notify.error({
                        title: _that.$t('admin.routes.roles'),
                        message:  _that.$t(error.message)
                    });
                }).finally(() => {
                });
            }
        },
        methods: {
            pasteRoleData(roleFrom, roleTo) {
                let _that = this;
                Vue.nextTick(()=>{
                    _that.preparedRoleObject = _.cloneDeep(roleTo);
                    _that.preparedRoleObject.permissionsOriginal = _.cloneDeep(roleTo.permissions);
                    _that.preparedRoleObject.permissions = roleFrom.permissions;

                    _that.copiedRoleData = null;
                });
            },
            copyRoleData(role) {
                this.copiedRoleData = role;
            },
            save() {
                let _that = this;
                let aPermissionIsChosen = _that.commonData.selectedRole.permissions.length > 0;

                if (!aPermissionIsChosen) {
                    _that.$notify({
                        type: 'error',
                        title: _that.$t('admin.routes.roles'),
                        message: _that.$t('client.errors.empty_permissions'),
                    });
                    return false;
                }
                if (_that.commonData.selectedRole && _that.commonData.selectedRole.id) {
                    if (_that.commonData.selectedRole.id === -1) { // role creation
                        RolesModel.create(_that.commonData.selectedRole).then((result) => {
                            if (_that.commonData.roles && !(_.find(_that.commonData.roles, {id: result.id}))) {
                                _that.commonData.roles.push(result);
                            }
                            _that.clearSelectedRole();
                            Bus.$emit('edit-roles:save-role', result);
                        }).catch((err)=> {
                            console.error("can't create role: ", err);
                            _that.$notify.error({
                                title: _that.$t('client.errors.title'),
                                message: err.message
                            });
                        }).finally();
                    } else { // update role
                        RolesModel.update(_that.commonData.selectedRole).then((result) => {
                            if (_that.commonData.roles) {
                                if (_.find(_that.commonData.roles, {id: result.id})) {
                                    let roleIndex = _.findIndex(_that.commonData.roles, {id: result.id});
                                    result.isEdited = false;
                                    result.showNameInput = false;
                                    _that.commonData.roles.splice(roleIndex, 1, result);
                                }
                            }
                            _that.clearSelectedRole();
                            Bus.$emit('edit-roles:save-role');
                        }).catch((err)=> {
                            console.error("can't update role: ", err);
                            _that.$notify.error({
                                title: _that.$t('admin.routes.roles'),
                                message: err.message
                            });
                        }).finally();
                    }
                }
            },
            add() {
                Bus.$emit('edit-roles:add-new-role');
            },
            showConfirmDeleteRoleModal() {
                if (this.commonData.selectedRole !== null && !this.commonData.selectedRole.isPredefined) {
                    this.confirmDeleteModalShow = true;
                }
            },
            closeConfirmDeleteRoleModal() {
                this.confirmDeleteModalShow = false;
            },
            deleteRole() {
                let _that = this;
                if (_that.commonData.selectedRole && _that.commonData.selectedRole.id === -1) {
                    _that.roles.splice(_that.roles.length - 1, 1);
                    _that.commonData.selectedRole = null;
                    _that.clearSelectedRole();
                    _that.closeConfirmDeleteRoleModal();
                } else {
                    RolesModel.delete(_that.commonData.selectedRole).then((res) => {
                        let roleIndex =_.findIndex(_that.roles, {'id': _that.commonData.selectedRole.id});
                        _that.roles.splice(roleIndex, 1);
                        _that.commonData.selectedRole = null;
                        _that.clearSelectedRole();
                    }).catch((error) => {
                        _that.saveWarning = true;
                        console.error("can't remove role: ", _that.$t(error.message));
                        _that.$notify.error({
                            title: _that.$t('admin.routes.users'),
                            message: _that.$t(error.message)
                        });
                    }).finally(() => {
                        _that.closeConfirmDeleteRoleModal();
                    });
                }
            },
            clearSelectedRole() {
                let _that = this;
                _that.commonData.selectedRole = null;
                _that.commonData.listHasChanges = false;
                _that.commonData.permissionsHasChanges = false;
            },
            cancel() {
                let _that = this;
                Bus.$emit('roleEdit:clearUnsaved');
                if (_that.commonData.selectedRole && _that.commonData.selectedRole.id === -1) {
                    _that.roles.splice(_that.roles.length - 1, 1);
                    _that.commonData.selectedRole = null;
                    _that.clearSelectedRole();
                    _that.closeConfirmDeleteRoleModal();
                }

                _that.commonData.listHasChanges = false;
                _that.commonData.permissionsHasChanges = false;
            },
            selectedRoleChanged(item) {
                let _that = this;
                if (item.id !== -1 && _that.roles.indexOf(_.find(_that.roles, {id: -1})) !== -1) {
                    _that.roles.splice(_that.roles.indexOf(_.find(_that.roles, {id: -1})), 1);
                }
                _that.commonData.selectedRole = item;
                _that.commonData.listHasChanges = false;
                _that.commonData.permissionsHasChanges = false;
            },
            saveIsDisabled() {
                let _that = this;
                let result = true;
                if (
                        _that.commonData.roles
                        && _that.commonData.selectedRole
                        && (_that.commonData.listHasChanges || _that.commonData.permissionsHasChanges)
                ) {
                    result = false;
                }
                if (
                        _that.commonData.selectedRole
                        && (
                                (_that.commonData.selectedRole.isInvalidName || _that.commonData.selectedRole.isDuplicateName || _that.commonData.selectedRole.isInvalidDescription)
                                || !_that.commonData.selectedRole.permissions
                                || _that.commonData.selectedRole.permissions.length < 1
                        )
                ) {
                    result = true;
                }
                return result;
            },
            nothingIsChanged() {
                let _that = this;
                let result = true;
                if (_that.commonData.roles && _that.commonData.selectedRole && (_that.commonData.listHasChanges || _that.commonData.permissionsHasChanges)) {
                    result = false;
                }
                return result;
            },
            CSSsave() {
                let cls = ['action', 'save-button'];
                return cls.join(' ');
            },
            CSScancel() {
                let cls = ['action', 'cancel-button'];
                return cls.join(' ');
            },
        },
        computed: {
            selectedRoleIsEdited: function () {
                return (this.commonData.listHasChanges || this.commonData.permissionsHasChanges);
            }
        },
        beforeRouteLeave(to, from, next) {
            let _that = this;
            if (_that.selectedRoleIsEdited) {
                _that.$confirm(_that.$t('admin.labels.confirm_role_change_part_1') + _that.commonData.selectedRole.name + _that.$t('admin.labels.confirm_role_change_part_2'), this.$t('admin.labels.warning'), {
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
