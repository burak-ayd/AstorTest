# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:
/ android/app/proguard-rules.pro - KOMPLİT KORUMA
# React Native Vector Icons - KOMPLE KORUMA
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**
-keepclassmembers class com.oblador.vectoricons.** { *; }

# Expo Vector Icons
-keep class expo.modules.vectoricons.** { *; }
-dontwarn expo.modules.vectoricons.**
-keepclassmembers class expo.modules.vectoricons.** { *; }

# Font yükleme sınıfları - TÜM KORUMA
-keep class android.graphics.Typeface { *; }
-keep class * extends android.graphics.Typeface { *; }
-keepclassmembers class android.graphics.Typeface { *; }

# Asset Manager - ÇOK ÖNEMLİ
-keep class android.content.res.AssetManager { *; }
-keepclassmembers class android.content.res.AssetManager { *; }

# React Native Text rendering
-keep class com.facebook.react.views.text.** { *; }
-keepclassmembers class com.facebook.react.views.text.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# Font resource koruma
-keep class **.R$*
-keep class **.R { public static <fields>; }
-keepclassmembers class **.R$* { public static <fields>; }

# Font names koruma
-keepnames class ** { *** *font*; *** *Font*; *** *FONT*; }

# Font attributes
-keepattributes *Font*
-keepattributes *Typeface*
-keepattributes Signature
-keepattributes *Annotation*

# Bundle assets
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }