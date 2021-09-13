/**
 * THe AOP class that allows you to create aspects around methods and instance creation. All methods are statically
 * accessible.
 */
export default class AOP {
  /**
   *
   * @callback Handler
   * @param {string} name The name of the target you're wrapping
   * @param {*[]} [args] An array of arguments that will be passed to the called target on 'before'
   * @param {*} [returnValue] The return value from the function that was just executed on 'after'
   * @param {Object} context The context of in which he target is executed
   */
  
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
  
  }
  
  /**
   * Execute code before an instance of a class is created. This allows you to modify the constructor arguments before
   * they are passed on the the instance constructor. The handler wil get the constructor arguments as 2nd parameter
   * where any modification will be passed on to the wrapped constructor.
   * @param {Class} clazz Reference of the class we want to wrap
   * @param {Handler} handler The handler function executed before creating the instance
   */
  static beforeInit(clazz, handler) {
  
  }
  
  /**
   * Execute code after an instance is created. This allows you to modify the return value.
   * The handler will get the instance as 2nd parameter and can decide what to return from the handler to pass on
   * to the original caller.
   * @param {Class} clazz Reference of the class we want to wrap
   * @param {Handler} handler The handler function executed after creating the instance
   */
  static afterInit(clazz, handler) {
  
  }
  
  /**
   * Query based aspect oriented programming interface. Not yet implemented but the goal is to have something like:
   * MyClass.set*Value
   * (MyClass|YourClass|TheirClass).*   // Might need to parse manually
   * My*Class.setValues?    // Might need to scan the context for available classes
   * @param {String} query The query used to find methods on a class.
   * @param {Handler} handler The handler function executed before the target methods
   * @param {Object} [context] The context object in which to execute this query. Uses the global context if not
   *   specified.
   */
  static injectBefore(query, handler, context) {
  
  }
  
  /**
   * @see injectBefore
   * @param {String} query The query used to find methods on a class.
   * @param {Handler} handler The handler function executed after the target methods
   * @param {Object} [context] The context object in which to execute this query. Uses the global context if not
   *   specified.
   */
  static injectAfter(query, handler, context) {
  
  }
}