// imports
const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/my_store_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");
// install the jsonwebtoken library & secret
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

const createTables = async () => {
  //   DROP TABLE IF EXISTS cart_products;
  // DROP TABLE IF EXISTS carts;

  // DROP TABLE IF EXISTS products;
  // DROP TABLE IF EXISTS categories;
  //  // DROP TABLE IF EXISTS users;
  const SQL = `
  CREATE TABLE users(
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

  CREATE TABLE categories(
    id UUID PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

  CREATE TABLE products(
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

  CREATE TABLE carts(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL
  );

  CREATE TABLE cart_products(
    id UUID PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
  );
  `;
  await client.query(SQL);
};

// all  products
const seeProducts = async () => {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// single product
const seeProduct = async (id) => {
  const SQL = `
    SELECT *
    FROM products
    WHERE id=$1
  `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

// categories
const seeCategories = async () => {
  const SQL = `
        SELECT *
        FROM categories
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// view all products in one category
const seeCategoryProducts = async (category_name) => {
  const SQL = `
        SELECT *
        FROM products
        WHERE category_name=$1
    `;
  const response = await client.query(SQL, [category_name]);
  return response.rows;
};

//  log in user
const createUser = async ({ email, password, is_admin }) => {
  let rows;

  let SQL = `SELECT * FROM users WHERE email=$1`;
  let response = await client.query(SQL, [email]);

  rows = response.rows;

  if (!rows.length) {
    SQL = `
      INSERT INTO users(id, email, password, is_admin)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `;
    response = await client.query(SQL, [
      uuid.v4(),
      email,
      await bcrypt.hash(password, 5),
      is_admin,
    ]);
    rows = response.rows;
  }

  return rows[0];
};

// new cart
const createCart = async ({ user_id }) => {
  const SQL = `
    INSERT INTO carts(id, user_id )
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id]);
  return response.rows[0];
};

// see cart details
const seeCart = async (userId) => {
  const GET_CART_ID = `
    SELECT *
    FROM carts
    WHERE user_id=$1
  `;

  const cartIdRes = await client.query(GET_CART_ID, [userId]);
  if (!cartIdRes) {
    throw new Error("No cart available");
  }

  return cartIdRes.rows[cartIdRes.rows.length - 1];
};

// new cart product
const createCartProduct = async ({ cart_id, product_id, quantity }) => {
  const SQL = `
      INSERT INTO cart_products(id, cart_id, product_id, quantity)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    cart_id,
    product_id,
    quantity,
  ]);
  return response.rows[0];
};

// View cart products
const seeCartProducts = async (cart_id) => {
  const SQL = `
        SELECT products.id, products.name, products.price, cart_products.quantity
        FROM cart_products
        INNER JOIN products
        ON products.id = cart_products.product_id
        WHERE cart_products.cart_id = $1
      `;
  const { rows } = await client.query(SQL, [cart_id]);
  return rows;
};

//  view total price of cart products
const seeTotalPrice = async (cart_id) => {
  const SQL = `
        SELECT SUM (p.price * cp.quantity)
        FROM cart_products cp
        INNER JOIN products p
        ON p.id=cp.product_id
        WHERE cp.cart_id = $1
      `;
  const response = await client.query(SQL, [cart_id]);
  return response.rows[0];
};

// Add a product to cart
const addProductToCart = async ({ cart_id, product_id, quantity }) => {
  const SQL = `
    INSERT
    INTO cart_products (id, cart_id, product_id, quantity)
    VALUES($1, $2, $3, $4)
    RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    cart_id,
    product_id,
    quantity,
  ]);
  return response.rows[0];
};

const deleteProductFromCart = async ({ cart_id, product_id }) => {
  const SQL = `
    DELETE
    FROM cart_products
    WHERE cart_id=$1 AND product_id=$2
    RETURNING *
  `;
  const response = await client.query(SQL, [cart_id, product_id]);
  return response.rows[0];
};

const changeQuantity = async ({ cart_id, product_id, quantity }) => {
  const SQL = `
    UPDATE cart_products
    SET quantity=$1
    WHERE product_id=$2 AND cart_id=$3
    RETURNING *
  `;
  const response = await client.query(SQL, [quantity, product_id, cart_id]);
  return response.rows[0];
};

const seeUser = async (id) => {
  const SQL = `
      SELECT id, email, firstName, lastName, phoneNumber
      FROM users
      WHERE id=$1
    `;
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

const updateUser = async ({ firstName, lastName, phoneNumber, id }) => {
  const SQL = `
    UPDATE users
    SET firstName=$1, lastName=$2, phoneNumber=$3, updated_at=now()
    WHERE id=$4
    RETURNING *
  `;
  const response = await client.query(SQL, [
    firstName,
    lastName,
    phoneNumber,
    id,
  ]);
  return response.rows;
};

const deleteUser = async (id) => {
  const SQL = `
    DELETE FROM users
    where id = $1
  `;
  await client.query(SQL, [id]);
};

// admin

const seeUsers = async () => {
  const SQL = `
        SELECT id, email, firstName, lastName, phoneNumber, is_admin
        FROM users
      `;
  const { rows } = await client.query(SQL);
  return rows;
};

const createProduct = async ({
  name,
  imageURL,
  price,
  description,
  inventory,
  category_name,
}) => {
  const SQL = `
        INSERT INTO products(id, name, imageURL, price, description, inventory, category_name)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
  const response = await client.query(SQL, [
    uuid.v4(),
    name,
    imageURL,
    price,
    description,
    inventory,
    category_name,
  ]);
  return response.rows[0];
};

const updateProduct = async ({
  name,
  imageURL,
  price,
  description,
  inventory,
  category_name,
}) => {
  const SQL = `
    UPDATE products
    SET name =$1 , imageURL=$2, price=$3, description=$4, inventory=$5, category_name=$6, updated_at= now()
    WHERE id = $7
    RETURNING *
  `;
  const response = await client.query(SQL, [
    { name, imageURL, price, description, inventory, category_name },
  ]);
  return response.rows[0];
};

const deleteProduct = async (id) => {
  const SQL = `
    DELETE FROM products
    where id = $1
  `;
  await client.query(SQL, [id]);
};

const seeCarts = async () => {
  const SQL = `
    SELECT *
    FROM carts
  ;`;
  const response = await client.query(SQL);
  return response.rows;
};

const createCategory = async ({ name }) => {
  const SQL = `
    INSERT INTO categories(id, name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

// password authentication
const authenticate = async ({ email, password }) => {
  const SQL = `
      SELECT id, email, password
      FROM users
      WHERE email=$1;
    `;
  const response = await client.query(SQL, [email]);

  if (
    !response.rows.length ||
    (await bcrypt.compare(password, response.rows[0].password)) === false
  ) {
    const error = new Error("not authorized"); // Change here
    error.status = 401;
    throw error;
  }

  const { is_admin, id } = response.rows[0];

  const token = await jwt.sign({ admin: is_admin, id }, JWT);
  return { token: token };
};

// use token to secure login process
const findUserWithToken = async (token) => {
  console.log(token);
  let id;
  try {
    const payload = await jwt.verify(token, JWT);
    console.log({ payload });
    id = payload.id;
  } catch (ex) {
    const error = new Error("JWT verification failed");
    error.status = 401;
    throw error;
  }
  const SQL = `
      SELECT id, email
      FROM users
      WHERE id=$1;
    `;

  const response = await client.query(SQL, [id]);
  console.log(response.rows[0], "line 269");
  if (!response.rows.length) {
    const error = new Error("not authorized");
    error.status = 401;
    throw error;
  }
  return response.rows[0];
};

module.exports = {
  client,
  createTables,
  seeProducts,
  seeProduct,
  seeCategories,
  seeCategoryProducts,
  createUser,
  createCart,
  seeCart,
  createCartProduct,
  seeCartProducts,
  seeTotalPrice,
  addProductToCart,
  deleteProductFromCart,
  changeQuantity,
  updateUser,
  seeUser,
  deleteUser,
  seeUsers,
  createProduct,
  createCategory,
  updateProduct,
  deleteProduct,
  authenticate,
  findUserWithToken,
};
