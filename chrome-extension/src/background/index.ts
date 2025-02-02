import 'webextension-polyfill';


chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Categories for popular domains
const domainCategories: { [key: string]: string[] } = {
  "Education": [
    "khanacademy.org",
    "coursera.org",
    "edx.org",
    "udemy.com",
    "wikipedia.org",
    "researchgate.net",
    "arxiv.org",
    "pubmed.ncbi.nlm.nih.gov",
    "sciencedirect.com",
    "quizlet.com",
    "brilliant.org",
    "byjus.com",
    "vedantu.com",
    "socratic.org",
    "nptel.ac.in",
    "openstax.org"
  ],
  "Productivity": [
    "notion.so",
    "trello.com",
    "asana.com",
    "slack.com",
    "microsoft.com",
    "zoom.us",
    "google.com",
    "mail.google.com",
    "outlook.com",
    "icloud.com",
    "dropbox.com",
    "github.com",
    "bitbucket.org",
    "figma.com",
    "clickup.com",
    "basecamp.com",
    "airtable.com",
    "monday.com",
    "todoist.com",
    "evernote.com"
  ],
  "Social Media": [
    "linkedin.com",
    "twitter.com",
    "facebook.com",
    "instagram.com",
    "reddit.com",
    "discord.com",
    "quora.com",
    "tiktok.com",
    "snapchat.com",
    "pinterest.com",
    "threads.net"
  ],
  "Entertainment": [
    "youtube.com",
    "netflix.com",
    "spotify.com",
    "primevideo.com",
    "hulu.com",
    "twitch.tv",
    "hotstar.com",
    "apple.com/apple-tv-plus",
    "soundcloud.com",
    "vimeo.com",
    "gaana.com",
    "wynk.in",
    "jiosaavn.com"
  ],
  "News": [
    "nytimes.com",
    "bbc.com",
    "cnn.com",
    "thehindu.com",
    "economist.com",
    "medium.com",
    "techcrunch.com",
    "forbes.com",
    "reuters.com",
    "guardian.com",
    "financialexpress.com",
    "indianexpress.com",
    "timesofindia.indiatimes.com"
  ],
  "Coding": [
    "stackoverflow.com",
    "w3schools.com",
    "geeksforgeeks.org",
    "hackerrank.com",
    "leetcode.com",
    "codeforces.com",
    "codechef.com",
    "kaggle.com",
    "topcoder.com",
    "codementor.io",
    "codecademy.com",
    "freecodecamp.org",
    "python.org",
    "javatpoint.com",
    "replit.com",
    "codesandbox.io",
    "visualstudio.com"
  ],
  "E-Commerce": [
    "amazon.com",
    "flipkart.com",
    "swiggy.com",
    "zomato.com",
    "ebay.com",
    "walmart.com",
    "bigbasket.com",
    "aliexpress.com",
    "etsy.com",
    "myntra.com",
    "ajio.com",
    "target.com",
    "dunzo.com",
    "grofers.com"
  ],
  "AI Tools": [
    "chat.openai.com",
    "claude.ai",
    "bard.google.com",
    "bing.com/chat",
    "huggingface.co",
    "midjourney.com",
    "runwayml.com",
    "cohere.ai",
    "poe.com",
    "perplexity.ai",
    "openai.com"
  ],
  "Finance": [
    "paypal.com",
    "stripe.com",
    "revolut.com",
    "zerodha.com",
    "upstox.com",
    "coinbase.com",
    "binance.com",
    "robinhood.com",
    "etrade.com",
    "yahoo.com/finance"
  ],
  "Healthcare": [
    "webmd.com",
    "mayoclinic.org",
    "clevelandclinic.org",
    "healthline.com",
    "nhs.uk",
    "medlineplus.gov",
    "who.int",
    "cdc.gov",
    "practo.com",
    "1mg.com"
  ]
};

// Build the lookup map for faster access
const domainLookup: { [key: string]: string } = {};
for (const category in domainCategories) {
  if (domainCategories.hasOwnProperty(category)) {
    domainCategories[category].forEach((domain) => {
      domainLookup[domain] = category;
    });
  }
}

// Function to get the category of a domain
function getDomainCategory(domain : string) {
  if (!domain) return "Miscellaneous";

  // Direct lookup
  if (domainLookup[domain]) return domainLookup[domain];

  // Guess category based on domain patterns
  if (domain.endsWith(".edu")) return "Education";
  if (domain.endsWith(".gov")) return "Government";
  if (domain.endsWith(".ai")) return "AI Tools";
  if (domain.includes("mail")) return "Productivity";
  if (domain.includes("calendar")) return "Productivity";
  if (domain.includes("video") || domain.includes("stream")) return "Entertainment";
  if (domain.includes("news") || domain.includes("media")) return "News";
  if (domain.includes("shop") || domain.includes("store") || domain.includes("cart")) return "E-Commerce";
  if (domain.includes("health") || domain.includes("med") || domain.includes("care")) return "Healthcare";
  if (domain.includes("code") || domain.includes("dev") || domain.includes("program")) return "Coding";
  if (domain.includes("learn") || domain.includes("study") || domain.includes("class")) return "Education";
  if (domain.includes("social") || domain.includes("connect")) return "Social Media";
  if (domain.includes("dev") || domain.includes("docs")) return "Coding";

  return "Miscellaneous";
}

// Function to extract domain from URL
function extractDomain(url : string) {
  try {
    const hostname = new URL(url).hostname;
    console.log(hostname);
    if(!hostname.includes('.')) return null;
    if(hostname.startsWith('www.')) return hostname.slice(4);
    return hostname; // Example: "example.com"
  } catch (e) {
    console.log("cannot extract domain");
    return null;
  }
}



let intervalId: any;
function startActiveTimeUpdater(interval = 120000) { // Default 2 minutes
  if (intervalId) clearInterval(intervalId); // Clear any existing interval
  intervalId = setInterval(() => {
    chrome.idle.queryState(60, (state) => {
      if (state === "active") {
        console.log('adding active time after 2 minutes');
        addTotalActiveTime();
      }
    });
  }, interval);
}

// Stop the interval
function stopActiveTimeUpdater() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Active time updater stopped.");
  }
}



/*
storage is maintaining the follwing data:
{
  tabChangeCount: number,        // Total number of tab switches
  totalActiveTime: number,       // Total active browsing time
  prevtime: number,              // Timestamp of the last recorded action
  prevTabId: number,             // ID of the previously active tab

  // Time series of tab switches
  tabSwitchHistory: [
    {
      timestamp: number          // Timestamp of the tab switch (Date.now())
    }
  ],

  // Per-tab tracking (without totalActiveTime)
  tabsList: {
    tabId: {
      domain: string,            // Domain of the tab
    }
  },

  // Per-domain tracking
  allUrlsList: {
    domain: {
      prevTimeStamp: number,     // Last timestamp this domain was active
      totalActiveTime: number,   // Total time spent on this domain
      interactionCount: number,        // Number of times this domain was visited
      category: string           // Category of the domain (e.g., Social Media)
    }
  }
}

*/


let lastTabId: number | null = null;

// const urlChanged = (tabId : number,  newDomain : string, time: number) => {
//   // get the previous domain for the same tabId and update its domain and update the time for previous domain
//   chrome.storage.local.get(['tabsList'], (result) => {
//     const tabsList = result.tabsList || {};
//     const tab = tabsList[tabId] || {};
//     const prevDomain = tab.domain || "";
//     if(prevDomain === newDomain) return;

//     console.log(`Tab: ${tabId} URL changed from ${prevDomain} to ${newDomain}`);
//     chrome.storage.local.get(['allUrlsList'], async (result) => {
//       const allUrls = result.allUrlsList || {};
//       let thisUrl = allUrls[prevDomain] || {};
//       let prevTimeStamp = thisUrl['prevTimeStamp'] || Date.now();
//       console.log('prevTimeStamp for previous domain: ' + prevDomain + " is " + prevTimeStamp);
//       let totalActiveTime = thisUrl['totalActiveTime'] || 0;
//       thisUrl['totalActiveTime'] = totalActiveTime + (Date.now() - prevTimeStamp);
//       thisUrl['prevTimeStamp'] = Date.now();
//       thisUrl['category'] = getDomainCategory(prevDomain);
//       allUrls[prevDomain] = thisUrl;
//       await chrome.storage.local.set({'allUrlsList' : allUrls});
//       console.log('total active time for ' + prevDomain + ' is ' + thisUrl['totalActiveTime']);
//     })
//     chrome.storage.local.get(['allUrlsList'], (result) => {
//       const allUrls = result.allUrlsList || {};
//       let thisUrl = allUrls[newDomain] || {};
//       thisUrl['prevTimeStamp'] = Date.now();
//       thisUrl['totalActiveTime'] = thisUrl['totalActiveTime'] || 0;
//       thisUrl['interactionCount'] = thisUrl['interactionCount'] + 1 || 1;
//       if(!thisUrl['category']) thisUrl['category'] = getDomainCategory(newDomain);
//       allUrls[newDomain] = thisUrl;
//       chrome.storage.local.set({'allUrlsList' : allUrls});
//       console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
//     })
//     tab['domain'] = newDomain;
//     tabsList[tabId] = tab;
//     console.log("new domain: " + tab['domain']);
//     chrome.storage.local.set({tabsList: tabsList});
//   })
// }
const urlChanged = async (tabId: number, newDomain: string, time: number) => {
  // Fetch current tabs list
  const { tabsList = {} } = await chrome.storage.local.get("tabsList");
  const tab = tabsList[tabId] || {};
  const prevDomain = tab.domain || "";

  // If the domain hasn't changed, no need to proceed
  if (prevDomain === newDomain) return;

  console.log(`Tab: ${tabId} URL changed from ${prevDomain} to ${newDomain}`);

  // Fetch allUrlsList only once
  const { allUrlsList = {} } = await chrome.storage.local.get("allUrlsList");

  // ✅ Update previous domain's active time
  if (prevDomain) {
    let thisUrl = allUrlsList[prevDomain] || {};
    let prevTimeStamp = thisUrl["prevTimeStamp"] || Date.now();
    
    console.log(`prevTimeStamp for ${prevDomain}: ${prevTimeStamp}`);
    
    let totalActiveTime = thisUrl["totalActiveTime"] || 0;
    thisUrl["totalActiveTime"] = totalActiveTime + (Date.now() - prevTimeStamp);
    thisUrl["prevTimeStamp"] = Date.now();
    thisUrl["category"] = getDomainCategory(prevDomain);
    allUrlsList[prevDomain] = thisUrl;

    console.log(`Updated total active time for ${prevDomain}: ${thisUrl["totalActiveTime"]}`);
  }

  // ✅ Update new domain's metadata
  let newUrl = allUrlsList[newDomain] || {};
  newUrl["prevTimeStamp"] = Date.now();
  newUrl["totalActiveTime"] = newUrl["totalActiveTime"] || 0;
  newUrl["interactionCount"] = (newUrl["interactionCount"] || 0) + 1;
  if (!newUrl["category"]) newUrl["category"] = getDomainCategory(newDomain);
  allUrlsList[newDomain] = newUrl;

  console.log(`yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`);

  // ✅ Update storage once
  await chrome.storage.local.set({ allUrlsList });

  // ✅ Update tabsList
  tab["domain"] = newDomain;
  tabsList[tabId] = tab;
  console.log(`New domain: ${tab["domain"]}`);
  await chrome.storage.local.set({ tabsList });
};


const tabChanged = (tabId : any) => {
  // increment the tabChangeCount
  chrome.storage.local.get('tabChangeCount', (result) => {
    let tabChangeCount = result.tabChangeCount || 0;
    tabChangeCount+=1;
    console.log(`tabChangeCount: ${tabChangeCount}`);
    chrome.storage.local.set({tabChangeCount});
    console.log("total tab changed :" + tabChangeCount);
  })
  // include this timestamp in the tabSiwtchHistory
  chrome.storage.local.get(['tabSwitchHistory'], results => {
    let tabSwitchHistory = results.tabSwitchHistory || [];
    tabSwitchHistory.push(Date.now());
    chrome.storage.local.set({tabSwitchHistory});
    console.log(tabSwitchHistory);
  })
  // maintain the prevTabId variable
  chrome.storage.local.get('prevTabId', (result) => {
    let prevTabId = result.prevTabId || -1;
    if(prevTabId === -1) {
      console.log("prevTabId is -1");
      chrome.storage.local.set({prevTabId: tabId});
    }
    else {
      // retreive the url in the prevtabId and update its prevTimeStamp and totalTime
      chrome.storage.local.get(['tabsList'], (result) => {
        const tabsList = result.tabsList || {};
        const tab = tabsList[prevTabId] || {};
        const domain = tab['domain'] || "";
        chrome.storage.local.get(['allUrlsList'], (result) => {
          const allUrls = result.allUrlsList || {};
          let thisUrl = allUrls[domain] || {};
          console.log("printing the prev URL details");
          console.log(thisUrl);
          let prevTimeStamp = thisUrl['prevTimeStamp'];
          let totalActiveTime = thisUrl['totalActiveTime'];
          console.log('prevTimestamp for ' + domain + ' is ' + prevTimeStamp);
          console.log('current timestamp is ' + Date.now());
          console.log('last active time duration for ' + domain + ' is ' + (Date.now() - prevTimeStamp));
          thisUrl['totalActiveTime'] = totalActiveTime + (Date.now() - prevTimeStamp);
          thisUrl['prevTimeStamp'] = Date.now();
          thisUrl['category'] = getDomainCategory(domain);
          allUrls[domain] = thisUrl;
          chrome.storage.local.set({'allUrlsList' : allUrls});
          console.log('total active time for ' + domain + ' is ' + thisUrl['totalActiveTime']);
          console.log("printing the prev URL details after changes");
          console.log(thisUrl);
        })
      })
      chrome.storage.local.set({prevTabId: tabId});
    }
  })
  
}

const addTotalActiveTime = () => {
  // Fetch both totalActiveTime and prevtime together
  chrome.storage.local.get(["totalActiveTime", "prevtime"], (result) => {
    const now = Date.now();
    const totalActiveTime = result.totalActiveTime || 0; // Default to 0
    const prevtime = result.prevtime || now; // Default prevtime to 'now' if unset

    // Update total active time
    const updatedTotalActiveTime = totalActiveTime + (now - prevtime);

    // Save updated values
    chrome.storage.local.set({
      totalActiveTime: updatedTotalActiveTime,
      prevtime: now // Update prevtime to current time
    });

    console.log("Total Active Time:", updatedTotalActiveTime);
  });
}

// const tabActivated = (tabId : any) => {
//   chrome.storage.local.get(['tabsList'], (result) => {
//     const tabsList = result.tabsList || {};
//     const tab = tabsList[tabId] || {};
//     chrome.tabs.get(tabId).then((thistab) => {
//       const url = thistab.url;
//       const domain = extractDomain(url || " ");
//       if(!domain) return;
//       tab['domain'] = domain;
//       tabsList[thistab.id!] = tab;
//       chrome.storage.local.set({tabsList: tabsList});
//       // update the timestamp for this domain
//       if(domain !== null){
//         chrome.storage.local.get(['allUrlsList'], (result) => {
//           const allUrls = result.allUrlsList || {};
//           const thisUrl = allUrls[domain!] || {};
//           thisUrl['prevTimeStamp'] = Date.now();
//           console.log('prevTimeStamp for this newly opened url ' + domain + ' is ' + thisUrl['prevTimeStamp']);
//           thisUrl['totalActiveTime'] = thisUrl['totalActiveTime'] || 0;
//           thisUrl['interactonCount'] = thisUrl['interactionCount'] + 1 || 1;
//           if(!thisUrl['category']) thisUrl['category'] = getDomainCategory(domain);
//           allUrls[domain!] = thisUrl;
//           console.log('newly updated details for the newly activated tab: ')
//           console.log(thisUrl);
//           chrome.storage.local.set({allUrlsList : allUrls});
//         })
//       }
//     })
//   })
// }
const tabActivated = (tabId: number) => {
  chrome.storage.local.get(["tabsList"], (result) => {
    const tabsList = result.tabsList || {};
    const tab = tabsList[tabId] || {};

    chrome.tabs.get(tabId, (thistab) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching tab details:", chrome.runtime.lastError);
        return;
      }

      const url = thistab.url || " ";
      const domain = extractDomain(url);

      if (!domain) return;

      // Store domain in tabsList
      tab["domain"] = domain;
      tabsList[thistab.id!] = tab;
      chrome.storage.local.set({ tabsList });

      // Update allUrlsList
      chrome.storage.local.get(["allUrlsList"], async (result) => {
        const allUrls = result.allUrlsList || {};
        const thisUrl = allUrls[domain] || {};

        thisUrl["prevTimeStamp"] = Date.now();
        console.log(`prevTimeStamp for newly opened URL (${domain}):`, thisUrl["prevTimeStamp"]);

        thisUrl["totalActiveTime"] = thisUrl["totalActiveTime"] || 0;
        thisUrl["interactionCount"] = (thisUrl["interactionCount"] || 0) + 1;

        if (!thisUrl["category"]) thisUrl["category"] = getDomainCategory(domain);

        allUrls[domain] = thisUrl;
        console.log("Updated details for activated tab:", thisUrl);

        await chrome.storage.local.set({ allUrlsList: allUrls });
        chrome.storage.local.get(['allUrlsList'], (result) => {
          console.log(result);
        })
      });
    });
  });
};


const updatePrevTimeStamp = () => {
  chrome.storage.local.get(['tabsList'], (result) => {
    const tabsList = result.tabsList || {};
    const prevtabId = chrome.storage.local.get(['prevTabId']);
    const tab = tabsList['prevTabId'] || {};
    const domain = tab['domain'] || "";
    chrome.storage.local.get(['allUrlsList'], (res) => {
      const allUrls = res.allUrlsList || {};
      let thisUrl = allUrls[domain] || {};
      let prevTimeStamp = thisUrl.prevTimeStamp || Date.now();
      let totalActiveTime = thisUrl.totalActiveTime || 0;
      thisUrl['totalActiveTime'] = totalActiveTime + (Date.now() - prevTimeStamp);
      thisUrl['prevTimeStamp'] = Date.now();
      thisUrl['category'] = thisUrl['category'] || getDomainCategory(domain);
      allUrls[domain] = thisUrl;
      chrome.storage.local.set({'allUrlsList' : allUrls});
      console.log("inside update prev time stamp call from idle state")
      console.log('total active time for ' + domain + ' is ' + thisUrl['totalActiveTime']);
    })
  })
}




chrome.tabs.onActivated.addListener(
  (activeInfo) => {
    console.log("activated");
    const tab = chrome.tabs.get(activeInfo.tabId).then((tab) => {
      // console.log(tab);
      // update the timestamp for the newly activated tab/url
      lastTabId = activeInfo.tabId;
      tabActivated(tab.id as number);
      setTimeout(() => {
        tabChanged(tab.id as number);
        console.log("timeout of 3 seconds over")
      }, 3000) // update prevTabId and totalActiveTime for the previous tab
    });
  }
)

chrome.tabs.onRemoved.addListener(
  (activeInfo) => {
    console.log('removed');
    console.log(activeInfo);
  }
)

chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    if (tabId !== lastTabId ) {
      console.log(`Ignoring URL change for tab ${tabId} because it is not the active tab.`);
      return;
    }
    if (changeInfo.url) {
      const domain = extractDomain(changeInfo.url) || "";
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx");
      // console.log(`Tab: ${tabId} URL changed to ${changeInfo.url}`);
      console.log(domain);
      console.log(Date.now());
      urlChanged(tabId, domain, Date.now());
    }
  }
)

chrome.idle.onStateChanged.addListener(
  (state) => {
    console.log("###################################################")
    console.log('state changed');
    console.log(Date.now());
    console.log(state);
    if(state === 'idle') {
      updatePrevTimeStamp();
      addTotalActiveTime();
      stopActiveTimeUpdater();
    }
    if(state === 'active') {
      chrome.storage.local.set({prevtime: Date.now()});
      startActiveTimeUpdater(120000)
    }
    console.log("###################################################")
  }
)

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser started, initializing prevtime...");
  chrome.storage.local.set({ prevtime: Date.now() });
  chrome.tabs.query({active: true, currentWindow: true}).then((results) => {
    const [tab] = results;
    chrome.storage.local.set({prevTabId : tab.url});
    console.log('prevTabId set to ' + tab.url);
  })

  startActiveTimeUpdater(120000); // Start interval on browser startup
});




chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension Installed or Updated");
  if (details.reason === "install") {
    console.log("Extension installed for the first time");

    chrome.storage.local.set({
      prevtime: Date.now(), // Initialize prevtime
      totalActiveTime: 0,  // Initialize total active time
      isFirstInstall: true, // Flag to detect first install
      sessionStartTime : Date.now(),
    }, () => {
      console.log("Default values initialized in storage.");
    });
  } else if (details.reason === "update") {
    // Handle updates
    console.log("Extension updated to a new version");
  }
});

