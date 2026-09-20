export function sendToLocalStorage(localStorageArr) {
    try {
        localStorage.setItem("Data", JSON.stringify(localStorageArr));
    } catch {
        // Continue without persistence when local storage is unavailable.
    }
}

export function getFromLocalStorage() {
    try {
        const dataStr = localStorage.getItem("Data");
        const data = dataStr ? JSON.parse(dataStr) : [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}