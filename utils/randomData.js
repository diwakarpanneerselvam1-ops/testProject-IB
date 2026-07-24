class RandomData {

    static itemCode() {
        return `UPLOAD${Date.now().toString().slice(-6)}`;
    }

}

module.exports = RandomData;