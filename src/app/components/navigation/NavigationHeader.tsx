// components/navigation/NavigationHeader.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoCloseOutline } from "react-icons/io5";

// Import reusable components and constants
import * as NavData from './constants';
import { useSavedPlants, useNotifications, Notification } from './hooks';
import { NavDropdown } from './NavDropdown';
import { MobileSidebar } from './MobileSidebar';
import { DesktopDropdownContainer } from './DesktopDropdownContainer';
import { Plant } from '../../../../types/plant'; // Adjust path

// Helper function from original code
function getProblemLink(slug: string, isAbsolute?: boolean): string {
  return isAbsolute ? `/${slug}` : `/problems/${slug}`;
}

// Sub-components can be defined in the same file if they are not complex or used elsewhere,
// or they can be moved to their own files for better organization.

const AuthButtons: React.FC<{ variant: 'mobile' | 'desktop' }> = ({ variant }) => {
  const mobileClasses = "px-3 py-1.5 font-semibold rounded-2xl bg-teal-600 text-white text-sm";
  const mobileLoginClasses = "px-3 py-1.5 font-medium text-neutral-800 text-sm hidden sm:block";
  const desktopClasses = "px-4 py-2 font-semibold rounded-2xl bg-teal-700 text-white items-center gap-2 hidden lg:flex";
  const desktopLoginClasses = "px-4 py-2 font-medium text-neutral-800 hidden lg:flex";

  return (
    <>
      <Link href="/authmodel" className={variant === 'mobile' ? mobileClasses : desktopClasses}>
        Sign Up Free
      </Link>
      <Link href="/authmodel" className={variant === 'mobile' ? mobileLoginClasses : desktopLoginClasses}>
        Log In
      </Link>
    </>
  );
};

const LoadingSkeleton: React.FC<{ variant: 'mobile' | 'desktop' }> = ({ variant }) => (
    <div className="flex items-center gap-3">
        {variant === 'mobile' ? (
            <>
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </>
        ) : (
            <>
                <div className="h-8 w-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded-2xl animate-pulse"></div>
            </>
        )}
    </div>
);


const UserProfileDropdown: React.FC<{ isOpen: boolean; onToggle: () => void; }> = ({ isOpen, onToggle }) => {
  const router = useRouter();

  const handleLinkClick = (href: string) => {
    router.push(href);
    onToggle();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 z-20">
      <ul className="py-2 text-gray-700">
        {NavData.userProfileLinks.map(({ href, label }) => (
          <li key={href} className="hover:bg-gray-100">
            <button className="w-full text-left px-4 py-2" onClick={() => handleLinkClick(href)}>{label}</button>
          </li>
        ))}
        <li className="hover:bg-gray-100">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2">Log Out</button>
        </li>
      </ul>
      <div className="px-4 py-3 border-t">
        <span className="text-sm font-medium text-gray-700">Follow Us:</span>
        <div className="flex space-x-3 mt-2">
          {NavData.socialLinks.map(({ href, icon, alt }) => (
            <Link key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={onToggle} aria-label={alt} className="text-2xl text-gray-600 hover:text-teal-600">{icon}</Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Exported Component
export function NavigationHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMyPlantsOpen, setIsMyPlantsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { savedPlants, fetchSavedPlants } = useSavedPlants();
  const { notifications, fetchNotifications } = useNotifications();

  // Close all popups/sidebars on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMyPlantsOpen(false);
    setIsNotificationsOpen(false);
  }, [router]);

  // Fetch data when corresponding panel is opened
  useEffect(() => {
    if (isMyPlantsOpen && status === "authenticated") fetchSavedPlants();
  }, [isMyPlantsOpen, status, fetchSavedPlants]);

  useEffect(() => {
    if (isNotificationsOpen && status === "authenticated") fetchNotifications();
  }, [isNotificationsOpen, status, fetchNotifications]);
  
  const closeAllPanels = () => {
    setIsProfileDropdownOpen(false);
    setIsMyPlantsOpen(false);
    setIsNotificationsOpen(false);
  };
  
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(prev => !prev);
  const toggleMyPlants = () => {
    setIsNotificationsOpen(false);
    setIsMyPlantsOpen(prev => !prev);
  };
  const toggleNotifications = () => {
    setIsMyPlantsOpen(false);
    setIsNotificationsOpen(prev => !prev);
  };

  const renderSavedPlantsContent = (isMobile: boolean) => (
    <>
      <div className={`flex-grow overflow-y-auto ${isMobile ? 'space-y-1' : ''}`}>
        {savedPlants.length > 0 ? (
          <ul className={isMobile ? "-mx-2" : "py-2"}>
            {savedPlants.map((plant) => (
              <li key={plant._id} className={`flex items-center hover:bg-gray-100 cursor-pointer ${isMobile ? 'px-2 py-2.5 rounded-md' : 'px-4 py-2'}`} onClick={() => { router.push(`/plants/${plant.slug || plant._id}`); closeAllPanels(); }}>
                <img src={plant.image || '/images/default-plant.jpg'} alt={plant.name} className="h-12 w-12 rounded-md object-cover mr-3" onError={(e) => (e.currentTarget.src = '/images/default-plant.jpg')} />
                <div className="flex-grow">
                  <h4 className="text-sm font-semibold uppercase text-gray-700">{plant.name}</h4>
                  <p className="text-xs text-blue-500">Added to My plants</p>
                </div>
                <svg className={`text-teal-500 flex-shrink-0 ${isMobile ? 'h-5 w-5 ml-2' : 'h-5 w-5 ml-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </li>
            ))}
          </ul>
        ) : (
          <div className={`flex flex-col items-center justify-center text-center ${isMobile ? 'h-full' : 'px-4 py-4'}`}>
            {isMobile && <img src="https://myplantin.com/icons/my-plants.svg" alt="No plants icon" className="w-16 h-16 opacity-50 mb-3" />}
            <p className="text-gray-500 text-sm">No saved plants yet.</p>
            <Link href="/identify/all-plants" className={`${isMobile ? 'mt-2' : ''} text-teal-600 hover:underline text-sm font-medium`} onClick={closeAllPanels}>
              Browse plants to add
            </Link>
          </div>
        )}
      </div>
      {savedPlants.length > 0 && (
        <div className={`pt-3 border-t ${isMobile ? 'mt-3' : 'p-4'}`}>
          <Link href="/my-plants" className={`block w-full text-center px-4 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 ${isMobile ? 'py-2.5 text-sm' : 'py-2'}`} onClick={closeAllPanels}>
            View all my plants
          </Link>
        </div>
      )}
    </>
  );

  const renderNotificationsContent = (isMobile: boolean) => (
     <>
      <div className="flex-grow overflow-y-auto space-y-1">
          {notifications.length > 0 ? (
            <ul className={isMobile ? "-mx-2" : "py-2"}>
              {notifications.map((notification) => (
                <li key={notification._id} className={`flex items-start cursor-pointer hover:bg-gray-100 ${isMobile ? 'px-2 py-3 rounded-md' : 'px-4 py-3'}`}>
                  <div className="flex-shrink-0 pt-0.5"><svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                  <div className={isMobile ? "ml-2.5" : "ml-3"}>
                    <p className="text-sm font-medium text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`flex flex-col items-center justify-center text-center ${isMobile ? 'h-full' : 'px-4 py-4'}`}>
               <svg className="text-gray-400 mb-3 ${isMobile ? 'w-16 h-16' : 'w-12 h-12'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3.159c0 .538-.214 1.053-.595 1.436L2 17h5m4 4a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              <p className="text-gray-500 text-sm">No recent notifications.</p>
            </div>
          )}
        </div>
         {notifications.length > 0 && (
          <div className={`pt-3 border-t ${isMobile ? 'mt-3' : 'p-4'}`}>
            <Link href="/notifications" className={`block w-full text-center px-4 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 ${isMobile ? 'py-2.5 text-sm' : 'py-2'}`} onClick={closeAllPanels}>
              View all notifications
            </Link>
          </div>
        )}
     </>
  );

  const UserActions: React.FC<{ variant: 'mobile' | 'desktop' }> = ({ variant }) => {
    if (status === "loading") return <LoadingSkeleton variant={variant} />;
    
    if (status !== "authenticated" || !session?.user) {
        return <AuthButtons variant={variant} />;
    }

    return (
        <>
            {/* Premium Button */}
            <Link href="/subscription" onClick={closeAllPanels} className={`font-semibold rounded-2xl bg-purple-600 text-white flex items-center gap-1 relative ${variant === 'mobile' ? 'px-2 py-1 text-xs sm:text-sm' : 'px-4 py-2'}`}>
                <img src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fenvelop_free_82a5a66816.webp&w=96&q=75" alt="Message Icon" className={`object-contain ${variant === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                Premium
                <span className={`absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center translate-x-1 -translate-y-1 ${variant === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'}`}>1</span>
            </Link>

            {/* My Plants */}
            <div className="relative">
                <button onClick={toggleMyPlants} className="relative p-1">
                    <img src="https://myplantin.com/icons/my-plants.svg" alt="Leaves Icon" className="h-6 w-6" />
                    {savedPlants.length > 0 && <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ${variant === 'mobile' ? 'h-4 w-4' : 'h-5 w-5 translate-x-1 -translate-y-1'}`}>{savedPlants.length}</span>}
                </button>
                {variant === 'desktop' && <DesktopDropdownContainer isOpen={isMyPlantsOpen} onClose={toggleMyPlants} title="My Plants">{renderSavedPlantsContent(false)}</DesktopDropdownContainer>}
            </div>

            {/* Notifications */}
            <div className="relative">
                <button onClick={toggleNotifications} className="relative p-1">
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-5-5.917V5a2 2 0 10-4 0v.083A6.002 6.002 0 004 11v3.159c0 .538-.214 1.053-.595 1.436L2 17h5m4 4a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                    {notifications.length > 0 && <span className={`absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ${variant === 'mobile' ? 'h-4 w-4' : 'h-5 w-5 translate-x-1 -translate-y-1'}`}>{notifications.length}</span>}
                </button>
                {variant === 'desktop' && <DesktopDropdownContainer isOpen={isNotificationsOpen} onClose={toggleNotifications} title="Notifications">{renderNotificationsContent(false)}</DesktopDropdownContainer>}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
                <Image src={session.user?.image || "https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FGroup_36843_5858b46b2c.webp&w=96&q=75"} alt="User Profile" className="h-8 w-8 rounded-full cursor-pointer" width={32} height={32} 
                onClick={variant === 'mobile' ? () => { router.push('/settings'); closeAllPanels(); } : toggleProfileDropdown} />
                {variant === 'desktop' && <UserProfileDropdown isOpen={isProfileDropdownOpen} onToggle={toggleProfileDropdown} />}
            </div>
        </>
    );
};


  return (
    <>
      <header className="sticky inset-x-0 top-0 z-50 m-0 p-0">
        <a href="/signup?redirect=/subscription" className="block w-full h-10 font-semibold text-center bg-green-100 text-black leading-10 text-sm sm:text-base">
          Identify, Get Care & Grow Healthy Plants with Us!
        </a>
        <div className="px-4 sm:px-6 py-4 bg-white shadow-md">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
           <div className="shrink-0 h-12 w-[108px] sm:w-[144px] overflow-hidden relative">
  <Link href="/" className="flex items-center h-full">
    <img
      src="https://myplantin.com/_next/static/media/logo.3707044a.svg"
      alt="Plant Care Logo"
      className="h-full absolute top-0 left-0"
      style={{ clipPath: 'inset(0 80% 0 0)' }} // Crop 70% from right
    />
  </Link>
</div>



              {/* Mobile Top Navigation */}
              <div className="lg:hidden flex items-center gap-3 sm:gap-4">
                 <UserActions variant="mobile" />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                 <NavDropdown title="Plant Identifier" href="/identify" items={NavData.plantCategories} linkFormatter={(item) => `/identify/${item.slug}`} />
                 <NavDropdown title="Plant Problems" href="/problems" items={NavData.problemCategories} linkFormatter={(item) => getProblemLink(item.slug, item.isAbsolute)} displayFormatter={(item) => NavData.problemDisplay[item.slug] || item.name} />
                 <NavDropdown title="Blog" href="/blog" items={NavData.blogCategories} />
                 <Link href="/feed" className="px-4 py-2 font-medium text-neutral-800 hover:text-teal-600">Feed</Link>
                 <NavDropdown title="Company" href="/about-us" items={NavData.companyCategories} />
              </nav>

              {/* Desktop Right Side Actions */}
              <div className="hidden lg:flex items-center gap-3">
                 <UserActions variant="desktop" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-blue-100 shadow-md z-40 border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {NavData.mobileBottomNavLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex flex-col items-center text-gray-700 hover:text-teal-600 p-2" onClick={closeAllPanels}>
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Sidebars */}
      <MobileSidebar isOpen={isMyPlantsOpen} onClose={toggleMyPlants} title="My Plants">
          {status === 'authenticated' ? renderSavedPlantsContent(true) : 
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-500 text-sm">Please <Link href="/authmodel" className="text-teal-600 hover:underline font-medium" onClick={toggleMyPlants}>log in</Link> to see your plants.</p>
            </div>
          }
      </MobileSidebar>

      <MobileSidebar isOpen={isNotificationsOpen} onClose={toggleNotifications} title="Notifications">
          {status === 'authenticated' ? renderNotificationsContent(true) :
             <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-500 text-sm">Please <Link href="/authmodel" className="text-teal-600 hover:underline font-medium" onClick={toggleNotifications}>log in</Link> to see notifications.</p>
             </div>
          }
      </MobileSidebar>
    </>
  );
}