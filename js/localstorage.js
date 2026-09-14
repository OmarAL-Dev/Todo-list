export function sendToLocalStorage(localStorageArr) {
    localStorage.setItem("Data", JSON.stringify(localStorageArr));
}

export function getFromLocalStorage() {
    const dataStr = localStorage.getItem("Data");
    return dataStr ? JSON.parse(dataStr) : [];
}