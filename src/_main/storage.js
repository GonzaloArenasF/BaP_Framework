/**
 * Information storage control
 * - LocalStorage
 * - SessionStorage
 */
import { CONSTANT } from "./constants.js";
import { ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { bapNotify } from "./util.js";
import { bapDB } from "./firebaseInit.js";
import { getI18nContent } from "./i18n.js";

const storageI18n = getI18nContent('page', 'cross');

/**
 * Encrypt and decrypt data
 *
 * @param data: <string>
 * @param secretKey: <string>
 *
 * @returns <string> Encrypted data
 */
const encryptData = (data, secretKey) => btoa(data) + "/@/" + secretKey;
const decryptData = (encryptedData) => atob(encryptedData.split("/@/")[0]);

/**
 * DB routes
 */
export const dbRoutes = {
  test: (param) => `/test/${param}`,
};

/**
 * Get from storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail. (Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted. (Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns *
 */
export const getFromStorage = ({ storageType, item, callbackOnSuccess, callBackOnFail, secretKey }) => {
  let value;
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      value = localStorage.getItem(item);
      secretKey ? (value = decryptData(value, secretKey)) : null;
      return value ? JSON.parse(value) : null;
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      value = sessionStorage.getItem(item);
      secretKey ? (value = decryptData(value, secretKey)) : null;
      return value ? JSON.parse(value) : null;
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      const dbConnection = ref(bapDB, item);
      onValue(
        dbConnection,
        (snapshot) => (callbackOnSuccess ? callbackOnSuccess(snapshot.val()) : null),
        (error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
                CONSTANT.NOTIFICATION.TYPE.ALERT,
                CONSTANT.NOTIFICATION.SEVERITY.ERROR,
                storageI18n.storage.errorGetting,
                error
              );
        }
      );
      break;
  }
};

/**
 * Set to storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param value: <string|object>
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail.(Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted.(Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns void
 */
export const setToStorage = ({ storageType, item, value, callbackOnSuccess, callBackOnFail, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      localStorage.setItem(item, secretKey ? encryptData(localData, secretKey) : localData);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      sessionStorage.setItem(item, secretKey ? encryptData(sessionData, secretKey) : sessionData);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      set(ref(bapDB, item), value)
        .then(() => {
          callbackOnSuccess
            ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
            : null;
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
                CONSTANT.NOTIFICATION.TYPE.ALERT,
                CONSTANT.NOTIFICATION.SEVERITY.ERROR,
                storageI18n.storage.errorSaving,
                error
              );
        });
      break;
  }
};

/**
 * Update to storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param value: <string|object>
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail.(Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted. (Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns void
 */
export const updateStorage = ({ storageType, item, value, callbackOnSuccess, callBackOnFail, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      localStorage.setItem(item, secretKey ? encryptData(localData, secretKey) : localData);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      sessionStorage.setItem(item, secretKey ? encryptData(sessionData, secretKey) : sessionData);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      update(ref(bapDB, item), value)
        .then(() => {
          if (callbackOnSuccess) {
            callbackOnSuccess
              ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
              : null;
          }
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
                CONSTANT.NOTIFICATION.TYPE.ALERT,
                CONSTANT.NOTIFICATION.SEVERITY.ERROR,
                storageI18n.storage.errorUpdating,
                error
              );
        });
      break;
  }
};

/**
 * Remove from storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail. (Just for STORAGE.SOURCE.DB)
 *
 * @returns void
 */
export const removeFromStorage = ({ storageType, item, callbackOnSuccess, callBackOnFail }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      return localStorage.removeItem(item);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      return sessionStorage.removeItem(item);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      remove(ref(bapDB, item))
        .then(() => {
          if (callbackOnSuccess) {
            callbackOnSuccess
              ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
              : null;
          }
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
                CONSTANT.NOTIFICATION.TYPE.ALERT,
                CONSTANT.NOTIFICATION.SEVERITY.ERROR,
                storageI18n.storage.errorRemoving,
                error
              );
        });
      break;
  }
};
