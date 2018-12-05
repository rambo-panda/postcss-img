# PostCSS Webp

[PostCSS] Convert to Base64 for redundancy limit size, otherwise use prepared webp pictures to replace.

```css
.foo {
	background: url(a.png);
	color:red
}
```

```css
/* one */
.foo {
	background: url(a.png);
	color:red
}
.webp .foo {
	background: url(a.png.webp);
}

/* two */
.foo {
	background: url(base64);
	color:red
}
```

## Usage

```js
postcss([ require('postcss-webp')({
   webpClassName: 'webp',  // default webp  TODO trasnform webp will be disabled When webpClassName is empty string
   base64Limit: 1024 * 3,  // default 3K    TODO transform base64 will be disabled When base64Limit is zero
   strict: true,           // true          Directly throwing an abort program to continue execution
}) ]);
```

See [PostCSS] docs for examples for your environment.
