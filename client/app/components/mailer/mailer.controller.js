
let mailer = function(http) {
    var property = 'blank';
    var jobVisitFlag = true;
    var dataPrsentFlag = false;
    return {
        sayHello: function () {
            console.log(http)
            console.log(this.abc)
            console.log("say hello")
        }
    };
};


export default mailer;
