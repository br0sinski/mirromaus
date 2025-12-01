# mirromaus

A simple Node package for now that allows collaborative sharing of the cursor. 
For the MVP I was thinking of just writing a simple WS Connection to see my cursor in two different tabs =) wish me luck

## Get started with the demo

Prerequisite: Node.js installed

1. Build the project (if its your first time cloning)
```bash
npm run build
```

2. Start the test server
```bash
node test-server.mjs
```

3. Host the project for now on a stupid local HTTP server
```bash
python -m http.server 8000 
```

4. Visit the Test-HTML File:
```bash
firefox http://127.0.0.1:8000/test-client.html
```