/* eslint-disable max-len */

const postcss = require("postcss");

const urlReg = /url\(['"]?([^'")]+)?['"]?\)/g,
    base64Limit = 1024 * 3,
    { existsSync, statSync, readFileSync } = require("fs"),
    { dirname, resolve, extname } = require("path");

const toBase64 = imgSrc =>
    `data:image/${extname(imgSrc).slice(1)};base64,${Buffer.from(
        readFileSync(imgSrc)
    ).toString("base64")}`;

const relativeReg = /^(\.{0,2}\/|(?!(http|data:image))\w|[0-9_])/,
    svgReg = /\.svg/,
    noParseReg = /no-postcss-img=0/,
    searchReg = /\?.+$/,
    webpReg = /\.webp(\?.+)?$/,
    endReg = /(\?.+)?$/;

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

        const parse = (decl, url) => {
            const { parent, value } = decl;

            const { strict, base64Limit: $base64Limit, webpClassName } = newOpts;

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

            if (webpClassName !== '' && !webpReg.test(url)) {
                const newDecl = decl.clone({
                        value: `url(${url.replace(endReg, '.webp$1')})`,
                        prop: "background-image"
                    }),
                    newRule = parent.cloneAfter({
                        selector: `.${newOpts.webpClassName} ${parent.selector}`,
                        nodes: [
                        ]
                    });

                newDecl.parent = newRule;

                newRule.nodes.push(newDecl);
            }
        };

        root.walkDecls(/^background(-image)?$/, decl => {
            const { value } = decl;

            let m;

            while ((m = urlReg.exec(value)) !== null) {
                const [, url] = m;

                if (noParse(url)) {
                    return;
                }

                parse(decl, url);
            }
        });
    }
);
