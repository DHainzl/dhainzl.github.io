TODO: Introduction

Why I've written this, what will be covered, difference between rxjs/add/operator and rxjs/add/observable ..

## Observable

These methods are used to spawn new `Observable`s:

### Observable.of

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
```

TODO: usage etc.

### Observable.from

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
```

TODO: usage, difference to .from

### Observable.forkJoin

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
```

TODO: usage, array form, parameter form

### Observable.throw

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
```

TODO: usage, in different operators

## Operators

These methods add new functionality to existing `Observable`s.

### Observable.do

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
```

TODO: What it does, difference to map, example usage (eg console.log)

### Observable.flatMap

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
```

TODO: Why mergeMap / flatMap, what it does.

### Observable.delay

```
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
```

TODO: What it does, usage in tests
