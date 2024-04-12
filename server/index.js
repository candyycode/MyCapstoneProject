// import packages
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const {
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
  addProductToCart,
  deleteProductFromCart,
  changeQuantity,
  updateUser,
  deleteUser,
  seeUsers,
  createCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  authenticate,
  findUserWithToken,
} = require("./db");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) =>
  res.send("Server is running and listening on port 3000")
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ error: err.message });
});

// Custom middleware for checking if user is logged in
const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  } catch (ex) {
    next(ex);
  }
};

// Custom middleware for checking if user is admin
const isAdmin = async (req, res, next) => {
  console.log("IsAdmin", req.user);
  if (!req.user.is_admin) {
    res.status(403).send("Not authorized");
  } else {
    next();
  }
};

// User NOT logged in

// login not required to see available products
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await seeProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products/:productId", async (req, res, next) => {
  try {
    res.send(await seeProduct(req.params.productId));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/categories", async (req, res, next) => {
  try {
    res.send(await seeCategories());
  } catch (ex) {
    next(ex);
  }
});

// create an account
app.post("/api/auth/register", async (req, res, next) => {
  try {
    res.send(await createUser(req.body));
  } catch (ex) {
    next(ex);
  }
});

// login to account
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (ex) {
    next(ex);
  }
});

// LOGGED IN USER
//  functions - add product to cart, see cart, edit cart, purchase

// user account
app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

// login in user able to see cart details
app.get("/api/mycart", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cart = await seeCart(userId);

    if (!cart) {
      // If the user doesn't have a cart, create one
      cart = await createCart({ user_id: userId });
    }

    // Respond with the cart details
    res.status(200).send(cart);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

// login user able to see cart products
app.get("/api/mycart/cartitems", isLoggedIn, async (req, res, next) => {
  try {
    // Retrieve the cart ID for the current user
    const userId = req.user.id;
    const cart = await seeCart(userId);

    if (!cart) {
      // If the user doesn't have a cart, respond with an appropriate message
      return res.status(404).send({ message: "Cart not found" });
    }

    // Retrieve the cart products using the cart ID
    const cartProducts = await seeCartProducts(cart.id);

    // Respond with the cart products
    res.status(200).send(cartProducts);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

// login user able to add product to cart
app.post("/api/mycart/cartitems", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cart = await seeCart(userId);

    if (!cart) {
      cart = await createCart({ user_id: userId });
    }

    const cartId = cart.id;
    const { product_id, quantity } = req.body;
    const result = await addProductToCart({
      cart_id: cartId,
      product_id,
      quantity,
    });

    res.send(result);
  } catch (ex) {
    next(ex);
  }
});

// login user able to change quantity of product in cart
app.put(
  "/api/mycart/cartitems/:cartitemsId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      let cart = await seeCart(userId);

      // If no cart exists, create a new one
      if (!cart) {
        cart = await createCart({ user_id: userId });
      }

      // Update quantity for the specified product in the cart
      const updatedCart = await changeQuantity({
        quantity: req.body.quantity,
        product_id: req.params.cartitemsId,
        cart_id: cart.id,
      });

      // Respond with the updated cart
      res.status(200).send(updatedCart);
    } catch (error) {
      // Handle any errors
      next(error);
    }
  }
);

// login user able to delete product from cart
app.delete(
  "/api/mycart/cartitems/:cartitemsId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Retrieve the cart ID for the current user
      const cart = await seeCart(userId);

      // If no cart exists, respond with an appropriate message
      if (!cart) {
        return res.status(404).send({ message: "Cart not found" });
      }

      // Delete the product from the cart
      await deleteProductFromCart({
        cart_id: cart.id,
        product_id: req.params.cartitemsId,
      });

      // Respond with a 204 status code (No Content) to indicate success
      res.sendStatus(204);
    } catch (error) {
      // Handle any errors
      next(error);
    }
  }
);

// login user able to purchase products

//  login user able to update information about user
app.put("/api/users/:id", isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    res.status(201).send(
      await updateUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone_number: req.body.phone_number,
        id: req.params.id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

// login user able to delete an account
app.delete("/api/users/:id", isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    await deleteUser(req.params.id);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

// ADMIN FUNCTIONS
// admin to able see all products
app.get("/api/admin/products", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const products = await seeProducts();

    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
});

// admin able to add a product
app.post("/api/admin/products", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    // Extract product data from request body
    const { name, price, description, inventory, category_name } = req.body;

    // Create the product
    const newProduct = await createProduct({
      name,
      imageURL,
      price,
      description,
      inventory,
      category_name,
    });

    // Send the newly created product as the response
    res.status(201).send(newProduct);
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

// admin able to edit a product
app.put(
  "/api/admin/products/:productId",
  isLoggedIn,
  isAdmin,
  async (req, res, next) => {
    try {
      // Extract product data from request body
      const { name, price, description, inventory, category_name } = req.body;

      // Update the product
      const updatedProduct = await updateProduct({
        id: req.params.productId,
        name,
        price,
        description,
        inventory,
        category_name,
      });

      // Send the updated product as the response
      res.status(200).send(updatedProduct);
    } catch (error) {
      // Handle any errors
      next(error);
    }
  }
);
// admin able to delete a product
app.delete(
  "/api/admin/products/:productId",
  isLoggedIn,
  isAdmin,
  async (req, res, next) => {
    try {
      // Delete the product by its ID
      await deleteProduct(req.params.productId);

      // Send a 204 No Content response to indicate success
      res.sendStatus(204);
    } catch (error) {
      // Handle any errors
      next(error);
    }
  }
);

// admin able to see all users
app.get("/api/users/users", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    res.send(await seeUsers());
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [cameron, emily, sarah] =
    await Promise.all([
      createUser({
        email: "cameron@icloud.com",
        password: "exoticguy",
        is_admin: true,
      }),
      createUser({
        email: "emily@icloud.com",
        password: "doglover",
      }),
      createUser({
        email: "sarah@icloud.com",
        password: "kittylover",
      }),
    ]);

    const productsDisplay = await Promise.all([
      createProduct({
        name: "cat toy",
        price: 1.99,
        description: "ball cat toy",
        inventory: 10,
        category_name: cat.name,
      }),
      createProduct({
        name: "cat food",
        price: 32.99,
        description: "best cat food ever",
        inventory: 15,
        category_name: dog.name,
      }),
      createProduct({
        name: "dog food",
        price: 54.98,
        description: "ultimate dog food",
        inventory: 20,
        category_name: dog.name,
      }),
      createProduct({
        name: "dog collar",
        price: 19.95,
        description: "premium dog collar",
        inventory: 25,
        category_name: dog.name,
      }),
    ]);

    const [cat, dog, exotics] = await Promise.all([
        createCategory({ name: "cat" }),
        createCategory({ name: "dog" }),
        createCategory({ name: "exotics" }),
      ]);

  const users = await seeUsers();
  console.log("Users: ", users);
  const category = await seeCategories();
  console.log("Categories: ", category);
  const products = await seeProducts();
  console.log("Products: ", products);
  const carts = await Promise.all([
    createCart({ user_id: cameron.id }),
    createCart({ user_id: emily.id }),
    createCart({ user_id: sarah.id }),
  ]);
  console.log("Carts: ", carts);

  const productsInCart = await Promise.all([
    createCartProduct({
      cart_id: carts[0].id,
      product_id: cattoy.id,
      quantity: 3,
    }),
    createCartProduct({
      cart_id: carts[0].id,
      product_id: catfood.id,
      quantity: 2,
    }),
    createCartProduct({
      cart_id: carts[1].id,
      product_id: dogfood.id,
      quantity: 1,
    }),
    createCartProduct({
      cart_id: carts[1].id,
      product_id: dogcollar.id,
      quantity: 5,
    }),
    createCartProduct({
      cart_id: carts[1].id,
      product_id: cattoy.id,
      quantity: 4,
    }),
    createCartProduct({
      cart_id: carts[2].id,
      product_id: catfood.id,
      quantity: 1,
    }),
  ]);

  console.log(productsInCart);

  // Start server
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init(); // Call the init function to start the initialization process
