// import packages
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
  seeTotalPrice,
  addProductToCart,
  deleteProductFromCart,
  changeQuantity,
  seeUser,
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

const cors = require("cors");
const express = require("express");

const app = express();

app.use(express.json());

// Log the requests as they come in
app.use(require("morgan")("dev"));

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "https://ultimatepetstore.netlify.app",
//     ],
//   })
// );

app.use(cors());

//for deployment
const path = require("path");

// Custom middleware for checking if user is logged in
const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization.split(" ")[1]);
    next();
  } catch (ex) {
    res.status(401).json({ message: "Login to view page" });
    // next(ex);
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

app.get("/api/categories/:categoryName", async (req, res, next) => {
  try {
    res.send(await seeCategoryProducts(req.params.categoryName));
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
    const token = await authenticate(req.body);
    res.send(token);
  } catch (ex) {
    next(ex);
    res.status(401).send({ message: "Failed to login" });
  }
});

// LOGGED IN USER
//  functions - add product to cart, see cart, edit cart, purchase

// user account
app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    res.status(401).json({ message: "Uauthorized" });
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
      return res.status(200).send({ message: "Cart not found" });
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

// login user to see total price of cart
app.get("/api/mycart/cartitemsprice", isLoggedIn, async (req, res, next) => {
  try {
    const cartId = await seeCart(req.user.id);
    const totalPrice = await seeTotalPrice(cartId.id);
    res.status(201).send(totalPrice);
  } catch (ex) {
    // next(ex);
    return res.status(200);
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
    // next(ex);
    res.status(401);
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

//  login user to see information about user
app.get("/api/myaccount", isLoggedIn, async (req, res, next) => {
  try {
    res.status(201).send(await seeUser(req.user.id));
  } catch (ex) {
    next(ex);
  }
});

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
        phone_number: req.body.phoneNumber,
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
    const { name, imageURL, price, description, inventory, category_name } =
      req.body;

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
      const { name, imageURL, price, description, inventory, category_name } =
        req.body;

      // Update the product
      const updatedProduct = await updateProduct({
        id: req.params.productId,
        name,
        imageURL,
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
  try {
    await client.connect();
    console.log("connected to database");

    await createTables();
    console.log("tables created");
    const [cameron, emily, sarah] = await Promise.all([
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

    const [cat, dog, exotics] = await Promise.all([
      createCategory({ name: "cat" }),
      createCategory({ name: "dog" }),
      createCategory({ name: "exotics" }),
    ]);

    const productsDisplay = await Promise.all([
      createProduct({
        name: "cat toy",
        imageURL:
          "https://www.kittyspout.com/cdn/shop/files/13_77bc4248-6d31-4f07-b3c1-c70bd77f0485.png?v=1712212801&width=900",
        price: 1.99,
        description: "Turbo chase ball cat toys",
        inventory: 10,
        category_name: cat.name,
      }),
      createProduct({
        name: "cat food",
        imageURL:
          "https://www.vetstreet.com/wp-content/uploads/2024/01/Screenshot-2024-01-24-at-5.20.51%E2%80%AFPM.jpg",
        price: 32.99,
        description: "The best cat food ever!",
        inventory: 15,
        category_name: cat.name,
      }),
      createProduct({
        name: "dog food",
        imageURL:
          "https://image.chewy.com/is/image/catalog/322681_MAIN._AC_SL600_V1635181278_.jpg",
        price: 54.98,
        description: "Ultimate nutrition dog food",
        inventory: 20,
        category_name: dog.name,
      }),
      createProduct({
        name: "dog collar",
        imageURL:
          "https://adityna.com/cdn/shop/products/5190aag98CL_1024x1024.jpg?v=1663509725",
        price: 19.95,
        description: "Premium dog collar",
        inventory: 25,
        category_name: dog.name,
      }),
      createProduct({
        name: "cat collar",
        imageURL:
          "https://m.media-amazon.com/images/I/71GSIz-LOeL._AC_SX679_.jpg",
        price: 9.99,
        description: "Premium cat collar",
        inventory: 25,
        category_name: cat.name,
      }),
      createProduct({
        name: "congo cage",
        imageURL:
          "https://exoticnutrition.com/cdn/shop/files/CongoCageFront1.jpg?v=1692300548&width=900",
        price: 250.0,
        description:
          "The Exotic Congo Cage is manufactured with high quality materials. Constructed from wrought-iron, this cage is one of the toughest options available for your exotic pet!",
        inventory: 30,
        category_name: exotics.name,
      }),
      createProduct({
        name: "Exotic pet travel cage",
        imageURL:
          "https://exoticnutrition.com/cdn/shop/files/SmallAnimalTravelCageBlack_2.jpg?v=1692302022&width=900",
        price: 115.0,
        description:
          "The Exotic Pet Travel Cage is the perfect carrier or temporary home for a variety of small mammals birds. The cage is most suitable for short term housing. Includes feedwater dishes, wooden climbing post, and exterior perch handle.",
        inventory: 30,
        category_name: exotics.name,
      }),
    ]);

    const users = await seeUsers();
    // console.log("Users: ", users);
    const category = await seeCategories();
    // console.log("Categories: ", category);
    const products = await seeProducts();
    // console.log("Products: ", products);
    const carts = await Promise.all([
      createCart({ user_id: cameron.id }),
      createCart({ user_id: emily.id }),
      createCart({ user_id: sarah.id }),
    ]);
    // console.log("Carts: ", carts);

    const productsInCart = await Promise.all([
      createCartProduct({
        cart_id: carts[0].id,
        product_id: productsDisplay[0].id,
        quantity: 3,
      }),
      createCartProduct({
        cart_id: carts[0].id,
        product_id: productsDisplay[1].id,
        quantity: 2,
      }),
      createCartProduct({
        cart_id: carts[1].id,
        product_id: productsDisplay[2].id,
        quantity: 1,
      }),
      createCartProduct({
        cart_id: carts[1].id,
        product_id: productsDisplay[3].id,
        quantity: 5,
      }),
      createCartProduct({
        cart_id: carts[1].id,
        product_id: productsDisplay[0].id,
        quantity: 4,
      }),
      createCartProduct({
        cart_id: carts[2].id,
        product_id: productsDisplay[1].id,
        quantity: 1,
      }),
    ]);
  } catch (e) {
    console.error("Init done");
  }

  // console.log(productsInCart);

  // Define a route handler for the root URL
  app.get("/", (req, res) => {
    res.send("Welcome to the Ultimate Pet Store!");
  });

  // Start server
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init(); // Call the init function to start the initialization process
