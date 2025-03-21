<template>
    <div class="alert-box">
        <Transition enter-active-class="animate__animated animate__fadeInDown" leave-active-class="animate__animated animate__fadeOutUp">        
            <div v-if="message != ''" :class="`alert alert-${type}`">{{ message }}</div>
        </Transition>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMessageStore } from '../store/messages';

/**
 * Reactive store for managing alert messages and their types.
 */
const messageStore = useMessageStore();

/**
 * Computed property for retrieving the current alert message from the store.
 * @type {import('vue').ComputedRef<string>}
 */
const message = computed(() => messageStore.message);

/**
 * Computed property for retrieving the current alert type from the store.
 * @type {import('vue').ComputedRef<'success' | 'info' | 'warning' | 'danger'>}
 */
const type = computed(() => messageStore.type);
</script>

<style lang="scss" scoped>

.alert-box {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100000;
    padding: 0.5em;
    div {
        text-align: center;
        white-space: pre-line;
        animation-duration: 0.5s;
    }
}
</style>
