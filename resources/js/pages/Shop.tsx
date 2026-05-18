import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Search, ShoppingCart, User, Menu, Star, Filter, Heart, ArrowRight } from 'lucide-react';

// Mock Data for the Sports Shop
const products = [
    {
        id: 1,
        name: "Adjustable Hex Dumbbell Set",
        price: 149.99,
        rating: 4.8,
        reviews: 1245,
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
        category: "Equipment",
        badge: "Best Seller"
    },
    {
        id: 2,
        name: "Premium Non-Slip Yoga Mat",
        price: 34.50,
        rating: 4.6,
        reviews: 892,
        image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=800&auto=format&fit=crop",
        category: "Accessories",
        badge: "Eco-Friendly"
    },
    {
        id: 3,
        name: "Pro-Stride Running Shoes",
        price: 129.95,
        rating: 4.9,
        reviews: 342,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        category: "Footwear",
        badge: "New Arrival"
    },
    {
        id: 4,
        name: "Whey Protein Isolate - Chocolate",
        price: 54.99,
        rating: 4.7,
        reviews: 2156,
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800&auto=format&fit=crop",
        category: "Supplements",
    },
    {
        id: 5,
        name: "Pro Leather Boxing Gloves",
        price: 79.00,
        rating: 4.5,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1549719386-74dfc47db4ba?q=80&w=800&auto=format&fit=crop",
        category: "Equipment",
    },
    {
        id: 6,
        name: "Waterproof Gym Duffel Bag",
        price: 45.00,
        rating: 4.4,
        reviews: 678,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
        category: "Accessories",
        badge: "Top Rated"
    },
    {
        id: 7,
        name: "High-Compression Active Leggings",
        price: 49.99,
        rating: 4.8,
        reviews: 1890,
        image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop",
        category: "Activewear",
    },
    {
        id: 8,
        name: "Smart Fitness Watch Tracker",
        price: 199.99,
        rating: 4.6,
        reviews: 534,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
        badge: "Sale"
    }
];

const categories = ["All Categories", "Activewear", "Footwear", "Equipment", "Supplements", "Accessories", "Electronics"];

export default function Shop() {
    const [cartCount, setCartCount] = useState(0);
    const [activeCategory, setActiveCategory] = useState("All Categories");

    const addToCart = () => {
        setCartCount(prev => prev + 1);
        // In a real app, you'd show a toast here and update global state
    };

    const filteredProducts = activeCategory === "All Categories" 
        ? products 
        : products.filter(p => p.category === activeCategory);

    return (
        <div className="bg-slate-50 min-h-screen font-sans selection:bg-indigo-100">
            <Head title="Sports Shop | FitCore" />

            {/* E-Commerce Header */}
            <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl shadow-slate-900/10">
                {/* Top Strip */}
                <div className="bg-slate-950 py-2 px-4 text-center text-xs font-semibold tracking-wide text-slate-300">
                    Free shipping on orders over $50. Use code <span className="text-emerald-400 font-black">FIT2026</span>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 lg:gap-8">
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-slate-300 hover:text-white transition">
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link href="/" className="text-2xl font-black tracking-tight shrink-0 flex items-center gap-2">
                            <div className="bg-emerald-500 rounded-lg p-1">
                                <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            </div>
                            FitCore <span className="text-emerald-400 font-light">Shop</span>
                        </Link>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-2xl relative">
                        <input 
                            type="text" 
                            placeholder="Search for activewear, equipment, supplements..." 
                            className="w-full bg-slate-800 text-white border border-slate-700 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder:text-slate-500"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 py-1.5 rounded-full text-sm transition">
                            Search
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition">
                            <User className="w-5 h-5" /> Account
                        </Link>
                        <button className="relative text-slate-300 hover:text-white transition flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-emerald-500 text-slate-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                                    {cartCount}
                                </span>
                            )}
                            <span className="hidden sm:inline text-sm font-bold">Cart</span>
                        </button>
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="hidden lg:flex items-center gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm font-bold text-slate-400">
                    <button className="text-white flex items-center gap-2"><Menu className="w-4 h-4"/> All Departments</button>
                    {categories.filter(c => c !== "All Categories").map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`hover:text-emerald-400 transition ${activeCategory === cat ? 'text-emerald-400' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                    <Link href="#" className="ml-auto text-emerald-400">Today's Deals</Link>
                </div>
            </header>

            {/* Mobile Search Bar */}
            <div className="lg:hidden bg-slate-900 p-4 border-t border-slate-800">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded-full py-3 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
                {/* Sidebar Filters (Desktop) */}
                <aside className="hidden lg:block w-64 shrink-0 space-y-8">
                    <div>
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <Filter className="w-4 h-4"/> Categories
                        </h3>
                        <ul className="space-y-3 font-semibold text-slate-600 text-sm">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button 
                                        onClick={() => setActiveCategory(cat)}
                                        className={`w-full text-left hover:text-emerald-600 transition flex items-center justify-between group ${activeCategory === cat ? 'text-emerald-600' : ''}`}
                                    >
                                        {cat}
                                        {activeCategory === cat && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="h-px bg-slate-200 w-full" />

                    <div>
                        <h3 className="font-black text-slate-900 mb-4 uppercase tracking-tight">Price Range</h3>
                        <ul className="space-y-3 font-semibold text-slate-600 text-sm">
                            <li><button className="hover:text-emerald-600">Under $25</button></li>
                            <li><button className="hover:text-emerald-600">$25 to $50</button></li>
                            <li><button className="hover:text-emerald-600">$50 to $100</button></li>
                            <li><button className="hover:text-emerald-600">$100 & Above</button></li>
                        </ul>
                    </div>

                    <div className="h-px bg-slate-200 w-full" />

                    <div>
                        <h3 className="font-black text-slate-900 mb-4 uppercase tracking-tight">Avg. Customer Review</h3>
                        <ul className="space-y-2 text-sm">
                            {[4, 3, 2, 1].map(stars => (
                                <li key={stars}>
                                    <button className="flex items-center gap-1 hover:text-emerald-600 transition group">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                        ))}
                                        <span className="text-slate-600 font-semibold group-hover:text-emerald-600">& Up</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Grid Area */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900">
                            {activeCategory} <span className="text-slate-400 text-lg font-bold ml-2">({filteredProducts.length} results)</span>
                        </h2>
                        
                        <select className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                            <option>Sort by: Featured</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Avg. Customer Review</option>
                        </select>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.badge && (
                                        <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                            {product.badge}
                                        </span>
                                    )}
                                    <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shadow-sm">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{product.category}</p>
                                    <h3 className="font-bold text-slate-800 leading-tight mb-2 line-clamp-2 hover:text-emerald-600 transition cursor-pointer">
                                        {product.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-1 mb-3">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200 fill-slate-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600">{product.rating}</span>
                                        <span className="text-xs text-slate-400 font-semibold ml-1">({product.reviews})</span>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="text-xl font-black text-slate-900">
                                            ${product.price.toFixed(2)}
                                        </div>
                                        <button 
                                            onClick={addToCart}
                                            className="bg-slate-900 hover:bg-emerald-500 text-white hover:text-slate-900 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-slate-600">No products found in this category.</h3>
                            <button 
                                onClick={() => setActiveCategory("All Categories")}
                                className="mt-4 text-emerald-600 font-bold hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Simple E-commerce Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 font-semibold text-sm">
                    <div>
                        <h4 className="text-white font-black uppercase tracking-wider mb-4">Get to Know Us</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">Careers</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">About FitCore Shop</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Investor Relations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-wider mb-4">Make Money with Us</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">Sell products</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Become an Affiliate</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-wider mb-4">Payment Products</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">FitCore Rewards Visa</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Shop with Points</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase tracking-wider mb-4">Let Us Help You</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-emerald-400 transition">Your Account</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Your Orders</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Shipping Rates & Policies</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Returns & Replacements</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Help</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Simple helper component for Sidebar chevron
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
