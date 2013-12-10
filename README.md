#Democratree

This is the main repo for the Democratree mobile app

Alpha builds will be posted [here](http://jakexks.github.io/democratree)

##Build Instructions

Covering Android only for the moment!

Quick step by step:

1. Install the Android SDK
2. Install Ant
3. Install node.js, npm
4. Install cordova
5. Clone repo
6. Create the cordova project
7. Build!
 
### Detailed Instructions

#### Installing the Android SDK

1. Install the [SDK Manager](http://dl.google.com/android/installer_r22.3-windows.exe)
2. Run the SDK manager and install the tools, platform tools, and every API >= Android 4.0
3. Add the `tools` and `platform-tools` directory to your PATH
4. Install the JDK
5. set `JAVA_HOME` to the jdk path

#### Installing Ant

1. Download [Ant](http://ant.apache.org/bindownload.cgi)
2. Add `ANT_HOME` to your environment variables
3. Add `ANT_HOME` `\bin` to your PATH

#### Install node.js

1. Install [node.js](http://nodejs.org/)

#### Install cordova

1. run `npm install -g cordova`

#### Clone Repo

1. Install github for windows
2. Click "Clone in Windows" on the repo page

#### Create Project and build

1. Open "Git shell"
2. run `cordova create democratree uk.co.democratree Democratree`
3. run `cd democratree; git reset --hard; cordova platform add android`
4. run `cordova build`
