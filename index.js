/* eslint-disable max-len */

const postcss = require("postcss");

const urlReg = /url\(['"]?([^'"]+)?['"]?\)/,
    base64Limit = 1024 * 3,
    { existsSync, statSync, readFileSync } = require("fs"),
    { dirname, resolve, extname } = require("path");

const toBase64 = imgSrc =>
    `data:image/${extname(imgSrc).slice(1)};base64,${Buffer.from(
        readFileSync(imgSrc)
    ).toString("base64")}`;

const relativeReg = /^(\.{0,2}\/|(?!(http|base64))\w|[0-9_])/,
    svgReg = /\.svg/,
    noParseReg = /no-postcss-img=0/,
    searchReg = /\?.+$/;

const noParse = (url) => noParseReg.test(url) || !relativeReg.test(url) || svgReg.test(url);

module.exports = postcss.plugin(
    "postcss-img",
    (opts = {}) => (root, result) => {
        const newOpts = Object.assign(
            {
                webpClassName: "webp",
                base64Limit,
                strict: true
            },
            opts
        );

        root.walkDecls(/^background(-image)?$/, decl => {
            const { value } = decl,
                [, url] = urlReg.exec(value) || [];

            if (!url) {
                result.warn("NOT FOUND: url param");

                return;
            }

            if (noParse(url)) {
                return;
            }

            const { strict, base63Limit: $base64Limit, webpClassName } = newOpts;

            if ($base64Limit > 0) {
                const imgSrc = resolve(dirname(result.opts.from), url).replace(searchReg, '');

                if (existsSync(imgSrc)) {
                    const { size } = statSync(imgSrc);

                    if (size < $base64Limit) {
                        // eslint-disable-next-line no-param-reassign
                        decl.value = value.replace(url, toBase64(imgSrc));

                        return;
                    }
                } else if (strict) {
                    throw decl.error(`NOT FOUND Image: ${imgSrc}`);
                }

            }

            if (webpClassName !== '') {
                const { parent } = decl;

                // Not all decl have the parent eg: parceljs generated ast
                if (parent) {
                    parent.cloneAfter({
                        selector: `.${newOpts.webpClassName} ${parent.selector}`,
                        nodes: [
                            decl.clone({
                                value: decl.value.replace(url, `${url}.webp`)
                            })
                        ]
                    });
                }
            }
        });
    }
);
