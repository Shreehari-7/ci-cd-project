const http = require('http');

let tasks = [];

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tasks));
    }

    else if (req.method === 'POST' && req.url === '/add') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            tasks.push(body);
            res.end("Task Added");
        });
    }

    else if (req.method === 'DELETE' && req.url.startsWith('/delete')) {
        const index = parseInt(req.url.split('/')[2]);
        tasks.splice(index, 1);
        res.end("Task Deleted");
    }

    else {
        res.end("Invalid Route");
    }
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});