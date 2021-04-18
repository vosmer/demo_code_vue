<template>
    <div class="user-settings" v-if="roles !== null && value !== null">
        {{ $t('admin.labels.user_roles') }}<br/><br/>
        <div class="user-roles" v-if="userRoles !== null">
            <div class="user-roles-item"
                 v-for="role in userRoles"
                 :class="userRoleCSS(role)"
                 @contextmenu="showRoleMenu(role, $event)">
                <el-checkbox
                        v-model="role.checked"
                        @change="roleChecked"
                        :label="role.description"
                        :disabled="readonly || !allowedRole(role)"
                ></el-checkbox>
                <div
                        class="context-menu"
                        v-show="role.showMenu"
                        :ref="'roleMenu'+role.id"
                        tabindex="-1"
                        @blur="hideRoleMenu(role)"
                        :style="{top:role.menuY, left:role.menuX}">
                    <span class="context-menu-item" @click="goTo('/admin/roles/' + role.id)">
                        {{ $t('admin.labels.goto_role_settings') }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import UserModel from '../../models/user';
    export default {
        name: 'user-settings',
        props: {
            roles:
                {
                    default: null,
                    type: Array
                },
            allowedRoles:
                {
                    default: null,
                    type: Array
                },
            value:
                {
                    default: null,
                    type: Array
                },
            readonly:
                {
                    default: false,
                    type: Boolean
                },
        },
        data() {
            return {
                userRoles: null,
                canUpdate: true,
                currentUser: null,
                access_granted: false,
            }
        },
        mounted() {
            this.currentUser = UserModel.getCurrentUser();
            this.access_granted = this.currentUser && this.currentUser.permissions.admin.users.manageUsers
                || this.currentUser.permissions.admin.users.viewUserProfiles;

            if (this.access_granted) {
                if (this.value) {
                    this.init(this.value);
                }
            }
        },
        methods: {
            allowedRole(role) {
                return _.find(this.allowedRoles, { id: role.id }) !== undefined;
            },
            init() {
                this.userRoles = [];
                if (this.roles && this.value) {
                    this.roles.forEach((role) => {
                        this.userRoles.push({
                            id: role.id,
                            description: role.description,
                            name: role.name,
                            showMenu: false,
                            menuX: 0,
                            menuY: 0,
                            initial: this.value.indexOf(role.id) > -1,
                            checked: this.value.indexOf(role.id) > -1
                        });
                    });
                }
            },
            getSelectedRolesIDs() {
                let rolesIDs = [];
                if (this.userRoles !== null) {
                    this.userRoles.forEach((role) => {
                        if (role.checked) {
                            rolesIDs.push(role.id);
                        }
                    });
                }
                return rolesIDs;
            },
            cancel() {
                this.init(this.rolesLst);
            },
            showRoleMenu(role, e) {
                if (this.userRoles) {
                    this.userRoles.forEach((r) => {
                        r.showMenu = false;
                    });
                }
                role.showMenu = true;
                role.menuY = e.offsetY;
                role.menuX = e.offsetX + 10;

                this.$nextTick(function () {
                    this.$refs['roleMenu' + role.id][0].focus();
                }.bind(this));
                e.preventDefault();
            },
            hideRoleMenu(role) {
                role.showMenu = false;
            },
            goTo(href) {
                this.$router.push(href);
            },
            userRoleCSS(role) {
                let cls = [];
                cls.push("checkbox-placeholder");
                if (role.initial !== role.checked) {
                    cls.push('is-changed');
                }
                return _.map(cls).join(' ');
            },
            roleChecked() {
                let rolesIDs = this.getSelectedRolesIDs();
                this.canUpdate = false;
                this.$emit("input", rolesIDs);

                let v = this.edited();
                this.$emit("user-roles-change", v);
            },
            edited() {
                let result = false;
                this.userRoles.forEach((role) => {
                    if (role.initial !== role.checked) {
                        result = true;
                    }
                });
                return result;
            }
        },
        watch: {
            roles: function () {
                this.init();
            },
            allowedRoles: function () {
                this.init();
            },
            value: function () {
                if (this.canUpdate) {
                    this.init();
                    this.$emit("user-roles-change", false);
                }
                this.canUpdate = true;
            }
        }
    }
</script>