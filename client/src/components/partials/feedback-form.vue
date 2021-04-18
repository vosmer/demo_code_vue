<template>
    <div class="feefback-form">
        <el-form ref="form" v-model="form">
            <el-form-item :label="$t('feedback.form.from')"
                          v-if="userIsLogin === false">
                <el-input v-model="form.from"></el-input>
                <span class="invalid-message" v-if="valid.from === false">{{ $t('feedback.form.invalid.from') }}</span>
            </el-form-item>
            <el-form-item v-if="userIsLogin === false"
                          :class="{'invalid': valid.email === false}"
                          :label="$t('feedback.form.email')">
                <el-input v-model="form.email"></el-input>
                <span class="invalid-message"
                      v-if="valid.email === false">{{ $t('feedback.form.invalid.email') }}</span>
            </el-form-item>
            <el-form-item :label="$t('feedback.form.title')" :class="{'invalid': valid.title === false}">
                <el-input v-model="form.title"></el-input>
                <span class="invalid-message"
                      v-if="valid.title === false">{{ $t('feedback.form.invalid.title') }}</span>
            </el-form-item>
            <el-form-item :label="$t('feedback.form.message')" :class="{'invalid': valid.message === false}">
                <el-input type="textarea" rows="3" v-model="form.message"></el-input>
                <span class="invalid-message"
                      v-if="valid.message === false">{{ $t('feedback.form.invalid.message') }}</span>
            </el-form-item>
            <el-form-item  :label="$t('feedback.form.admin_list')">
                <el-checkbox-group v-model="form.adminList">
                    <el-checkbox v-for="adm in adminList" :label="adm.id" :key="adm.id">{{ adm.name }}</el-checkbox><br />
                </el-checkbox-group>
                <span class="invalid-message" v-if="valid.adminList === false">{{ $t('feedback.form.invalid.adminList') }}</span>
            </el-form-item>
            <el-form-item>
                <el-button @click="onSubmit">{{ $t('feedback.form.button.submit') }}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import Utils from '../../utils';
    import FeedbackModel from '../../models/feedback';
    import UserModel from '../../models/user';
    import Api from '../../services/api';

    export default {
        name: 'feedback-form',
        data() {
            return {
                form: {
                    from: '',
                    email: '',
                    title: '',
                    message: '',
                    adminList: [],
                },
                valid: {
                    from: true,
                    email: true,
                    title: true,
                    message: true,
                    adminList: true
                },
                userIsLogin: false,
                adminList: []
            };
        },
        mounted() {
            let _that = this;
            let me = UserModel.getCurrentUser();
            _that.userIsLogin = (me && me.id);
            if (_that.userIsLogin) {
                UserModel.getCurrentUserAdminList().then((response) => {
                    _that.adminList = Api.fixArray(response);
                    _that.form.adminList = _.map(_that.adminList, 'id');
                }).catch((error) => {
                    _that.$notify.error({
                        title: _that.$t('server.errors.get_current_user_admin_list.title'),
                        message: _that.$t('server.errors.get_current_user_admin_list.message')
                    });
                });
            }
        },
        methods: {
            onSubmit() {
                this.valid.title = (this.form.title.length < 255) ? (true) : (false);
                this.valid.message = (this.form.message.length < 8000 && this.form.message.length > 0) ? (true) : (false);
                this.valid.adminList = (this.form.adminList.length > 0);
                this.valid.from = Utils.validate('fullName', this.form.from);
                this.valid.email = Utils.validate("email", this.form.email);
                if (
                        this.valid.from === true
                        && this.valid.email === true
                        && this.valid.title === true
                        && this.valid.message === true
                        && this.valid.adminList === true
                ) {
                    FeedbackModel.send(this.form)
                        .then(() => {
                            this.$notify({
                                title: this.$t('feedback.notify.success.title'),
                                message: this.$t('feedback.notify.success.message'),
                                type: 'success'
                            });
                            this.$emit('close-dialog');
                        })
                        .catch(error => this.$notify(this.$t(error)))
                        .finally(() => {
                            this.clearForm();
                        });
                } else {
                    this.$notify({
                        title: this.$t('feedback.notify.error.title'),
                        message: this.$t('feedback.notify.error.message'),
                        type: 'error'
                    });
                }
            },
            clearForm() {
                this.form.from = '';
                this.form.email = '';
                this.form.title = '';
                this.form.message = '';
                this.form.adminList = [];
                this.valid = {
                    from: true,
                    email: true,
                    title: true,
                    message: true,
                    adminList: true
                };
            }
        }
    }
</script>
