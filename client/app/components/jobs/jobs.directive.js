
let fileModelDirective = function($parse) {
    return {
        restrict: 'A',
        link: (scope, element, attrs) => {
            let model = $parse(attrs.fileModel);
            let modelSetter = model.assign;

            element.bind('change', () => {
                scope.$apply(() => {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
};

fileModelDirective.$inject = ['$parse'];

export default fileModelDirective;