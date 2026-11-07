// Business data for the menu and contact sections.
// Only fill in real Pages & Pour information. Leave a value empty ("" or null) to hide it.
window.SITE_DATA = {
  menuCategories: [
    { id: "books", label: "Books & Study" },
    { id: "coffee", label: "Coffee" },
    { id: "non-coffee", label: "Non-Coffee" },
    { id: "pastries", label: "Pastries & Snacks" },
  ],

  // price: number in PHP, or null until the actual price is provided.
  // Items follow the Pages & Pour product catalog.
  menu: [
    { category: "books", name: "Novels", description: "", price: null, image: "assets/products/book-secrets-lost-woods.png" },
    { category: "books", name: "Review Books", description: "", price: null, image: "assets/products/book-education-challenges.png" },
    { category: "books", name: "Journals", description: "", price: null, image: "assets/products/journal-leather.jpg" },
    { category: "books", name: "Notebooks", description: "", price: null, image: "assets/products/book-extra-02.jpg" },
    { category: "books", name: "Bookmarks", description: "", price: null, image: "assets/products/bookmark-set.png" },
    { category: "books", name: "Pens", description: "", price: null, image: "assets/products/stationery-flatlay.jpg" },

    { category: "coffee", name: "Iced Latte", description: "", price: null, image: "assets/products/coffee-iced-latte.jpg" },
    { category: "coffee", name: "Caramel Macchiato", description: "", price: null, image: "assets/products/coffee-caramel-drizzle.jpg" },
    { category: "coffee", name: "Café Mocha", description: "", price: null, image: "assets/products/coffee-mocha.jpg" },
    { category: "coffee", name: "Spanish Latte", description: "", price: null, image: "assets/products/coffee-spanish-latte.jpg" },
    { category: "coffee", name: "Hot Cappuccino", description: "", price: null, image: "assets/products/hot-coffee.png" },

    { category: "non-coffee", name: "Matcha Latte", description: "", price: null, image: "assets/products/coffee-caramel.jpg" },
    { category: "non-coffee", name: "Milk Tea", description: "", price: null, image: "assets/products/coffee-spanish-latte.jpg" },
    { category: "non-coffee", name: "Chocolate Drink", description: "", price: null, image: "assets/products/iced-coffee.png" },
    { category: "non-coffee", name: "Fruit Tea", description: "", price: null, image: "assets/products/coffee-iced-latte.jpg" },

    { category: "pastries", name: "Croissants", description: "", price: null, image: "assets/products/pastry-croissant.jpg" },
    { category: "pastries", name: "Brownies", description: "", price: null, image: "assets/products/pastry-chocolate-cake.jpg" },
    { category: "pastries", name: "Cookies", description: "", price: null, image: "assets/products/pastry-cookies.jpg" },
    { category: "pastries", name: "Cinnamon Rolls", description: "", price: null, image: "assets/products/pastry-cinnamon-rolls.jpg" },
    { category: "pastries", name: "Sandwiches", description: "", price: null, image: "assets/products/croissant-sandwich.png" },
  ],

  contact: {
    address: "34 Kape St., Brgy. Bookelya",
    // Google Maps search text or place name; leave empty until the real location is confirmed.
    mapQuery: "",
    // Example: [{ days: "Monday – Friday", time: "8:00 AM – 9:00 PM" }]
    hours: [],
    phone: "",
    email: "",
    // Example: [{ label: "Facebook", url: "https://facebook.com/..." }]
    socials: [],
  },
};
