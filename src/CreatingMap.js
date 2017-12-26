module.exports = class CreatingMap extends Map {
    constructor(create) {
        super();
        this.create=create;
    }

    get(key) {
        let result;
        if (this.has(key)) {
            result=super.get(key);
        } else {
            this.set(key,result=this.create(key));
        }
        return result;
    }
}
