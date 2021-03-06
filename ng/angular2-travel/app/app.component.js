"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var fruit_1 = require('./class/fruit');
var user_1 = require('./class/user');
var user_service_1 = require('./services/user.service');
/*
 * 别忘记了使用@前缀
 * 这里相当于组件视图
 */
var AppComponent = (function () {
    function AppComponent(userService) {
        this.userService = userService;
        this.input = '';
        this.item = '';
        this.itemList = [];
        this.user = new user_1.User('dreamapple', 'sdfsf@qw.com', 'noting is bad', 'apple');
        this.username = 'dreamapple';
        this.age = 22;
        this.fruit = 'apple';
        this.fruitList = [
            new fruit_1.Fruit('apple', 20),
            new fruit_1.Fruit('orange', 30),
            new fruit_1.Fruit('pear', 40),
            new fruit_1.Fruit('banana', 50)
        ];
        this.msg = 'hello';
        this.showMsg = function () {
            alert(this.msg);
        };
        this.users = userService.getUsers();
    }
    AppComponent.prototype.keyupHandler1 = function (event) {
        this.input = event.target.value;
    };
    AppComponent.prototype.addItem = function (name) {
        this.itemList.push({ name: name, status: 'not finished' });
    };
    AppComponent.prototype.removeItem = function (id) {
        this.itemList.splice(id, 1);
    };
    AppComponent.prototype.doneItem = function (id) {
        this.itemList[id].status = 'done';
    };
    Object.defineProperty(AppComponent.prototype, "userInfo", {
        get: function () {
            return JSON.stringify(this.user);
        },
        enumerable: true,
        configurable: true
    });
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            // template: `
            //     <p>my name is:{{username}}</p>
            //     <p>my age is:{{age}}</p>
            //     <p>my fruit is:{{fruit}}</p>
            // `
            templateUrl: 'app/templates/app.template.html',
            providers: [
                user_service_1.UserService
            ]
        }), 
        __metadata('design:paramtypes', [user_service_1.UserService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map