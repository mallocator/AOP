# AOP - Aspect Oriented Programming

Well, kind off... not really though.

This library aims to provide aspect oriented programming features to javascript.

## How to use

Here's a simple example:

```javascript
import AOP          from '@mallocator/aop'
import EventEmitter from 'events'

AOP.beforeMethods(EventEmitter, (_, args) => {
  console.log('Fired Event Args: ' + args)
}, 'emit');
```

## API

todo