// Business data for the menu and contact sections.
// Only fill in real Pages & Pour information. Leave a value empty ("" or null) to hide it.
window.SITE_DATA = {
  menuCategories: [
    { id: "coffee", label: "Coffee" },
    { id: "tea", label: "Tea" },
    { id: "milk-tea", label: "Milk Tea" },
    { id: "frappes", label: "Frappes" },
    { id: "pastries", label: "Pastries" },
    { id: "sandwiches", label: "Sandwiches" },
    { id: "snacks", label: "Snacks" },
  ],

  // price: number in PHP, or null until the actual price is provided.
  menu: [
    { category: "coffee", name: "Hot and iced coffee", description: "", price: null, image: "assets/product-coffee.jpg" },
    { category: "tea", name: "Tea", description: "", price: null, image: "" },
    { category: "milk-tea", name: "Milk tea", description: "", price: null, image: "" },
    { category: "frappes", name: "Frappes", description: "", price: null, image: "" },
    { category: "pastries", name: "Pastries", description: "", price: null, image: "assets/pastry.jpg" },
    { category: "sandwiches", name: "Sandwiches and light meals", description: "", price: null, image: "" },
    { category: "snacks", name: "Affordable student-friendly snacks", description: "", price: null, image: "" },
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
