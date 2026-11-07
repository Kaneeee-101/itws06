// Business data for the menu and contact sections.
// Only fill in real Pages & Pour information. Leave a value empty ("" or null) to hide it.
window.SITE_DATA = {
  menuCategories: [
    { id: "books", label: "Books & Study" },
    { id: "coffee", label: "Coffee" },
    { id: "non-coffee", label: "Non-Coffee" },
    { id: "pastries", label: "Pastries & Snacks" },
  ],

  // price: number in PHP (₱).
  // Items follow the Pages & Pour product catalog.
  menu: [
    { category: "books", name: "Novels", description: "", price: 299, image: "assets/products/book-secrets-lost-woods.png" },
    { category: "books", name: "Review Books", description: "", price: 450, image: "assets/products/book-education-challenges.png" },
    { category: "books", name: "Journals", description: "", price: 199, image: "assets/products/journal-leather.jpg" },
    { category: "books", name: "Notebooks", description: "", price: 89, image: "assets/products/book-extra-02.jpg" },
    { category: "books", name: "Bookmarks", description: "", price: 49, image: "assets/products/bookmark-set.png" },
    { category: "books", name: "Pens", description: "", price: 35, image: "assets/products/stationery-flatlay.jpg" },

    { category: "coffee", name: "Iced Latte", description: "", price: 140, image: "assets/products/coffee-iced-latte.jpg" },
    { category: "coffee", name: "Caramel Macchiato", description: "", price: 160, image: "assets/products/coffee-caramel-drizzle.jpg" },
    { category: "coffee", name: "Café Mocha", description: "", price: 155, image: "assets/products/coffee-mocha.jpg" },
    { category: "coffee", name: "Spanish Latte", description: "", price: 150, image: "assets/products/coffee-spanish-latte.jpg" },
    { category: "coffee", name: "Hot Cappuccino", description: "", price: 130, image: "assets/products/hot-coffee.png" },

    { category: "non-coffee", name: "Matcha Latte", description: "", price: 150, image: "assets/products/coffee-caramel.jpg" },
    { category: "non-coffee", name: "Milk Tea", description: "", price: 120, image: "assets/products/coffee-spanish-latte.jpg" },
    { category: "non-coffee", name: "Chocolate Drink", description: "", price: 130, image: "assets/products/iced-coffee.png" },
    { category: "non-coffee", name: "Fruit Tea", description: "", price: 110, image: "assets/products/coffee-iced-latte.jpg" },

    { category: "pastries", name: "Croissants", description: "", price: 85, image: "assets/products/pastry-croissant.jpg" },
    { category: "pastries", name: "Brownies", description: "", price: 75, image: "assets/products/pastry-chocolate-cake.jpg" },
    { category: "pastries", name: "Cookies", description: "", price: 55, image: "assets/products/pastry-cookies.jpg" },
    { category: "pastries", name: "Cinnamon Rolls", description: "", price: 95, image: "assets/products/pastry-cinnamon-rolls.jpg" },
    { category: "pastries", name: "Sandwiches", description: "", price: 145, image: "assets/products/croissant-sandwich.png" },
  ],

  contact: {
    address: "34 Kape St., Brgy. Bookelya",
    mapQuery: "34 Kape St., Brgy. Bookelya",
    // Example: [{ days: "Monday – Friday", time: "8:00 AM – 9:00 PM" }]
    hours: [],
    phone: "",
    email: "",
    // Example: [{ label: "Facebook", url: "https://facebook.com/..." }]
    socials: [],
  },
};
