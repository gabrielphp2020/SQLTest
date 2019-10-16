//source:https://coderwall.com/p/flonoa/simple-string-format-in-javascript

class StringUtils {

    static Format(str, ...args) {
        args = ArrayUtils.Root(args);
        for (var k = 0; k < args.length; k++) {
            str = StringUtils.Replace(str, "{" + k + "}", args[k]);
        }
        return str;
    }
    static Replace(str, oldText, newText) {
        while (str.includes(oldText)) {
            str = str.replace(oldText, newText);
        }
        return str;
    }

}
class ArrayUtils {

    static Root(args) {
        while (args instanceof Array && args.length == 1 && args[0] instanceof Array)
            args = args[0];
        return args;
    }

}