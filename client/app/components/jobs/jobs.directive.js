
let fileModelDirective = function($parse) {
    return {
        restrict: 'A',
        link: (scope, element, attrs) => {
            let model = $parse(attrs.fileModel);
            let modelSetter = model.assign;

            element.bind('change', () => {
                scope.$apply(() => {
                    if(attrs.fileModel=="vm.mailAttachments"){
                        var mailAttachments = [];
                        for (var i = element[0].files.length - 1; i >= 0; i--) {
                            mailAttachments.push(element[0].files[i]);
                        }
                        modelSetter(scope, mailAttachments);
                    }else{
                        modelSetter(scope, element[0].files[0]);
                    }
                });
            });
        }
    };
};

fileModelDirective.$inject = ['$parse'];

export default fileModelDirective;