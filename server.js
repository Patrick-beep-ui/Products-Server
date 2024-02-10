const express = require('express');
const port = process.env.PORT || 3000
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const FileSystem = require("fs");


const updateFile = (products) => {
    FileSystem.writeFile('data.json', JSON.stringify(products), (error) => {

''    })
}

//Middleware to access the json file
const readMiddleware = (req, res, next) => {
    FileSystem.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).render('500');
        }

        req.products = JSON.parse(data);
        next();
    });
};


const app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false})) //Send data through method

//Handlebars configuration Start
app.engine('handlebars', engine({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')
//Handlebars configuration End

app.get('/', (req, res) => {
    res.render('home');
})

//Products Rendering
app.get('/products', readMiddleware, (req, res) => {
    res.render('products', { products: req.products });
});

app.get('/products/name', readMiddleware, (req, res) => {
    const productName = req.query.name;
    const product = req.products.filter((product) => product.name.includes(productName));

    if (product) {
        res.render('products', { products: product });
    }
});

app.get('/products/id', readMiddleware, (req, res) => {
    const productId = parseFloat(req.query.id)
    const product = req.products.find(product=> product.id === productId)

    if (product) {
        res.render('products', {products: [product]})
    }
})

app.get('/products/category', readMiddleware, (req, res) => {
    const productCategory = req.query.category
    const product = req.products.filter(product=> product.category === productCategory);

    if (product) {
        res.render('products', {products: product})
    }
})

app.get('/products/price', readMiddleware, (req, res) => {
    //Math.abs(product.price - productPrice) < 0.01
    //const productPrice = parseFloat(req.query.price);

    const minPrice = parseFloat(req.query.min);
    const maxPrice = parseFloat(req.query.max);

    const product = req.products.filter(product => {
        if (!isNaN(minPrice) && product.price < minPrice) {
            return false;
        }

        if (!isNaN(maxPrice) && product.price > maxPrice) {
            return false;
        }

        return true;
    });

    if (product) {
        res.render('products', {products: product})
    }

     else {
        res.json({ message: 'No product found for the specified price' });
    }
});

app.get('/products/color', readMiddleware, (req, res) => {
    const productColor = req.query.color
    const product = req.products.filter(product=> product.color === productColor);

    if (product) {
        res.render('products', {products: product})
    }
    else {
        res.render('not-found')
    }
})

app.get('/filter', (req, res) => {
    res.status(200)
    res.render('filter', {body: 'hola'});
})

app.get('/add', (req, res) => {
    res.status(200)
    res.render('add')
})

app.get('/delete', (req, res) => {
    res.status(200);
    res.render('delete')
})

app.get('/edit', (req, res) => {
    res.status(200)
    res.render('edit')
})

//Add a Product
app.post('/add/register', readMiddleware, (req, res) => {
    const {id, name, stock, price, category, color} = req.body

    const newProduct = {
        id: parseFloat(id),
        name: name,
        stock: stock,
        price: parseFloat(price),
        category: category,
        color: color
    };

    req.products.push(newProduct);
    updateFile(req.products);


    res.render('products', {"products":req.products})
    

})

//Delete a Product
app.post('/delete/product', readMiddleware, (req, res) => {
    const productId = parseFloat(req.body.id);
    const product = req.products.findIndex(product=> product.id === productId);

    if(product) {
        req.products.splice(product, 1);
        updateFile(req.products);

        res.render('products', {"products":req.products})
    }
    else {
        res.status(404).json({
            message: 'Product not found.'
        })

    }
    
})

//Edit a Product
app.post('/edit/product', readMiddleware, (req, res) => {
    const {id, name, stock, price, category, color} = req.body;
    const productId = parseFloat(id);

    const productIndex = req.products.findIndex(product => product.id === productId);

    if (productIndex !== -1) {
        req.products[productIndex] = {
            id: productId,
            name: name,
            stock: stock,
            price: parseFloat(price),
            category: category,
            color: color
        }

        updateFile(req.products);

        res.render('products', {"products":req.products})

    }
    else {
        res.status(404).json({
            message: 'Product not found'
        })
    }
})

app.use((req, res) => {
    res.status(400)
    res.render('404')
})

app.use((req, res) => {
    res.status(500)
    res.render('500')
})

app.listen(port, () => console.log("Server listening on port", port))