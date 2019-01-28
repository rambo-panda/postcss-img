# PostCSS Webp

[PostCSS] Convert to Base64 for redundancy limit size, otherwise use prepared webp pictures to replace.

## Usage And default setting

```js
const ignoreExtReg = /^(?:svg|webp)$/,
    noParseReg = /no-postcss-img=0/,
    // relativeReg = /^(\.{1,2}\/|(?!(?:https?:\/\/|data:image))\w)/,
    absoluteReg = /^(?:https?:\/\/|data:image)/; // https://  or  base64

const defaultIgnore = (url) => url ? noParseReg.test(url) || ignoreExtReg.test(extname(url)) || absoluteReg.test(url) : true;

postcss([ require('postcss-webp')({
   webpClassName: 'webp',  // default webp  trasnform webp will be disabled When webpClassName is empty string
   base64Limit: 1024 * 3,  // default 3K    transform base64 will be disabled When base64Limit is zero
   strict: true,           // default true  Directly throwing an abort program to continue execution
   ignore: defaultIgnore,  // default defaultIgnore ignore callback
}) ]);
```

## example

```css
.PNPIfoo {
	background: url(a.png);
	color:red
}

/* No Parse */
.PNPIfoo {
	background: url(a.png);
	color:red
}

.foo {
	background: url(a.png?no-postcss-img=0);
	color:red
}

/* No Parse */
.foo {
	background: url(a.png?no-postcss-img=0);
	color:red
}
```

```css
.foo {
	background: url(a.png);
	color:red
}

/* parse one when img size genater than specified size */
.foo {
	background: url(a.png);
	color:red
}
.webp .foo {
	background: url(a.png.webp);
}

/* parse two when img size less than specified size */
.foo {
	background: url(base64);
	color:red
}
```
