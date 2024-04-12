DROP TABLE IF EXISTS cart_products;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(100) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phoneNumber VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create the categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Create the products table
CREATE TABLE products (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    name VARCHAR(255) NOT NULL,
    imageURL TEXT,
    price NUMERIC NOT NULL,
    description TEXT NOT NULL,
    inventory INTEGER,
    category_name TEXT REFERENCES categories(name) NOT NULL
);

-- Create the carts table
CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL
);

-- Create the cart_products table
CREATE TABLE cart_products (
    id UUID PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);