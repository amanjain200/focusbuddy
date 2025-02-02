
# FocusBuddy Extension

FocusBuddy is an intelligent browser extension designed to help you track your focus and improve productivity. It provides detailed insights into your browsing behavior, tracks time spent on websites, and helps you identify productive vs. distracting activities. The extension also offers AI-powered insights with the powerful **Llama-3.3-70b-versatile model** to give personalized recommendations on how to stay focused and improve your productivity.

## Features

### 1. **Focus Metrics Tracking**  
   Track your focus by monitoring the time spent on different websites and categories.  
   - **Tab Switching:** Monitor how often you switch between tabs and websites.  
   - **Time on Site:** Keep track of how much time is spent on individual websites.
   - **Visited Domains Tracking:** All domains you visit are tracked and categorized based on activity patterns, helping you analyze your browsing habits.
   - **Domain Categorization:** Domains are categorized based on predefined patterns, such as productive, distracting, or neutral. This helps you understand how much time is spent on various types of websites.
   - **Domain Visit Frequency:** FocusBuddy tracks how often you visit each domain, giving insights into whether you're repeatedly visiting distracting websites or staying focused on productive tasks.

### 2. **Distraction Analysis**  
   Analyze your browsing behavior to identify distractions.  
   - **Distraction Categories:** Classify websites into **productive** or **distracting** categories based on the user’s activity.
   - **Real-Time Feedback:** Provides suggestions to minimize distractions and boost productivity.

### 3. **AI-Powered Insights**  
   Gain actionable insights with the help of AI using the **Llama-3.3-70b-versatile model**.  
   - **Behavior Analysis:** Get AI-driven suggestions based on your browsing patterns to optimize your productivity.
   - **Privacy-Focused:** Only domain-level data is provided to the AI model, ensuring that no personal information is shared. The data is **safe and privacy-conscious**.

### 4. **Real-Time Analytics**  
   Visualize your productivity and track progress with dynamic, real-time charts.  
   - **Time Spent vs Categories Pie Chart:** Displays the time spent on different categories of websites.
   - **Distraction vs Focus Pie Chart:** Visualizes your time split between productive and distracting websites.
   - **Domain Active Time Bar Chart:** Shows how much time was spent on individual domains.
   - **Tab Switching Chart:** Provides insights into how often tabs are switched during browsing sessions.

### 5. **Top 10 Domains Based on Active Time**  
   View the **top 10 domains** based on the total active time spent.  
   - **Insights into High-Activity Domains:** Identify where most of your time is being spent and make informed decisions on how to improve focus.

### 6. **Efficient Event-Driven Data Collection**  
   The extension uses an **event-driven model** for tracking, which is efficient and ensures that no unnecessary data is collected.  
   - **Optimized Data Collection:** Only collects relevant browsing behavior data using **Chrome's native APIs** (Manifest V3).  
   - **Lightweight:** Not an overkill. It only collects the data that's meaningful, ensuring minimal performance impact.

### 7. **Privacy Focused**  
   - **No Personal Information Collected:** FocusBuddy **does not collect** any personal information.  
   - **Only Domains Tracked:** The extension tracks **domains** (not specific websites) to ensure privacy and security.  
   - **Safe for Privacy:** All data collected is stored **locally** and used **only for analysis** within the extension.

---

## How It Works

1. **Install the Extension:** Add **FocusBuddy** to your browser and enable it.
2. **Track Your Time:** As you browse, FocusBuddy monitors and logs your time spent on websites using **Chrome's native APIs**.
3. **Analyze & Improve:** Get real-time insights into your productivity and distractions.
4. **AI Insights:** The **Llama-3.3-70b-versatile model** provides personalized suggestions based on your browsing data (using only domain-level data).
5. **Visualize Your Progress:** Use the four built-in visualizations to track time spent, focus vs. distraction, domain activity, and tab switching behavior.

---

This version is more **privacy-focused, efficient, and sleek**, ensuring that it helps users track their productivity and improve without compromising their privacy. Let me know if you need more adjustments! 🚀

## Getting started

1. When you're using Windows run this:
   - `git config --global core.eol lf`
   - `git config --global core.autocrlf input`

   **This will set the EOL (End of line) character to be the same as on Linux/macOS. Without this, our bash script won't work, and you will have conflicts with developers on Linux/macOS.**
2. Clone this repository.
3. Check your node version is >= than in `.nvmrc` file, recommend to use [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#intro)
4. Edit `/packages/i18n/locales/`{your locale(s)}/`messages.json`
5. In the objects `extensionDescription` and `extensionName`, change the `message` fields (leave `description` alone)
6. In `/.package.json`, change the `version` to the desired version of your extension.
7. Install pnpm globally: `npm install -g pnpm` (check your node version >= 22.12.0))
8. Run `pnpm install`

Then, depending on the target browser:

### For Chrome: <a name="getting-started-chrome"></a>

1. Run:
    - Dev: `pnpm dev` (on Windows, you should run as administrator; see [issue#456](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/456))
    - Prod: `pnpm build`
2. Open in browser - `chrome://extensions`
3. Check - <kbd>Developer mode</kbd>
4. Click - <kbd>Load unpacked</kbd> in the upper left corner
5. Select the `dist` directory from the boilerplate project

### For Firefox: <a name="getting-started-firefox"></a>

1. Run:
    - Dev: `pnpm dev:firefox`
    - Prod: `pnpm build:firefox`
2. Open in browser - `about:debugging#/runtime/this-firefox`
3. Click - <kbd>Load Temporary Add-on...</kbd> in the upper right corner
4. Select the `./dist/manifest.json` file from the boilerplate project

> [!NOTE]
> In Firefox, you load add-ons in temporary mode. That means they'll disappear after each browser close. You have to load the add-on on every browser launch.

### We used the boilerplate code from https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite


# Screenshots
![Demo Screenshot 1](screenshots\scr1.png)
![Demo Screenshot 2](screenshots\scr2.png)
![Demo Screenshot 3](screenshots\scr3.png)
![Demo Screenshot 4](screenshots\scr4.png)
![Demo Screenshot 5](screenshots\scr5.png)
![Demo Screenshot 6](screenshots\scr6.png)
![Demo Screenshot 7](screenshots\scr7.png)