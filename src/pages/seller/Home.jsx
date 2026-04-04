import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaArrowRight,
  FaCheckCircle,
  FaCarSide,
  FaUsers,
  FaEnvelope,
  FaStar,
  FaTools,
  FaClipboardCheck,
  FaBolt,
  FaGasPump,
  FaRoad,
  FaHandshake,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../../components/UserNavbar";
import { isAdminAuthenticated } from "../../utils/auth";
import SellCarModel from "../../components/seller/SellCarModel";

const Home = () => {
  const canOpenAdminPanel = isAdminAuthenticated();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const [savedCars, setSavedCars] = useState([]);
  const [isSellWizardOpen, setIsSellWizardOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    users: 0,
    cars: 0,
    inquiries: 0,
    messages: 0,
    reviews: 0,
    testDrives: 0,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [carsRes, summaryRes, messageRes, reviewRes, testDriveRes] =
          await Promise.allSettled([
            axios.get("http://localhost:4444/car/all"),
            axios.get("http://localhost:4444/admin/dashboard"),
            axios.get("http://localhost:4444/message/all"),
            axios.get("http://localhost:4444/reviews/all"),
            axios.get("http://localhost:4444/testdrive/all"),
          ]);

        if (carsRes.status === "fulfilled") {
          setCars(Array.isArray(carsRes.value.data) ? carsRes.value.data : []);
        } else {
          setError("Unable to load cars right now");
        }

        const summaryData =
          summaryRes.status === "fulfilled" ? summaryRes.value.data : {};

        const messages =
          messageRes.status === "fulfilled" && Array.isArray(messageRes.value.data)
            ? messageRes.value.data.length
            : 0;

        const reviews =
          reviewRes.status === "fulfilled" && Array.isArray(reviewRes.value.data)
            ? reviewRes.value.data.length
            : 0;

        const testDrives =
          testDriveRes.status === "fulfilled" && Array.isArray(testDriveRes.value.data)
            ? testDriveRes.value.data.length
            : 0;

        setPlatformStats({
          users: summaryData.users || 0,
          cars: summaryData.cars || 0,
          inquiries: summaryData.inquiries || 0,
          messages,
          reviews,
          testDrives,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load cars right now");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const visibleCars = useMemo(() => {
    let items = [...cars];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (car) =>
          `${car.brand || ""} ${car.model || ""}`.toLowerCase().includes(q)
      );
    }

    if (fuelFilter !== "all") {
      items = items.filter(
        (car) => (car.fuelType || "").toLowerCase() === fuelFilter
      );
    }

    if (priceSort === "low") {
      items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (priceSort === "high") {
      items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return items;
  }, [cars, query, fuelFilter, priceSort]);

  const formatPrice = (price) => {
    const numeric = Number(price || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const toggleSave = (carId) => {
    setSavedCars((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  const featuredCars = visibleCars.slice(0, 9);

  return (
    <div className="min-h-screen bg-bg-base text-text-main flex flex-col">
      <UserNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary-900/10 to-transparent dark:from-primary-900/30 -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 dark:bg-primary-500/20 px-4 py-1.5 text-sm font-semibold text-primary-700 dark:text-primary-300 mb-6 backdrop-blur-md"
          >
            <FaStar className="text-yellow-500" />
            Premium Automotive Marketplace
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8"
          >
            Buy Smarter. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Sell Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            CarScout unifies the complete marketplace lifecycle. Buyers get verified inventory and smart filtering. Sellers get a seamless listing flow and high-quality leads.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link
              to="/customer"
              className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
            >
              Start Buying <FaArrowRight />
            </Link>
            <button
              onClick={() => setIsSellWizardOpen(true)}
              className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto dark:bg-bg-surface dark:hover:bg-zinc-800"
            >
              Sell Your Car
            </button>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="relative z-20 -mt-8 max-w-5xl mx-auto px-6 w-full">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center bg-bg-base dark:bg-zinc-900 border border-border-subtle rounded-xl px-4 py-2">
            <FaSearch className="text-text-muted mr-3" />
            <input
              type="text"
              placeholder="Search by brand, model..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-text-main placeholder-text-muted"
            />
          </div>
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="bg-bg-base dark:bg-zinc-900 border border-border-subtle rounded-xl px-4 py-3 outline-none text-text-main cursor-pointer"
          >
            <option value="all">All Fuel</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
          </select>
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="bg-bg-base dark:bg-zinc-900 border border-border-subtle rounded-xl px-4 py-3 outline-none text-text-main cursor-pointer"
          >
            <option value="default">Sort Price</option>
            <option value="low">Low to High</option>
            <option value="high">High to Low</option>
          </select>
        </div>
        <div className="mt-4 text-center">
            <span className="text-sm font-semibold text-text-muted bg-border-subtle/50 px-3 py-1 rounded-full">{visibleCars.length} cars found</span>
        </div>
      </section>

      {/* Featured Cars List */}
      <section id="featured-cars" className="max-w-7xl mx-auto px-6 py-20 w-full">
        <h2 className="text-3xl font-bold mb-10 text-center">Featured Inventory</h2>

        {loading && <div className="text-center text-text-muted animate-pulse">Loading amazing cars...</div>}
        {error && <div className="text-center text-red-500 font-semibold">{error}</div>}

        {!loading && !error && visibleCars.length === 0 && (
          <div className="text-center py-20">
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-border-subtle text-text-muted mb-4">
               <FaCarSide className="text-3xl" />
             </div>
             <h3 className="text-xl font-bold text-text-main">No cars found</h3>
             <p className="text-text-muted mt-2">Adjust your filters to discover more vehicles.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={car._id}
                className="card-styled flex flex-col group cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                   {/* Placeholder Image using Unsplash */}
                  <img
                    src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80"
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                     <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-bg-surface text-text-main rounded-md shadow-sm opacity-90">
                        {car.year}
                     </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-text-main truncate">
                      {car.brand} {car.model}
                    </h3>
                  </div>

                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400 mb-4">
                     {formatPrice(car.price)}
                  </p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-muted font-medium mb-6">
                    <span className="flex items-center gap-2"><FaRoad /> {car.mileage} km</span>
                    <span className="flex items-center gap-2"><FaGasPump /> {car.fuelType}</span>
                    <span className="flex items-center gap-2"><FaBolt /> {car.transmission}</span>
                    <span className="flex items-center gap-2"><FaUsers /> {car.owner}</span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link
                      to={`/customer`}
                      className="btn-primary text-sm py-2"
                    >
                      Buy Now
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(car._id); }}
                      className={`text-sm py-2 rounded-xl font-semibold border transition ${
                        savedCars.includes(car._id)
                          ? "bg-text-main border-text-main text-bg-surface"
                          : "bg-transparent border-border-subtle text-text-main hover:bg-bg-base"
                      }`}
                    >
                      {savedCars.includes(car._id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Platform Functionality Snapshot */}
      <section className="bg-bg-surface border-t border-b border-border-subtle py-20 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold mb-4 text-text-main">Platform Intelligence</h2>
             <p className="text-text-muted">A fully integrated environment for buyers, sellers, and administrators.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
             {[
               { label: "Users", count: platformStats.users, color: "text-blue-500", bg: "bg-blue-500/10" },
               { label: "Cars", count: platformStats.cars, color: "text-green-500", bg: "bg-green-500/10" },
               { label: "Inquiries", count: platformStats.inquiries, color: "text-cyan-500", bg: "bg-cyan-500/10" },
               { label: "Messages", count: platformStats.messages, color: "text-indigo-500", bg: "bg-indigo-500/10" },
               { label: "Reviews", count: platformStats.reviews, color: "text-amber-500", bg: "bg-amber-500/10" },
               { label: "Bookings", count: platformStats.testDrives, color: "text-rose-500", bg: "bg-rose-500/10" },
             ].map((stat, i) => (
                <div key={i} className={`rounded-2xl p-5 text-center ${stat.bg} border border-border-subtle/50`}>
                   <p className="text-xs uppercase font-bold tracking-widest text-text-muted mb-2">{stat.label}</p>
                   <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
                </div>
             ))}
           </div>

           <div className="grid md:grid-cols-3 gap-6">
             <div className="card-styled p-6 hover:border-primary-500 transition-colors">
               <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mb-4">
                 <FaHandshake className="text-2xl" />
               </div>
               <h3 className="font-bold text-lg mb-2">Seamless Buy Flow</h3>
               <p className="text-sm text-text-muted">Search premium inventory, save your favorites, and engage sellers through a unified dashboard designed for speed.</p>
             </div>
             
             <div className="card-styled p-6 hover:border-primary-500 transition-colors">
               <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mb-4">
                 <FaMoneyBillWave className="text-2xl" />
               </div>
               <h3 className="font-bold text-lg mb-2">Accelerated Sell Flow</h3>
               <p className="text-sm text-text-muted">List your vehicle instantly, set competitive pricing, and start receiving direct inquiries and test drive bookings.</p>
             </div>

             <div className="card-styled p-6 hover:border-primary-500 transition-colors">
               <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mb-4">
                 <FaClipboardCheck className="text-2xl" />
               </div>
               <h3 className="font-bold text-lg mb-2">Platform Oversight</h3>
               <p className="text-sm text-text-muted">Admins manage overarching user roles, monitor communications, and configure platform settings centrally.</p>
             </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-base py-24 text-center border-t border-border-subtle">
        <h2 className="text-3xl font-bold mb-4">Ready for your next vehicle?</h2>
        <p className="text-text-muted mb-8 max-w-xl mx-auto">Experience the fastest growing premium automotive exchange. Join thousands of verified buyers and sellers today.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
           <Link to="/customer" className="btn-primary">Browse Vehicles</Link>
           <button onClick={() => setIsSellWizardOpen(true)} className="btn-secondary">List a Vehicle</button>
        </div>
      </section>

      <SellCarModel
        isOpen={isSellWizardOpen}
        onClose={() => setIsSellWizardOpen(false)}
      />
    </div>
  );
};

export default Home;