# Guide: Converting Web App to Offline Android APK

This guide will help you convert your web application into an offline-capable Android APK. This is particularly useful for Progressive Web Apps (PWAs) or React/Vue/Angular applications that you want to run as native Android apps.

## Prerequisites

1. Install the following software:
   - [Android Studio](https://developer.android.com/studio)
   - [Node.js and npm](https://nodejs.org/)
   - [Java Development Kit (JDK) 17](https://adoptium.net/)

## Step 1: Prepare Your Web App

1. Make sure your web app is built with relative paths:
   ```javascript
   // vite.config.js example
   export default defineConfig({
     base: './', // This ensures relative paths
     // ... other config
   })
   ```

2. Build your web app:
   ```bash
   npm install    # Install dependencies
   npm run build  # Build the project
   ```

3. Your built files should be in a `dist` or `build` directory (depending on your framework)

## Step 2: Create Android Project

1. Open Android Studio
2. Click "New Project"
3. Select "Empty Activity"
4. Configure your project:
   - Name: Your app name
   - Package name: com.yourcompany.appname
   - Language: Kotlin
   - Minimum SDK: API 21 (Android 5.0) or your preferred minimum
   - Click "Finish"

## Step 3: Configure Android Project

1. Update `gradle/wrapper/gradle-wrapper.properties`:
   ```properties
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
   ```

2. Update root `build.gradle`:
   ```gradle
   buildscript {
       ext {
           kotlin_version = '1.8.0'
       }
       dependencies {
           classpath 'com.android.tools.build:gradle:8.1.0'
           classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
       }
   }
   ```

3. Update app `build.gradle`:
   ```gradle
   android {
       namespace "com.yourcompany.appname"
       compileSdk 34
       
       defaultConfig {
           applicationId "com.yourcompany.appname"
           minSdk 21
           targetSdk 34
           // ... other config
       }
       
       compileOptions {
           sourceCompatibility JavaVersion.VERSION_17
           targetCompatibility JavaVersion.VERSION_17
       }
   }
   ```

## Step 4: Create WebView Layout

1. Replace `app/src/main/res/layout/activity_main.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
       android:layout_width="match_parent"
       android:layout_height="match_parent">

       <WebView
           android:id="@+id/webView"
           android:layout_width="match_parent"
           android:layout_height="match_parent" />

   </RelativeLayout>
   ```

## Step 5: Configure MainActivity

1. Update `app/src/main/java/com/yourcompany/appname/MainActivity.kt`:
   ```kotlin
   package com.yourcompany.appname

   import android.os.Bundle
   import android.webkit.*
   import android.util.Log
   import androidx.appcompat.app.AppCompatActivity

   class MainActivity : AppCompatActivity() {
       private lateinit var webView: WebView
       private val TAG = "MainActivity"

       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           setContentView(R.layout.activity_main)

           WebView.setWebContentsDebuggingEnabled(true)
           
           webView = findViewById(R.id.webView)
           webView.settings.apply {
               javaScriptEnabled = true
               domStorageEnabled = true
               databaseEnabled = true
               allowFileAccess = true
               allowContentAccess = true
               loadsImagesAutomatically = true
               mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
               useWideViewPort = true
               loadWithOverviewMode = true
               allowFileAccessFromFileURLs = true
               allowUniversalAccessFromFileURLs = true
           }

           webView.webViewClient = object : WebViewClient() {
               override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                   error?.let {
                       Log.e(TAG, "WebView error: ${it.description} (${it.errorCode})")
                   }
                   super.onReceivedError(view, request, error)
               }
           }

           webView.webChromeClient = object : WebChromeClient() {
               override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                   Log.d(TAG, "Console: ${consoleMessage.message()}")
                   return true
               }
           }
           
           webView.loadUrl("file:///android_asset/index.html")
       }

       override fun onBackPressed() {
           if (webView.canGoBack()) {
               webView.goBack()
           } else {
               super.onBackPressed()
           }
       }
   }
   ```

## Step 6: Copy Web App Files

1. Create the assets directory if it doesn't exist:
   ```
   app/src/main/assets/
   ```

2. Copy your web app's built files to the assets directory:
   - Copy all files from your web app's build directory (e.g., `dist` or `build`)
   - Make sure to include all JS, CSS, images, and other assets
   - The `index.html` should be directly in the assets folder

3. Verify your assets structure looks like this:
   ```
   app/src/main/assets/
   ├── index.html
   ├── assets/
   │   ├── index.[hash].js
   │   ├── index.[hash].css
   │   └── other assets...
   └── other files...
   ```

## Step 7: Update AndroidManifest.xml

1. Add necessary permissions in `app/src/main/AndroidManifest.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <manifest xmlns:android="http://schemas.android.com/apk/res/android">
       <uses-permission android:name="android.permission.INTERNET" />
       <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
       
       <application
           android:allowBackup="true"
           android:icon="@mipmap/ic_launcher"
           android:label="@string/app_name"
           android:roundIcon="@mipmap/ic_launcher_round"
           android:supportsRtl="true"
           android:theme="@style/Theme.AppTheme">
           
           <activity
               android:name=".MainActivity"
               android:exported="true">
               <intent-filter>
                   <action android:name="android.intent.action.MAIN" />
                   <category android:name="android.intent.category.LAUNCHER" />
               </intent-filter>
           </activity>
       </application>
   </manifest>
   ```

## Step 8: Build and Run

1. In Android Studio:
   - Click "Build" > "Clean Project"
   - Click "Build" > "Rebuild Project"
   - Click "Run" > "Run 'app'"

2. The APK will be generated in:
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

## Google TV Support

### Step 1: Configure TV Support

1. Update `AndroidManifest.xml` to declare TV support:
   ```xml
   <manifest xmlns:android="http://schemas.android.com/apk/res/android">
       <!-- Add TV hardware features -->
       <uses-feature
           android:name="android.hardware.touchscreen"
           android:required="false" />
       <uses-feature
           android:name="android.software.leanback"
           android:required="true" />
       <uses-feature
           android:name="android.hardware.tv"
           android:required="true" />
       
       <!-- Add CATEGORY_LEANBACK_LAUNCHER to your main activity -->
       <application
           android:banner="@drawable/tv_banner"
           android:logo="@drawable/tv_banner">
           <activity android:name=".MainActivity">
               <intent-filter>
                   <action android:name="android.intent.action.MAIN" />
                   <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
               </intent-filter>
           </activity>
       </application>
   </manifest>
   ```

2. Add TV banner (required for TV launcher):
   - Create `app/src/main/res/drawable/tv_banner.png`
   - Size should be 320x180 pixels
   - Use your app's logo/branding

### Step 2: Optimize WebView for TV

1. Update MainActivity to handle TV navigation:
   ```kotlin
   class MainActivity : AppCompatActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           
           // Enable TV-specific settings
           webView.settings.apply {
               // Increase default font size for TV viewing distance
               defaultFontSize = 24
               
               // Enable hardware acceleration
               setLayerType(View.LAYER_TYPE_HARDWARE, null)
               
               // Optimize for TV display
               loadWithOverviewMode = true
               useWideViewPort = true
           }
           
           // Handle D-pad navigation
           webView.setOnKeyListener { v, keyCode, event ->
               when (keyCode) {
                   KeyEvent.KEYCODE_DPAD_CENTER,
                   KeyEvent.KEYCODE_ENTER -> {
                       if (event.action == KeyEvent.ACTION_DOWN) {
                           webView.dispatchKeyEvent(KeyEvent(
                               event.action,
                               KeyEvent.KEYCODE_ENTER
                           ))
                           return@setOnKeyListener true
                       }
                   }
               }
               false
           }
       }
   }
   ```

### Step 3: Optimize Web App UI for TV

1. Add TV-specific CSS media queries:
   ```css
   /* TV-specific styles */
   @media tv {
     /* Increase touch targets for D-pad navigation */
     button, a, .clickable {
       min-height: 48px;
       min-width: 48px;
       padding: 12px;
       margin: 8px;
     }
     
     /* Add focus indicators for D-pad navigation */
     :focus {
       outline: 3px solid #fff;
       outline-offset: 2px;
     }
     
     /* Larger text for viewing distance */
     body {
       font-size: 1.5em;
     }
     
     /* Optimize layout for landscape orientation */
     .container {
       max-width: 90vw;
       margin: 0 auto;
     }
   }
   ```

2. Implement D-pad navigation support in JavaScript:
   ```javascript
   // Add this to your main JavaScript file
   if (matchMedia('tv').matches) {
     // Initialize focusable elements
     const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
     
     // Set initial focus
     document.addEventListener('DOMContentLoaded', () => {
       const firstFocusable = document.querySelector(focusableElements);
       if (firstFocusable) firstFocusable.focus();
     });
     
     // Handle D-pad navigation
     document.addEventListener('keydown', (e) => {
       switch(e.key) {
         case 'ArrowUp':
         case 'ArrowDown':
         case 'ArrowLeft':
         case 'ArrowRight':
           // Handle spatial navigation
           break;
         case 'Enter':
           // Simulate click on focused element
           document.activeElement.click();
           break;
       }
     });
   }
   ```

### Step 4: Performance Optimization for TV

1. Optimize asset loading:
   ```kotlin
   webView.settings.apply {
       // Cache optimization
       setAppCacheEnabled(true)
       setAppCachePath(applicationContext.cacheDir.absolutePath)
       cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
       
       // Enable hardware acceleration
       setLayerType(View.LAYER_TYPE_HARDWARE, null)
   }
   ```

2. Handle memory constraints:
   ```kotlin
   override fun onTrimMemory(level: Int) {
       super.onTrimMemory(level)
       if (level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE) {
           webView.clearCache(false)
       }
   }
   ```

### Step 5: Testing on Google TV

1. Test on real TV devices or emulators:
   - Use Android Studio's TV emulator
   - Test with different TV resolutions (1080p, 4K)
   - Verify D-pad navigation works correctly
   - Check text readability at typical viewing distances

2. Common TV-specific issues to check:
   - Overscan: Add padding to prevent content from being cut off
   - Text readability: Ensure text is large enough
   - Focus states: Verify focus indicators are visible
   - Performance: Check for smooth scrolling and animations
   - Memory usage: Monitor for memory leaks and excessive usage

### Step 6: Publishing for Google TV

1. Update app store listing:
   - Add TV screenshots (1920x1080 or higher)
   - Create compelling TV banner image
   - Mention TV support in description
   - Add TV-specific features to listing

2. Required TV assets:
   ```
   app/src/main/res/
   ├── drawable-xhdpi/
   │   └── tv_banner.png (320x180)
   ├── drawable-xxhdpi/
   │   └── tv_banner.png (640x360)
   └── drawable-xxxhdpi/
       └── tv_banner.png (960x540)
   ```

3. TV-specific manifest tags:
   ```xml
   <manifest>
       <uses-feature android:name="android.software.leanback" android:required="false" />
       <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
   </manifest>
   ```

### Best Practices for TV Apps

1. Navigation:
   - Implement proper D-pad navigation
   - Make focus visible and intuitive
   - Avoid complex touch gestures

2. UI/UX:
   - Use large, readable text
   - Implement proper overscan margins
   - Design for landscape orientation
   - Use high-contrast colors
   - Make clickable elements large

3. Performance:
   - Optimize image loading
   - Minimize memory usage
   - Cache assets effectively
   - Handle low-memory situations

4. Testing:
   - Test on multiple TV sizes
   - Verify remote control navigation
   - Check performance on lower-end devices
   - Test different network conditions

Remember that TV apps have different user expectations and interaction patterns compared to mobile apps. Focus on creating a lean-back experience that's easy to navigate with a remote control.

## Troubleshooting

1. If you see a blank page:
   - Check the Android Studio Logcat for errors
   - Verify all assets are copied correctly
   - Make sure paths in index.html are relative
   - Enable WebView debugging and check Chrome DevTools

2. If you have path issues:
   - Make sure your web app is built with relative paths
   - Update any absolute paths in your code to be relative
   - Check that all referenced files exist in the assets folder

3. If you have JavaScript errors:
   - Enable WebView debugging
   - Connect to chrome://inspect in Chrome
   - Check the console for errors

## Notes

- This setup creates a debug build. For production, you'll need to:
  - Generate a signed APK
  - Optimize assets
  - Configure ProGuard rules
  - Update versionCode and versionName in build.gradle
  - Remove debugging settings

- For better performance:
  - Minimize your web app bundle size
  - Optimize images and assets
  - Consider using a service worker for caching
  - Test thoroughly on different Android versions

Remember to test your app thoroughly on different Android versions and device sizes before releasing.
