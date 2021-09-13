import { expect } from 'chai';
import AOP        from '../src/index.js';

describe('Test base AOP functions', () => {
  /**
   * Simple helper class that will just echo back what it receives as parameters for later comparison.
   */
  class Echo {
    constructor(arg1, ...arg2) {
      this.arg1 = arg1;
      this.arg2 = arg2;
    }
    
    dynamicMethod(arg1, ...arg2) {
      return {arg1, arg2};
    }
    
    static staticMethod(arg1, ...arg2) {
      return {arg1, arg2};
    }
  }
  
  it('should execute a handler before a method on an instance is called', () => {
    const instance = new Echo(1, 2);
    const handler = (methodName, params, instanceReference) => {
      expect(instanceReference).to.deep.equal(instance);
      return params[0]++;
    };
    AOP.beforeMethods(instance, handler);
    
    const result = instance.dynamicMethod(1, 2);
    expect(result.arg1).to.equal(2);
    expect(result.arg2).to.deep.equal([2]);
  });
  
  it('should execute a handler before a method on a class is called', () => {
    const handler = (methodName, params, instance) => {
      expect(instance.arg1).to.equal(1);
      expect(instance.arg2).to.deep.equal([2]);
      return params[0]++;
    };
    AOP.beforeMethods(Echo, handler);
    
    const result1 = new Echo(1, 2).dynamicMethod(1);
    expect(result1.arg1).to.equal(2);
    expect(result1.arg2).to.deep.equal([2]);
    
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).to.equal(2);
    expect(result2.arg2).to.deep.equal([2]);
  });
  
  it('should execute a handler before a method on a class is called on select methods', () => {
    const handler = (methodName, params, instance) => {
      expect(instance.arg1).to.equal(1);
      expect(instance.arg2).to.deep.equal([2]);
      return params[0]++;
    };
    AOP.beforeMethods(Echo, handler, 'staticMethod');
    
    const result1 = new Echo(1, 2).dynamicMethod(1);
    expect(result1.arg1).to.equal(1);
    expect(result1.arg2).to.deep.equal([2]);
    
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).to.equal(2);
    expect(result2.arg2).to.deep.equal([2]);
  });
  
  it('should execute a handler after a method on an instance is called', () => {
    const instance = new Echo(1, 2);
    const handler = (methodName, returnValue, instanceReference) => {
      expect(instanceReference).to.deep.equal(instance);
      return returnValue++;
    };
    AOP.afterMethods(instance, handler);
    
    const result = instance.dynamicMethod(1, 2);
    expect(result.arg1).to.equal(2);
    expect(result.arg2).to.deep.equal([2]);
  });
  
  it('should execute a handler after a method on a class is called', () => {
    const handler = (methodName, returnValue, instance) => {
      expect(instance).to.deep.equal(instance);
      return returnValue++;
    };
    AOP.afterMethods(Echo, handler);
    
    const result1 = new Echo(1, 2).dynamicMethod(1);
    expect(result1.arg1).to.equal(2);
    expect(result1.arg2).to.deep.equal([2]);
    
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).to.equal(2);
    expect(result2.arg2).to.deep.equal([2]);
  });
  
  it('should execute an aspect before an instance is created', () => {
    const handler = (methodName, args) => {
      return args[0]++;
    };
    
    AOP.beforeInit(Echo, handler);
    const result = new Echo(1, 2);
    expect(result.arg1).to.equal(2);
    expect(result.arg2).to.deep.equal([2]);
  });
  
  it('should execute an aspect after an instance is created', () => {
    const handler = (methodName, instance) => {
      instance.arg1++;
      return instance;
    };
    
    AOP.afterInit(Echo, handler);
    const result = new Echo(1, 2);
    expect(result.arg1).to.equal(2);
    expect(result.arg2).to.deep.equal([2]);
  });
  
  it('should execute an aspect before a query for methods is used', () => {
    const handler = (methodName, params, instance) => {
      expect(instance.arg1).to.equal(1);
      expect(instance.arg2).to.deep.equal([2]);
      return params[0]++;
    };
    AOP.injectBefore('Echo.dynamicMethod', handler);
    
    const result1 = new Echo(1, 2).dynamicMethod(1);
    expect(result1.arg1).to.equal(2);
    expect(result1.arg2).to.deep.equal([2]);
    
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).to.equal(1);
    expect(result2.arg2).to.deep.equal([2]);
  });
  
  it('should execute an aspect after a a query for methods is used', () => {
    const handler = (methodName, returnValue, instance) => {
      expect(instance).to.deep.equal(instance);
      return returnValue++;
    };
    AOP.afterMethods('Echo.staticMethod', handler);
    
    const result1 = new Echo(1, 2).dynamicMethod(1);
    expect(result1.arg1).to.equal(1);
    expect(result1.arg2).to.deep.equal([2]);
    
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).to.equal(2);
    expect(result2.arg2).to.deep.equal([2]);
  });
});