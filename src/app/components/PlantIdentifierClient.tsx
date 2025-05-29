import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';
import CollapsibleBox from '../components/ColapsibleBox'; // Assuming correct path
import { FaHeart, FaRegHeart, FaFilter } from 'react-icons/fa';
import { Plant } from '../../../types/plant'; // Assuming correct path

interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}

interface Traits {
  trailing: boolean;
  hanging: boolean;
  evergreen: boolean;
  easyCare: boolean;
  airPurifying: boolean;
}

interface LifeCycle {
  perennial: boolean;
  annual: boolean;
}

interface PlantIdentifierClientProps {
  initialSelectedCategory: Category;
  initialDisplayedPlants: Plant[];
  initialCategories: Category[];
  initialPlantCounts: { [key: string]: number };
  initialMainDescription: string;
  initialExpandedDescription: string;
}

// This is the type of object returned by your /api/plant/saved endpoint for each saved plant
interface SavedPlantRecord {
  _id: string; // This is the plantId
  userId: string;
  savedAt: Date; // Or string if it's serialized
  // Add other fields if your API returns more for saved records
}

const PlantIdentifierClient: React.FC<PlantIdentifierClientProps> = ({
  initialSelectedCategory,
  initialDisplayedPlants,
  initialCategories,
  initialPlantCounts,
  initialMainDescription,
  initialExpandedDescription,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialSelectedCategory);
  const [displayedPlants, setDisplayedPlants] = useState<Plant[]>(initialDisplayedPlants);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [plantCounts, setPlantCounts] = useState<{ [key: string]: number }>(initialPlantCounts);
  const [mainDescription, setMainDescription] = useState<string>(initialMainDescription);
  const [expandedDescription, setExpandedDescription] = useState<string>(initialExpandedDescription);
  const [traits, setTraits] = useState<Traits>({
    trailing: false,
    hanging: false,
    evergreen: false,
    easyCare: false,
    airPurifying: false,
  });
  const [expanded, setExpanded] = useState<boolean>(false);
  const [lifeCycle, setLifeCycle] = useState<LifeCycle>({
    perennial: false,
    annual: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [savedPlants, setSavedPlants] = useState<Set<string>>(new Set());
  const [baseUrl, setBaseUrl] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id && baseUrl) { // Ensure baseUrl is set before fetching
      fetchSavedPlants();
    }
  }, [session, baseUrl]); // Add baseUrl as a dependency

  const fetchSavedPlants = async () => {
    if (!session?.user?.id || !baseUrl) return; // Ensure baseUrl is available
    try {
      const res = await fetch(`${baseUrl}/api/plant/saved?userId=${session.user.id}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        console.error(`Failed to fetch saved plants: ${res.status} ${res.statusText}`);
        setSavedPlants(new Set()); // Reset or handle error appropriately
        return;
      }
      // The API returns an array of SavedPlantRecord objects directly.
      const savedPlantRecords: SavedPlantRecord[] = await res.json();

      // Ensure the response is an array before trying to map over it.
      if (!Array.isArray(savedPlantRecords)) {
        console.error('Error fetching saved plants: API response was not an array.', savedPlantRecords);
        setSavedPlants(new Set()); // Reset or handle error appropriately
        return;
      }
      
      // Each 'record' in savedPlantRecords has an '_id' property which is the plant's ID.
      const savedPlantIds = new Set<string>(savedPlantRecords.map((record) => record._id));
      setSavedPlants(savedPlantIds);
    } catch (error) {
      console.error('Error fetching saved plants:', error);
      setSavedPlants(new Set()); // Reset or handle error appropriately
    }
  };

  const savePlant = async (plantId: string) => {
    if (!session?.user?.id) {
      alert('Please log in to save plants');
      return;
    }
    if (!baseUrl) {
      console.error('Base URL not set, cannot save plant.');
      alert('Error: Application not fully loaded. Please try again.');
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/plant/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id, plantId }),
      });
      const data = await res.json();
      // alert(data.message); // Consider replacing with react-hot-toast or similar
      if (res.ok) {
        alert(data.message || 'Plant saved successfully!'); // Provide default message
        setSavedPlants((prev) => new Set([...prev, plantId]));
      } else {
        alert(data.error || data.message || 'Failed to save plant');
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      alert('Failed to save plant');
    }
  };

  const fetchCategoryData = async (categorySlug: string) => {
    setLoading(true);
    try {
      // Assuming API base is the same origin, otherwise prepend baseUrl if needed
      const response = await fetch(`/api/categories?categorySlug=${categorySlug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category data');
      }
      const data = await response.json();
      setSelectedCategory(data.selectedCategory);
      setDisplayedPlants(data.plants);
      setCategories(data.categories);
      setPlantCounts(data.plantCounts);
      setMainDescription(data.selectedCategory.mainDescription);
      setExpandedDescription(data.selectedCategory.expandedDescription);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTraits({
      ...traits,
      [e.target.name]: e.target.checked,
    });
  };

  const handleLifeCycleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLifeCycle({
      ...lifeCycle,
      [e.target.name]: e.target.checked,
    });
  };

  const handleCategoryChange = (slug: string) => {
    router.push(`/identify/${slug}`);
    // fetchCategoryData is now called by Next.js router due to navigation,
    // or you might want to call it if your page component (`/identify/[slug]/page.tsx`)
    // doesn't automatically re-fetch or if this component handles data fetching for those routes.
    // If this component is responsible for fetching on slug change:
    // fetchCategoryData(slug);
  };

  // Render logic (no changes made here, assuming it's correct)
  return (
    <>
      <aside className="hidden md:block w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0">
        <div className="p-4 border border-gray-200 border-secondary rounded-2xl bg-white">
          <h3 className="text-sm text-left text-gray-600 font-semibold mb-4">
            <a href="/plant-finder" className="hover:underline">
              Plant Finder
            </a>
          </h3>
          <hr className="border-t border-gray-300 mb-4" />
          <CollapsibleBox title="Traits" titleClassName="text-gray-400">
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="trailing"
                  checked={traits.trailing}
                  onChange={handleTraitChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Trailing</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="hanging"
                  checked={traits.hanging}
                  onChange={handleTraitChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Hanging</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="evergreen"
                  checked={traits.evergreen}
                  onChange={handleTraitChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Evergreen</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="easyCare"
                  checked={traits.easyCare}
                  onChange={handleTraitChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Easy care</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="airPurifying"
                  checked={traits.airPurifying}
                  onChange={handleTraitChange}
                  className="form-checkbox"
                />
                <span className="ml-2">Air Purifying</span>
              </label>
            </div>
          </CollapsibleBox>
          <CollapsibleBox title="Life Cycle" titleClassName="text-gray-400">
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="perennial"
                  checked={lifeCycle.perennial}
                  onChange={handleLifeCycleChange}
                  className="form-radio"
                />
                <span className="ml-2">Perennial</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="annual"
                  checked={lifeCycle.annual}
                  onChange={handleLifeCycleChange}
                  className="form-radio"
                />
                <span className="ml-2">Annual</span>
              </label>
            </div>
          </CollapsibleBox>
          <CollapsibleBox title="Light" titleClassName="text-gray-400">
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="shade"
                  className="form-radio"
                />
                <span className="ml-2">Shade</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="fullSun"
                  className="form-radio"
                />
                <span className="ml-2">Full sun</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="partSunPartShade"
                  className="form-radio"
                />
                <span className="ml-2">Part Sun Part Shade</span>
              </label>
            </div>
          </CollapsibleBox>
          <CollapsibleBox title="Safety Type" titleClassName="text-gray-400">
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="safeForPets"
                  className="form-radio"
                />
                <span className="ml-2">Safe For Pets</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="safeForHumans"
                  className="form-radio"
                />
                <span className="ml-2">Safe For Humans</span>
              </label>
            </div>
          </CollapsibleBox>
        </div>
      </aside>
      <main className="w-full md:w-2/3 lg:w-3/4 md:pl-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#04BF94" size={40} />
          </div>
        ) : displayedPlants.length === 0 && !loading ? ( // Show loader if initial plants are empty and not due to explicit empty result
          <div className="flex justify-center items-center h-64 text-gray-500">
            No plants found for this category or filter.
          </div>
        ) : displayedPlants.length === 0 && loading ? ( // This case for when loading and plants are empty
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#04BF94" size={40} />
          </div>
        ) : (
          <>
            <nav className="bg-white shadow-md">
              <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <ul className="flex space-x-4 py-2 overflow-x-hidden hover:overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing">
                  {categories.map((cat) => (
                    <li
                      key={cat.slug} // Use slug if name can have duplicates or for routing
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`
                        whitespace-nowrap cursor-pointer px-3 py-1
                        ${
                          cat.slug === selectedCategory.slug // Compare by slug for consistency
                            ? 'text-green-600 font-medium'
                            : 'text-gray-600 hover:text-blue-600'
                        }
                      `}
                    >
                      {cat.name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({plantCounts[cat.name] || 0} Plants)
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className="flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 md:hidden"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Filter Options"
                >
                  <FaFilter className="w-5 h-5" />
                </button>
              </div>
            </nav>
            {isFilterOpen && (
              <div
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setIsFilterOpen(false)}
              >
                <div
                  className="bg-white rounded-xl p-4 w-11/12 max-w-md max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm text-left text-gray-600 font-semibold">
                      Plant Finder
                    </h3>
                    <button
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <hr className="border-t border-gray-300 mb-4" />
                  {/* Mobile Filter Content (same as aside) */}
                  <CollapsibleBox title="Traits" titleClassName="text-gray-400">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center">
                        <input type="checkbox" name="trailing" checked={traits.trailing} onChange={handleTraitChange} className="form-checkbox"/>
                        <span className="ml-2">Trailing</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="checkbox" name="hanging" checked={traits.hanging} onChange={handleTraitChange} className="form-checkbox"/>
                        <span className="ml-2">Hanging</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="checkbox" name="evergreen" checked={traits.evergreen} onChange={handleTraitChange} className="form-checkbox"/>
                        <span className="ml-2">Evergreen</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="checkbox" name="easyCare" checked={traits.easyCare} onChange={handleTraitChange} className="form-checkbox"/>
                        <span className="ml-2">Easy care</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="checkbox" name="airPurifying" checked={traits.airPurifying} onChange={handleTraitChange} className="form-checkbox"/>
                        <span className="ml-2">Air Purifying</span>
                      </label>
                    </div>
                  </CollapsibleBox>
                  <CollapsibleBox title="Life Cycle" titleClassName="text-gray-400">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center">
                        <input type="radio" name="perennial" checked={lifeCycle.perennial} onChange={handleLifeCycleChange} className="form-radio"/>
                        <span className="ml-2">Perennial</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input type="radio" name="annual" checked={lifeCycle.annual} onChange={handleLifeCycleChange} className="form-radio"/>
                        <span className="ml-2">Annual</span>
                      </label>
                    </div>
                  </CollapsibleBox>
                  <CollapsibleBox title="Light" titleClassName="text-gray-400">
                     <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center"><input type="radio" name="shade" className="form-radio"/><span className="ml-2">Shade</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="fullSun" className="form-radio"/><span className="ml-2">Full sun</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="partSunPartShade" className="form-radio"/><span className="ml-2">Part Sun Part Shade</span></label>
                     </div>
                  </CollapsibleBox>
                  <CollapsibleBox title="Safety Type" titleClassName="text-gray-400">
                     <div className="flex flex-col space-y-2">
                        <label className="inline-flex items-center"><input type="radio" name="safeForPets" className="form-radio"/><span className="ml-2">Safe For Pets</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="safeForHumans" className="form-radio"/><span className="ml-2">Safe For Humans</span></label>
                     </div>
                  </CollapsibleBox>
                </div>
              </div>
            )}
            <div className="relative md:p-5 p-4 border rounded-xl border-gray-200">
              <p className="text-lg text-gray-700">
                {mainDescription}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:underline mt-4 inline-block focus:outline-none"
              >
                {expanded ? 'Less ID info' : 'More ID info'}
              </button>
              {expanded && (
                <div className="mt-4 border rounded-xl border-gray-200 p-4">
                  <div className="border-gray-200 pt-4">
                    <p className="text-lg text-gray-700">
                      {expandedDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {displayedPlants.map((plant) => (
                <div
                  key={plant._id}
                  className="p-4 shadow rounded bg-white cursor-pointer hover:shadow-lg transition-shadow relative"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.save-icon')) return;
                    router.push(`/plants/${plant._id}`);
                  }}
                >
                  <div className="relative">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <button
                      className="save-icon absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        savePlant(plant._id);
                      }}
                      disabled={!session?.user?.id}
                      title={session?.user?.id ? 'Save Plant' : 'Login to Save'}
                    >
                      {savedPlants.has(plant._id) ? (
                        <FaHeart className="text-red-500 w-5 h-5" />
                      ) : (
                        <FaRegHeart className="text-gray-500 w-5 h-5 hover:text-red-500" />
                      )}
                    </button>
                  </div>
                  <h5 className="mt-2 text-left font-medium">{plant.name}</h5>
                  <p className="mt-1 text-left text-sm text-gray-500">
                    {plant.latin}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default PlantIdentifierClient;