// components/navigation/constants.ts
import React from "react"; // <-- Import React
import { MdFacebook } from "react-icons/md";
import { FaInstagramSquare, FaPinterest } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { IoLeafOutline, IoBookOutline, IoBugOutline, IoGridOutline } from "react-icons/io5";

export const plantCategories = [
  { name: "Flowers", slug: "flowers" },
  { name: "Succulents", slug: "succulents" },
  { name: "Cactuses", slug: "cactuses" },
  { name: "Ferns", slug: "ferns" },
  { name: "Shrubs", slug: "shrubs" },
  { name: "Trees", slug: "trees" },
  { name: "Grasses", slug: "grasses" },
  { name: "Herbs", slug: "herbs" },
  { name: "Houseplants", slug: "houseplants" },
  { name: "Veggies & Fruit", slug: "veggies-fruit" },
];

export const problemCategories = [
  { name: "All Problems", slug: "all-problem" },
  { name: "Diseases", slug: "diseases" },
  { name: "Pests", slug: "pests" },
  { name: "Weeds", slug: "weeds" },
  { name: "Ask the Botanist", slug: "ask-the-botanist", isAbsolute: true },
];

interface ProblemDisplay { [key: string]: string; }
export const problemDisplay: ProblemDisplay = {
  "all-problem": "All Problems",
  diseases: "Disease ID",
  pests: "Pest ID",
  weeds: "Weeds ID",
  "ask-the-botanist": "Ask the Botanist",
};

export const companyCategories = [
  { name: "PlantIn App", slug: "/plantinapp" },
  { name: "Mushroom ID App", slug: "/mushroom-identification" },
  { name: "About Us", slug: "/about-us" },
  { name: "PlantIn App Review", slug: "/review" },
  { name: "Rating & Reviews", slug: "/" },
  { name: "Hero of Ukraine", slug: "/" },
  { name: "FAQ", slug: "/faq" },
  { name: "Contact Us", slug: "/contact-us" },
  { name: "Promo", slug: "/promo" },
  { name: "Education", slug: "/education" },
];

export const blogCategories = [
  { name: "Plants", slug: "/blog/plants" },
  { name: "Weeds", slug: "/problems/weeds" },
];

// --- FIX IS HERE ---
// 1. Define the shape of our social link object
interface SocialLink {
  href: string;
  icon: React.ReactElement; // The type for a JSX element like <... />
  alt: string;
}

// 2. Apply the type to the array
export const socialLinks: SocialLink[] = [
    { href: "https://instagram.com", icon: <FaInstagramSquare />, alt: "Instagram" },
    { href: "https://facebook.com", icon: <MdFacebook />, alt: "Facebook" },
    { href: "https://pinterest.com", icon: <FaPinterest />, alt: "Pinterest" },
    { href: "https://tiktok.com", icon: <AiFillTikTok />, alt: "TikTok" },
];
// --- END OF FIX ---


export const userProfileLinks = [
    { href: "/settings", label: "Settings" },
    { href: "/community-profile", label: "Community Profile" },
    { href: "/my-plants", label: "My Plants" },
    { href: "/saved-articles", label: "Saved Articles" },
    { href: "/subscription", label: "Get Premium" },
];

export const mobileBottomNavLinks = [
    { href: "/identify", icon: IoLeafOutline, label: "Plant ID" },
    { href: "/blog", icon: IoBookOutline, label: "Blog" },
    { href: "/problems/diseases", icon: IoBugOutline, label: "Disease ID" },
    { href: "/about-us", icon: IoGridOutline, label: "More" },
];