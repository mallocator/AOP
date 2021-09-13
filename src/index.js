/**
 * THe AOP class that allows you to create aspects around methods and instance creation. All methods are statically
 * accessible.
 */
export default class AOP {
  /**
   * The handler function that will either be able to modify parameters and execute code before a method is called or
   * after where it can then modify the return value.
   * @callback Handler
   * @param {string} name The name of the method you're intercepting. It will come with a suffix of either ":before" or
   *   ":after" to indicate when it was called.
   * @param {*[]} [args] An array of arguments that will be passed to the called target on 'before'
   * @param {*} [returnValue] The return value from the function that was just executed on 'after'
   */

  /**
   * This method performs the actual wrapping of methods with handlers. It does this by looking for both static and
   * dynamic methods, which are on different properties depending on what the target is. After that it iterates over
   * both lists and wraps each method (according to the filters) with custom function the executes the handler and
   * allows us to modify either the method parameters or the return value.
   * @param {Object|Class} target Can be either an object instance or a class reference
   * @param {Handler} handler The handler function executed before the target method
   * @param {string[]} methods A list of method name strings on the target to which this should be applied (basically a
   *   filter). empty if should be ignored.
   * @param {string[]} aspects Whether the execute before, after or both
   */
  static #wrap(target, handler, methods, aspects) {
    let staticProps;
    let dynamicProps;
    if (typeof target == 'function') {
      if (/^class/.test(target.toString())) {
        staticProps = target;
        dynamicProps = target.prototype;
      } else {
        throw new Error('Passed in single method, not supported');
      }
    }
    if (typeof target == 'object') {
      staticProps = target.constructor;
      dynamicProps = Object.getPrototypeOf(target);
    }

    // For dynamic properties
    for (let prop of Object.getOwnPropertyNames(dynamicProps)) {
      const method = prop.toString();
      // ignore constructor unless explicitly specified
      if (method === 'constructor' || (methods.length && !methods.includes(method))) {
        continue;
      }

      let original = dynamicProps[method];
      dynamicProps[method] = (...args) => {
        if (aspects.includes('before')) {
          handler(method + ':before', args);
        }
        let result = original(...args);
        if (aspects.includes('after')) {
          // Haven't decided yet if I want to use the return value from this
          return handler(method + ':after', result);
        }
        return result;
      };
    }

    // For static properties
    for (let prop of Object.getOwnPropertyNames(staticProps)) {
      const method = prop.toString();
      // ignore default properties unless explicitly specified
      if (['length', 'prototype', 'name'].includes(method) && !methods.includes(method)) {
        continue;
      }
      const original = staticProps[method];
      staticProps[method] = (...args) => {
        if (aspects.includes('before')) {
          handler(method + ':before', args);
        }
        let result = original(...args);
        if (aspects.includes('after')) {
          handler(method + ':after', result);
        }
        return result;
      };
    }
  }

  /**
   * Execute code before a method is called. This allows you to modify the arguments passed in on the args parameter.
   * The handler will get the list of arguments as 2nd parameter where any modification will be passed on to the
   * wrapped method.
   * @param {Object|Class} target Can be either an object instance or a class reference
   * @param {Handler} handler The handler function executed before the target method
   * @param {String} [methods] An optional list of method name strings on the target to which this should be applied
   *   (basically a filter)
   */
  static beforeMethods(target, handler, ...methods) {
    AOP.#wrap(target, handler, methods, ['before']);
  }

  /**
   * Execute code after a method is called. This allows you to modify the return value.
   * The handler will get the return value as 2nd parameter and can decide what to return from the handler to pass on
   * to the original caller.
   * @param {Object|Class} target Can be either an object instance or a class reference
   * @param {Handler} handler The handler function executed before the target method
   * @param {String} [methods] An optional list of method name strings on the target to which this should be applied
   *   (basically a filter)
   */
  static afterMethods(target, handler, ...methods) {
    AOP.#wrap(target, handler, methods, ['after']);
  }

  /**
   * Execute code before and after a method is called. This allows you to modify both the parameters and the return
   * value. The handler will in this case be called twice, once before the method is called and once after. If you want
   * to differentiate between the two, you can look at the first parameter, the method name. The parameter will always
   * have a suffix with either ":before" or ":after".
   * @see beforeMethods
   * @see afterMethods
   * @param {Object|Class} target Can be either an object instance or a class reference
   * @param {Handler} handler The handler function executed before the target method
   * @param {String} [methods] An optional list of method name strings on the target to which this should be applied
   *   (basically a filter)
   */
  static aroundMethods(target, handler, ...methods) {
    AOP.#wrap(target, handler, methods, ['before', 'after']);
  }
}
