import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';
import { useState, useEffect } from 'react';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const [tabChangeCount, setTabChangeCount] = useState(0);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [currentTabDomain, setCurrentTabDomain] = useState("");

  const getTabChangeCount = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['tabChangeCount'], (result) => {
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
      chrome.storage.local.get(['totalActiveTime'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve((result.totalActiveTime || 0) / 1000); // Convert to seconds
        }
      });
    });
  };
  
  const getCurrentTab = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const [currentTab] = tabs;
          chrome.storage.local.get(['tabsList'], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              const tabsList = result.tabsList || {};
              const currTab = tabsList[currentTab.id!] || {};
              resolve(currTab.domain || " ");
            }
          });
        }
      });
    });
  };
  

  useEffect(() => {
    // Fetch tab change count
    getTabChangeCount()
      .then((count) => setTabChangeCount(count as number))
      .catch((error) => console.error("Error fetching tab change count:", error));

    // Fetch total active time
    getTotalActiveTime()
      .then((time) => setTotalActiveTime(time as number))
      .catch((error) => console.error("Error fetching total active time:", error));

    // Fetch current tab domain
    getCurrentTab()
      .then((domain) => setCurrentTabDomain(domain as string))
      .catch((error) => console.error("Error fetching current tab domain:", error));
  }, []);
  
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  // const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';
  // const goGithubSite = () =>
  //   chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // const injectContentScript = async () => {
  //   const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

  //   if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
  //     chrome.notifications.create('inject-error', notificationOptions);
  //   }

  //   await chrome.scripting
  //     .executeScript({
  //       target: { tabId: tab.id! },
  //       files: ['/content-runtime/index.iife.js'],
  //     })
  //     .catch(err => {
  //       // Handling errors related to other paths
  //       if (err.message.includes('Cannot access a chrome:// URL')) {
  //         chrome.notifications.create('inject-error', notificationOptions);
  //       }
  //     });
  // };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <h1>Chrome Extension Data</h1>
      <p><strong>Tab Change Count:</strong> {tabChangeCount}</p>
      <p><strong>Total Active Time (seconds):</strong> {totalActiveTime}</p>
      <p><strong>Current Tab Domain:</strong> {currentTabDomain}</p>
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
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
