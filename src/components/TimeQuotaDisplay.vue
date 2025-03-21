<template>
    <div :class="['time-quota-box', 'alert', timeQuotaClass(timeQuota)]">
        Time Quota: {{ formatTimeQuota(timeQuota) }}
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

/**
 * Props for the TimeQuotaDisplay component.
 * @property {number} timeQuota - The time quota in minutes.
 */
const props = defineProps({
    timeQuota: {
        type: Number,
        required: true
    },
});

/**
 * Formats the time quota into a human-readable string.
 * Converts minutes into days, hours, and minutes.
 * 
 * @param {number} timeQuota - The time quota in minutes.
 * @returns {string} - The formatted time quota string.
 */
function formatTimeQuota(timeQuota) {
    if (timeQuota <= 0) {
        return '0 min';
    }
    const days = Math.floor(timeQuota / 1440);
    const hours = Math.floor((timeQuota % 1440) / 60);
    const minutes = timeQuota % 60;
    let result = '';
    if (days > 0) {
        result += `${days}d `;
    }
    if (hours > 0) {
        result += `${hours}h `;
    }
    result += `${minutes}min`;
    return result;
}

/**
 * Determines the CSS class for the time quota box based on the time quota value.
 * 
 * @param {number} timeQuota - The time quota in minutes.
 * @returns {string} - The CSS class name.
 */
function timeQuotaClass(timeQuota) {
    if (timeQuota <= 0) {
        return 'alert-danger';
    }
    return 'alert-success';
}
</script>

<style scoped>

.time-quota-box {
    padding: 0.5rem 1rem;
    text-align: center;
    display: inline-block;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}
</style>