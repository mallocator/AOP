import AOP              from '../src/index.js';
import { EventEmitter } from 'events';

// TODO test primitive return value
// TODO consider whether around should have control over method execution
// TODO query based filter might be possible if we override the Object prototype constructor to register with a tracker
// class. Might also work with the Function prototype to support non class function wrapping.

const debug = false;

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
    
    #privateMethod(arg1, arg2) {
      return {arg1, arg2};
    }
    
    callPrivateMethod(arg1, ...arg2) {
      return this.#privateMethod(arg1, arg2);
    }
    
    static #privateStaticMethod(arg1, arg2) {
      return {arg1, arg2};
    }
    
    static callPrivateStaticMethod(arg1, ...arg2) {
      return Echo.#privateStaticMethod(arg1, arg2);
    }
    
    static staticMethod(arg1, ...arg2) {
      return {arg1, arg2};
    }
  }
  
  it('works before a method on an instance is called', () => {
    const instance = new Echo();
    const handler = (methodName, params) => {
      debug && console.log('increasing by 1 before instance');
      params[0]++;
    };
    AOP.beforeMethods(instance, handler);
    
    // works on dynamic methods
    const result1 = instance.dynamicMethod(1, 2);
    // The reason we deal with args this way is because our test class above returns an object with the params like this
    expect(result1.arg1).toEqual(2);
    // It depends on the method you're trying to wrap what the return value is.
    expect(result1.arg2).toEqual([2]);
    
    // also works on static methods of the instance
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(2);
    expect(result2.arg2).toEqual([2]);
  });
  
  it('works before a method on a class is called', () => {
    const handler = (methodName, params) => {
      debug && console.log('increasing by 1 before class');
      params[0]++;
    };
    AOP.beforeMethods(Echo, handler);
    
    // now increases by 2 since we already have another aspect in the chain
    const result1 = new Echo().dynamicMethod(1, 2);
    expect(result1.arg1).toEqual(3);
    expect(result1.arg2).toEqual([2]);
    
    // same with the static method
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(3);
    expect(result2.arg2).toEqual([2]);
  });
  
  it("doesn't work when passing in a method", () => {
    try {
      AOP.beforeMethods(Echo.staticMethod, () => {});
      throw new Error('Fail');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual('Fail');
    }
  });
  
  it('works before a method on a class is called on select methods', () => {
    const handler = (methodName, params) => {
      debug && console.log('increasing by 1 before class filtered');
      params[0]++;
    };
    AOP.beforeMethods(Echo, handler, 'staticMethod');
    
    // now increases by 2 since we have the other 2 from before to deal with but from this one
    const result1 = new Echo().dynamicMethod(1, 2);
    expect(result1.arg1).toEqual(3);
    expect(result1.arg2).toEqual([2]);
    
    // this one only affect the static method, hence only this one increases by yet another 1 on top of the other 2
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(4);
    expect(result2.arg2).toEqual([2]);
  });
  
  it('works after a method on an instance is called', () => {
    const handler = (methodName, returnValue) => {
      debug && console.log('reducing by 1 after instance');
      returnValue.arg1--;
      return returnValue;
    };
    const instance = new Echo();
    AOP.afterMethods(instance, handler);
    
    // This now increases by 2 and reduces by 1
    const result1 = instance.dynamicMethod(1, 2);
    expect(result1.arg1).toEqual(2);
    expect(result1.arg2).toEqual([2]);
    
    // Same on the static side, but here we've increased by one extra
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(3);
    expect(result2.arg2).toEqual([2]);
  });
  
  it('works after a method on a class is called', () => {
    const handler = (methodName, returnValue) => {
      debug && console.log('reducing by 3 after class');
      returnValue.arg1 = returnValue.arg1 - 3;
      return returnValue;
    };
    AOP.afterMethods(Echo, handler);
    
    // This should now increase by 2 and reduce by 4 total (since we reduce by 3 in this test)
    const result1 = new Echo().dynamicMethod(1, 2);
    expect(result1.arg1).toEqual(-1);
    expect(result1.arg2).toEqual([2]);
    
    // Should do the same over here, first increase by 3 and the reduce by 4 total
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(0);
    expect(result2.arg2).toEqual([2]);
  });
  
  it('works around a method', () => {
    let tracker1 = false;
    let tracker2 = false;
    const handler = (methodName, returnValue) => {
      if (methodName.endsWith(':before')) {
        debug && console.log('increasing by 1 before class in around');
        tracker1 = true;
        returnValue[0]++;
      }
      if (methodName.endsWith(':after')) {
        debug && console.log('reducing by 1 after class in around');
        tracker2 = true;
        returnValue.arg1 = returnValue.arg1++;
        return returnValue;
      }
    };
    AOP.aroundMethods(Echo, handler);
    
    // Now we increase again from the previous -1
    const result1 = new Echo().dynamicMethod(1, 2);
    expect(result1.arg1).toEqual(0);
    expect(tracker1).toBe(true);
    expect(result1.arg2).toEqual([2]);
    expect(tracker2).toBe(true);
    
    // Same here except starting from 0
    const result2 = Echo.staticMethod(1, 2);
    expect(result2.arg1).toEqual(1);
    expect(result2.arg2).toEqual([2]);
  });
  
  it('works with private instance methods', () => {
    const instance = new Echo();
    const result = instance.callPrivateMethod(1, 2);
    expect(result.arg1).toEqual(0);
    expect(result.arg2).toEqual([2]);
  });
  
  it('works with private static methods', () => {
    const result = Echo.callPrivateStaticMethod(1, 2);
    expect(result.arg1).toEqual(1);
    expect(result.arg2).toEqual([2]);
  });
  
  it('works with native classes', () => {
    let tracker = false;
    const handler = () => {
      tracker = true;
    };
    AOP.beforeMethods(EventEmitter, handler, 'emit');
    new EventEmitter().emit('test');
    expect(tracker).toBe(true);
  });
  
  it.skip('should execute an aspect before an instance is created', () => {
    expect.fail('This is not possible since we cannot inject code before a constructor');
  });
  
  it.skip('should execute an aspect after an instance is created', () => {
    expect.fail(
      'constructors are read-only. If you had a named reference you could do it, but not via method param dynamically'
    );
  });
});
