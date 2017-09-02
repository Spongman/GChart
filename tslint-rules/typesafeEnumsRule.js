"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        debugger;
        return this.applyWithWalker(new TypesafeEnumsWalker(sourceFile, this.getOptions(), program));
    };
    Rule.FAILURE_STRING = "cannot mix number/enum";
    Rule.metadata = {
        ruleName: 'typesafe-enums',
        type: 'maintainability',
        description: 'The name of the exported module must match the filename of the source file',
        options: null,
        optionsDescription: '',
        requiresTypeInfo: true,
        typescriptOnly: true
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
// The walker takes care of all the work.
var TypesafeEnumsWalker = /** @class */ (function (_super) {
    __extends(TypesafeEnumsWalker, _super);
    function TypesafeEnumsWalker(srcFile, lintOptions, program) {
        var _this = _super.call(this, srcFile, lintOptions, program) || this;
        //console.log('foo');
        _this.checker = _this.getTypeChecker();
        return _this;
    }
    /*
    protected visitNode(node: ts.Node): void {
        console.log(ts.SyntaxKind[node.kind]);
        return super.visitNode(node);
    }
    */
    TypesafeEnumsWalker.prototype.typeInfo = function (node) {
        var type = this.checker.getTypeAtLocation(node);
        var isNumber = !!(type.flags & ts.TypeFlags.Number) || !!(type.flags & ts.TypeFlags.NumberLiteral);
        if (isNumber) {
            if (ts.isBinaryExpression(node) && node.operatorToken.kind !== ts.SyntaxKind.CommaToken) {
                var tiLeft = this.typeInfo(node.left);
                var tiRight = this.typeInfo(node.right);
                var isEnum_1 = tiLeft.isEnum && tiRight.isEnum ||
                    tiLeft.isEnum && tiRight.isNumber ||
                    tiLeft.isNumber && tiRight.isEnum;
                return {
                    isEnum: isEnum_1,
                    isNumber: !isEnum_1 && (tiLeft.isNumber || tiRight.isNumber),
                };
            }
            else if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
                return this.typeInfo(node.operand);
            }
            else if (ts.isParenthesizedExpression(node)) {
                return this.typeInfo(node.expression);
            }
            else if (ts.isConditionalExpression(node)) {
                var tiLeft = this.typeInfo(node.whenTrue);
                var tiRight = this.typeInfo(node.whenFalse);
                var isEnum_2 = tiLeft.isEnum && tiRight.isEnum ||
                    tiLeft.isEnum && tiRight.isNumber ||
                    tiLeft.isNumber && tiRight.isEnum;
                return {
                    isEnum: isEnum_2,
                    isNumber: !isEnum_2 && (tiLeft.isNumber || tiRight.isNumber),
                };
            }
        }
        var isEnum = !!(type.flags & ts.TypeFlags.Enum) || !!(type.flags & ts.TypeFlags.EnumLiteral);
        return {
            //type: type,
            isEnum: isEnum,
            isNumber: !isEnum && isNumber && !(type.flags & ts.TypeFlags.EnumLiteral),
        };
    };
    TypesafeEnumsWalker.prototype.checkTypes = function (node, nodeLeft, nodeRight) {
        if (!nodeLeft || !nodeRight)
            return;
        var tiLeft = this.typeInfo(nodeLeft);
        var tiRight = this.typeInfo(nodeRight);
        if (tiLeft.isNumber) {
            if (tiRight.isNumber)
                return;
            if (tiRight.isEnum)
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        else if (tiRight.isNumber) {
            // !leftIsNumber
            if (tiLeft.isEnum)
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
    };
    TypesafeEnumsWalker.prototype.visitBinaryExpression = function (node) {
        if (node.operatorToken.kind !== ts.SyntaxKind.CommaToken)
            this.checkTypes(node.operatorToken, node.left, node.right);
        _super.prototype.visitBinaryExpression.call(this, node);
    };
    TypesafeEnumsWalker.prototype.visitParameterDeclaration = function (node) {
        if (node.initializer)
            this.checkTypes(node.initializer, node.initializer, node);
        _super.prototype.visitParameterDeclaration.call(this, node);
    };
    TypesafeEnumsWalker.prototype.visitPropertyDeclaration = function (node) {
        if (node.initializer)
            this.checkTypes(node.initializer, node.initializer, node);
        _super.prototype.visitPropertyDeclaration.call(this, node);
    };
    TypesafeEnumsWalker.prototype.visitVariableDeclaration = function (node) {
        if (node.initializer)
            this.checkTypes(node.initializer, node.initializer, node);
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    TypesafeEnumsWalker.prototype.visitConditionalExpression = function (node) {
        this.checkTypes(node.colonToken, node.whenTrue, node.whenFalse);
        _super.prototype.visitConditionalExpression.call(this, node);
    };
    TypesafeEnumsWalker.prototype.visitCallExpression = function (node) {
        var signature = this.checker.getResolvedSignature(node);
        if (!signature || !signature.parameters)
            return;
        for (var parameterIndex = 0; parameterIndex < signature.parameters.length; parameterIndex++) {
            var param = signature.declaration.parameters[parameterIndex];
            var arg = node.arguments[parameterIndex];
            this.checkTypes(arg, param, arg);
        }
    };
    /*
    protected visitElementAccessExpression(node: ts.ElementAccessExpression) {

        if (node.argumentExpression)
            this.checkTypes(node.argumentExpression, node.argumentExpression, node);

        super.visitElementAccessExpression(node);
    }
    */
    TypesafeEnumsWalker.prototype.visitReturnStatement = function (statement) {
        if (statement.expression) {
            var node = statement;
            while (node) {
                if (ts.isFunctionLike(node)) {
                    this.checkTypes(statement.expression, statement.expression, node);
                    break;
                }
                node = node.parent;
            }
        }
        _super.prototype.visitReturnStatement.call(this, statement);
    };
    return TypesafeEnumsWalker;
}(Lint.ProgramAwareRuleWalker));

//# sourceMappingURL=typesafeEnumsRule.js.map
