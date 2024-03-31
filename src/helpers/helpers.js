function generateRandomId() {
    return Math.random().toString(36).substring(7);
}

function generateRandomEmail() {
    return `user${Math.floor(Math.random() * 10000)}@example.com`;
}

function generateUID(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';
    for (let i = 0; i < length; i++) {
        uid += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return uid;
}

module.exports = {
    generateRandomId,
    generateRandomEmail,
    generateUID
};
