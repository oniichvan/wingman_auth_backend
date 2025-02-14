class ResponseObj {
    constructor(isSuccess, message, data) {
        this.isSuccess = isSuccess;
        this.message = message;
        this.data = data;
    }

    /** The static success and failure methods make it easier to create response objects without writing new ResponseObj(...) 
     * every time, keeping the code cleaner and more readable. */
    static success(message, data) {
        return new ResponseObj(true, message, data);
    }

    static failure(message, data = null) {
        return new ResponseObj(false, message, data);
    }
}

module.exports = ResponseObj;