const http = require('http');
const url = require('url');
const fs = require('fs');

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

    const parsed = url.parse(req.url, true);
    console.log("req.method:", req.method);

    if (req.method === 'GET') {
        if (parsed.pathname === '/') {
            fs.readFile('index.html', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading index.html');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        } else if (parsed.pathname === '/items.json') {
            const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(itemsJson));
        } else {
            res.statusCode = 404;
            res.end('Not found');
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

        // ✅ Add safety check for item limit
        if (itemsJson.length >= 100) {
            res.statusCode = 400;
            res.end('Item limit reached. Please delete some items before adding more.');
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
    }

    if (req.method === 'POST') {
        const itemId = parsed.query.id;
        const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));

        switch (parsed.pathname) {
            case "/updateName":
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
                break;

            case "/updatePrice":
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
                break;

            default:
                res.statusCode = 404;
                res.end();
        }
    }

    if (req.method === 'DELETE') {
        const itemId = parsed.query.id;
        const itemsJson = JSON.parse(fs.readFileSync('./items.json', 'utf-8'));
        const deleteIndex = itemsJson.findIndex(item => item.id === itemId);

        if (deleteIndex >= 0) {
            itemsJson.splice(deleteIndex, 1);
            fs.writeFileSync('./items.json', JSON.stringify(itemsJson, null, 2));
            res.statusCode = 200;
        } else {
            res.statusCode = 404;
        }
        res.end();
    }

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
    }

}).listen(process.env.PORT || 3000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
});

