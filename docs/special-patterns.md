> A few special replacement patterns were created for this lib.

### `:num`

Automatically adds sequential, "padded" numbers, using the provided `length` to determine the amount of padding.

For example, given you have `permalinks({structure: ':num-:basename', context: context, length: foo})`

* if `foo` is 1-9, the result would be `1-foo.html`, `2-bar.html`, `3-baz.html` and so on.
* if `foo` is 1,000 the result would be `0001-foo.html`, `0002-bar.html`, `0003-baz.html`, ... `1000-quux.html`.

### `:000`
Adds sequential digits. Similar to `:num`, but the number of digits is determined by the number of zeros defined.

Example:

* `:00` will result in two-digit numbers
* `:000` will result in three-digit numbers
* `:00000000` will result in eight-digit numbers, and so on...



### `:random( pattern, number )`

Adds randomized characters based on the pattern provided in the parentheses. `pattern` defines the pattern you wish to use, and `number` is an optional parameter to define the number of characters to generate.

For example, `:random(A, 4)` (whitespace insenstive) would result in randomized 4-digit uppercase letters, like, `ZAKH`, `UJSL`... and so on.

**no second parameter**

If a second parameter is not provided, then the  `length()` of the characters used in the first parameter will be used to determine the number of digits to output. For example:

* `:random(AAAA)` is equivelant to `:random(A, 4)`
* `:random(AAA0)` and `:random(AA00)` and `:random(A0A0)` are equivelant to `:random(A0, 4)`

**valid characters (and examples)**

* `:random(aa)`: results in double-digit, randomized, lower-case letters (`abcdefghijklmnopqrstuvwxyz`)
* `:random(AAA)`: results in triple-digit, randomized, upper-case letters (`ABCDEFGHIJKLMNOPQRSTUVWXYZ`)
* `:random(0, 6)`: results in six-digit, randomized nubmers (`0123456789`)
* `:random(!, 5)`: results in single-digit randomized, _valid_ non-letter characters (`~!@#$%^&()_+-={}[];\',.`)
* `:random(A!a0, 9)`: results in nine-digit, randomized characters (any of the above)

_The order in which the characters are provided has no impact on the outcome._