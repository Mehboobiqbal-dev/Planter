"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MdFacebook } from "react-icons/md";
import { FaInstagramSquare, FaPinterest } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { IoLeafOutline, IoBookOutline, IoBugOutline, IoGridOutline } from "react-icons/io5";
import { Plant } from '../../../types/plant'; // Adjust path as needed

const plantCategories = [
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

const problemCategories = [
  { name: "All Problems", slug: "all-problem" },
  { name: "Diseases", slug: "diseases" },
  { name: "Pests", slug: "pests" },
  { name: "Weeds", slug: "weeds" },
  { name: "Ask the Botanist", slug: "ask-the-botanist", isAbsolute: true },
];

interface ProblemDisplay {
  [key: string]: string;
}

const problemDisplay: ProblemDisplay = {
  "all-problem": "All Problems",
  diseases: "Disease ID",
  pests: "Pest ID",
  weeds: "Weeds ID",
  "ask-the-botanist": "Ask the Botanist",
};

const companyCategories = [
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

const blogCategories = [
  { name: "Plants", slug: "/blog/plants" },
  { name: "Weeds", slug: "/problems/weeds" },
];

interface Notification {
  _id: string;
  message: string;
  date: string;
}

function getProblemLink(slug: string, isAbsolute?: boolean): string {
  return isAbsolute ? `/${slug}` : `/problems/${slug}`;
}

export function NavigationHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMiniBarOpen, setIsMiniBarOpen] = useState(false);
  const [isNotificationBarOpen, setIsNotificationBarOpen] = useState(false);
  const [savedPlants, setSavedPlants] = useState<Plant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [baseUrl, setBaseUrl] = useState(''); // To construct absolute URLs if needed, though relative is fine here

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin); // Not strictly needed for relative /api calls
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleMiniBar = () => {
    setIsMiniBarOpen((prev) => !prev);
    setIsNotificationBarOpen(false);
  };

  const toggleNotificationBar = () => {
    setIsNotificationBarOpen((prev) => !prev);
    setIsMiniBarOpen(false);
  };

  useEffect(() => {
    if (isMiniBarOpen && status === "authenticated" && session?.user) {
      const fetchSavedPlants = async () => {
        const userId = (session.user as any)?.id || (session.user as any)?.sub;

        if (!userId) {
          console.warn("[NavigationHeader] User ID not found in session. Cannot fetch saved plants.");
          setSavedPlants([]);
          return;
        }

        try {
          const url = `/api/plant/saved?userId=${encodeURIComponent(String(userId))}`;
          console.log(`[NavigationHeader] Fetching saved plants from: ${url}`);

          const res = await fetch(url, {
            cache: 'no-store',
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[NavigationHeader] Failed to fetch saved plants. Status: ${res.status}. UserID: ${userId}. Response: ${errorText}`);
            setSavedPlants([]);
            return;
          }
          const data = await res.json();
          if (data.plants && Array.isArray(data.plants)) {
            setSavedPlants(data.plants);
            console.log(`[NavigationHeader] Successfully fetched ${data.plants.length} saved plants for user ${userId}.`);
          } else {
            console.warn('[NavigationHeader] Fetched saved plants, but data.plants is not an array or is missing.', data);
            setSavedPlants([]);
          }
        } catch (error) {
          console.error('[NavigationHeader] Error in fetchSavedPlants:', error);
          setSavedPlants([]);
        }
      };
      fetchSavedPlants();
    }
  }, [isMiniBarOpen, status, session]);

  useEffect(() => {
    if (isNotificationBarOpen && status === "authenticated") {
      const fetchNotifications = async () => {
        try {
          const mockNotifications: Notification[] = [
            { _id: "1", message: "Your plant needs watering!", date: "2025-05-25" },
            { _id: "2", message: "New article on plant care available.", date: "2025-05-24" },
          ];
          setNotifications(mockNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        }
      };
      fetchNotifications();
    }
  }, [isNotificationBarOpen, status]);

  return (
    <>
      <header className="sticky inset-x-0 top-0 z-50 m-0 p-0">
        <a
          href="/signup?redirect=/subscription"
          className="block w-full h-10 font-semibold text-center bg-green-100 text-black leading-10 text-sm sm:text-base"
        >
          Identify, Get Care & Grow Healthy Plants with Us!
        </a>
        <div className="px-4 sm:px-6 py-4 bg-white shadow-md">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="shrink-0">
                <Link href="/" className="flex items-center h-12">
                  <img
                    src="https://myplantin.com/_next/static/media/logo.3707044a.svg"
                    alt="Plant Care Logo"
                    className="object-cover h-6 w-[108px] sm:h-8 sm:w-[144px]"
                  />
                </Link>
              </div>

              {/* Mobile Top Navigation */}
              <div className="lg:hidden flex items-center gap-4">
                {status === "authenticated" && session?.user ? (
                  <>
                    <Link
                      href="/subscription"
                      className="px-2 py-1 font-semibold rounded-2xl bg-purple-600 text-white text-sm flex items-center gap-1 relative mx-2"
                    >
                      <img
                        src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fenvelop_free_82a5a66816.webp&w=96&q=75"
                        alt="Message Icon"
                        className="h-4 w-4 object-contain"
                      />
                      Premium
                      <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center translate-x-1 -translate-y-1">
                        1
                      </span>
                    </Link>
                    <button onClick={toggleMiniBar} className="relative">
                      <img
                        src="https://myplantin.com/icons/my-plants.svg"
                        alt="Leaves Icon"
                        className="h-6 w-6"
                      />
                      {savedPlants.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">
                          {savedPlants.length}
                        </span>
                      )}
                    </button>
                    <button onClick={toggleNotificationBar} className="relative">
                      <svg
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3.159c0 .538-.214 1.053-.595 1.436L2 17h5m4 4a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                        />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                    <Image
                      src={session.user?.image || "https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36843_5858b46b2c.webp&w=96&q=75"}
                      alt="User Profile"
                      className="h-8 w-8 rounded-full cursor-pointer"
                      width={32}
                      height={32}
                      onClick={toggleDropdown}
                    />
                  </>
                ) : status === "loading" ? (
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/authmodel"
                      className="px-3 py-1.5 font-semibold rounded-2xl bg-teal-600 text-white text-sm"
                    >
                      Sign Up Free
                    </Link>
                    <Link
                      href="/authmodel"
                      className="px-3 py-1.5 font-medium text-neutral-800 text-sm"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                <div className="relative group">
                  <Link href="/identify" className="px-4 py-2 font-medium text-neutral-800 flex items-center hover:text-teal-600">
                    Plant Identifier
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </Link>
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
                    <ul className="py-2">
                      {plantCategories.map((cat) => (<li key={cat.slug}><Link href={`/identify/${cat.slug}`} className="block px-4 py-2 text-sm hover:bg-gray-100">{cat.name}</Link></li>))}
                    </ul>
                  </div>
                </div>
                <div className="relative group">
                  <Link href="/problems" className="px-4 py-2 font-medium text-neutral-800 flex items-center hover:text-teal-600">
                    Plant Problems
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </Link>
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
                    <ul className="py-2">
                      {problemCategories.map((cat) => (
                        <li key={cat.slug}>
                          <Link href={getProblemLink(cat.slug, cat.isAbsolute)} className="block px-4 py-2 text-sm hover:bg-gray-100">
                            {problemDisplay[cat.slug] || cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative group">
                  <Link href="/blog" className="px-4 py-2 font-medium text-neutral-800 flex items-center hover:text-teal-600">
                    Blog
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </Link>
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
                    <ul className="py-2">
                      {blogCategories.map((item) => (<li key={item.slug}><Link href={item.slug} className="block px-4 py-2 text-sm hover:bg-gray-100">{item.name}</Link></li>))}
                    </ul>
                  </div>
                </div>
                <Link href="/feed" className="px-4 py-2 font-medium text-neutral-800 hover:text-teal-600">Feed</Link>
                <div className="relative group">
                  <Link href="/about-us" className="px-4 py-2 font-medium text-neutral-800 flex items-center hover:text-teal-600">
                    Company
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </Link>
                  <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
                    <ul className="py-2">
                      {companyCategories.map((item) => (<li key={item.slug}><Link href={item.slug} className="block px-4 py-2 text-sm hover:bg-gray-100">{item.name}</Link></li>))}
                    </ul>
                  </div>
                </div>
              </nav>

              {/* Desktop Right Side Actions */}
              <div className="hidden lg:flex items-center gap-3">
                {status === "authenticated" && session?.user ? (
                  <>
                    <Link href="/subscription" className="px-4 py-2 font-semibold rounded-2xl bg-purple-600 text-white flex items-center gap-2 relative">
                      <img src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fenvelop_free_82a5a66816.webp&w=96&q=75" alt="Message Icon" className="h-5 w-5 object-contain" />
                      Premium
                      <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">1</span>
                    </Link>
                    <div className="relative">
                      <button onClick={toggleMiniBar} className="relative">
                        <img src="https://myplantin.com/icons/my-plants.svg" alt="Leaves Icon" className="h-6 w-6" />
                        {savedPlants.length > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">
                            {savedPlants.length}
                          </span>
                        )}
                      </button>
                      {isMiniBarOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                          <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">My Plants</h3>
                            <button onClick={toggleMiniBar} className="text-gray-500 hover:text-gray-700">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          {savedPlants.length > 0 ? (
                            <ul className="py-2">
                              {savedPlants.map((plant) => (
                                <li key={plant._id} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { router.push(`/plants/${plant.slug || plant._id}`); setIsMiniBarOpen(false); }}>
                                  <img src={plant.image || '/images/default-plant.jpg'} alt={plant.name} className="h-12 w-12 rounded-md object-cover mr-3" onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')} />
                                  <div>
                                    <h4 className="text-sm font-semibold uppercase">{plant.name}</h4>
                                    <p className="text-xs text-blue-500">Added to My plants</p>
                                  </div>
                                  <svg className="h-5 w-5 text-teal-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="px-4 py-4 text-gray-500 text-sm text-center">No saved plants yet. <Link href="/identify/all-plants" className="text-teal-600 hover:underline">Browse plants</Link> to add some!</p>
                          )}
                          <div className="p-4 border-t">
                            <Link href="/my-plants" className="block w-full text-center px-4 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600" onClick={() => setIsMiniBarOpen(false)}>View my plants</Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button onClick={toggleNotificationBar} className="relative">
                        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3.159c0 .538-.214 1.053-.595 1.436L2 17h5m4 4a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                        {notifications.length > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center translate-x-1 -translate-y-1">
                            {notifications.length}
                          </span>
                        )}
                      </button>
                      {isNotificationBarOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                          <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            <button onClick={toggleNotificationBar} className="text-gray-500 hover:text-gray-700">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          {notifications.length > 0 ? (
                            <ul className="py-2">
                              {notifications.map((notification) => (
                                <li key={notification._id} className="flex items-start px-4 py-3 hover:bg-gray-100 cursor-pointer">
                                  <div className="flex-shrink-0 pt-1">
                                    <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleDateString()}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="px-4 py-4 text-gray-500 text-sm text-center">No recent notifications.</p>
                          )}
                          <div className="p-4 border-t">
                            <Link href="/notifications" className="block w-full text-center px-4 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600" onClick={() => setIsNotificationBarOpen(false)}>View all notifications</Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Image src={session.user?.image || "https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36843_5858b46b2c.webp&w=96&q=75"} alt="User Profile" className="h-8 w-8 rounded-full cursor-pointer" width={32} height={32} onClick={toggleDropdown} />
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 z-20">
                          <ul className="py-2 text-gray-700">
                            {[
                              { href: "/settings", label: "Settings" },
                              { href: "/community-profile", label: "Community Profile" },
                              { href: "/my-plants", label: "My Plants" },
                              { href: "/saved-articles", label: "Saved Articles" },
                              { href: "/subscription", label: "Get Premium" },
                            ].map(({ href, label }) => (
                              <li key={href} className="hover:bg-gray-100">
                                <button className="w-full text-left px-4 py-2" onClick={async () => { router.push(href); setIsDropdownOpen(false); }}>{label}</button>
                              </li>
                            ))}
                            <li className="hover:bg-gray-100">
                              <button onClick={() => { signOut({ callbackUrl: "/" }); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2">Log Out</button>
                            </li>
                          </ul>
                          <div className="px-4 py-3 border-t">
                            <span className="text-sm font-medium text-gray-700">Follow Us:</span>
                            <div className="flex space-x-3 mt-2">
                              {[
                                { href: "https://instagram.com", icon: <FaInstagramSquare />, alt: "Instagram" },
                                { href: "https://facebook.com", icon: <MdFacebook />, alt: "Facebook" },
                                { href: "https://pinterest.com", icon: <FaPinterest />, alt: "Pinterest" },
                                { href: "https://tiktok.com", icon: <AiFillTikTok />, alt: "TikTok" },
                              ].map(({ href, icon, alt }) => (
                                <Link key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setIsDropdownOpen(false)} aria-label={alt} className="text-2xl text-gray-600 hover:text-teal-600">{icon}</Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : status === "loading" ? (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <Link href="/authmodel" className="px-4 py-2 font-semibold rounded-2xl bg-teal-700 text-white items-center gap-2 hidden lg:flex">Sign Up Free</Link>
                    <Link href="/authmodel" className="px-4 py-2 font-medium text-neutral-800 hidden lg:flex">Log In</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-blue-100 shadow-md z-40">
        <div className="flex justify-around items-center h-16">
          <Link href="/identify" className="flex flex-col items-center text-gray-700 hover:text-teal-600 p-2">
            <IoLeafOutline className="h-6 w-6" />
            <span className="text-xs mt-1">Plant ID</span>
          </Link>
          <Link href="/blog" className="flex flex-col items-center text-gray-700 hover:text-teal-600 p-2">
            <IoBookOutline className="h-6 w-6" />
            <span className="text-xs mt-1">Blog</span>
          </Link>
          <Link href="/problems/diseases" className="flex flex-col items-center text-gray-700 hover:text-teal-600 p-2">
            <IoBugOutline className="h-6 w-6" />
            <span className="text-xs mt-1">Disease ID</span>
          </Link>
          <Link href="/about-us" className="flex flex-col items-center text-gray-700 hover:text-teal-600 p-2">
            <IoGridOutline className="h-6 w-6" />
            <span className="text-xs mt-1">More</span>
          </Link>
        </div>
      </nav>
    </>
  );
}