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

const relativeReg = /^(\.{0,2}\/|(?!(http|data:image))\w|[0-9_])/,
    svgReg = /\.svg/,
    noParseReg = /no-postcss-img=0/,
    searchReg = /\?.+$/,
    webpReg = /\.webp(\?.+)?$/,
    endReg = /(\?.+)?$/;

const noParse = (url) => url ? noParseReg.test(url) || !relativeReg.test(url) || svgReg.test(url) : true;

const toSrc = (srcs) => srcs.join(',');

/* eslint-disable consistent-return */
const parse = (result, newOpts, url) => {
    const { strict, base64Limit: $base64Limit, webpClassName } = newOpts;

    if ($base64Limit > 0) {
        const imgSrc = resolve(dirname(result.opts.from), url).replace(searchReg, '');

        if (existsSync(imgSrc)) {
            const { size } = statSync(imgSrc);

            if (size < $base64Limit) {
                return ['B', toBase64(imgSrc)];
            }
        } else {
            return strict ? new TypeError(`NOT FOUND Image: ${imgSrc}`) : ['B', url];
        }
    }

    if (webpClassName !== '' && !webpReg.test(url)) {
        return ['W', url.replace(endReg, '.webp$1')];
    }
};
/* eslint-enable consistent-return */


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
                ress = [],
                parseVal = value.split(',').map(v => {
                    const [, url ] = urlReg.exec(v) || [];

                    if (noParse(url)) {
                        return v;
                    }

                    const res = parse(result, newOpts, url);

                    if (undefined === res) {
                        return v;
                    }

                    if (res instanceof Error) {
                        decl.error(res);

                        return res;
                    }

                    ress.push(res);

                    return v.replace(url, res[1]);
                });

            if (ress.length === 0) {
                return;
            }

            if (ress.length === 1 && ress[0][0] === 'B') {
                decl.value = toSrc(parseVal);
            } else {
                const { parent } = decl,
                    newDecl = decl.clone({
                        value: toSrc(parseVal.map(v => (urlReg.exec(v) || [v])[0])),
                        prop: 'background-image'
                    }),
                    newRule = parent.cloneAfter({
                        selector: `.${newOpts.webpClassName} ${parent.selector}`,
                        nodes: [
                        ]
                    });

                newDecl.parent = newRule;

                newRule.nodes.push(newDecl);
            }
        });
    }
);
