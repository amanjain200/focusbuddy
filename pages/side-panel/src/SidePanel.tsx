import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ComponentPropsWithoutRef } from 'react';
import { useState, useEffect } from 'react';
import { categoriesPie, DomainActiveTimeBar } from './visualisations';
import { TabSwitchingChart } from './visualisations';
import { focusVsDistractionPie } from './visualisations';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface DomainDetails {
  prevTimeStamp: number;
  totalActiveTime: number;
  category: string;
  interactionCount: number;
}

interface AllUrls {
  [domain: string]: DomainDetails;
}

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';

  const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const [tabChangeCount, setTabChangeCount] = useState(0);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [currentTabDomain, setCurrentTabDomain] = useState('');
  const [uniqueSitesCount, setUniqueSitesCount] = useState(0);
  const [currentDomainCategory, setCurrentDomainCategory] = useState('Misc');
  const [allDomains, setAllDomains] = useState<AllUrls>({});
  const [tabSwitchHistory, setTabSwitchHistory] = useState<number[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const beautifyMdText = (text: string) => {
    const cleanedText = text.replace(/\n{2,}/g, '\n');
    return (
      <ReactMarkdown
        children={cleanedText}
        remarkPlugins={[remarkGfm]}
        className="prose lg:prose-xl text-white space-y-2" // Adjust space between elements
      />
    );
  };
  

  const handleStartnewSession = () => {
    console.log('inside handleStartnewSession');
    chrome.storage.local.remove(['tabSwitchHistory', 'tabChangeCount', 'totalActiveTime', 'allUrlsList', 'tabsList']);
    chrome.storage.local.set({ sessionStartTime: Date.now() });
    setTabChangeCount(0);
    setTotalActiveTime(0);
    setAllDomains({});
    setTabSwitchHistory([]);
    setAiResponse('');
    setUniqueSitesCount(0);
    setSessionStartTime(Date.now());
  };

  const getTabSwitchHistory = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['tabSwitchHistory'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.tabSwitchHistory || []);
        }
      });
    });
  };

  const getTabChangeCount = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['tabChangeCount'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.tabChangeCount || 0);
        }
      });
    });
  };

  const getTotalActiveTime = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['totalActiveTime'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.totalActiveTime || 0);
        }
      });
    });
  };

  const getCurrentDomainCategory = (domain: any) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['allUrlsList'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const allUrls = result.allUrlsList || {};
          console.log('inside getcurrentdomaincategory in sidepanel');
          console.log(allUrls);
          setAllDomains(allUrls);
          resolve(allUrls[domain]?.category || domain);
        }
      });
    });
  };

  const getCurrentTab = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const [currentTab] = tabs;
          chrome.storage.local.get(['tabsList'], result => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              const tabsList = result.tabsList || {};
              const currTab = tabsList[currentTab.id!] || {};
              console.log('inside getcurrenttab in sidepanel');
              console.log(currTab);
              resolve(currTab['domain']);
            }
          });
        }
      });
    });
  };

  const getTotalSitesVisited = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['allUrlsList'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const allUrls = result.allUrlsList || {};
          resolve(Object.keys(allUrls).length);
        }
      });
    });
  };

  const getSessionStartTime = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['sessionStartTime'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.sessionStartTime || Date.now());
        }
      });
    });
  };

  const handleAiInsights = async (temp : any) => {
      setLoading(true);
      try {
        const response: { data: { message: string } } = await axios.post('http://extension-gpt-call.azurewebsites.net/gorq', temp);
        console.log(response);
        const responseData = response.data;
        setAiResponse(responseData.message);
        console.log(responseData.message);
      }catch {
        console.log('Error in fetching data');
        setAiResponse('Failed to fetch insights. Please try again later.');
      }
      setLoading(false);
    }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tab change count
        const tabChangeCount = await getTabChangeCount();
        setTabChangeCount(tabChangeCount as number);

        // Fetch total active time
        const totalActiveTime = await getTotalActiveTime();
        setTotalActiveTime(totalActiveTime as number);

        // Fetch current tab domain
        const currentTabDomain = await getCurrentTab();
        console.log('currentTabDomain: ' + currentTabDomain);
        setCurrentTabDomain(currentTabDomain as string);

        // Get the current domain category
        const currentDomainCategory = await getCurrentDomainCategory(currentTabDomain);
        setCurrentDomainCategory(currentDomainCategory as string);
        console.log('currentDomainCategory' + currentDomainCategory);

        // Fetch total sites visited
        const totalSitesVisited = await getTotalSitesVisited();
        setUniqueSitesCount(totalSitesVisited as number);

        // Fetch tab switch history
        const tabSwitchHisto = await getTabSwitchHistory();
        console.log('tabSwitchHisto: ' + tabSwitchHisto);
        setTabSwitchHistory(tabSwitchHisto as []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      // Fetch session start time
      const sessionStartTiming = await getSessionStartTime();
      setSessionStartTime(sessionStartTiming as number);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('inside useEffect allDomains');
    console.log(allDomains);
  }, [allDomains]);

  return (
    <div className={`App bg-gray-800`}>
      <div className="p-6 flex flex-col items-center justify-center">
        {/* Animated Gradient Header */}
        <h1
          className="text-4xl font-extrabold mb-6 text-white text-center bg-clip-text text-transparent 
                 animate-gradient bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
          FocusBuddy Statistics ⚡
        </h1>

        {/* Session Start Time */}
        <h1 className="text-lg font-medium mb-6 text-white bg-gray-900 bg-opacity-50 p-2 rounded-lg shadow-lg">
          {`⏱️ Session started @ ${new Date(sessionStartTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}`}
        </h1>

        {/* Glassmorphism Stats Card */}
        <div
          className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-2xl p-6 w-full max-w-md 
                  border border-gray-300 relative animate-fade-in">
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>

          <p className="text-lg font-semibold text-white">
            <strong className="text-green-300">📌 Tab Change Count:</strong> {tabChangeCount}
          </p>
          <p className="text-lg font-semibold text-white">
            <strong className="text-blue-300">🌐 Current Tab Domain:</strong> {currentTabDomain}
          </p>
          <p className="text-lg font-semibold text-white">
            <strong className="text-purple-300">🗂️ Current Domain Category:</strong> {currentDomainCategory}
          </p>
          <p className="text-lg font-semibold text-white">
            <strong className="text-yellow-300">🔗 Unique Sites Visited:</strong> {uniqueSitesCount}
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-6 py-6 my-6">
        {/* AI Insights Button */}
        <button
          title="Get AI Insights on your browsing behavior and how to improve it"
          onClick={() => handleAiInsights({
            'tabChangeCount' : tabChangeCount,
            'uniqueSitesCount' : uniqueSitesCount,
            'sessionStartTime' : sessionStartTime.toLocaleString(),
            'currentTime' : Date.now().toLocaleString(),
            'AllDomains' : allDomains,
          })}
          className="relative px-7 py-3 text-lg font-semibold text-white rounded-lg shadow-lg overflow-hidden 
               bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 
               hover:from-green-500 hover:to-green-700 hover:scale-105 
               active:scale-95 hover:shadow-green-400">
          🌟 Get AI Insights
          <span className="absolute inset-0 bg-green-500 opacity-20 blur-lg rounded-lg"></span>
        </button>

        {/* Start New Session Button */}
        <button
          title="Note: This will reset all your current session data"
          onClick={handleStartnewSession}
          className="relative px-7 py-3 text-lg font-semibold text-white rounded-lg shadow-lg overflow-hidden 
               bg-gradient-to-r from-red-500 to-red-700 transition-all duration-300 
               hover:from-red-600 hover:to-red-800 hover:scale-105 
               active:scale-95 hover:shadow-red-400">
          🔄 Start New Session
          <span className="absolute inset-0 bg-red-500 opacity-20 blur-lg rounded-lg"></span>
        </button>
      </div>

      {/* {loading && <p className="text-white text-center">Loading...</p>}
      {aiResponse && !loading && (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-2xl p-6 mt-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-white mb-4">AI Insights Response:</h2>
          <div className="text-white whitespace-pre-wrap text-lg">{beautifyMdText(aiResponse)}</div>
        </div>
      )} */}

{loading && (
  <p className="text-white text-left text-lg font-medium mb-4 animate-pulse">Loading...</p>
)}

{aiResponse && !loading && (
  <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-opacity-20 backdrop-blur-lg rounded-xl shadow-2xl p-8 mt-6 animate-fade-in max-w-4xl mx-auto">
    <h2 className="text-2xl font-semibold text-white mb-4 text-shadow-md">AI Insights Response:</h2>
    
    <div className="text-white whitespace-pre-wrap text-lg leading-relaxed space-y-4 text-left">
      {/* Beautified Markdown Content */}
      {beautifyMdText(aiResponse)}
    </div>
  </div>
)}


      
      <div className="p-8 bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 rounded-xl shadow-2xl">
        {/* Chart Container with Vibrant Effects */}
        <div className="grid grid-cols-1 gap-8">
          <div
            className="relative border-2 border-green-400 rounded-2xl shadow-xl p-6 
                 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                 bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-80 backdrop-blur-lg">
            {/* Floating Glow Effects */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-400 rounded-full opacity-50 animate-ping"></div>

            <h2 className="text-xl font-bold text-white mb-4 tracking-wide">🔥 Time Spent vs Categories</h2>

            {/* Animated Chart */}
            <div className="flex justify-center items-center mt-4 animate-fade-in">{categoriesPie(allDomains)}</div>
          </div>
        </div>
        {/* 📊 Focus vs Distraction Pie Chart */}
        <div className="grid grid-cols-1 gap-8">
          <div
            className="relative border-2 border-yellow-400 rounded-2xl shadow-xl p-6 
                 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                 bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-80 backdrop-blur-lg">
            {/* Floating Glow Effects */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-orange-400 rounded-full opacity-50 animate-ping"></div>

            <h2 className="text-xl font-bold text-white mb-4 tracking-wide">🔥 Focus vs Distraction Pie Chart</h2>
            <div className="flex justify-center items-center mt-4 animate-fade-in">
              {focusVsDistractionPie(allDomains)}
            </div>
          </div>
        </div>

        {/* 📊 Domain Active Time Bar Chart */}
        <div className="grid grid-cols-1 gap-8 mt-6">
          <div
            className="relative border-2 border-blue-400 rounded-2xl shadow-xl p-6 
                 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                 bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-80 backdrop-blur-lg">
            {/* Floating Glow Effects */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-cyan-400 rounded-full opacity-50 animate-ping"></div>

            <h2 className="text-xl font-bold text-white mb-4 tracking-wide">📊 Domain Active Time Bar Chart</h2>
            <div className="animate-fade-in">{DomainActiveTimeBar(allDomains)}</div>
          </div>
        </div>

        {/* 🔄 Tab Switching Chart */}
        <div className="grid grid-cols-1 gap-8 mt-6">
          <div
            className="relative border-2 border-green-400 rounded-2xl shadow-xl p-6 
                 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                 bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-80 backdrop-blur-lg">
            {/* Floating Glow Effects */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-lime-400 rounded-full opacity-50 animate-ping"></div>

            <h2 className="text-xl font-bold text-white mb-4 tracking-wide">🔄 Tab Switching Chart</h2>
            <div className="animate-fade-in">
              <TabSwitchingChart tabSwitchHistory={tabSwitchHistory} />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="p-4">
        <h1 className="text-3xl font-bold mb-4 text-white">Top 10 Sites You Visited</h1>
        {Object.keys(allDomains).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(allDomains)
              .sort((a, b) => allDomains[b].totalActiveTime - allDomains[a].totalActiveTime) // Sort by totalActiveTime in descending order
              .slice(0, 10) // Take the top 10 domains
              .map(domain => {
                const details = allDomains[domain];
                return (
                  <div key={domain} className="p-4 border border-blue-600 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-semibold">{domain}</h2>
                    <p>
                      <strong>Last Visited at:</strong> {new Date(details.prevTimeStamp).toLocaleString()}
                    </p>
                    <p>
                      <strong>Total Active Time:</strong> {formatDuration(details.totalActiveTime)}
                    </p>
                    <p>
                      <strong>Category:</strong> {details.category}
                    </p>
                  </div>
                );
              })}
          </div>
        ) : (
          <p>No domain data available.</p>
        )}
      </div> */}
      <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl">
  <h1 className="text-4xl font-extrabold mb-8 text-center text-white bg-clip-text 
                 text-transparent animate-gradient bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
    🔥 Top 10 Sites You Visited
  </h1>

  {Object.keys(allDomains).length > 0 ? (
    <div className="grid grid-cols-1 gap-6">
      {Object.keys(allDomains)
        .sort((a, b) => allDomains[b].totalActiveTime - allDomains[a].totalActiveTime) // Sort by totalActiveTime
        .slice(0, 10) // Get top 10
        .map((domain, index) => {
          const details = allDomains[domain];

          return (
            <div
              key={domain}
              className="relative p-6 border border-cyan-400 rounded-xl shadow-xl 
                         bg-white bg-opacity-20 backdrop-blur-lg transform transition-all duration-300 
                         hover:scale-105 hover:shadow-2xl hover:border-blue-500"
            >
              {/* Floating Glow Effects */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-cyan-400 rounded-full opacity-50 animate-ping"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-blue-400 rounded-full opacity-50 animate-ping"></div>

              <h2 className="text-2xl font-semibold text-white mb-3 flex items-center space-x-3">
                <span className="text-cyan-300">{index + 1}.</span>
                <span className="truncate">{domain}</span>
              </h2>

              <p className="text-white">
                <strong className="text-green-300">🕒 Last Visited:</strong> {new Date(details.prevTimeStamp).toLocaleString()}
              </p>
              <p className="text-white">
                <strong className="text-yellow-300">⏳ Total Active Time:</strong> {formatDuration(details.totalActiveTime)}
              </p>
              <p className="text-white">
                <strong className="text-purple-300">📂 Category:</strong> {details.category}
              </p>
            </div>
          );
        })}
    </div>
  ) : (
    <p className="text-center text-white text-lg">⚠️ No domain data available.</p>
  )}
</div>


    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
