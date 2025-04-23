const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require("path");

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    console.log("req.method:", req.method, "req.url:", req.url);

    const staticPath = path.join(__dirname, 'client', 'build');
    const isAsset = pathname.startsWith('/static') || pathname.match(/\.(js|css|png|jpg|ico|json)$/);

    // ✅ Handle HEAD requests gracefully
    if (req.method === 'HEAD') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET') {
        if (pathname === '/items.json') {
            const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(itemsJson));
            return;
        } else if (isAsset) {
            const filePath = path.join(staticPath, pathname);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Asset not found');
                } else {
                    const ext = path.extname(filePath).slice(1);
                    const types = {
                        js: 'application/javascript',
                        css: 'text/css',
                        json: 'application/json',
                        png: 'image/png',
                        jpg: 'image/jpeg',
                        ico: 'image/x-icon'
                    };
                    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
                    res.end(data);
                }
            });
            return;
        } else {
            const indexPath = path.join(staticPath, 'index.html');
            fs.readFile(indexPath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end("Error loading React app");
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
            return;
        }
    }

    if (req.method === 'PUT') {
        const { newItemName, newItemPrice } = parsed.query;

        if (!newItemName || !newItemPrice) {
            res.statusCode = 400;
            res.end('Missing item name or price');
            return;
        }

        const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));

        if (itemsJson.length >= 100) {
            res.statusCode = 400;
            res.end('Item limit reached. Please delete some items first.');
            return;
        }

        const newItem = {
            id: new Date().toISOString(),
            name: newItemName,
            price: parseFloat(newItemPrice)
        };

        itemsJson.push(newItem);
        fs.writeFileSync('./items.json', JSON.stringify(itemsJson, null, 2));
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method === 'POST') {
        const itemId = parsed.query.id;
        const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));

        if (pathname === "/updateName") {
            const newName = parsed.query.newItemName;
            const nameIndex = itemsJson.findIndex(item => item.id === itemId);

            if (nameIndex >= 0) {
                itemsJson[nameIndex].name = newName;
                fs.writeFileSync('./items.json', JSON.stringify(itemsJson, null, 2));
                res.statusCode = 200;
            } else {
                res.statusCode = 404;
            }
            res.end();
            return;
        }

        if (pathname === "/updatePrice") {
            const newPrice = parsed.query.newItemPrice;
            const priceIndex = itemsJson.findIndex(item => item.id === itemId);

            if (priceIndex >= 0) {
                itemsJson[priceIndex].price = parseFloat(newPrice);
                fs.writeFileSync('./items.json', JSON.stringify(itemsJson, null, 2));
                res.statusCode = 200;
            } else {
                res.statusCode = 404;
            }
            res.end();
            return;
        }

        res.statusCode = 404;
        res.end();
        return;
    }

    if (req.method === 'DELETE') {
        const itemId = parsed.query.id;
        const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));
        const index = itemsJson.findIndex(item => item.id === itemId);

        if (index >= 0) {
            itemsJson.splice(index, 1);
            fs.writeFileSync('./items.json', JSON.stringify(itemsJson, null, 2));
            res.statusCode = 200;
        } else {
            res.statusCode = 404;
        }
        res.end();
        return;
    }

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

}).listen(process.env.PORT || 3000, () => {
    console.log(`✅ Server running on http://localhost:${process.env.PORT || 3000}`);
});
