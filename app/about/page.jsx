"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Feather,
  Heart,
  Star,
} from "lucide-react";
import { useRef } from "react";
import Footer from "../components/Footer"


export default function About() {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const testimonials = [
    {
      name: "Alex Rider",
      role: "Pro Biker",
      text: "The Helmet Store helmets combine style and unbeatable protection. I never ride without mine!",
      rating: 5,
    },
    {
      name: "Samantha Lee",
      role: "Urban Commuter",
      text: "Lightweight, stylish, and certified safe. I feel confident every ride.",
      rating: 4,
    },
    {
      name: "Jordan Kim",
      role: "Motocross Enthusiast",
      text: "The attention to detail and aerodynamics is incredible. Total game-changer!",
      rating: 5,
    },
    {
      name: "Marcus Woods",
      role: "Touring Rider",
      text: "Comfort for hours, protection for life. Truly premium craftsmanship.",
      rating: 5,
    },
  ];
  return (
    <section className="text-gray-900">
        {/* Hero Section */}
      <div
        className="relative h-[70vh] flex items-center justify-center bg-gray-900 overflow-hidden"
        style={{
          backgroundImage: "url('/5.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>
        <div className="relative text-center text-white max-w-2xl px-6">
          <h1 className="text-2xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
            Minimal Helmets. Maximum Presence.
          </h1>

          <p className="text-lg md:text-2xl mb-6 drop-shadow-md">
            Engineered for style. Built for safety.
          </p>
          <Link
            href="/#shop"
            className="inline-block bg-indigo-700 text-white px-10 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition-colors"
          >
            Explore Our Collection
          </Link>
        </div>/
      </div>

      {/* Brand Story + Stats */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-semibold mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            At Helmet Store, we believe safety should never compromise style.
            Every helmet is a blend of craftsmanship, cutting-edge engineering,
            and minimalist design—crafted to give you presence on every ride.
          </p>
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-700">10+</p>
              <p className="text-gray-500 text-sm">Years of Innovation</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-700">500+</p>
              <p className="text-gray-500 text-sm">Helmets Designed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-700">99%</p>
              <p className="text-gray-500 text-sm">Safety Compliance</p>
            </div>
          </div>
        </div>
        <div className="relative w-full h-96 md:h-[28rem]">
          <Image
            src="/15.jpg"
            alt="Helmet craftsmanship"
            fill
            className="rounded-xl shadow-2xl object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Craftsmanship Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-semibold mb-12 text-center">
            Craftsmanship & Design
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow text-center">
              <Feather className="mx-auto text-indigo-700 mb-4" size={32} />
              <h3 className="font-semibold text-lg mb-2">Premium Materials</h3>
              <p className="text-gray-500">
                Carbon fiber, reinforced polymers, and eco-friendly components
                for ultimate performance.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow text-center">
              <TrendingUp className="mx-auto text-indigo-700 mb-4" size={32} />
              <h3 className="font-semibold text-lg mb-2">Aerodynamic Design</h3>
              <p className="text-gray-500">
                Every curve is optimized for airflow, stability, and comfort.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow text-center">
              <ShieldCheck className="mx-auto text-indigo-700 mb-4" size={32} />
              <h3 className="font-semibold text-lg mb-2">Safety First</h3>
              <p className="text-gray-500">
                Cutting-edge protective technology to keep riders secure under
                all conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-12">
        {[
          {
            icon: Award,
            title: "Award-Winning Designs",
            text: "Recognized globally for innovative design and performance.",
            img: "/11.jpg",
          },
          {
            icon: Heart,
            title: "Loved by Riders",
            text: "Trusted by thousands of riders worldwide for comfort and safety.",
            img: "/23.jpg",
          },
          {
            icon: ShieldCheck,
            title: "Certified Safety",
            text: "Every helmet undergoes rigorous testing and meets international safety standards.",
            img: "/7.jpg",
          },
        ].map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <feature.icon className="text-indigo-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-500">{feature.text}</p>

            {/* Fixed-size container */}
            <div className="w-[300px] h-[200px] relative mt-4">
              <Image
                src={feature.img}
                alt={feature.title}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials Carousel */}
   <div className="relative max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-900">
        What Riders Say
      </h2>

      {/* Scroll Buttons — Hidden on Mobile */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-md hover:bg-white transition-all duration-300 z-10"
      >
        ←
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 shadow-md hover:bg-white transition-all duration-300 z-10"
      >
        →
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-8 py-4 pr-6 snap-x snap-mandatory scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-80 md:w-96 bg-gradient-to-br from-indigo-100/70 to-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-2 snap-start"
          >
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 rounded-full ring-4 ring-indigo-300 overflow-hidden mr-4 shadow-lg">
                <Image
                  src={`/${idx + 1}.jpg`}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
            <div className="flex bg-yellow-50/50 p-1 rounded-full w-max gap-1">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="text-yellow-400" size={20} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer/>
    </section>
  );
}
