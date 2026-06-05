package com.fanshanng.aichatpocket

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray

data class SharedImageItem(
  val uri: String,
  val name: String?,
  val mimeType: String?
)

class SharedImageModule(private val appContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(appContext) {

  override fun getName(): String = NAME

  @ReactMethod
  fun getInitialImages(promise: Promise) {
    promise.resolve(toArray(snapshotPendingImages()))
  }

  @ReactMethod
  fun clear() {
    synchronized(pendingImages) {
      pendingImages.clear()
    }
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by NativeEventEmitter.
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required by NativeEventEmitter.
  }

  companion object {
    private const val NAME = "SharedImage"
    private const val EVENT_SHARED_IMAGES = "SharedImages"
    private val pendingImages = linkedMapOf<String, SharedImageItem>()

    fun appendPendingImages(items: List<SharedImageItem>) {
      if (items.isEmpty()) {
        return
      }
      synchronized(pendingImages) {
        items.forEach { pendingImages[it.uri] = it }
      }
    }

    fun emitImages(reactContext: ReactContext?, items: List<SharedImageItem>) {
      if (reactContext == null || items.isEmpty()) {
        return
      }
      reactContext
        .getJSModule(ReactContext.RCTDeviceEventEmitter::class.java)
        .emit(EVENT_SHARED_IMAGES, toArray(items))
    }

    private fun snapshotPendingImages(): List<SharedImageItem> =
      synchronized(pendingImages) {
        pendingImages.values.toList()
      }

    private fun toArray(items: List<SharedImageItem>): WritableArray {
      val array = Arguments.createArray()
      items.forEach { item ->
        val map = Arguments.createMap()
        map.putString("uri", item.uri)
        map.putString("name", item.name)
        map.putString("mimeType", item.mimeType)
        array.pushMap(map)
      }
      return array
    }
  }
}
