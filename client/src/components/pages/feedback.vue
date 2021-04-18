<template>
    <div class="feedback-page">
        <h1>{{ $t('feedback.title') }}</h1>
        <feedback-form></feedback-form>
    </div>
</template>

<script>
    import FeedbackForm from '../partials/feedback-form.vue';
    export default {
        name: 'feedback-page',
        components: {
            FeedbackForm
        }
    }
</script>
