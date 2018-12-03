const postcss = require("postcss");

const urlReg = /url\(['"]?([^'"]+)?['"]?\)/,
    base64Limit = 1024 * 3,
    { existsSync, statSync, readFileSync } = require("fs"),
    { dirname, resolve, extname } = require("path");

const toBase64 = imgSrc =>
    `data:image/${extname(imgSrc).slice(1)};base64,${Buffer.from(
        readFileSync(imgSrc)
    ).toString("base64")}`;

module.exports = postcss.plugin(
    "postcss-img",
    (opts = {}) => (root, result) => {
        const newOpts = Object.assign(
            {
                webpClassName: "webp",
                base64Limit
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

            const { base64Limit: $base64Limit, webpClassName } = newOpts;

            if ($base64Limit > 0) {
                const imgSrc = resolve(dirname(result.opts.from), url);

                if (!existsSync(imgSrc)) {
                    decl.error(`NOT FOUND Image: ${imgSrc}`);

                    return;
                }

                const { size } = statSync(imgSrc);

                if (size < $base64Limit) {
                    // eslint-disable-next-line no-param-reassign
                    decl.value = value.replace(url, toBase64(imgSrc));

                    return;
                }
            }

            if (webpClassName !== '') {
                const { parent } = decl;

                parent.cloneAfter({
                    selector: `.${newOpts.webpClassName} ${parent.selector}`,
                    nodes: [
                        decl.clone({
                            value: decl.value.replace(url, `${url}.webp`)
                        })
                    ]
                });
            }
        });
    }
);
