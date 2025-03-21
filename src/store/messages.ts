import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * List of valid alert types.
 */
const alertTypes = ['success', 'danger', 'warning', 'info'] as const;

/**
 * Message store to manage alert messages and their types.
 */
export const useMessageStore = defineStore('message', () => {
  /**
   * Reactive variable to store the alert message.
   */
  const message = ref('');

  /**
   * Reactive variable to store the alert type.
   */
  const type = ref('');

  /**
   * Displays a short alert message.
   * 
   * @param {string} msg - The message to display.
   * @param {string} typeP - The type of alert (must be one of 'success', 'danger', 'warning', 'info').
   * @throws {Error} If the provided alert type is invalid.
   */
  const showAlert = (msg: string, typeP: string) => {
    if (!alertTypes.includes(typeP as any)) {
      throw new Error(`Invalid alert type: ${typeP}`);
    }
    message.value = msg;
    type.value = typeP;

    setTimeout(() => {
      message.value = '';
      type.value = '';
    }, 3000);
  };

  /**
   * Displays a long alert message.
   * 
   * @param {string} msg - The message to display.
   * @param {string} typeP - The type of alert (must be one of 'success', 'danger', 'warning', 'info').
   * @throws {Error} If the provided alert type is invalid.
   */
  const showLongAlert = (msg: string, typeP: string) => {
    if (!alertTypes.includes(typeP as any)) {
      throw new Error(`Invalid alert type: ${typeP}`);
    }
    message.value = msg;
    type.value = typeP;
    type.value = typeP;

    setTimeout(() => {
      message.value = '';
      type.value = '';
      type.value = '';
    }, 5000);
  };

  return {
    message,
    type,
    showAlert,
    showLongAlert
  };
});