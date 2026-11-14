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
    { category: "books", name: "Roast & Reason", description: "A Philosophy of Coffee", price: 299, image: "assets/products/books/roast-and-reason.png" },
    { category: "books", name: "Terroir & Tales", description: "A Cultural Journey of Coffee and Lore", price: 320, image: "assets/products/books/terroir-and-tales.png" },
    { category: "books", name: "Steeped in Stories", description: "", price: 289, image: "assets/products/books/steeped-in-stories.png" },
    { category: "books", name: "Sip & Scroll", description: "An Anthology of Café Writing", price: 275, image: "assets/products/books/sip-and-scroll.png" },
    { category: "books", name: "Cultivate & Brew", description: "A Journal of Growth and Coffee", price: 249, image: "assets/products/books/cultivate-and-brew.png" },

    { category: "coffee", name: "Iced Latte", description: "", price: 140, image: "assets/products/drinks/iced-latte.jpg" },
    { category: "coffee", name: "Caramel Macchiato", description: "", price: 160, image: "assets/products/drinks/caramel-macchiato.jpg" },
    { category: "coffee", name: "Café Mocha", description: "", price: 155, image: "assets/products/drinks/mocha.jpg" },
    { category: "coffee", name: "Spanish Latte", description: "", price: 150, image: "assets/products/drinks/spanish-latte.jpg" },
    { category: "coffee", name: "Hot Cappuccino", description: "", price: 130, image: "assets/products/drinks/hot-coffee.png" },

    { category: "non-coffee", name: "Matcha Latte", description: "", price: 150, image: "assets/products/drinks/caramel.jpg" },
    { category: "non-coffee", name: "Milk Tea", description: "", price: 120, image: "assets/products/drinks/spanish-latte.jpg" },
    { category: "non-coffee", name: "Chocolate Drink", description: "", price: 130, image: "assets/products/drinks/iced-coffee.png" },
    { category: "non-coffee", name: "Fruit Tea", description: "", price: 110, image: "assets/products/drinks/iced-latte.jpg" },

    { category: "pastries", name: "Croissants", description: "", price: 85, image: "assets/products/food/croissant.jpg" },
    { category: "pastries", name: "Brownies", description: "", price: 75, image: "assets/products/food/chocolate-cake.jpg" },
    { category: "pastries", name: "Cookies", description: "", price: 55, image: "assets/products/food/cookies.jpg" },
    { category: "pastries", name: "Cinnamon Rolls", description: "", price: 95, image: "assets/products/food/cinnamon-rolls.jpg" },
    { category: "pastries", name: "Sandwiches", description: "", price: 145, image: "assets/products/food/sandwich.png" },
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
