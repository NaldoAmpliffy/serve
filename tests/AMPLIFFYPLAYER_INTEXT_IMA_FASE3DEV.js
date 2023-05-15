(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;
      
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

// Adds compatibility for ES modules
debounce.debounce = debounce;

module.exports = debounce;

},{}],2:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('video.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'video.js'], factory) :
	(factory((global.videojsIma = {}),global.videojs));
}(this, (function (exports,videojs) { 'use strict';

videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Wraps the video.js player for the plugin.
 *
 * @param {Object} player Video.js player instance.
 * @param {Object} adsPluginSettings Settings for the contrib-ads plugin.
 * @param {Controller} controller Reference to the parent controller.
 */
var PlayerWrapper = function PlayerWrapper(player, adsPluginSettings, controller) {
  /**
   * Instance of the video.js player.
   */
  this.vjsPlayer = player;

  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * Timer used to track content progress.
   */
  this.contentTrackingTimer = null;

  /**
   * True if our content video has completed, false otherwise.
   */
  this.contentComplete = false;

  /**
   * Handle to interval that repeatedly updates current time.
   */
  this.updateTimeIntervalHandle = null;

  /**
   * Interval (ms) to check for player resize for fluid support.
   */
  this.updateTimeInterval = 1000;

  /**
   * Handle to interval that repeatedly checks for seeking.
   */
  this.seekCheckIntervalHandle = null;

  /**
   * Interval (ms) on which to check if the user is seeking through the
   * content.
   */
  this.seekCheckInterval = 1000;

  /**
   * Handle to interval that repeatedly checks for player resize.
   */
  this.resizeCheckIntervalHandle = null;

  /**
   * Interval (ms) to check for player resize for fluid support.
   */
  this.resizeCheckInterval = 250;

  /**
   * Threshold by which to judge user seeking. We check every 1000 ms to see
   * if the user is seeking. In order for us to decide that they are *not*
   * seeking, the content video playhead must only change by 900-1100 ms
   * between checks. Any greater change and we assume the user is seeking
   * through the video.
   */
  this.seekThreshold = 100;

  /**
   * Content ended listeners passed by the publisher to the plugin. Publishers
   * should allow the plugin to handle content ended to ensure proper support
   * of custom ad playback.
   */
  this.contentEndedListeners = [];

  /**
   * Stores the content source so we can re-populate it manually after a
   * post-roll on iOS.
   */
  this.contentSource = '';

  /**
   * Stores the content source type so we can re-populate it manually after a
   * post-roll.
   */
  this.contentSourceType = '';

  /**
   * Stores data for the content playhead tracker.
   */
  this.contentPlayheadTracker = {
    currentTime: 0,
    previousTime: 0,
    seeking: false,
    duration: 0
  };

  /**
   * Player dimensions. Used in our resize check.
   */
  this.vjsPlayerDimensions = {
    width: this.getPlayerWidth(),
    height: this.getPlayerHeight()
  };

  /**
   * Video.js control bar.
   */
  this.vjsControls = this.vjsPlayer.getChild('controlBar');

  /**
   * Vanilla HTML5 video player underneath the video.js player.
   */
  this.h5Player = null;

  this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
  this.boundContentEndedListener = this.localContentEndedListener.bind(this);
  this.vjsPlayer.on('contentended', this.boundContentEndedListener);
  this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
  this.vjsPlayer.on('readyforpreroll', this.onReadyForPreroll.bind(this));
  this.vjsPlayer.on('adtimeout', this.onAdTimeout.bind(this));
  this.vjsPlayer.ready(this.onPlayerReady.bind(this));

  if (this.controller.getSettings().requestMode === 'onPlay') {
    this.vjsPlayer.one('play', this.controller.requestAds.bind(this.controller));
  }

  if(typeof this.vjsPlayer.ads === 'function')
    this.vjsPlayer.ads(adsPluginSettings);
};

/**
 * Set up the intervals we use on the player.
 */
PlayerWrapper.prototype.setUpPlayerIntervals = function () {
  this.updateTimeIntervalHandle = setInterval(this.updateCurrentTime.bind(this), this.updateTimeInterval);
  this.seekCheckIntervalHandle = setInterval(this.checkForSeeking.bind(this), this.seekCheckInterval);
  this.resizeCheckIntervalHandle = setInterval(this.checkForResize.bind(this), this.resizeCheckInterval);
};

/**
 * Updates the current time of the video
 */
PlayerWrapper.prototype.updateCurrentTime = function () {
  if (!this.contentPlayheadTracker.seeking) {
    this.contentPlayheadTracker.currentTime = this.vjsPlayer.currentTime();
  }
};

/**
 * Detects when the user is seeking through a video.
 * This is used to prevent mid-rolls from playing while a user is seeking.
 *
 * There *is* a seeking property of the HTML5 video element, but it's not
 * properly implemented on all platforms (e.g. mobile safari), so we have to
 * check ourselves to be sure.
 */
PlayerWrapper.prototype.checkForSeeking = function () {
  var tempCurrentTime = this.vjsPlayer.currentTime();
  var diff = (tempCurrentTime - this.contentPlayheadTracker.previousTime) * 1000;
  if (Math.abs(diff) > this.seekCheckInterval + this.seekThreshold) {
    this.contentPlayheadTracker.seeking = true;
  } else {
    this.contentPlayheadTracker.seeking = false;
  }
  this.contentPlayheadTracker.previousTime = this.vjsPlayer.currentTime();
};

/**
 * Detects when the player is resized (for fluid support) and resizes the
 * ads manager to match.
 */
PlayerWrapper.prototype.checkForResize = function () {
  var currentWidth = this.getPlayerWidth();
  var currentHeight = this.getPlayerHeight();

  if (currentWidth != this.vjsPlayerDimensions.width || currentHeight != this.vjsPlayerDimensions.height) {
    this.vjsPlayerDimensions.width = currentWidth;
    this.vjsPlayerDimensions.height = currentHeight;
    this.controller.onPlayerResize(currentWidth, currentHeight);
  }
};

/**
 * Local content ended listener for contentComplete.
 */
PlayerWrapper.prototype.localContentEndedListener = function () {
  if (!this.contentComplete) {
    this.contentComplete = true;
    this.controller.onContentComplete();
  }

  for (var index in this.contentEndedListeners) {
    if (typeof this.contentEndedListeners[index] === 'function') {
      this.contentEndedListeners[index]();
    }
  }

  clearInterval(this.updateTimeIntervalHandle);
  clearInterval(this.seekCheckIntervalHandle);
  clearInterval(this.resizeCheckIntervalHandle);
  if (this.vjsPlayer.el()) {
    this.vjsPlayer.one('play', this.setUpPlayerIntervals.bind(this));
  }
};

/**
 * Called when it's time to play a post-roll but we don't have one to play.
 */
PlayerWrapper.prototype.onNoPostroll = function () {
  this.vjsPlayer.trigger('nopostroll');
};

/**
 * Detects when the video.js player has been disposed.
 */
PlayerWrapper.prototype.playerDisposedListener = function () {
  this.contentEndedListeners = [];
  this.controller.onPlayerDisposed();

  this.contentComplete = true;
  this.vjsPlayer.off('contentended', this.boundContentEndedListener);

  // Bug fix: https://github.com/googleads/videojs-ima/issues/306
  if (this.vjsPlayer.ads.adTimeoutTimeout) {
    clearTimeout(this.vjsPlayer.ads.adTimeoutTimeout);
  }

  var intervalsToClear = [this.updateTimeIntervalHandle, this.seekCheckIntervalHandle, this.resizeCheckIntervalHandle];
  for (var index in intervalsToClear) {
    if (intervalsToClear[index]) {
      clearInterval(intervalsToClear[index]);
    }
  }
};

/**
 * Start ad playback, or content video playback in the absence of a
 * pre-roll.
 */
PlayerWrapper.prototype.onReadyForPreroll = function () {
  this.controller.onPlayerReadyForPreroll();
};

/**
 * Detects if the ad has timed out.
 */
PlayerWrapper.prototype.onAdTimeout = function () {
  this.controller.onAdTimeout();
};

/**
 * Called when the player fires its 'ready' event.
 */
PlayerWrapper.prototype.onPlayerReady = function() {
  this.h5Player =
      (top.ampTV.getElementById(
          this.getPlayerId()) || document.getElementById(
          this.getPlayerId())).getElementsByClassName('vjs-tech')[0];
    

  // Detect inline options
  if (this.h5Player.hasAttribute('autoplay')) {
    this.controller.setSetting('adWillAutoPlay', true);
  }

  // Sync ad volume with player volume.
  this.onVolumeChange();
  this.vjsPlayer.on('fullscreenchange', this.onFullscreenChange.bind(this));
  this.vjsPlayer.on('volumechange', this.onVolumeChange.bind(this));

  this.controller.onPlayerReady();
};

/**
 * Listens for the video.js player to change its fullscreen status. This
 * keeps the fullscreen-ness of the AdContainer in sync with the player.
 */
PlayerWrapper.prototype.onFullscreenChange = function () {
  if (this.vjsPlayer.isFullscreen()) {
    this.controller.onPlayerEnterFullscreen();
  } else {
    this.controller.onPlayerExitFullscreen();
  }
};

/**
 * Listens for the video.js player to change its volume. This keeps the ad
 * volume in sync with the content volume if the volume of the player is
 * changed while content is playing.
 */
PlayerWrapper.prototype.onVolumeChange = function () {
  var newVolume = this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
  this.controller.onPlayerVolumeChanged(newVolume);
};

/**
 * Inject the ad container div into the DOM.
 *
 * @param{HTMLElement} adContainerDiv The ad container div.
 */
PlayerWrapper.prototype.injectAdContainerDiv = function (adContainerDiv) {
  this.vjsControls.el().parentNode.appendChild(adContainerDiv);
};

/**
 * @return {Object} The content player.
 */
PlayerWrapper.prototype.getContentPlayer = function () {
  return this.h5Player;
};

/**
 * @return {number} The volume, 0-1.
 */
PlayerWrapper.prototype.getVolume = function () {
  return this.vjsPlayer.muted() ? 0 : this.vjsPlayer.volume();
};

/**
 * Set the volume of the player. 0-1.
 *
 * @param {number} volume The new volume.
 */
PlayerWrapper.prototype.setVolume = function (volume) {
  this.vjsPlayer.volume(volume);
  if (volume == 0) {
    this.vjsPlayer.muted(true);
  } else {
    this.vjsPlayer.muted(false);
  }
};

/**
 * Ummute the player.
 */
PlayerWrapper.prototype.unmute = function () {
  this.vjsPlayer.muted(false);
};

/**
 * Mute the player.
 */
PlayerWrapper.prototype.mute = function () {
  this.vjsPlayer.muted(true);
};

/**
 * Play the video.
 */
PlayerWrapper.prototype.play = function () {
  this.vjsPlayer.play();
};

/**
 * Toggles playback of the video.
 */
PlayerWrapper.prototype.togglePlayback = function () {
  if (this.vjsPlayer.paused()) {
    this.vjsPlayer.play();
  } else {
    this.vjsPlayer.pause();
  }
};

/**
 * Get the player width.
 *
 * @return {number} The player's width.
 */
PlayerWrapper.prototype.getPlayerWidth = function () {
  var width = (getComputedStyle(this.vjsPlayer.el()) || {}).width;

  if (!width || parseFloat(width) === 0) {
    width = (this.vjsPlayer.el().getBoundingClientRect() || {}).width;
  }

  return parseFloat(width) || this.vjsPlayer.width();
};

/**
 * Get the player height.
 *
 * @return {number} The player's height.
 */
PlayerWrapper.prototype.getPlayerHeight = function () {
  var height = (getComputedStyle(this.vjsPlayer.el()) || {}).height;

  if (!height || parseFloat(height) === 0) {
    height = (this.vjsPlayer.el().getBoundingClientRect() || {}).height;
  }

  return parseFloat(height) || this.vjsPlayer.height();
};

/**
 * @return {Object} The vjs player's options object.
 */
PlayerWrapper.prototype.getPlayerOptions = function () {
  return this.vjsPlayer.options_;
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
PlayerWrapper.prototype.getPlayerId = function () {
  return this.vjsPlayer.id();
};

/**
 * Toggle fullscreen state.
 */
PlayerWrapper.prototype.toggleFullscreen = function () {
  if (this.vjsPlayer.isFullscreen()) {
    this.vjsPlayer.exitFullscreen();
  } else {
    this.vjsPlayer.requestFullscreen();
  }
};

/**
 * Returns the content playhead tracker.
 *
 * @return {Object} The content playhead tracker.
 */
PlayerWrapper.prototype.getContentPlayheadTracker = function () {
  return this.contentPlayheadTracker;
};

/**
 * Handles ad errors.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
PlayerWrapper.prototype.onAdError = function (adErrorEvent) {
  this.vjsControls.show();
  var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
  this.vjsPlayer.trigger({ type: 'adserror', data: {
      AdError: errorMessage,
      AdErrorEvent: adErrorEvent
    } });
};

/**
 * Handles ad log messages.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the IMA SDK.
 */
PlayerWrapper.prototype.onAdLog = function (adEvent) {
  var adData = adEvent.getAdData();
  var errorMessage = adData['adError'] !== undefined ? adData['adError'].getMessage() : undefined;
  this.vjsPlayer.trigger({ type: 'adslog', data: {
      AdError: errorMessage,
      AdEvent: adEvent
    } });
};

/**
 * Handles ad break starting.
 */
PlayerWrapper.prototype.onAdBreakStart = function () {
  this.contentSource = this.vjsPlayer.currentSrc();
  this.contentSourceType = this.vjsPlayer.currentType();
  this.vjsPlayer.off('contentended', this.boundContentEndedListener);
  this.vjsPlayer.ads.startLinearAdMode();
  this.vjsControls.hide();
  this.vjsPlayer.pause();
};

/**
 * Handles ad break ending.
 */
PlayerWrapper.prototype.onAdBreakEnd = function () {
  this.vjsPlayer.on('contentended', this.boundContentEndedListener);
  if (this.vjsPlayer.ads.inAdBreak()) {
    this.vjsPlayer.ads.endLinearAdMode();
  }
  this.vjsControls.show();
};

/**
 * Handles an individual ad start.
 */
PlayerWrapper.prototype.onAdStart = function () {
  this.vjsPlayer.trigger('ads-ad-started');
};

/**
 * Handles when all ads have finished playing.
 */
PlayerWrapper.prototype.onAllAdsCompleted = function () {
  if (this.contentComplete == true) {
    // The null check on this.contentSource was added to fix
    // an error when the post-roll was an empty VAST tag.
    if (this.contentSource && this.vjsPlayer.currentSrc() != this.contentSource) {
      this.vjsPlayer.src({
        src: this.contentSource,
        type: this.contentSourceType
      });
    }
    this.controller.onContentAndAdsCompleted();
  }
};

/**
 * Triggers adsready for contrib-ads.
 */
PlayerWrapper.prototype.onAdsReady = function () {
  this.vjsPlayer.trigger('adsready');
};

/**
 * Changes the player source.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 */
PlayerWrapper.prototype.changeSource = function (contentSrc) {
  // Only try to pause the player when initialised with a source already
  if (this.vjsPlayer.currentSrc()) {
    this.vjsPlayer.currentTime(0);
    this.vjsPlayer.pause();
  }
  if (contentSrc) {
    this.vjsPlayer.src(contentSrc);
  }
  this.vjsPlayer.one('loadedmetadata', this.seekContentToZero.bind(this));
};

/**
 * Seeks content to 00:00:00. This is used as an event handler for the
 * loadedmetadata event, since seeking is not possible until that event has
 * fired.
 */
PlayerWrapper.prototype.seekContentToZero = function () {
  this.vjsPlayer.currentTime(0);
};

/**
 * Triggers an event on the VJS player
 * @param  {string} name The event name.
 * @param  {Object} data The event data.
 */
PlayerWrapper.prototype.triggerPlayerEvent = function (name, data) {
  this.vjsPlayer.trigger(name, data);
};

/**
 * Listener JSDoc for ESLint. This listener can be passed to
 * addContentEndedListener.
 * @callback listener
 */

/**
 * Adds a listener for the 'contentended' event of the video player. This should
 * be used instead of setting an 'contentended' listener directly to ensure that
 * the ima can do proper cleanup of the SDK before other event listeners are
 * called.
 * @param {listener} listener The listener to be called when content
 *     completes.
 */
PlayerWrapper.prototype.addContentEndedListener = function (listener) {
  this.contentEndedListeners.push(listener);
};

/**
 * Reset the player.
 */
PlayerWrapper.prototype.reset = function () {
  // Attempts to remove the contentEndedListener before adding it.
  // This is to prevent an error where an erroring video caused multiple
  // contentEndedListeners to be added.
  this.vjsPlayer.off('contentended', this.boundContentEndedListener);

  this.vjsPlayer.on('contentended', this.boundContentEndedListener);
  this.vjsControls.show();
  if (this.vjsPlayer.ads.inAdBreak()) {
    this.vjsPlayer.ads.endLinearAdMode();
  }
  // Reset the content time we give the SDK. Fixes an issue where requesting
  // VMAP followed by VMAP would play the second mid-rolls as pre-rolls if
  // the first playthrough of the video passed the second response's
  // mid-roll time.
  this.contentPlayheadTracker.currentTime = 0;
  this.contentComplete = false;
};

/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Ad UI implementation.
 *
 * @param {Controller} controller Plugin controller.
 * @constructor
 * @struct
 * @final
 */
var AdUi = function AdUi(controller) {
  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * Div used as an ad container.
   */
  this.adContainerDiv = document.createElement('div');

  /**
   * Div used to display ad controls.
   */
  this.controlsDiv = document.createElement('div');

  /**
   * Div used to display ad countdown timer.
   */
  this.countdownDiv = document.createElement('div');

  /**
   * Div used to display add seek bar.
   */
  this.seekBarDiv = document.createElement('div');

  /**
   * Div used to display ad progress (in seek bar).
   */
  this.progressDiv = document.createElement('div');

  /**
   * Div used to display ad play/pause button.
   */
  this.playPauseDiv = document.createElement('div');

  /**
   * Div used to display ad mute button.
   */
  this.muteDiv = document.createElement('div');

  /**
   * Div used by the volume slider.
   */
  this.sliderDiv = document.createElement('div');

  /**
   * Volume slider level visuals
   */
  this.sliderLevelDiv = document.createElement('div');

  /**
   * Div used to display ad fullscreen button.
   */
  this.fullscreenDiv = document.createElement('div');

  /**
   * Bound event handler for onMouseUp.
   */
  this.boundOnMouseUp = this.onMouseUp.bind(this);

  /**
   * Bound event handler for onMouseMove.
   */
  this.boundOnMouseMove = this.onMouseMove.bind(this);

  /**
   * Stores data for the ad playhead tracker.
   */
  this.adPlayheadTracker = {
    'currentTime': 0,
    'duration': 0,
    'isPod': false,
    'adPosition': 0,
    'totalAds': 0
  };

  /**
   * Used to prefix videojs ima controls.
   */
  this.controlPrefix = this.controller.getPlayerId() + '_';

  /**
   * Boolean flag to show or hide the ad countdown timer.
   */
  this.showCountdown = true;
  if (this.controller.getSettings().showCountdown === false) {
    this.showCountdown = false;
  }

  /**
   * Boolean flag if the current ad is nonlinear.
   */
  this.isAdNonlinear = false;

  this.createAdContainer();
};

/**
 * Creates the ad container.
 */
AdUi.prototype.createAdContainer = function () {
  this.assignControlAttributes(this.adContainerDiv, 'ima-ad-container');
  this.adContainerDiv.style.position = 'absolute';
  this.adContainerDiv.style.zIndex = 1111;
  this.adContainerDiv.addEventListener('mouseenter', this.showAdControls.bind(this), false);
  this.adContainerDiv.addEventListener('mouseleave', this.hideAdControls.bind(this), false);
  this.adContainerDiv.addEventListener('click', this.onAdContainerClick.bind(this), false);
  this.createControls();
  this.controller.injectAdContainerDiv(this.adContainerDiv);
};

/**
 * Create the controls.
 */
AdUi.prototype.createControls = function () {
  this.assignControlAttributes(this.controlsDiv, 'ima-controls-div');
  this.controlsDiv.style.width = '100%';

  if (!this.controller.getIsMobile()) {
    this.assignControlAttributes(this.countdownDiv, 'ima-countdown-div');
    this.countdownDiv.innerHTML = this.controller.getSettings().adLabel;
    this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
  } else {
    this.countdownDiv.style.display = 'none';
  }

  this.assignControlAttributes(this.seekBarDiv, 'ima-seek-bar-div');
  this.seekBarDiv.style.width = '100%';

  this.assignControlAttributes(this.progressDiv, 'ima-progress-div');

  this.assignControlAttributes(this.playPauseDiv, 'ima-play-pause-div');
  this.addClass(this.playPauseDiv, 'ima-playing');
  this.playPauseDiv.addEventListener('click', this.onAdPlayPauseClick.bind(this), false);

  this.assignControlAttributes(this.muteDiv, 'ima-mute-div');
  this.addClass(this.muteDiv, 'ima-non-muted');
  this.muteDiv.addEventListener('click', this.onAdMuteClick.bind(this), false);

  this.assignControlAttributes(this.sliderDiv, 'ima-slider-div');
  this.sliderDiv.addEventListener('mousedown', this.onAdVolumeSliderMouseDown.bind(this), false);

  // Hide volume slider controls on iOS as they aren't supported.
  if (this.controller.getIsIos()) {
    this.sliderDiv.style.display = 'none';
  }

  this.assignControlAttributes(this.sliderLevelDiv, 'ima-slider-level-div');

  this.assignControlAttributes(this.fullscreenDiv, 'ima-fullscreen-div');
  this.addClass(this.fullscreenDiv, 'ima-non-fullscreen');
  this.fullscreenDiv.addEventListener('click', this.onAdFullscreenClick.bind(this), false);

  this.adContainerDiv.appendChild(this.controlsDiv);
  this.controlsDiv.appendChild(this.countdownDiv);
  this.controlsDiv.appendChild(this.seekBarDiv);
  this.controlsDiv.appendChild(this.playPauseDiv);
  this.controlsDiv.appendChild(this.muteDiv);
  this.controlsDiv.appendChild(this.sliderDiv);
  this.controlsDiv.appendChild(this.fullscreenDiv);
  this.seekBarDiv.appendChild(this.progressDiv);
  this.sliderDiv.appendChild(this.sliderLevelDiv);
};

/**
 * Listener for clicks on the play/pause button during ad playback.
 */
AdUi.prototype.onAdPlayPauseClick = function () {
  this.controller.onAdPlayPauseClick();
};

/**
 * Listener for clicks on the play/pause button during ad playback.
 */
AdUi.prototype.onAdMuteClick = function () {
  this.controller.onAdMuteClick();
};

/**
 * Listener for clicks on the fullscreen button during ad playback.
 */
AdUi.prototype.onAdFullscreenClick = function () {
  this.controller.toggleFullscreen();
};

/**
 * Show pause and hide play button
 */
AdUi.prototype.onAdsPaused = function () {
  this.controller.sdkImpl.adPlaying = false;
  this.addClass(this.playPauseDiv, 'ima-paused');
  this.removeClass(this.playPauseDiv, 'ima-playing');
  this.showAdControls();
};

/**
 * Show pause and hide play button
 */
AdUi.prototype.onAdsResumed = function () {
  this.onAdsPlaying();
  this.showAdControls();
};

/**
 * Show play and hide pause button
 */
AdUi.prototype.onAdsPlaying = function () {
  this.controller.sdkImpl.adPlaying = true;
  this.addClass(this.playPauseDiv, 'ima-playing');
  this.removeClass(this.playPauseDiv, 'ima-paused');
};

/**
 * Takes data from the controller to update the UI.
 *
 * @param {number} currentTime Current time of the ad.
 * @param {number} remainingTime Remaining time of the ad.
 * @param {number} duration Duration of the ad.
 * @param {number} adPosition Index of the ad in the pod.
 * @param {number} totalAds Total number of ads in the pod.
 */
AdUi.prototype.updateAdUi = function (currentTime, remainingTime, duration, adPosition, totalAds) {
  // Update countdown timer data
  var remainingMinutes = Math.floor(remainingTime / 60);
  var remainingSeconds = Math.floor(remainingTime % 60);
  if (remainingSeconds.toString().length < 2) {
    remainingSeconds = '0' + remainingSeconds;
  }
  var podCount = ': ';
  if (totalAds > 1) {
    podCount = ' (' + adPosition + ' ' + this.controller.getSettings().adLabelNofN + ' ' + totalAds + '): ';
  }
  this.countdownDiv.innerHTML = this.controller.getSettings().adLabel + podCount + remainingMinutes + ':' + remainingSeconds;

  // Update UI
  var playProgressRatio = currentTime / duration;
  var playProgressPercent = playProgressRatio * 100;
  this.progressDiv.style.width = playProgressPercent + '%';
};

/**
 * Handles UI changes when the ad is unmuted.
 */
AdUi.prototype.unmute = function () {
  this.addClass(this.muteDiv, 'ima-non-muted');
  this.removeClass(this.muteDiv, 'ima-muted');
  this.sliderLevelDiv.style.width = this.controller.getPlayerVolume() * 100 + '%';
};

/**
 * Handles UI changes when the ad is muted.
 */
AdUi.prototype.mute = function () {
  this.addClass(this.muteDiv, 'ima-muted');
  this.removeClass(this.muteDiv, 'ima-non-muted');
  this.sliderLevelDiv.style.width = '0%';
};

/*
 * Listener for mouse down events during ad playback. Used for volume.
 */
AdUi.prototype.onAdVolumeSliderMouseDown = function () {
  document.addEventListener('mouseup', this.boundOnMouseUp, false);
  document.addEventListener('mousemove', this.boundOnMouseMove, false);
};

/*
 * Mouse movement listener used for volume slider.
 */
AdUi.prototype.onMouseMove = function (event) {
  this.changeVolume(event);
};

/*
 * Mouse release listener used for volume slider.
 */
AdUi.prototype.onMouseUp = function (event) {
  this.changeVolume(event);
  document.removeEventListener('mouseup', this.boundOnMouseUp);
  document.removeEventListener('mousemove', this.boundOnMouseMove);
};

/*
 * Utility function to set volume and associated UI
 */
AdUi.prototype.changeVolume = function (event) {
  var percent = (event.clientX - this.sliderDiv.getBoundingClientRect().left) / this.sliderDiv.offsetWidth;
  percent *= 100;
  // Bounds value 0-100 if mouse is outside slider region.
  percent = Math.min(Math.max(percent, 0), 100);
  this.sliderLevelDiv.style.width = percent + '%';
  if (this.percent == 0) {
    this.addClass(this.muteDiv, 'ima-muted');
    this.removeClass(this.muteDiv, 'ima-non-muted');
  } else {
    this.addClass(this.muteDiv, 'ima-non-muted');
    this.removeClass(this.muteDiv, 'ima-muted');
  }
  this.controller.setVolume(percent / 100); // 0-1
};

/**
 * Show the ad container.
 */
AdUi.prototype.showAdContainer = function () {
  this.adContainerDiv.style.display = 'block';
};

/**
 * Hide the ad container
 */
AdUi.prototype.hideAdContainer = function () {
  this.adContainerDiv.style.display = 'none';
};

/**
 * Handles clicks on the ad container
 */
AdUi.prototype.onAdContainerClick = function () {
  if (this.isAdNonlinear) {
    this.controller.togglePlayback();
  }
};

/**
 * Resets the state of the ad ui.
 */
AdUi.prototype.reset = function () {
  this.hideAdContainer();
};

/**
 * Handles ad errors.
 */
AdUi.prototype.onAdError = function () {
  this.hideAdContainer();
};

/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
AdUi.prototype.onAdBreakStart = function (adEvent) {
  this.showAdContainer();

  var contentType = adEvent.getAd().getContentType();
  if (contentType === 'application/javascript' && !this.controller.getSettings().showControlsForJSAds) {
    this.controlsDiv.style.display = 'none';
  } else {
    this.controlsDiv.style.display = 'block';
  }
  this.onAdsPlaying();
  // Start with the ad controls minimized.
  this.hideAdControls();
};

/**
 * Handles ad break ending.
 */
AdUi.prototype.onAdBreakEnd = function () {
  var currentAd = this.controller.getCurrentAd();
  if (currentAd == null || // hide for post-roll only playlist
  currentAd.isLinear()) {
    // don't hide for non-linear ads
    this.hideAdContainer();
  }
  this.controlsDiv.style.display = 'none';
  this.countdownDiv.innerHTML = '';
};

/**
 * Handles when all ads have finished playing.
 */
AdUi.prototype.onAllAdsCompleted = function () {
  this.hideAdContainer();
};

/**
 * Handles when a linear ad starts.
 */
AdUi.prototype.onLinearAdStart = function () {
  // Don't bump container when controls are shown
  this.removeClass(this.adContainerDiv, 'bumpable-ima-ad-container');
  this.isAdNonlinear = false;
};

/**
 * Handles when a non-linear ad starts.
 */
AdUi.prototype.onNonLinearAdLoad = function () {
  // For non-linear ads that show after a linear ad. For linear ads, we show the
  // ad container in onAdBreakStart to prevent blinking in pods.
  this.adContainerDiv.style.display = 'block';
  // Bump container when controls are shown
  this.addClass(this.adContainerDiv, 'bumpable-ima-ad-container');
  this.isAdNonlinear = true;
};

AdUi.prototype.onPlayerEnterFullscreen = function () {
  this.addClass(this.fullscreenDiv, 'ima-fullscreen');
  this.removeClass(this.fullscreenDiv, 'ima-non-fullscreen');
};

AdUi.prototype.onPlayerExitFullscreen = function () {
  this.addClass(this.fullscreenDiv, 'ima-non-fullscreen');
  this.removeClass(this.fullscreenDiv, 'ima-fullscreen');
};

/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
AdUi.prototype.onPlayerVolumeChanged = function (volume) {
  if (volume == 0) {
    this.addClass(this.muteDiv, 'ima-muted');
    this.removeClass(this.muteDiv, 'ima-non-muted');
    this.sliderLevelDiv.style.width = '0%';
  } else {
    this.addClass(this.muteDiv, 'ima-non-muted');
    this.removeClass(this.muteDiv, 'ima-muted');
    this.sliderLevelDiv.style.width = volume * 100 + '%';
  }
};

/**
 * Shows ad controls on mouseover.
 */
AdUi.prototype.showAdControls = function () {
  var _controller$getSettin = this.controller.getSettings(),
      disableAdControls = _controller$getSettin.disableAdControls;

  if (!disableAdControls) {
    this.addClass(this.controlsDiv, 'ima-controls-div-showing');
  }
};

/**
 * Hide the ad controls.
 */
AdUi.prototype.hideAdControls = function () {
  this.removeClass(this.controlsDiv, 'ima-controls-div-showing');
};

/**
 * Assigns the unique id and class names to the given element as well as the
 * style class.
 * @param {HTMLElement} element Element that needs the controlName assigned.
 * @param {string} controlName Control name to assign.
 */
AdUi.prototype.assignControlAttributes = function (element, controlName) {
  element.id = this.controlPrefix + controlName;
  element.className = this.controlPrefix + controlName + ' ' + controlName;
};

/**
 * Returns a regular expression to test a string for the given className.
 *
 * @param {string} className The name of the class.
 * @return {RegExp} The regular expression used to test for that class.
 */
AdUi.prototype.getClassRegexp = function (className) {
  // Matches on
  // (beginning of string OR NOT word char)
  // classname
  // (negative lookahead word char OR end of string)
  return new RegExp('(^|[^A-Za-z-])' + className + '((?![A-Za-z-])|$)', 'gi');
};

/**
 * Returns whether or not the provided element has the provied class in its
 * className.
 * @param {HTMLElement} element Element to tes.t
 * @param {string} className Class to look for.
 * @return {boolean} True if element has className in class list. False
 *     otherwise.
 */
AdUi.prototype.elementHasClass = function (element, className) {
  var classRegexp = this.getClassRegexp(className);
  return classRegexp.test(element.className);
};

/**
 * Adds a class to the given element if it doesn't already have the class
 * @param {HTMLElement} element Element to which the class will be added.
 * @param {string} classToAdd Class to add.
 */
AdUi.prototype.addClass = function (element, classToAdd) {
  element.className = element.className.trim() + ' ' + classToAdd;
};

/**
 * Removes a class from the given element if it has the given class
 *
 * @param {HTMLElement} element Element from which the class will be removed.
 * @param {string} classToRemove Class to remove.
 */
AdUi.prototype.removeClass = function (element, classToRemove) {
  var classRegexp = this.getClassRegexp(classToRemove);
  element.className = element.className.trim().replace(classRegexp, '');
};

/**
 * @return {HTMLElement} The div for the ad container.
 */
AdUi.prototype.getAdContainerDiv = function () {
  return this.adContainerDiv;
};

/**
 * Changes the flag to show or hide the ad countdown timer.
 *
 * @param {boolean} showCountdownIn Show or hide the countdown timer.
 */
AdUi.prototype.setShowCountdown = function (showCountdownIn) {
  this.showCountdown = showCountdownIn;
  this.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
};

var name = "videojs-ima";
var version = "2.1.0";
var license = "Apache-2.0";
var main = "./dist/videojs.ima.js";
var module$1 = "./dist/videojs.ima.es.js";
var author = { "name": "Google Inc." };
var engines = { "node": ">=0.8.0" };
var scripts = { "contBuild": "watch 'npm run rollup:max' src", "predevServer": "echo \"Starting up server on localhost:8000.\"", "devServer": "npm-run-all -p testServer contBuild", "lint": "eslint \"src/**/*.js\"", "rollup": "npm-run-all rollup:*", "rollup:max": "rollup -c configs/rollup.config.js", "rollup:es": "rollup -c configs/rollup.config.es.js", "rollup:min": "rollup -c configs/rollup.config.min.js", "pretest": "npm run rollup", "start": "npm run devServer", "test": "npm-run-all test:*", "test:vjs6": "npm install video.js@6 --no-save && npm-run-all -p -r testServer webdriver", "test:vjs7": "npm install video.js@7 --no-save && npm-run-all -p -r testServer webdriver", "testServer": "http-server --cors -p 8000 --silent", "preversion": "node scripts/preversion.js && npm run lint && npm test", "version": "node scripts/version.js", "postversion": "node scripts/postversion.js", "webdriver": "mocha test/webdriver/*.js --no-timeouts" };
var repository = { "type": "git", "url": "https://github.com/googleads/videojs-ima" };
var files = ["CHANGELOG.md", "LICENSE", "README.md", "dist/", "src/"];
var peerDependencies = { "video.js": "^5.19.2 || ^6 || ^7" };
var dependencies = { "@hapi/cryptiles": "^5.1.0", "can-autoplay": "^3.0.2", "extend": ">=3.0.2", "videojs-contrib-ads": "^6.9.0" };
var devDependencies = { "axios": "^0.25.0", "babel-core": "^6.26.3", "babel-preset-env": "^1.7.0", "child_process": "^1.0.2", "chromedriver": "^102.0.0", "conventional-changelog-cli": "^2.2.2", "conventional-changelog-videojs": "^3.0.2", "ecstatic": "^4.1.4", "eslint": "^8.8.0", "eslint-config-google": "^0.9.1", "eslint-plugin-jsdoc": "^3.15.1", "geckodriver": "^2.0.4", "http-server": "^14.1.0", "ini": ">=1.3.7", "mocha": "^9.2.0", "npm-run-all": "^4.1.5", "path": "^0.12.7", "protractor": "^7.0.0", "rimraf": "^2.7.1", "rollup": "^0.51.8", "rollup-plugin-babel": "^3.0.7", "rollup-plugin-copy": "^0.2.3", "rollup-plugin-json": "^2.3.1", "rollup-plugin-uglify": "^2.0.1", "selenium-webdriver": "^3.6.0", "uglify-es": "^3.3.9", "video.js": "^7.17.0", "watch": "^0.13.0", "webdriver-manager": "^12.1.7", "xmldom": "^0.6.0" };
var keywords = ["videojs", "videojs-plugin"];
var pkg = {
	name: name,
	version: version,
	license: license,
	main: main,
	module: module$1,
	author: author,
	engines: engines,
	scripts: scripts,
	repository: repository,
	files: files,
	peerDependencies: peerDependencies,
	dependencies: dependencies,
	devDependencies: devDependencies,
	keywords: keywords
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Implementation of the IMA SDK for the plugin.
 *
 * @param {Object} controller Reference to the parent controller.
 *
 * @constructor
 * @struct
 * @final
 */
var SdkImpl = function SdkImpl(controller) {
  /**
   * Plugin controller.
   */
  this.controller = controller;

  /**
   * IMA SDK AdDisplayContainer.
   */
  this.adDisplayContainer = null;

  /**
   * True if the AdDisplayContainer has been initialized. False otherwise.
   */
  this.adDisplayContainerInitialized = false;

  /**
   * IMA SDK AdsLoader
   */
  this.adsLoader = null;

  /**
   * IMA SDK AdsManager
   */
  this.adsManager = null;

  /**
   * IMA SDK AdsRenderingSettings.
   */
  this.adsRenderingSettings = null;

  /**
   * VAST, VMAP, or ad rules response. Used in lieu of fetching a response
   * from an ad tag URL.
   */
  this.adsResponse = null;

  /**
   * Current IMA SDK Ad.
   */
  this.currentAd = null;

  /**
   * Timer used to track ad progress.
   */
  this.adTrackingTimer = null;

  /**
   * True if ALL_ADS_COMPLETED has fired, false until then.
   */
  this.allAdsCompleted = false;

  /**
   * True if ads are currently displayed, false otherwise.
   * True regardless of ad pause state if an ad is currently being displayed.
   */
  this.adsActive = false;

  /**
   * True if ad is currently playing, false if ad is paused or ads are not
   * currently displayed.
   */
  this.adPlaying = false;

  /**
   * True if the ad is muted, false otherwise.
   */
  this.adMuted = false;

  /**
   * Listener to be called to trigger manual ad break playback.
   */
  this.adBreakReadyListener = undefined;

  /**
   * Tracks whether or not we have already called adsLoader.contentComplete().
   */
  this.contentCompleteCalled = false;

  /**
   * True if the ad has timed out.
   */
  this.isAdTimedOut = false;

  /**
   * Stores the dimensions for the ads manager.
   */
  this.adsManagerDimensions = {
    width: 0,
    height: 0
  };

  /**
   * Boolean flag to enable manual ad break playback.
   */
  this.autoPlayAdBreaks = true;
  if (this.controller.getSettings().autoPlayAdBreaks === false) {
    this.autoPlayAdBreaks = false;
  }

  // Set SDK settings from plugin settings.
  if (this.controller.getSettings().locale) {
    /* eslint no-undef: 'error' */
    /* global google */
    google.ima.settings.setLocale(this.controller.getSettings().locale);
  }
  if (this.controller.getSettings().disableFlashAds) {
    google.ima.settings.setDisableFlashAds(this.controller.getSettings().disableFlashAds);
  }
  if (this.controller.getSettings().disableCustomPlaybackForIOS10Plus) {
    google.ima.settings.setDisableCustomPlaybackForIOS10Plus(this.controller.getSettings().disableCustomPlaybackForIOS10Plus);
  }

  if (this.controller.getSettings().ppid) {
    google.ima.settings.setPpid(this.controller.getSettings().ppid);
  }

  if (this.controller.getSettings().featureFlags) {
    google.ima.settings.setFeatureFlags(this.controller.getSettings().featureFlags);
  }
};

/**
 * Creates and initializes the IMA SDK objects.
 */
SdkImpl.prototype.initAdObjects = function () {
  this.adDisplayContainer = new google.ima.AdDisplayContainer(this.controller.getAdContainerDiv(), this.controller.getContentPlayer());

  this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);

  this.adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
  if (this.controller.getSettings().vpaidAllowed == false) {
    this.adsLoader.getSettings().setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.DISABLED);
  }
  if (this.controller.getSettings().vpaidMode !== undefined) {
    this.adsLoader.getSettings().setVpaidMode(this.controller.getSettings().vpaidMode);
  }

  if (this.controller.getSettings().locale) {
    this.adsLoader.getSettings().setLocale(this.controller.getSettings().locale);
  }

  if (this.controller.getSettings().numRedirects) {
    this.adsLoader.getSettings().setNumRedirects(this.controller.getSettings().numRedirects);
  }

  if (this.controller.getSettings().sessionId) {
    this.adsLoader.getSettings().setSessionId(this.controller.getSettings().sessionId);
  }

  this.adsLoader.getSettings().setPlayerType('videojs-ima');
  this.adsLoader.getSettings().setPlayerVersion(pkg.version);
  this.adsLoader.getSettings().setAutoPlayAdBreaks(this.autoPlayAdBreaks);

  this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded.bind(this), false);
  this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdsLoaderError.bind(this), false);

  this.controller.playerWrapper.vjsPlayer.trigger({
    type: 'ads-loader',
    adsLoader: this.adsLoader
  });
};

/**
 * Creates the AdsRequest and request ads through the AdsLoader.
 */
SdkImpl.prototype.requestAds = function () {
  var adsRequest = new google.ima.AdsRequest();
  if (this.controller.getSettings().adTagUrl) {
    adsRequest.adTagUrl = this.controller.getSettings().adTagUrl;
  } else {
    adsRequest.adsResponse = this.controller.getSettings().adsResponse;
  }
  if (this.controller.getSettings().forceNonLinearFullSlot) {
    adsRequest.forceNonLinearFullSlot = true;
  }

  if (this.controller.getSettings().vastLoadTimeout) {
    adsRequest.vastLoadTimeout = this.controller.getSettings().vastLoadTimeout;
  }

  if (this.controller.getSettings().omidMode) {
    window.console.warn('The additional setting `omidMode` has been removed. ' + 'Use `omidVendorAccess` instead.');
  }

  if (this.controller.getSettings().omidVendorAccess) {
    adsRequest.omidAccessModeRules = {};
    var omidVendorValues = this.controller.getSettings().omidVendorAccess;

    Object.keys(omidVendorValues).forEach(function (vendorKey) {
      adsRequest.omidAccessModeRules[vendorKey] = omidVendorValues[vendorKey];
    });
  }

  adsRequest.linearAdSlotWidth = this.controller.getPlayerWidth();
  adsRequest.linearAdSlotHeight = this.controller.getPlayerHeight();
  adsRequest.nonLinearAdSlotWidth = this.controller.getSettings().nonLinearWidth || this.controller.getPlayerWidth();
  adsRequest.nonLinearAdSlotHeight = this.controller.getSettings().nonLinearHeight || this.controller.getPlayerHeight();
  adsRequest.setAdWillAutoPlay(this.controller.adsWillAutoplay());
  adsRequest.setAdWillPlayMuted(this.controller.adsWillPlayMuted());

  // Populate the adsRequestproperties with those provided in the AdsRequest
  // object in the settings.
  var providedAdsRequest = this.controller.getSettings().adsRequest;
  if (providedAdsRequest && (typeof providedAdsRequest === 'undefined' ? 'undefined' : _typeof(providedAdsRequest)) === 'object') {
    Object.keys(providedAdsRequest).forEach(function (key) {
      adsRequest[key] = providedAdsRequest[key];
    });
  }

  this.adsLoader.requestAds(adsRequest);
  this.controller.playerWrapper.vjsPlayer.trigger({
    type: 'ads-request',
    AdsRequest: adsRequest
  });
};

/**
 * Listener for the ADS_MANAGER_LOADED event. Creates the AdsManager,
 * sets up event listeners, and triggers the 'adsready' event for
 * videojs-ads-contrib.
 *
 * @param {google.ima.AdsManagerLoadedEvent} adsManagerLoadedEvent Fired when
 *     the AdsManager loads.
 */
SdkImpl.prototype.onAdsManagerLoaded = function (adsManagerLoadedEvent) {
  this.createAdsRenderingSettings();

  this.adsManager = adsManagerLoadedEvent.getAdsManager(this.controller.getContentPlayheadTracker(), this.adsRenderingSettings);

  this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdError.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, this.onAdBreakReady.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this.onContentPauseRequested.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this.onContentResumeRequested.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, this.onAllAdsCompleted.bind(this));

  this.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, this.onAdLoaded.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, this.onAdStarted.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, this.onAdComplete.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, this.onAdComplete.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.LOG, this.onAdLog.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, this.onAdPaused.bind(this));
  this.adsManager.addEventListener(google.ima.AdEvent.Type.RESUMED, this.onAdResumed.bind(this));

  this.controller.playerWrapper.vjsPlayer.trigger({
    type: 'ads-manager',
    adsManager: this.adsManager
  });

  if (!this.autoPlayAdBreaks) {
    this.initAdsManager();
  }

  var _controller$getSettin = this.controller.getSettings(),
      preventLateAdStart = _controller$getSettin.preventLateAdStart;

  if (!preventLateAdStart) {
    this.controller.onAdsReady();
  } else if (preventLateAdStart && !this.isAdTimedOut) {
    this.controller.onAdsReady();
  }

  if (this.controller.getSettings().adsManagerLoadedCallback) {
    this.controller.getSettings().adsManagerLoadedCallback();
  }
};

/**
 * Listener for errors fired by the AdsLoader.
 * @param {google.ima.AdErrorEvent} event The error event thrown by the
 *     AdsLoader. See
 *     https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdError#.Type
 */
SdkImpl.prototype.onAdsLoaderError = function (event) {
  window.console.warn('AdsLoader error: ' + event.getError());
  this.controller.onErrorLoadingAds(event);
  if (this.adsManager) {
    this.adsManager.destroy();
  }
};

/**
 * Initialize the ads manager.
 */
SdkImpl.prototype.initAdsManager = function () {
  try {
    var initWidth = this.controller.getPlayerWidth();
    var initHeight = this.controller.getPlayerHeight();
    this.adsManagerDimensions.width = initWidth;
    this.adsManagerDimensions.height = initHeight;
    this.adsManager.init(initWidth, initHeight, google.ima.ViewMode.NORMAL);
    this.adsManager.setVolume(this.controller.getPlayerVolume());
    this.initializeAdDisplayContainer();
  } catch (adError) {
    this.onAdError(adError);
  }
};

/**
 * Create AdsRenderingSettings for the IMA SDK.
 */
SdkImpl.prototype.createAdsRenderingSettings = function () {
  this.adsRenderingSettings = new google.ima.AdsRenderingSettings();
  this.adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  if (this.controller.getSettings().adsRenderingSettings) {
    for (var setting in this.controller.getSettings().adsRenderingSettings) {
      if (setting !== '') {
        this.adsRenderingSettings[setting] = this.controller.getSettings().adsRenderingSettings[setting];
      }
    }
  }
};

/**
 * Listener for errors thrown by the AdsManager.
 * @param {google.ima.AdErrorEvent} adErrorEvent The error event thrown by
 *     the AdsManager.
 */
SdkImpl.prototype.onAdError = function (adErrorEvent) {
  var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
  window.console.warn('Ad error: ' + errorMessage);

  this.adsManager.destroy();
  this.controller.onAdError(adErrorEvent);

  // reset these so consumers don't think we are still in an ad break,
  // but reset them after any prior cleanup happens
  this.adsActive = false;
  this.adPlaying = false;
};

/**
 * Listener for AD_BREAK_READY. Passes event on to publisher's listener.
 * @param {google.ima.AdEvent} adEvent AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdBreakReady = function (adEvent) {
  this.adBreakReadyListener(adEvent);
};

/**
 * Pauses the content video and displays the ad container so ads can play.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onContentPauseRequested = function (adEvent) {
  this.adsActive = true;
  this.adPlaying = true;
  this.controller.onAdBreakStart(adEvent);
};

/**
 * Resumes content video and hides the ad container.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onContentResumeRequested = function (adEvent) {
  this.adsActive = false;
  this.adPlaying = false;
  this.controller.onAdBreakEnd();
  // Hide controls in case of future non-linear ads. They'll be unhidden in
  // content_pause_requested.
};

/**
 * Records that ads have completed and calls contentAndAdsEndedListeners
 * if content is also complete.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAllAdsCompleted = function (adEvent) {
  this.allAdsCompleted = true;
  this.controller.onAllAdsCompleted();
};

/**
 * Starts the content video when a non-linear ad is loaded.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdLoaded = function (adEvent) {
  if (!adEvent.getAd().isLinear()) {
    this.controller.onNonLinearAdLoad();
    this.controller.playContent();
  }
};

/**
 * Starts the interval timer to check the current ad time when an ad starts
 * playing.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdStarted = function (adEvent) {
  this.currentAd = adEvent.getAd();
  if (this.currentAd.isLinear()) {
    this.adTrackingTimer = setInterval(this.onAdPlayheadTrackerInterval.bind(this), 250);
    this.controller.onLinearAdStart();
  } else {
    this.controller.onNonLinearAdStart();
  }
};

/**
 * Handles an ad click. Puts the player UI in a paused state.
 */
SdkImpl.prototype.onAdPaused = function () {
  this.controller.onAdsPaused();
};

/**
 * Syncs controls when an ad resumes.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdResumed = function (adEvent) {
  this.controller.onAdsResumed();
};

/**
 * Clears the interval timer for current ad time when an ad completes.
 */
SdkImpl.prototype.onAdComplete = function () {
  if (this.currentAd.isLinear()) {
    clearInterval(this.adTrackingTimer);
  }
};

/**
 * Handles ad log messages.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the AdsManager.
 */
SdkImpl.prototype.onAdLog = function (adEvent) {
  this.controller.onAdLog(adEvent);
};

/**
 * Gets the current time and duration of the ad and calls the method to
 * update the ad UI.
 */
SdkImpl.prototype.onAdPlayheadTrackerInterval = function () {
  if (this.adsManager === null) return;
  var remainingTime = this.adsManager.getRemainingTime();
  var duration = this.currentAd.getDuration();
  var currentTime = duration - remainingTime;
  currentTime = currentTime > 0 ? currentTime : 0;
  var totalAds = 0;
  var adPosition = void 0;
  if (this.currentAd.getAdPodInfo()) {
    adPosition = this.currentAd.getAdPodInfo().getAdPosition();
    totalAds = this.currentAd.getAdPodInfo().getTotalAds();
  }

  this.controller.onAdPlayheadUpdated(currentTime, remainingTime, duration, adPosition, totalAds);
};

/**
 * Called by the player wrapper when content completes.
 */
SdkImpl.prototype.onContentComplete = function () {
  if (this.adsLoader) {
    this.adsLoader.contentComplete();
    this.contentCompleteCalled = true;
  }

  if (this.adsManager && this.adsManager.getCuePoints() && !this.adsManager.getCuePoints().includes(-1) || !this.adsManager) {
    this.controller.onNoPostroll();
  }

  if (this.allAdsCompleted) {
    this.controller.onContentAndAdsCompleted();
  }
};

/**
 * Called when the player is disposed.
 */
SdkImpl.prototype.onPlayerDisposed = function () {
  if (this.adTrackingTimer) {
    clearInterval(this.adTrackingTimer);
  }
  if (this.adsManager) {
    this.adsManager.destroy();
    this.adsManager = null;
  }
};

SdkImpl.prototype.onPlayerReadyForPreroll = function () {
  if (this.autoPlayAdBreaks) {
    this.initAdsManager();
    try {
      this.controller.showAdContainer();
      // Sync ad volume with content volume.
      this.adsManager.setVolume(this.controller.getPlayerVolume());
      this.adsManager.start();
    } catch (adError) {
      this.onAdError(adError);
    }
  }
};

SdkImpl.prototype.onAdTimeout = function () {
  this.isAdTimedOut = true;
};

SdkImpl.prototype.onPlayerReady = function () {
  this.initAdObjects();

  if ((this.controller.getSettings().adTagUrl || this.controller.getSettings().adsResponse) && this.controller.getSettings().requestMode === 'onLoad') {
    this.requestAds();
  }
};

SdkImpl.prototype.onPlayerEnterFullscreen = function () {
  if (this.adsManager) {
    this.adsManager.resize(window.screen.width, window.screen.height, google.ima.ViewMode.FULLSCREEN);
  }
};

SdkImpl.prototype.onPlayerExitFullscreen = function () {
  if (this.adsManager) {
    this.adsManager.resize(this.controller.getPlayerWidth(), this.controller.getPlayerHeight(), google.ima.ViewMode.NORMAL);
  }
};

/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
SdkImpl.prototype.onPlayerVolumeChanged = function (volume) {
  if (this.adsManager) {
    this.adsManager.setVolume(volume);
  }

  if (volume == 0) {
    this.adMuted = true;
  } else {
    this.adMuted = false;
  }
};

/**
 * Called when the player wrapper detects that the player has been resized.
 *
 * @param {number} width The post-resize width of the player.
 * @param {number} height The post-resize height of the player.
 */
SdkImpl.prototype.onPlayerResize = function (width, height) {
  if (this.adsManager) {
    this.adsManagerDimensions.width = width;
    this.adsManagerDimensions.height = height;
    /* eslint no-undef: 'error' */
    this.adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
};

/**
 * @return {Object} The current ad.
 */
SdkImpl.prototype.getCurrentAd = function () {
  return this.currentAd;
};

/**
 * Listener JSDoc for ESLint. This listener can be passed to
 * setAdBreakReadyListener.
 * @callback listener
 */

/**
 * Sets the listener to be called to trigger manual ad break playback.
 * @param {listener} listener The listener to be called to trigger manual ad
 *     break playback.
 */
SdkImpl.prototype.setAdBreakReadyListener = function (listener) {
  this.adBreakReadyListener = listener;
};

/**
 * @return {boolean} True if an ad is currently playing. False otherwise.
 */
SdkImpl.prototype.isAdPlaying = function () {
  return this.adPlaying;
};

/**
 * @return {boolean} True if an ad is currently playing. False otherwise.
 */
SdkImpl.prototype.isAdMuted = function () {
  return this.adMuted;
};

/**
 * Pause ads.
 */
SdkImpl.prototype.pauseAds = function () {
  this.adsManager.pause();
  this.adPlaying = false;
};

/**
 * Resume ads.
 */
SdkImpl.prototype.resumeAds = function () {
  this.adsManager.resume();
  this.adPlaying = true;
};

/**
 * Unmute ads.
 */
SdkImpl.prototype.unmute = function () {
  this.adsManager.setVolume(1);
  this.adMuted = false;
};

/**
 * Mute ads.
 */
SdkImpl.prototype.mute = function () {
  this.adsManager.setVolume(0);
  this.adMuted = true;
};

/**
 * Set the volume of the ads. 0-1.
 *
 * @param {number} volume The new volume.
 */
SdkImpl.prototype.setVolume = function (volume) {
  this.adsManager.setVolume(volume);
  if (volume == 0) {
    this.adMuted = true;
  } else {
    this.adMuted = false;
  }
};

/**
 * Initializes the AdDisplayContainer. On mobile, this must be done as a
 * result of user action.
 */
SdkImpl.prototype.initializeAdDisplayContainer = function () {
  if (this.adDisplayContainer) {
    if (!this.adDisplayContainerInitialized) {
      this.adDisplayContainer.initialize();
      this.adDisplayContainerInitialized = true;
    }
  }
};

/**
 * Called by publishers in manual ad break playback mode to start an ad
 * break.
 */
SdkImpl.prototype.playAdBreak = function () {
  if (!this.autoPlayAdBreaks) {
    this.controller.showAdContainer();
    // Sync ad volume with content volume.
    this.adsManager.setVolume(this.controller.getPlayerVolume());
    this.adsManager.start();
  }
};

/**
 * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
 * @callback callback
 */

/**
 * Ads an EventListener to the AdsManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
 * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
 *     listen.
 * @param {callback} callback The method to call when the event is fired.
 */
SdkImpl.prototype.addEventListener = function (event, callback) {
  if (this.adsManager) {
    this.adsManager.addEventListener(event, callback);
  }
};

/**
 * Returns the instance of the AdsManager.
 * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
 */
SdkImpl.prototype.getAdsManager = function () {
  return this.adsManager;
};

/**
 * Reset the SDK implementation.
 */
SdkImpl.prototype.reset = function () {
  this.adsActive = false;
  this.adPlaying = false;
  if (this.adTrackingTimer) {
    // If this is called while an ad is playing, stop trying to get that
    // ad's current time.
    clearInterval(this.adTrackingTimer);
  }
  if (this.adsManager) {
    this.adsManager.destroy();
    this.adsManager = null;
  }
  if (this.adsLoader && !this.contentCompleteCalled) {
    this.adsLoader.contentComplete();
  }
  this.contentCompleteCalled = false;
  this.allAdsCompleted = false;
};

/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */
/**
 * The grand coordinator of the plugin. Facilitates communication between all
 * other plugin classes.
 *
 * @param {Object} player Instance of the video.js player.
 * @param {Object} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
var Controller = function Controller(player, options) {
  /**
   * Stores user-provided settings.
   * @type {Object}
   */
  this.settings = {};

  /**
   * Content and ads ended listeners passed by the publisher to the plugin.
   * These will be called when the plugin detects that content *and all
   * ads* have completed. This differs from the contentEndedListeners in that
   * contentEndedListeners will fire between content ending and a post-roll
   * playing, whereas the contentAndAdsEndedListeners will fire after the
   * post-roll completes.
   */
  this.contentAndAdsEndedListeners = [];

  /**
   * Whether or not we are running on a mobile platform.
   */
  this.isMobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i);

  /**
   * Whether or not we are running on an iOS platform.
   */
  this.isIos = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i);

  this.initWithSettings(options);

  /**
   * Stores contrib-ads default settings.
   */
  var contribAdsDefaults = {
    debug: this.settings.debug,
    timeout: this.settings.timeout,
    prerollTimeout: this.settings.prerollTimeout
  };
  var adsPluginSettings = Object.assign({}, contribAdsDefaults, options.contribAdsSettings || {});

  this.playerWrapper = new PlayerWrapper(player, adsPluginSettings, this);
  this.adUi = new AdUi(this);
  this.sdkImpl = new SdkImpl(this);
};

Controller.IMA_DEFAULTS = {
  adLabel: 'Advertisement',
  adLabelNofN: 'of',
  debug: false,
  disableAdControls: false,
  prerollTimeout: 1000,
  preventLateAdStart: false,
  requestMode: 'onLoad',
  showControlsForJSAds: true,
  timeout: 5000
};

/**
 * Extends the settings to include user-provided settings.
 *
 * @param {Object} options Options to be used in initialization.
 */
Controller.prototype.initWithSettings = function (options) {
  this.settings = Object.assign({}, Controller.IMA_DEFAULTS, options || {});

  this.warnAboutDeprecatedSettings();

  // Default showing countdown timer to true.
  this.showCountdown = true;
  if (this.settings.showCountdown === false) {
    this.showCountdown = false;
  }
};

/**
 * Logs console warnings when deprecated settings are used.
 */
Controller.prototype.warnAboutDeprecatedSettings = function () {
  var _this = this;

  var deprecatedSettings = ['adWillAutoplay', 'adsWillAutoplay', 'adWillPlayMuted', 'adsWillPlayMuted'];
  deprecatedSettings.forEach(function (setting) {
    if (_this.settings[setting] !== undefined) {
      console.warn('WARNING: videojs.ima setting ' + setting + ' is deprecated');
    }
  });
};

/**
 * Return the settings object.
 *
 * @return {Object} The settings object.
 */
Controller.prototype.getSettings = function () {
  return this.settings;
};

/**
 * Return whether or not we're in a mobile environment.
 *
 * @return {boolean} True if running on mobile, false otherwise.
 */
Controller.prototype.getIsMobile = function () {
  return this.isMobile;
};

/**
 * Return whether or not we're in an iOS environment.
 *
 * @return {boolean} True if running on iOS, false otherwise.
 */
Controller.prototype.getIsIos = function () {
  return this.isIos;
};

/**
 * Inject the ad container div into the DOM.
 *
 * @param{HTMLElement} adContainerDiv The ad container div.
 */
Controller.prototype.injectAdContainerDiv = function (adContainerDiv) {
  this.playerWrapper.injectAdContainerDiv(adContainerDiv);
};

/**
 * @return {HTMLElement} The div for the ad container.
 */
Controller.prototype.getAdContainerDiv = function () {
  return this.adUi.getAdContainerDiv();
};

/**
 * @return {Object} The content player.
 */
Controller.prototype.getContentPlayer = function () {
  return this.playerWrapper.getContentPlayer();
};

/**
 * Returns the content playhead tracker.
 *
 * @return {Object} The content playhead tracker.
 */
Controller.prototype.getContentPlayheadTracker = function () {
  return this.playerWrapper.getContentPlayheadTracker();
};

/**
 * Requests ads.
 */
Controller.prototype.requestAds = function () {
  this.sdkImpl.requestAds();
};

/**
 * Add or modify a setting.
 *
 * @param {string} key Key to modify
 * @param {Object} value Value to set at key.
 */
Controller.prototype.setSetting = function (key, value) {
  this.settings[key] = value;
};

/**
 * Called when there is an error loading ads.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
Controller.prototype.onErrorLoadingAds = function (adErrorEvent) {
  this.adUi.onAdError();
  this.playerWrapper.onAdError(adErrorEvent);
};

/**
 * Called by the ad UI when the play/pause button is clicked.
 */
Controller.prototype.onAdPlayPauseClick = function () {
  if (this.sdkImpl.isAdPlaying()) {
    this.adUi.onAdsPaused();
    this.sdkImpl.pauseAds();
  } else {
    this.adUi.onAdsPlaying();
    this.sdkImpl.resumeAds();
  }
};

/**
 * Called by the ad UI when the mute button is clicked.
 *
 */
Controller.prototype.onAdMuteClick = function () {
  if (this.sdkImpl.isAdMuted()) {
    this.playerWrapper.unmute();
    this.adUi.unmute();
    this.sdkImpl.unmute();
  } else {
    this.playerWrapper.mute();
    this.adUi.mute();
    this.sdkImpl.mute();
  }
};

/**
 * Set the volume of the player and ads. 0-1.
 *
 * @param {number} volume The new volume.
 */
Controller.prototype.setVolume = function (volume) {
  this.playerWrapper.setVolume(volume);
  this.sdkImpl.setVolume(volume);
};

/**
 * @return {number} The volume of the content player.
 */
Controller.prototype.getPlayerVolume = function () {
  return this.playerWrapper.getVolume();
};

/**
 * Toggle fullscreen state.
 */
Controller.prototype.toggleFullscreen = function () {
  this.playerWrapper.toggleFullscreen();
};

/**
 * Relays ad errors to the player wrapper.
 *
 * @param {Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
Controller.prototype.onAdError = function (adErrorEvent) {
  this.adUi.onAdError();
  this.playerWrapper.onAdError(adErrorEvent);
};

/**
 * Handles ad break starting.
 *
 * @param {Object} adEvent The event fired by the IMA SDK.
 */
Controller.prototype.onAdBreakStart = function (adEvent) {
  this.playerWrapper.onAdBreakStart();
  this.adUi.onAdBreakStart(adEvent);
};

/**
 * Show the ad container.
 */
Controller.prototype.showAdContainer = function () {
  this.adUi.showAdContainer();
};

/**
 * Handles ad break ending.
 */
Controller.prototype.onAdBreakEnd = function () {
  this.playerWrapper.onAdBreakEnd();
  this.adUi.onAdBreakEnd();
};

/**
 * Handles when all ads have finished playing.
 */
Controller.prototype.onAllAdsCompleted = function () {
  this.adUi.onAllAdsCompleted();
  this.playerWrapper.onAllAdsCompleted();
};

/**
 * Handles the SDK firing an ad paused event.
 */
Controller.prototype.onAdsPaused = function () {
  this.adUi.onAdsPaused();
};

/**
 * Handles the SDK firing an ad resumed event.
 */
Controller.prototype.onAdsResumed = function () {
  this.adUi.onAdsResumed();
};

/**
 * Takes data from the sdk impl and passes it to the ad UI to update the UI.
 *
 * @param {number} currentTime Current time of the ad.
 * @param {number} remainingTime Remaining time of the ad.
 * @param {number} duration Duration of the ad.
 * @param {number} adPosition Index of the ad in the pod.
 * @param {number} totalAds Total number of ads in the pod.
 */
Controller.prototype.onAdPlayheadUpdated = function (currentTime, remainingTime, duration, adPosition, totalAds) {
  this.adUi.updateAdUi(currentTime, remainingTime, duration, adPosition, totalAds);
};

/**
 * Handles ad log messages.
 * @param {google.ima.AdEvent} adEvent The AdEvent thrown by the IMA SDK.
 */
Controller.prototype.onAdLog = function (adEvent) {
  this.playerWrapper.onAdLog(adEvent);
};

/**
 * @return {Object} The current ad.
 */
Controller.prototype.getCurrentAd = function () {
  return this.sdkImpl.getCurrentAd();
};

/**
 * Play content.
 */
Controller.prototype.playContent = function () {
  this.playerWrapper.play();
};

/**
 * Handles when a linear ad starts.
 */
Controller.prototype.onLinearAdStart = function () {
  this.adUi.onLinearAdStart();
  this.playerWrapper.onAdStart();
};

/**
 * Handles when a non-linear ad loads.
 */
Controller.prototype.onNonLinearAdLoad = function () {
  this.adUi.onNonLinearAdLoad();
};

/**
 * Handles when a non-linear ad starts.
 */
Controller.prototype.onNonLinearAdStart = function () {
  this.adUi.onNonLinearAdLoad();
  this.playerWrapper.onAdStart();
};

/**
 * Get the player width.
 *
 * @return {number} The width of the player.
 */
Controller.prototype.getPlayerWidth = function () {
  return this.playerWrapper.getPlayerWidth();
};

/**
 * Get the player height.
 *
 * @return {number} The height of the player.
 */
Controller.prototype.getPlayerHeight = function () {
  return this.playerWrapper.getPlayerHeight();
};

/**
 * Tells the player wrapper that ads are ready.
 */
Controller.prototype.onAdsReady = function () {
  this.playerWrapper.onAdsReady();
};

/**
 * Called when the player wrapper detects that the player has been resized.
 *
 * @param {number} width The post-resize width of the player.
 * @param {number} height The post-resize height of the player.
 */
Controller.prototype.onPlayerResize = function (width, height) {
  this.sdkImpl.onPlayerResize(width, height);
};

/**
 * Called by the player wrapper when content completes.
 */
Controller.prototype.onContentComplete = function () {
  this.sdkImpl.onContentComplete();
};

/**
 * Called by the player wrapper when it's time to play a post-roll but we don't
 * have one to play.
 */
Controller.prototype.onNoPostroll = function () {
  this.playerWrapper.onNoPostroll();
};

/**
 * Called when content and all ads have completed.
 */
Controller.prototype.onContentAndAdsCompleted = function () {
  for (var index in this.contentAndAdsEndedListeners) {
    if (typeof this.contentAndAdsEndedListeners[index] === 'function') {
      this.contentAndAdsEndedListeners[index]();
    }
  }
};

/**
 * Called when the player is disposed.
 */
Controller.prototype.onPlayerDisposed = function () {
  this.contentAndAdsEndedListeners = [];
  this.sdkImpl.onPlayerDisposed();
};

/**
 * Called when the player is ready to play a pre-roll.
 */
Controller.prototype.onPlayerReadyForPreroll = function () {
  this.sdkImpl.onPlayerReadyForPreroll();
};

/**
 * Called if the ad times out.
 */
Controller.prototype.onAdTimeout = function () {
  this.sdkImpl.onAdTimeout();
};

/**
 * Called when the player is ready.
 */
Controller.prototype.onPlayerReady = function () {
  this.sdkImpl.onPlayerReady();
};

/**
 * Called when the player enters fullscreen.
 */
Controller.prototype.onPlayerEnterFullscreen = function () {
  this.adUi.onPlayerEnterFullscreen();
  this.sdkImpl.onPlayerEnterFullscreen();
};

/**
 * Called when the player exits fullscreen.
 */
Controller.prototype.onPlayerExitFullscreen = function () {
  this.adUi.onPlayerExitFullscreen();
  this.sdkImpl.onPlayerExitFullscreen();
};

/**
 * Called when the player volume changes.
 *
 * @param {number} volume The new player volume.
 */
Controller.prototype.onPlayerVolumeChanged = function (volume) {
  this.adUi.onPlayerVolumeChanged(volume);
  this.sdkImpl.onPlayerVolumeChanged(volume);
};

/**
 * Sets the content of the video player. You should use this method instead
 * of setting the content src directly to ensure the proper ad tag is
 * requested when the video content is loaded.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?string} adTag The ad tag to be requested when the content loads.
 *     Leave blank to use the existing ad tag.
 */
Controller.prototype.setContentWithAdTag = function (contentSrc, adTag) {
  this.reset();
  this.settings.adTagUrl = adTag ? adTag : this.settings.adTagUrl;
  this.playerWrapper.changeSource(contentSrc);
};

/**
 * Sets the content of the video player. You should use this method instead
 * of setting the content src directly to ensure the proper ads response is
 * used when the video content is loaded.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?string} adsResponse The ads response to be requested when the
 *     content loads. Leave blank to use the existing ads response.
 */
Controller.prototype.setContentWithAdsResponse = function (contentSrc, adsResponse) {
  this.reset();
  this.settings.adsResponse = adsResponse ? adsResponse : this.settings.adsResponse;
  this.playerWrapper.changeSource(contentSrc);
};

/**
 * Sets the content of the video player. You should use this method instead
 * of setting the content src directly to ensure the proper ads request is
 * used when the video content is loaded.
 * @param {?string} contentSrc The URI for the content to be played. Leave
 *     blank to use the existing content.
 * @param {?Object} adsRequest The ads request to be requested when the
 *     content loads. Leave blank to use the existing ads request.
 */
Controller.prototype.setContentWithAdsRequest = function (contentSrc, adsRequest) {
  this.reset();
  this.settings.adsRequest = adsRequest ? adsRequest : this.settings.adsRequest;
  this.playerWrapper.changeSource(contentSrc);
};

/**
 * Resets the state of the plugin.
 */
Controller.prototype.reset = function () {
  this.sdkImpl.reset();
  this.playerWrapper.reset();
  this.adUi.reset();
};

/**
 * Listener JSDoc for ESLint. This listener can be passed to
 * (add|remove)ContentEndedListener.
 * @callback listener
 */

/**
 * Adds a listener for the 'contentended' event of the video player. This should
 * be used instead of setting an 'contentended' listener directly to ensure that
 * the ima can do proper cleanup of the SDK before other event listeners are
 * called.
 * @param {listener} listener The listener to be called when content
 *     completes.
 */
Controller.prototype.addContentEndedListener = function (listener) {
  this.playerWrapper.addContentEndedListener(listener);
};

/**
 * Adds a listener that will be called when content and all ads have
 * finished playing.
 * @param {listener} listener The listener to be called when content and ads
 *     complete.
 */
Controller.prototype.addContentAndAdsEndedListener = function (listener) {
  this.contentAndAdsEndedListeners.push(listener);
};

/**
 * Sets the listener to be called to trigger manual ad break playback.
 * @param {listener} listener The listener to be called to trigger manual ad
 *     break playback.
 */
Controller.prototype.setAdBreakReadyListener = function (listener) {
  this.sdkImpl.setAdBreakReadyListener(listener);
};

/**
 * Changes the flag to show or hide the ad countdown timer.
 *
 * @param {boolean} showCountdownIn Show or hide the countdown timer.
 */
Controller.prototype.setShowCountdown = function (showCountdownIn) {
  this.adUi.setShowCountdown(showCountdownIn);
  this.showCountdown = showCountdownIn;
  this.adUi.countdownDiv.style.display = this.showCountdown ? 'block' : 'none';
};

/**
 * Initializes the AdDisplayContainer. On mobile, this must be done as a
 * result of user action.
 */
Controller.prototype.initializeAdDisplayContainer = function () {
  this.sdkImpl.initializeAdDisplayContainer();
};

/**
 * Called by publishers in manual ad break playback mode to start an ad
 * break.
 */
Controller.prototype.playAdBreak = function () {
  this.sdkImpl.playAdBreak();
};

/**
 * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
 * @callback callback
 */

/**
 * Ads an EventListener to the AdsManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
 * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
 *     listen.
 * @param {callback} callback The method to call when the event is fired.
 */
Controller.prototype.addEventListener = function (event, callback) {
  this.sdkImpl.addEventListener(event, callback);
};

/**
 * Returns the instance of the AdsManager.
 * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
 */
Controller.prototype.getAdsManager = function () {
  return this.sdkImpl.getAdsManager();
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
Controller.prototype.getPlayerId = function () {
  return this.playerWrapper.getPlayerId();
};

/**
 * Changes the ad tag. You will need to call requestAds after this method
 * for the new ads to be requested.
 * @param {?string} adTag The ad tag to be requested the next time
 *     requestAds is called.
 */
Controller.prototype.changeAdTag = function (adTag) {
  this.reset();
  this.settings.adTagUrl = adTag;
};

/**
 * Pauses the ad.
 */
Controller.prototype.pauseAd = function () {
  this.adUi.onAdsPaused();
  this.sdkImpl.pauseAds();
};

/**
 * Resumes the ad.
 */
Controller.prototype.resumeAd = function () {
  this.adUi.onAdsPlaying();
  this.sdkImpl.resumeAds();
};

/**
 * Toggles video/ad playback.
 */
Controller.prototype.togglePlayback = function () {
  this.playerWrapper.togglePlayback();
};

/**
 * @return {boolean} true if we expect that ads will autoplay. false otherwise.
 */
Controller.prototype.adsWillAutoplay = function () {
  if (this.settings.adsWillAutoplay !== undefined) {
    return this.settings.adsWillAutoplay;
  } else if (this.settings.adWillAutoplay !== undefined) {
    return this.settings.adWillAutoplay;
  } else {
    return !!this.playerWrapper.getPlayerOptions().autoplay;
  }
};

/**
 * @return {boolean} true if we expect that ads will autoplay. false otherwise.
 */
Controller.prototype.adsWillPlayMuted = function () {
  if (this.settings.adsWillPlayMuted !== undefined) {
    return this.settings.adsWillPlayMuted;
  } else if (this.settings.adWillPlayMuted !== undefined) {
    return this.settings.adWillPlayMuted;
  } else if (this.playerWrapper.getPlayerOptions().muted !== undefined) {
    return this.playerWrapper.getPlayerOptions().muted;
  } else {
    return this.playerWrapper.getVolume() == 0;
  }
};

/**
 * Triggers an event on the VJS player
 * @param  {string} name The event name.
 * @param  {Object} data The event data.
 */
Controller.prototype.triggerPlayerEvent = function (name, data) {
  this.playerWrapper.triggerPlayerEvent(name, data);
};

/**
 * Copyright 2021 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Wraps the video.js stream player for the plugin.
 *
 * @param {!Object} player Video.js player instance.
 * @param {!Object} adsPluginSettings Settings for the contrib-ads plugin.
 * @param {!DaiController} daiController Reference to the parent controller.
 */
var PlayerWrapper$2 = function PlayerWrapper(player, adsPluginSettings, daiController) {
  /**
   * Instance of the video.js player.
   */
  this.vjsPlayer = player;

  /**
   * Plugin DAI controller.
   */
  this.daiController = daiController;

  /**
   * Video.js control bar.
   */
  this.vjsControls = this.vjsPlayer.getChild('controlBar');

  /**
   * Vanilla HTML5 video player underneath the video.js player.
   */
  this.h5Player = null;

  this.vjsPlayer.on('dispose', this.playerDisposedListener.bind(this));
  this.vjsPlayer.on('pause', this.onPause.bind(this));
  this.vjsPlayer.on('play', this.onPlay.bind(this));
  this.vjsPlayer.on('seeked', this.onSeekEnd.bind(this));
  this.vjsPlayer.ready(this.onPlayerReady.bind(this));
  this.vjsPlayer.ads(adsPluginSettings);
};

/**
 * Called in response to the video.js player's 'disposed' event.
 */
PlayerWrapper$2.prototype.playerDisposedListener = function () {
  this.contentEndedListeners = [];
  this.daiController.onPlayerDisposed();
};

/**
 * Called on the player 'pause' event. Handles displaying controls during
 * paused ad breaks.
 */
PlayerWrapper$2.prototype.onPause = function () {
  // This code will run if the stream is paused during an ad break. Since
  // controls are usually hidden during ads, they will now show to allow
  // users to resume ad playback.
  if (this.daiController.isInAdBreak()) {
    this.vjsControls.show();
  }
};

/**
 * Called on the player 'play' event. Handles hiding controls during
 * ad breaks while playing.
 */
PlayerWrapper$2.prototype.onPlay = function () {
  if (this.daiController.isInAdBreak()) {
    this.vjsControls.hide();
  }
};

/**
 * Called on the player's 'seeked' event. Sets up handling for ad break
 * snapback for VOD streams.
 */
PlayerWrapper$2.prototype.onSeekEnd = function () {
  this.daiController.onSeekEnd(this.vjsPlayer.currentTime());
};

/**
 * Called on the player's 'ready' event to begin initiating IMA.
 */
PlayerWrapper$2.prototype.onPlayerReady = function () {
  this.h5Player = document.getElementById(this.getPlayerId()).getElementsByClassName('vjs-tech')[0];
  this.daiController.onPlayerReady();
};

/**
 * @return {!Object} The stream player.
 */
PlayerWrapper$2.prototype.getStreamPlayer = function () {
  return this.h5Player;
};

/**
 * @return {!Object} The video.js player.
 */
PlayerWrapper$2.prototype.getVjsPlayer = function () {
  return this.vjsPlayer;
};

/**
 * @return {!Object} The vjs player's options object.
 */
PlayerWrapper$2.prototype.getPlayerOptions = function () {
  return this.vjsPlayer.options_;
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
PlayerWrapper$2.prototype.getPlayerId = function () {
  return this.vjsPlayer.id();
};

/**
 * Handles ad errors.
 *
 * @param {!Object} adErrorEvent The ad error event thrown by the IMA SDK.
 */
PlayerWrapper$2.prototype.onAdError = function (adErrorEvent) {
  this.vjsControls.show();
  var errorMessage = adErrorEvent.getError !== undefined ? adErrorEvent.getError() : adErrorEvent.stack;
  this.vjsPlayer.trigger({ type: 'adserror', data: {
      AdError: errorMessage,
      AdErrorEvent: adErrorEvent
    } });
};

/**
 * Handles ad break starting.
 */
PlayerWrapper$2.prototype.onAdBreakStart = function () {
  this.vjsControls.hide();
};

/**
 * Handles ad break ending.
 */
PlayerWrapper$2.prototype.onAdBreakEnd = function () {
  this.vjsControls.show();
};

/**
 * Reset the player.
 */
PlayerWrapper$2.prototype.reset = function () {
  this.vjsControls.show();
};

/**
 * Copyright 2021 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Implementation of the IMA DAI SDK for the plugin.
 *
 * @param {DaiController!} daiController Reference to the parent DAI
 * controller.
 *
 * @constructor
 * @struct
 * @final
 */
var SdkImpl$2 = function SdkImpl(daiController) {
  /**
   * Plugin DAI controller.
   */
  this.daiController = daiController;

  /**
   * The html5 stream player.
   */
  this.streamPlayer = null;

  /**
   * The videoJS stream player.
   */
  this.vjsPlayer = null;

  /**
   * IMA SDK StreamManager
   */
  this.streamManager = null;

  /**
   * IMA stream UI settings.
   */
  /* eslint no-undef: 'error' */
  /* global google */
  this.uiSettings = new google.ima.dai.api.UiSettings();

  /**
   * If the stream is currently in an ad break.
   */
  this.isAdBreak = false;

  /**
   * If the stream is currently seeking from a snapback.
   */
  this.isSnapback = false;

  /**
   * Originally seeked to time, to return stream to after ads.
   */
  this.snapForwardTime = 0;

  /**
   * Timed metadata for the stream.
   */
  this.timedMetadata;

  /**
   * Timed metadata record.
   */
  this.metadataLoaded = {};

  this.SOURCE_TYPES = {
    hls: 'application/x-mpegURL',
    dash: 'application/dash+xml'
  };
};

/**
 * Creates and initializes the IMA DAI SDK objects.
 */
SdkImpl$2.prototype.initImaDai = function () {
  this.streamPlayer = this.daiController.getStreamPlayer();
  this.vjsPlayer = this.daiController.getVjsPlayer();

  this.createAdUiDiv();
  if (this.daiController.getSettings().locale) {
    this.uiSettings.setLocale(this.daiController.getSettings().locale);
  }

  this.streamManager = new google.ima.dai.api.StreamManager(this.streamPlayer, this.adUiDiv, this.uiSettings);

  this.streamPlayer.addEventListener('pause', this.onStreamPause);
  this.streamPlayer.addEventListener('play', this.onStreamPlay);

  this.streamManager.addEventListener([google.ima.dai.api.StreamEvent.Type.LOADED, google.ima.dai.api.StreamEvent.Type.ERROR, google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED, google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED], this.onStreamEvent.bind(this), false);

  this.vjsPlayer.textTracks().onaddtrack = this.onAddTrack.bind(this);

  this.vjsPlayer.trigger({
    type: 'stream-manager',
    StreamManager: this.streamManager
  });

  this.requestStream();
};

/**
 * Called when the video player has metadata to process.
 * @param {Event!} event The event that triggered this call.
 */
SdkImpl$2.prototype.onAddTrack = function (event) {
  var _this = this;

  var track = event.track;
  if (track.kind === 'metadata') {
    track.mode = 'hidden';
    track.oncuechange = function (e) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = track.activeCues_[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var cue = _step.value;

          var metadata = {};
          metadata[cue.value.key] = cue.value.data;
          _this.streamManager.onTimedMetadata(metadata);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };
  }
};

/**
 * Creates the ad UI container.
 */
SdkImpl$2.prototype.createAdUiDiv = function () {
  var uiDiv = document.createElement('div');
  uiDiv.id = 'ad-ui';
  // 3em is the height of the control bar.
  uiDiv.style.height = 'calc(100% - 3em)';
  this.streamPlayer.parentNode.appendChild(uiDiv);
  this.adUiDiv = uiDiv;
};

/**
 * Called on pause to update the ad UI.
 */
SdkImpl$2.prototype.onStreamPause = function () {
  if (this.isAdBreak) {
    this.adUiDiv.style.display = 'none';
  }
};

/**
 * Called on play to update the ad UI.
 */
SdkImpl$2.prototype.onStreamPlay = function () {
  if (this.isAdBreak) {
    this.adUiDiv.style.display = 'block';
  }
};

/**
 * Called on play to update the ad UI.
 * @param {number} currentTime the current time of the stream.
 */
SdkImpl$2.prototype.onSeekEnd = function (currentTime) {
  var streamType = this.daiController.getSettings().streamType;
  if (streamType === 'live') {
    return;
  }
  if (this.isSnapback) {
    this.isSnapback = false;
    return;
  }
  var previousCuePoint = this.streamManager.previousCuePointForStreamTime(currentTime);
  if (previousCuePoint && !previousCuePoint.played) {
    this.isSnapback = true;
    this.snapForwardTime = currentTime;
    this.vjsPlayer.currentTime(previousCuePoint.start);
  }
};

/**
 * Handles IMA events.
 * @param {google.ima.StreamEvent!} event the IMA event
 */
SdkImpl$2.prototype.onStreamEvent = function (event) {
  switch (event.type) {
    case google.ima.dai.api.StreamEvent.Type.LOADED:
      this.loadUrl(event.getStreamData().url);
      break;
    case google.ima.dai.api.StreamEvent.Type.ERROR:
      window.console.warn('Error loading stream, attempting to play backup ' + 'stream. ' + event.getStreamData().errorMessage);
      this.daiController.onErrorLoadingAds(event);
      if (this.daiController.getSettings().fallbackStreamUrl) {
        this.loadurl(this.daiController.getSettings().fallbackStreamUrl);
      }
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
      this.isAdBreak = true;
      this.adUiDiv.style.display = 'block';
      this.daiController.onAdBreakStart();
      break;
    case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
      this.isAdBreak = false;
      this.adUiDiv.style.display = 'none';
      this.daiController.onAdBreakEnd();
      if (this.snapForwardTime && this.snapForwardTime > this.vjsPlayer.currentTime()) {
        this.vjsPlayer.currentTime(this.snapForwardTime);
        this.snapForwardTime = 0;
      }
      break;
    default:
      break;
  }
};

/**
 * Loads the stream URL .
 * @param {string} streamUrl the URL for the stream being loaded.
 */
SdkImpl$2.prototype.loadUrl = function (streamUrl) {
  this.vjsPlayer.ready(function () {
    var streamFormat = this.daiController.getSettings().streamFormat;
    this.vjsPlayer.src({
      src: streamUrl,
      type: this.SOURCE_TYPES[streamFormat]
    });

    var bookmarkTime = this.daiController.getSettings().bookmarkTime;
    if (bookmarkTime) {
      var startTime = this.streamManager.streamTimeForContentTime(bookmarkTime);
      // Seeking on load triggers the onSeekEnd event, so treat this seek as
      // if it's snapback. Without this, resuming at a bookmark kicks you
      // back to the ad before the bookmark.
      this.isSnapback = true;
      this.vjsPlayer.currentTime(startTime);
    }
  }.bind(this));
};

/**
 * Creates the AdsRequest and request ads through the AdsLoader.
 */
SdkImpl$2.prototype.requestStream = function () {
  var streamRequest = void 0;
  var streamType = this.daiController.getSettings().streamType;
  if (streamType === 'vod') {
    streamRequest = new google.ima.dai.api.VODStreamRequest();
    streamRequest.contentSourceId = this.daiController.getSettings().cmsId;
    streamRequest.videoId = this.daiController.getSettings().videoId;
  } else if (streamType === 'live') {
    streamRequest = new google.ima.dai.api.LiveStreamRequest();
    streamRequest.assetKey = this.daiController.getSettings().assetKey;
  } else {
    window.console.warn('No valid stream type selected');
  }
  streamRequest.format = this.daiController.getSettings().streamFormat;

  if (this.daiController.getSettings().apiKey) {
    streamRequest.apiKey = this.daiController.getSettings().apiKey;
  }
  if (this.daiController.getSettings().authToken) {
    streamRequest.authToken = this.daiController.getSettings().authToken;
  }
  if (this.daiController.getSettings().adTagParameters) {
    streamRequest.adTagParameters = this.daiController.getSettings().adTagParameters;
  }
  if (this.daiController.getSettings().streamActivityMonitorId) {
    streamRequest.streamActivityMonitorId = this.daiController.getSettings().streamActivityMonitorId;
  }

  if (this.daiController.getSettings().omidMode) {
    streamRequest.omidAccessModeRules = {};
    var omidValues = this.daiController.getSettings().omidMode;

    if (omidValues.FULL) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.FULL] = omidValues.FULL;
    }
    if (omidValues.DOMAIN) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.DOMAIN] = omidValues.DOMAIN;
    }
    if (omidValues.LIMITED) {
      streamRequest.omidAccessModeRules[google.ima.OmidAccessMode.LIMITED] = omidValues.LIMITED;
    }
  }

  this.streamManager.requestStream(streamRequest);
  this.vjsPlayer.trigger({
    type: 'stream-request',
    StreamRequest: streamRequest
  });
};

/**
 * Initiates IMA when the player is ready.
 */
SdkImpl$2.prototype.onPlayerReady = function () {
  this.initImaDai();
};

/**
 * Reset the StreamManager when the player is disposed.
 */
SdkImpl$2.prototype.onPlayerDisposed = function () {
  if (this.streamManager) {
    this.streamManager.reset();
  }
};

/**
 * Returns the instance of the StreamManager.
 * @return {google.ima.StreamManager!} The StreamManager being used by the
 * plugin.
 */
SdkImpl$2.prototype.getStreamManager = function () {
  return this.StreamManager;
};

/**
 * Reset the SDK implementation.
 */
SdkImpl$2.prototype.reset = function () {
  if (this.StreamManager) {
    this.StreamManager.reset();
  }
};

/**
 * Copyright 2021 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */
/**
 * The coordinator for the DAI portion of the plugin. Facilitates
 * communication between all other plugin classes.
 *
 * @param {Object!} player Instance of the video.js player.
 * @param {Object!} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
var DaiController = function DaiController(player, options) {
  /**
  * If the stream is currently in an ad break.
  * @type {boolean}
  */
  this.inAdBreak = false;

  /**
  * Stores user-provided settings.
  * @type {Object!}
  */
  this.settings = {};

  /**
  * Whether or not we are running on a mobile platform.
  */
  this.isMobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i);

  /**
  * Whether or not we are running on an iOS platform.
  */
  this.isIos = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i);

  this.initWithSettings(options);

  /**
  * Stores contrib-ads default settings.
  */
  var contribAdsDefaults = {
    debug: this.settings.debug,
    timeout: this.settings.timeout,
    prerollTimeout: this.settings.prerollTimeout
  };
  var adsPluginSettings = Object.assign({}, contribAdsDefaults, options.contribAdsSettings || {});

  this.playerWrapper = new PlayerWrapper$2(player, adsPluginSettings, this);
  this.sdkImpl = new SdkImpl$2(this);
};

DaiController.IMA_DEFAULTS = {
  adLabel: 'Advertisement',
  adLabelNofN: 'of',
  debug: false,
  disableAdControls: false,
  showControlsForJSAds: true
};

/**
 * Extends the settings to include user-provided settings.
 *
 * @param {Object!} options Options to be used in initialization.
 */
DaiController.prototype.initWithSettings = function (options) {
  this.settings = Object.assign({}, DaiController.IMA_DEFAULTS, options || {});

  this.warnAboutDeprecatedSettings();

  // Default showing countdown timer to true.
  this.showCountdown = true;
  if (this.settings.showCountdown === false) {
    this.showCountdown = false;
  }
};

/**
 * Logs console warnings when deprecated settings are used.
 */
DaiController.prototype.warnAboutDeprecatedSettings = function () {
  var _this = this;

  var deprecatedSettings = [
    // Currently no DAI plugin settings are deprecated.
  ];
  deprecatedSettings.forEach(function (setting) {
    if (_this.settings[setting] !== undefined) {
      console.warn('WARNING: videojs.imaDai setting ' + setting + ' is deprecated');
    }
  });
};

/**
 * Return the settings object.
 *
 * @return {Object!} The settings object.
 */
DaiController.prototype.getSettings = function () {
  return this.settings;
};

/**
 * Return whether or not we're in a mobile environment.
 *
 * @return {boolean} True if running on mobile, false otherwise.
 */
DaiController.prototype.getIsMobile = function () {
  return this.isMobile;
};

/**
 * Return whether or not we're in an iOS environment.
 *
 * @return {boolean} True if running on iOS, false otherwise.
 */
DaiController.prototype.getIsIos = function () {
  return this.isIos;
};

/**
 * @return {Object!} The html5 player.
 */
DaiController.prototype.getStreamPlayer = function () {
  return this.playerWrapper.getStreamPlayer();
};

/**
 * @return {Object!} The video.js player.
 */
DaiController.prototype.getVjsPlayer = function () {
  return this.playerWrapper.getVjsPlayer();
};

/**
 * Requests the stream.
 */
DaiController.prototype.requestStream = function () {
  this.sdkImpl.requestStream();
};

/**
 * Add or modify a setting.
 *
 * @param {string} key Key to modify
 * @param {Object!} value Value to set at key.
*/
DaiController.prototype.setSetting = function (key, value) {
  this.settings[key] = value;
};

/**
 * Called when there is an error loading ads.
 *
 * @param {Object!} adErrorEvent The ad error event thrown by the IMA SDK.
 */
DaiController.prototype.onErrorLoadingAds = function (adErrorEvent) {
  this.playerWrapper.onAdError(adErrorEvent);
};

/**
 * Relays ad errors to the player wrapper.
 *
 * @param {Object!} adErrorEvent The ad error event thrown by the IMA SDK.
 */
DaiController.prototype.onAdError = function (adErrorEvent) {
  this.playerWrapper.onAdError(adErrorEvent);
};

/**
 * Signals player that an ad break has started.
 */
DaiController.prototype.onAdBreakStart = function () {
  this.inAdBreak = true;
  this.playerWrapper.onAdBreakStart();
};

/**
 * Signals player that an ad break has ended.
 */
DaiController.prototype.onAdBreakEnd = function () {
  this.inAdBreak = false;
  this.playerWrapper.onAdBreakEnd();
};

/**
 * Called when the player is disposed.
 */
DaiController.prototype.onPlayerDisposed = function () {
  this.contentAndAdsEndedListeners = [];
  this.sdkImpl.onPlayerDisposed();
};

/**
 * Returns if the stream is currently in an ad break.
 * @return {boolean} If the stream is currently in an ad break.
 */
DaiController.prototype.isInAdBreak = function () {
  return this.inAdBreak;
};

/**
 * Called on seek end to check for ad snapback.
 * @param {number} currentTime the current time of the stream.
 */
DaiController.prototype.onSeekEnd = function (currentTime) {
  this.sdkImpl.onSeekEnd(currentTime);
};

/**
 * Called when the player is ready.
 */
DaiController.prototype.onPlayerReady = function () {
  this.sdkImpl.onPlayerReady();
};

/**
 * Resets the state of the plugin.
 */
DaiController.prototype.reset = function () {
  this.sdkImpl.reset();
  this.playerWrapper.reset();
};

/**
 * Adds an EventListener to the StreamManager. For a list of available events,
 * see
 * https://developers.google.com/interactive-media-ads/docs/sdks/html5/dai/reference/js/StreamEvent
 * @param {google.ima.StreamEvent.Type!} event The AdEvent.Type for which to
 *     listen.
 * @param {callback!} callback The method to call when the event is fired.
 */
DaiController.prototype.addEventListener = function (event, callback) {
  this.sdkImpl.addEventListener(event, callback);
};

/**
 * Returns the instance of the StreamManager.
 * @return {google.ima.StreamManager!} The StreamManager being used by the
 * plugin.
 */
DaiController.prototype.getStreamManager = function () {
  return this.sdkImpl.getStreamManager();
};

/**
 * Returns the instance of the player id.
 * @return {string} The player id.
 */
DaiController.prototype.getPlayerId = function () {
  return this.playerWrapper.getPlayerId();
};

/**
 * @return {boolean} true if we expect that the stream will autoplay. false
 * otherwise.
 */
DaiController.prototype.streamWillAutoplay = function () {
  if (this.settings.streamWillAutoplay !== undefined) {
    return this.settings.streamWillAutoplay;
  } else {
    return !!this.playerWrapper.getPlayerOptions().autoplay;
  }
};

/**
 * Triggers an event on the VJS player
 * @param  {string} name The event name.
 * @param  {Object!} data The event data.
 */
DaiController.prototype.triggerPlayerEvent = function (name, data) {
  this.playerWrapper.triggerPlayerEvent(name, data);
};

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * IMA SDK integration plugin for Video.js. For more information see
 * https://www.github.com/googleads/videojs-ima
 */

/**
 * Exposes the ImaPlugin to a publisher implementation.
 *
 * @param {Object} player Instance of the video.js player to which this plugin
 *     will be added.
 * @param {Object} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
var ImaPlugin = function ImaPlugin(player, options) {
  this.controller = new Controller(player, options);

  /**
   * Listener JSDoc for ESLint. This listener can be passed to
   * addContent(AndAds)EndedListener.
   * @callback listener
   */

  /**
   * Adds a listener that will be called when content and all ads have
   * finished playing.
   * @param {listener} listener The listener to be called when content and ads
   *     complete.
   */
  this.addContentAndAdsEndedListener = function (listener) {
    this.controller.addContentAndAdsEndedListener(listener);
  }.bind(this);

  /**
   * Adds a listener for the 'contentended' event of the video player. This
   * should be used instead of setting an 'contentended' listener directly to
   * ensure that the ima can do proper cleanup of the SDK before other event
   * listeners are called.
   * @param {listener} listener The listener to be called when content
   *     completes.
   */
  this.addContentEndedListener = function (listener) {
    this.controller.addContentEndedListener(listener);
  }.bind(this);

  /**
   * Callback JSDoc for ESLint. This callback can be passed to addEventListener.
   * @callback callback
   */

  /**
   * Ads an EventListener to the AdsManager. For a list of available events,
   * see
   * https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdEvent#.Type
   * @param {google.ima.AdEvent.Type} event The AdEvent.Type for which to
   *     listen.
   * @param {callback} callback The method to call when the event is fired.
   */
  this.addEventListener = function (event, callback) {
    this.controller.addEventListener(event, callback);
  }.bind(this);

  /**
   * Changes the ad tag. You will need to call requestAds after this method
   * for the new ads to be requested.
   * @param {?string} adTag The ad tag to be requested the next time requestAds
   *     is called.
   */
  this.changeAdTag = function (adTag) {
    this.controller.changeAdTag(adTag);
  }.bind(this);

  /**
   * Returns the instance of the AdsManager.
   * @return {google.ima.AdsManager} The AdsManager being used by the plugin.
   */
  this.getAdsManager = function () {
    return this.controller.getAdsManager();
  }.bind(this);

  /**
   * Initializes the AdDisplayContainer. On mobile, this must be done as a
   * result of user action.
   */
  this.initializeAdDisplayContainer = function () {
    this.controller.initializeAdDisplayContainer();
  }.bind(this);

  /**
   * Pauses the ad.
   */
  this.pauseAd = function () {
    this.controller.pauseAd();
  }.bind(this);

  /**
   * Called by publishers in manual ad break playback mode to start an ad
   * break.
   */
  this.playAdBreak = function () {
    this.controller.playAdBreak();
  }.bind(this);

  /**
   * Creates the AdsRequest and request ads through the AdsLoader.
   */
  this.requestAds = function () {
    this.controller.requestAds();
  }.bind(this);

  /**
   * Resumes the ad.
   */
  this.getSettings = function () { return this.controller.getSettings(); }.bind(this);
    this.resumeAd = function () {
    this.controller.resumeAd();
  }.bind(this);

  /**
   * Sets the listener to be called to trigger manual ad break playback.
   * @param {listener} listener The listener to be called to trigger manual ad
   *     break playback.
   */
  this.setAdBreakReadyListener = function (listener) {
    this.controller.setAdBreakReadyListener(listener);
  }.bind(this);

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ad tag is
   * requested when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?string} adTag The ad tag to be requested when the content loads.
   *     Leave blank to use the existing ad tag.
   */
  this.setContentWithAdTag = function (contentSrc, adTag) {
    this.controller.setContentWithAdTag(contentSrc, adTag);
  }.bind(this);

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ads response is
   * used when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?string} adsResponse The ads response to be requested when the
   *     content loads. Leave blank to use the existing ads response.
   */
  this.setContentWithAdsResponse = function (contentSrc, adsResponse) {
    this.controller.setContentWithAdsResponse(contentSrc, adsResponse);
  }.bind(this);

  /**
   * Sets the content of the video player. You should use this method instead
   * of setting the content src directly to ensure the proper ads request is
   * used when the video content is loaded.
   * @param {?string} contentSrc The URI for the content to be played. Leave
   *     blank to use the existing content.
   * @param {?Object} adsRequest The ads request to be requested when the
   *     content loads. Leave blank to use the existing ads request.
   */
  this.setContentWithAdsRequest = function (contentSrc, adsRequest) {
    this.controller.setContentWithAdsRequest(contentSrc, adsRequest);
  }.bind(this);

  /**
   * Changes the flag to show or hide the ad countdown timer.
   *
   * @param {boolean} showCountdownIn Show or hide the countdown timer.
   */
  this.setShowCountdown = function (showCountdownIn) {
    this.controller.setShowCountdown(showCountdownIn);
  }.bind(this);
};

/**
 * Exposes the ImaDaiPlugin to a publisher implementation.
 *
 * @param {Object} player Instance of the video.js player to which this plugin
 *     will be added.
 * @param {Object} options Options provided by the implementation.
 * @constructor
 * @struct
 * @final
 */
var ImaDaiPlugin = function ImaDaiPlugin(player, options) {
  this.controller = new DaiController(player, options);

  /**
   * Adds a listener that will be called when content and all ads in the
   * stream have finished playing. VOD stream only.
   * @param {listener} listener The listener to be called when content and ads
   *     complete.
   */
  this.streamEndedListener = function (listener) {
    this.controller.addStreamEndedListener(listener);
  }.bind(this);

  /**
   * Adds an EventListener to the StreamManager.
   * @param {google.ima.StreamEvent.Type} event The StreamEvent.Type for which
   * to listen.
   * @param {callback} callback The method to call when the event is fired.
   */
  this.addEventListener = function (event, callback) {
    this.controller.addEventListener(event, callback);
  }.bind(this);

  /**
   * Returns the instance of the StreamManager.
   * @return {google.ima.StreamManager} The StreamManager being used by the
   * plugin.
   */
  this.getStreamManager = function () {
    return this.controller.getStreamManager();
  }.bind(this);
};

/**
 * Initializes the plugin for client-side ads.
 * @param {Object} options Plugin option set on initiation.
 */
var init = function init(options) {
  /* eslint no-invalid-this: 'off' */
  this.ima = new ImaPlugin(this, options);
};

/**
 * LiveStream class used for DAI live streams.
 */

var LiveStream =
/**
 * LiveStream class constructor used for DAI live streams.
 * @param {string} streamFormat stream format, plugin currently supports only
 * 'hls' streams.
 * @param {string} assetKey live stream's asset key.
 */
function LiveStream(streamFormat, assetKey) {
  _classCallCheck(this, LiveStream);

  streamFormat = streamFormat.toLowerCase();
  if (streamFormat !== 'hls' && streamFormat !== 'dash') {
    window.console.error('VodStream error: incorrect streamFormat.');
    return;
  } else if (streamFormat === 'dash') {
    window.console.error('streamFormat error: DASH streams are not' + 'currently supported by this plugin.');
    return;
  } else if (typeof assetKey !== 'string') {
    window.console.error('assetKey error: value must be string.');
    return;
  }
  this.streamFormat = streamFormat;
  this.assetKey = assetKey;
};

/**
 * VodStream class used for DAI VOD streams.
 */


var VodStream =
/**
 * VodStream class constructor used for DAI VOD streams.
 * @param {string} streamFormat stream format, plugin currently supports only
 * 'hls' streams.
 * @param {string} cmsId VOD stream's CMS ID.
 * @param {string} videoId VOD stream's video ID.
 */
function VodStream(streamFormat, cmsId, videoId) {
  _classCallCheck(this, VodStream);

  streamFormat = streamFormat.toLowerCase();
  if (streamFormat !== 'hls' && streamFormat !== 'dash') {
    window.console.error('VodStream error: incorrect streamFormat.');
    return;
  } else if (streamFormat === 'dash') {
    window.console.error('streamFormat error: DASH streams are not' + 'currently supported by this plugin.');
    return;
  } else if (typeof cmsId !== 'string') {
    window.console.error('cmsId error: value must be string.');
    return;
  } else if (typeof videoId !== 'string') {
    window.console.error('videoId error: value must be string.');
    return;
  }

  this.streamFormat = streamFormat;
  this.cmsId = cmsId;
  this.videoId = videoId;
};

/**
 * Initializes the plugin for DAI ads.
 * @param {Object} stream Accepts either an instance of the LiveStream or
 * VodStream classes.
 * @param {Object} options Plugin option set on initiation.
 */


var initDai = function initDai(stream, options) {
  if (stream instanceof LiveStream) {
    options.streamType = 'live';
    options.assetKey = stream.assetKey;
  } else if (stream instanceof VodStream) {
    options.streamType = 'vod';
    options.cmsId = stream.cmsId;
    options.videoId = stream.videoId;
  } else {
    window.console.error('initDai() first parameter must be an instance of LiveStream or ' + 'VodStream.');
    return;
  }

  options.streamFormat = stream.streamFormat;
  /* eslint no-invalid-this: 'off' */
  this.imaDai = new ImaDaiPlugin(this, options);
};

var registerPlugin = videojs.registerPlugin || videojs.plugin;
registerPlugin('ima', init);
registerPlugin('imaDai', initDai);

exports['default'] = ImaPlugin;
exports.VodStream = VodStream;
exports.LiveStream = LiveStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"video.js":"video.js"}],3:[function(require,module,exports){
"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,_toPropertyKey(n.key),n)}}function _createClass(t,e,i){return e&&_defineProperties(t.prototype,e),i&&_defineProperties(t,i),Object.defineProperty(t,"prototype",{writable:!1}),t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var n=i.call(t,e||"default");if("object"!==_typeof(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Ava=void 0;var Ava=function(){function t(e,i,n,s,o,r,h,a){_classCallCheck(this,t),this.domElement=e,this.rootElement=i,this.playerStorage=n,this.position=s,this.resizeFn=h,this.viewPortSize=o,this.avaSize=r,this.snapshot={parentElement:{},player:{width:0,height:0}},this.forceStop=!1,this.on=!1,this.wantsOn=!1,this.observer=[],this.delayStartStop=a}return _createClass(t,[{key:"startAva",value:function(){return!this.on&&(!this.forceStop&&(!this.errorWithDomElement()&&(this.wantsOn=!0,this.delayStartStop?(this.manageDelayStartStop(),!1):this.actuallyStartAva())))}},{key:"actuallyStartAva",value:function(){return this.size=[this.domElement.parentElement.clientWidth,this.domElement.parentElement.clientHeight],this.doSnapshot(),this.domElement.parentElement.style.width=this.size[0]+"px",this.domElement.parentElement.style.height=this.size[1]+"px",this.doFix(),this.on=!0,this.playerStorage.playerSize.setSizeByType("ava",this.avaSize.getWidth(),this.avaSize.getHeight()),this.playerStorage.playerSize.setType("ava"),this.resizeFn&&this.resizeFn({width:this.avaSize.getWidth(),height:this.avaSize.getHeight()}),this.observer.forEach(function(t){return t()}),!0}},{key:"stopAva",value:function(){return!!this.on&&(!this.forceStop&&(!this.errorWithDomElement()&&(this.wantsOn=!1,this.delayStartStop?(this.manageDelayStartStop(),!1):this.actuallyStopAva())))}},{key:"actuallyStopAva",value:function(){return this.doUnfix(),this.doRestore(),this.on=!1,this.playerStorage.playerSize.setType("nonAva"),this.observer.forEach(function(t){return t()}),!0}},{key:"doSnapshot",value:function(){if(this.errorWithDomElement())return!1;switch(this.snapshot.parentElement.width=this.domElement.parentElement.style.width,this.snapshot.parentElement.height=this.domElement.parentElement.style.height,this.resizeFn&&(this.snapshot.player=this.resizeFn()),this.snapshot.width=this.domElement.style.width,this.snapshot.height=this.domElement.style.height,this.snapshot.zIndex=this.domElement.style.zIndex,this.snapshot.position=this.domElement.style.position,this.position){case"top-left":this.snapshot.top=this.domElement.style.top,this.snapshot.left=this.domElement.style.left;break;case"top-right":this.snapshot.top=this.domElement.style.top,this.snapshot.right=this.domElement.style.right;break;case"bottom-left":this.snapshot.bottom=this.domElement.style.bottom,this.snapshot.left=this.domElement.style.left;break;case"bottom-right":this.snapshot.bottom=this.domElement.style.bottom,this.snapshot.right=this.domElement.style.right;break;default:throw"Unknown position:"+this.position}return!0}},{key:"doRestore",value:function(){if(this.errorWithDomElement())return!1;void 0!==this.snapshot.parentElement.width&&(this.domElement.parentElement.style.width=this.snapshot.parentElement.width),void 0!==this.snapshot.parentElement.height&&(this.domElement.parentElement.style.height=this.snapshot.parentElement.height),this.resizeFn&&(this.snapshot.player=this.resizeFn(this.snapshot.player))}},{key:"doFix",value:function(){return!0}},{key:"doUnfix",value:function(){return!0}},{key:"errorWithDomElement",value:function(){var t=this.domElement.parentElement instanceof this.domElement.parentElement.ownerDocument.defaultView.HTMLElement||this.domElement.parentElement.toString().match(/\[object HTML.*Element\]/);return!this.domElement||!this.domElement.parentElement||!t}},{key:"manageDelayStartStop",value:function(){this.delayStartStop&&this.delayStartStop(this.handleDelayStartStop.bind(this),50)}},{key:"handleDelayStartStop",value:function(){this.wantsOn&&!this.on&&this.actuallyStartAva(),!this.wantsOn&&this.on&&this.actuallyStopAva()}}]),t}();exports.Ava=Ava;

},{}],4:[function(require,module,exports){
"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.AvaCSS=void 0;var _ava=require("./ava"),_log=require("../log/log");function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var o=0;o<e.length;o++){var i=e[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,_toPropertyKey(i.key),i)}}function _createClass(t,e,o){return e&&_defineProperties(t.prototype,e),o&&_defineProperties(t,o),Object.defineProperty(t,"prototype",{writable:!1}),t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var o=t[Symbol.toPrimitive];if(void 0!==o){var i=o.call(t,e||"default");if("object"!==_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&_setPrototypeOf(t,e)}function _setPrototypeOf(t,e){return(_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t})(t,e)}function _createSuper(t){var e=_isNativeReflectConstruct();return function(){var o,i=_getPrototypeOf(t);if(e){var r=_getPrototypeOf(this).constructor;o=Reflect.construct(i,arguments,r)}else o=i.apply(this,arguments);return _possibleConstructorReturn(this,o)}}function _possibleConstructorReturn(t,e){if(e&&("object"===_typeof(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(t)}function _assertThisInitialized(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}function _getPrototypeOf(t){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var AvaCSS=function(t){_inherits(o,_ava.Ava);var e=_createSuper(o);function o(){return _classCallCheck(this,o),e.apply(this,arguments)}return _createClass(o,[{key:"setupCSS",value:function(){if(this.timeoutID=0,!this.cssElement){var t=this.domElement.parentElement;if(t){var e=this.setupCSSClassName(),o=this.cssElement=t.ownerDocument.createElement("style");o.type="text/css";o.innerHTML="."+e+"fixed { position: fixed; z-index: 20000000; transition: top,left,right,bottom,position 0.4s,0.4s,0.4s,0.4s,0.4s ease-in-out; width: "+this.avaSize.getWidth()+"px; height: "+this.avaSize.getHeight()+"px; }."+e+"top-left { top: 10px; left: 10px; right: unset; bottom: unset; }."+e+"top-right { top: 10px; right: 10px; left: unset; bottom: unset; }."+e+"bottom-left { bottom: 10px; left: 10px; right: unset; top: unset; }."+e+"bottom-right { bottom: 10px; right: 10px; left: unset; top: unset; }";for(var i=this.domElement;i&&i.parentElement&&i.parentElement!==i;)i=i.parentElement;i.querySelector("head").appendChild(o)}}}},{key:"setupCSSClassName",value:function(){return this.cssClassName||(this.cssClassName="avaCSS"+(new Date).getTime()),this.cssClassName}},{key:"setupUnfixedCSS",value:function(){var t=this.domElement.parentElement;if(t){this.cssUnfixedElement&&(this.cssUnfixedElement.remove(),this.cssUnfixedElement=void 0);var e=this.setupCSSClassName(),o=t.getBoundingClientRect();(0,_log.cLog)("bounding:",o);var i=this.cssUnfixedElement=t.ownerDocument.createElement("style");i.type="text/css";var r=this.viewPortSize(),s="";switch(this.position){case"top-left":s="top: "+o.top+"px; left:"+o.left+"px; right: initial; bottom: initial;";break;case"top-right":s="top: "+o.top+"px; left: initial; right:"+(r[0]-o.right)+"px; bottom: initial;";break;case"bottom-left":s="top: initial; left:"+o.left+"px; right: initial; bottom: "+(r[1]-o.bottom)+"px;";break;case"bottom-right":s="top: initial; left: initial; right: "+(r[0]-o.right)+"px; bottom: "+(r[1]-o.bottom)+"px;"}i.innerHTML="."+e+"unfixed { position:fixed; z-index: 20000000; "+s+" transition: top,left,right,bottom,position 0.4s,0.4s,0.4s,0.4s,0.4s ease-in-out; }",this.rootElement.querySelector("head").appendChild(i)}}},{key:"doFix",value:function(){this.setupCSS(),this.setupUnfixedCSS();var t=this.cssClassName;if(!t)throw"Missing cssClassName";var e=this.playerStorage.getElementToFloat();if(this.domElement.classList.add(t+"unfixed"),e&&e.classList.add(t+"unfixed"),this.playerStorage.rootDocument&&this.playerStorage.rootDocument.nodeName&&this.playerStorage.rootDocument.nodeName.match&&this.playerStorage.rootDocument.nodeName.match(/-fragment/)&&this.playerStorage.rootDocument.host){this.playerStorage.rootDocument.host.style.zIndex=1111;var o=window.getComputedStyle(this.playerStorage.rootDocument.host);"absolute"===o.position&&"relative"===o.position||(this.playerStorage.rootDocument.host.style.top.match(/px$/)||this.playerStorage.rootDocument.host.style.left.match(/px$/)?this.playerStorage.rootDocument.host.style.position="absolute":this.playerStorage.rootDocument.host.style.position="relative")}var i=this;return requestAnimationFrame(function(t){i.wantsOn&&(i.domElement.classList.remove(t+"unfixed"),e&&e.classList.remove(t+"unfixed"),i.domElement.classList.add(t+"fixed"),e&&e.classList.add(t+"fixed"),i.domElement.classList.add(t+i.position),e&&e.classList.add(t+i.position))}.bind(this,t)),!0}},{key:"doUnfix",value:function(){if(this.errorWithDomElement())return!1;var t=this.cssClassName;if(!t)throw"Missing cssClassName";this.setupUnfixedCSS();var e=this.playerStorage.getElementToFloat();this.playerStorage.rootDocument&&this.playerStorage.rootDocument.nodeName&&this.playerStorage.rootDocument.nodeName.match&&this.playerStorage.rootDocument.nodeName.match(/-fragment/)&&(this.playerStorage.rootDocument.host&&(this.playerStorage.rootDocument.host.style.zIndex="","relative"===window.getComputedStyle(this.playerStorage.rootDocument.host).position&&(this.playerStorage.rootDocument.host.style.position="absolute")));this.domElement.classList.add(t+"unfixed"),e&&e.classList.add(t+"unfixed"),this.domElement.classList.remove(t+"fixed"),e&&e.classList.remove(t+"fixed"),this.domElement.classList.remove(t+this.position),e&&e.classList.remove(t+this.position),this.timeoutID&&clearTimeout(this.timeoutID);var o=this;return this.timeoutID=setTimeout(function(t){o.wantsOn||(o.domElement.classList.remove(t+"unfixed"),e&&e.classList.remove(t+"unfixed"),o.resizeFn&&o.resizeFn(o.snapshot.player),o.resizeFn&&setTimeout(o.resizeFn.bind(o,o.snapshot.player),150))}.bind(this,t),950),!0}}]),o}();exports.AvaCSS=AvaCSS;

},{"../log/log":17,"./ava":3}],5:[function(require,module,exports){
"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.AvaSizeDynamic=void 0;var _isMobile=require("../dom/isMobile");function _toConsumableArray(t){return _arrayWithoutHoles(t)||_iterableToArray(t)||_unsupportedIterableToArray(t)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(t,e):void 0}}function _iterableToArray(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}function _arrayWithoutHoles(t){if(Array.isArray(t))return _arrayLikeToArray(t)}function _arrayLikeToArray(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,o=new Array(e);r<e;r++)o[r]=t[r];return o}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var r=0;r<e.length;r++){var o=e[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,_toPropertyKey(o.key),o)}}function _createClass(t,e,r){return e&&_defineProperties(t.prototype,e),r&&_defineProperties(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var o=r.call(t,e||"default");if("object"!==_typeof(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&_setPrototypeOf(t,e)}function _setPrototypeOf(t,e){return(_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t})(t,e)}function _createSuper(t){var e=_isNativeReflectConstruct();return function(){var r,o=_getPrototypeOf(t);if(e){var n=_getPrototypeOf(this).constructor;r=Reflect.construct(o,arguments,n)}else r=o.apply(this,arguments);return _possibleConstructorReturn(this,r)}}function _possibleConstructorReturn(t,e){if(e&&("object"===_typeof(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(t)}function _assertThisInitialized(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}function _getPrototypeOf(t){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var AvaSizeDynamic=function(t){_inherits(r,_isMobile.IsMobile);var e=_createSuper(r);function r(t){return _classCallCheck(this,r),e.call.apply(e,[this].concat(_toConsumableArray(t)))}return _createClass(r,[{key:"getWidth",value:function(){var t=this.viewPortWidth*this.viewPortHeight,e=Math.sqrt(t*(this._avaSize.mobile.percentage/100)*this._ratio);return this.isMobile()?Math.min(this.viewPortWidth,e):this._avaSize.desktop.width}},{key:"getHeight",value:function(){return this.isMobile()?this.getWidth()/this._ratio:this._avaSize.desktop.height}},{key:"avaSize",set:function(t){this._avaSize=t}},{key:"ratio",set:function(t){this._ratio=t}}]),r}();exports.AvaSizeDynamic=AvaSizeDynamic;

},{"../dom/isMobile":13}],6:[function(require,module,exports){
"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.AvaStyles=void 0;var _ava=require("./ava");function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var o=0;o<e.length;o++){var i=e[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,_toPropertyKey(i.key),i)}}function _createClass(t,e,o){return e&&_defineProperties(t.prototype,e),o&&_defineProperties(t,o),Object.defineProperty(t,"prototype",{writable:!1}),t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var o=t[Symbol.toPrimitive];if(void 0!==o){var i=o.call(t,e||"default");if("object"!==_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&_setPrototypeOf(t,e)}function _setPrototypeOf(t,e){return(_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t})(t,e)}function _createSuper(t){var e=_isNativeReflectConstruct();return function(){var o,i=_getPrototypeOf(t);if(e){var s=_getPrototypeOf(this).constructor;o=Reflect.construct(i,arguments,s)}else o=i.apply(this,arguments);return _possibleConstructorReturn(this,o)}}function _possibleConstructorReturn(t,e){if(e&&("object"===_typeof(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(t)}function _assertThisInitialized(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}function _getPrototypeOf(t){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var AvaStyles=function(t){_inherits(o,_ava.Ava);var e=_createSuper(o);function o(){return _classCallCheck(this,o),e.apply(this,arguments)}return _createClass(o,[{key:"doFix",value:function(){var t=this.domElement;switch(this.domElement.style.width=this.avaSize.getWidth()+"px",this.domElement.style.height=this.avaSize.getHeight()+"px",t&&(t.style.width=this.avaSize.getWidth()+"px",t.style.height=this.avaSize.getHeight()+"px"),this.position){case"top-left":this.domElement.style.top="10px",this.domElement.style.left="10px";break;case"top-right":this.domElement.style.top="10px",this.domElement.style.right="10px";break;case"bottom-left":this.domElement.style.bottom="10px",this.domElement.style.left="10px";break;case"bottom-right":this.domElement.style.bottom="10px",this.domElement.style.right="10px";break;default:throw"Unknown position:"+this.position}return this.domElement.style.zIndex=""+2e6,this.domElement.style.position="fixed",!0}},{key:"doUnfix",value:function(){if(this.errorWithDomElement())return!1;var t=this.domElement;switch(void 0!==this.snapshot.width&&(this.domElement.style.width=this.snapshot.width),void 0!==this.snapshot.height&&(this.domElement.style.height=this.snapshot.height),void 0!==this.snapshot.zIndex&&(this.domElement.style.zIndex=this.snapshot.zIndex),void 0!==this.snapshot.position&&(this.domElement.style.position=this.snapshot.position),this.position){case"top-left":void 0!==this.snapshot.top&&(this.domElement.style.top=this.snapshot.top),void 0!==this.snapshot.left&&(this.domElement.style.left=this.snapshot.left);break;case"top-right":void 0!==this.snapshot.top&&(this.domElement.style.top=this.snapshot.top),void 0!==this.snapshot.right&&(this.domElement.style.right=this.snapshot.right);break;case"bottom-left":void 0!==this.snapshot.bottom&&(this.domElement.style.bottom=this.snapshot.bottom),void 0!==this.snapshot.left&&(this.domElement.style.left=this.snapshot.left);break;case"bottom-right":void 0!==this.snapshot.bottom&&(this.domElement.style.bottom=this.snapshot.bottom),void 0!==this.snapshot.right&&(this.domElement.style.right=this.snapshot.right);break;default:throw"Unknown position:"+this.position}return t&&(t.style.width=this.snapshot.width?this.snapshot.width:"",t.style.height=this.snapshot.height?this.snapshot.height:""),!0}}]),o}();exports.AvaStyles=AvaStyles;

},{"./ava":3}],7:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Controller=void 0;var _ava=require("./ava"),_debounce=require("debounce");function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,_toPropertyKey(i.key),i)}}function _createClass(t,e,r){return e&&_defineProperties(t.prototype,e),r&&_defineProperties(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var i=r.call(t,e||"default");if("object"!==_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}var Controller=function(){function t(e,r){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1e3;_classCallCheck(this,t),this.ava=e,this.isPaused=r,this.wantsAva=!1,this.viewedCompletelyTS=void 0,this.debouncedChangeAvaStartStop=(0,_debounce.debounce)(this.changeAvaStartStop.bind(this),i)}return _createClass(t,[{key:"changeAvaStartStop",value:function(){this.wantsAva?this.ava.startAva():this.ava.stopAva()}},{key:"startAva",value:function(){return!!this.viewedCompletelyTS&&(this.wantsAva=!0,this.isPaused()?(this.startTimer(),!1):(this.ava.startAva(),!0))}},{key:"forceStartAva",value:function(){this.viewedCompletelyTS=performance.now(),this.wantsAva=!0,this.ava.startAva()}},{key:"viewableCompletely",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0]||this.viewedCompletelyTS;this.viewedCompletelyTS||(this.viewedCompletelyTS=performance.now()),t&&this.wantsAva&&(this.wantsAva=!1,this.debouncedChangeAvaStartStop(),this.stopTimer())}},{key:"startTimer",value:function(){this.timer||(this.timer=setInterval(this.checkInterval.bind(this),1e3))}},{key:"stopTimer",value:function(){this.timer&&(clearInterval(this.timer),this.timer=void 0)}},{key:"checkInterval",value:function(){this.wantsAva&&this.startAva()&&this.stopTimer()}}]),t}();exports.Controller=Controller;

},{"./ava":3,"debounce":1}],8:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.install=install;var _viewability=require("./viewability"),_avaCSS=require("./avaCSS"),_viewport=require("../dom/viewport"),_avaStyles=require("./avaStyles"),_closeCSS=require("../interstitial/closeCSS"),_avaSizeDynamic=require("./avaSizeDynamic"),_log=require("../log/log"),_cls=require("../browser/cls");function install(e,i,a,r,t,o,l,n){var s,d=arguments.length>8&&void 0!==arguments[8]?arguments[8]:void 0,v=arguments.length>9&&void 0!==arguments[9]?arguments[9]:-1,p=arguments.length>10&&void 0!==arguments[10]&&arguments[10],u=arguments.length>11&&void 0!==arguments[11]&&arguments[11],y=arguments.length>12&&void 0!==arguments[12]&&arguments[12],c=arguments.length>13&&void 0!==arguments[13]?arguments[13]:null,g=_viewport.getTopViewPortSize,h=g(),S=function(e){if(e){l.player.width(e.width),l.player.height(e.height);try{l.player.ima.getAdsManager().resize(e.width,e.height,"NORMAL")}catch(e){(0,_log.cLog)("AdsManager not set",e)}}return{width:l.player.width(),height:l.player.height()}},w=new _avaSizeDynamic.AvaSizeDynamic(h);w.avaSize=l.options.avaSize;var A=l.player.width(),_=l.player.height();w.ratio=A&&_?A/_:16/9;var C=void 0;if(l.options.avaAvoidCLS){var f=new _cls.Cls;f.setup(),C=l.options.avaAvoidCLS?f.addObserver.bind(f):void 0}s=new _avaCSS.AvaCSS(i,a,l,t,g,w,S,C),l.pollForceViewability(function(){return s.on}),l.pollIsAvaOn=function(){return s.on},"function"==typeof l.setForceViewabilityCheck&&s.observer.push(l.setForceViewabilityCheck);var b=new _closeCSS.CloseCSS(e.parentElement,a,function(){l.playerState.adManager.userClosedVidAd=!0,l.player.one("playing",function(){return l.playerState.adManager.userClosedVidAd=!1}),s.stopAva(),setTimeout(function(){(0,_log.cLog)("AVA close => stop playing",l.playerState.adManager.playingAnAd),l.playerState.adManager.playingAnAd?l.player.muted()&&0!==l.player.volume()||l.player.ima.pauseAd():l.player.paused()||((0,_log.cLog)("AVA close => pause playing"),l.player.pause())},100),c&&void 0!==c.avaClose&&Array.isArray(c.avaClose)&&c.avaClose.forEach(function(e){return e()})});return b.size=d,b.setup(),b.hide(),v>=0&&v&&l.player.on(["adstart","adsstart"],function(){(0,_log.cLog)("hideDuringSomeMilliseconds",v),b.hideDuringSomeMilliseconds(1e3*v)}),s.observer.push(function(e,i){e.on?i.show():i.hide()}.bind(this,s,b)),(0,_viewability.avaViewabilityLogic)(s,r,l.player,l,void 0,void 0,2e3,u,p,y),s}

},{"../browser/cls":10,"../dom/viewport":14,"../interstitial/closeCSS":16,"../log/log":17,"./avaCSS":4,"./avaSizeDynamic":5,"./avaStyles":6,"./viewability":9}],9:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.avaViewabilityLogic=avaViewabilityLogic;var _controller=require("./controller"),_intersection=require("../observer/intersection"),_paused=require("../player/paused"),_log=require("../log/log");function avaViewabilityLogic(e,t,a,r,i,n){var o,l=arguments.length>6&&void 0!==arguments[6]?arguments[6]:1e3,s=arguments.length>7&&void 0!==arguments[7]&&arguments[7],v=arguments.length>8&&void 0!==arguments[8]&&arguments[8],d=arguments.length>9&&void 0!==arguments[9]&&arguments[9],u={threshold:.99,viewable:void 0,tsLastTransition:void 0,tsPreviousTransition:void 0,observer:[]},c={threshold:.8,viewable:void 0,tsLastTransition:void 0,tsPreviousTransition:void 0,observer:[]},p=[u,c];i&&(u.threshold=Math.max(.01,Math.min(i,.99))),n&&(c.threshold=Math.max(.01,Math.min(n,.99)));var h=new _controller.Controller(e,_paused.isFullyPaused.bind(this,a),l),b=null;if(v){var g=null,A=function(){if(r.playerState.playingVidAd&&!r.playerState.adManager.userClosedVidAd)return g=!0,h.startAva();(g||h.ava.on)&&(h.wantsAva=!1,h.changeAvaStartStop(),g=!1)};c.observer.push(function(e){if(e.viewable)return h.wantsAva=!1,h.changeAvaStartStop(),g=!1,void(b&&(clearInterval(b),b=null));A(),b||(b=setInterval(A,1e3))}),u.observer.push(function(e){return e.viewable?h.viewableCompletely(!0):null})}else c.observer.push(function(e){return e.viewable?null:h.startAva()}),u.observer.push(function(e){return e.viewable?h.viewableCompletely():null});(o=new _intersection.Intersection(p)).setup(t),r.disposeCallback.push(function(e){b&&(clearInterval(b),b=null)}),r.disposeCallback.push(function(e){return o.dispose()}),s&&h.forceStartAva(),v&&((0,_log.cLog)("avaOnlyOnVidAd prepared"),a.on(["adstart","adsstart"],function(){(0,_log.cLog)("avaOnlyOnVidAd launched",c,u),c.viewable||h.forceStartAva()})),d&&((0,_log.cLog)("startAVAOnVidAdStart prepared"),a.on(["adstart","adsstart"],function(){(0,_log.cLog)("startAVAOnVidAdStart launched",c,u),c.viewable||h.forceStartAva()}))}

},{"../log/log":17,"../observer/intersection":18,"../player/paused":21,"./controller":7}],10:[function(require,module,exports){
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,_toPropertyKey(r.key),r)}}function _createClass(e,t,i){return t&&_defineProperties(e.prototype,t),i&&_defineProperties(e,i),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var t=_toPrimitive(e,"string");return"symbol"===_typeof(t)?t:String(t)}function _toPrimitive(e,t){if("object"!==_typeof(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var r=i.call(e,t||"default");if("object"!==_typeof(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Cls=void 0;var Cls=function(){function e(){_classCallCheck(this,e),this.observers=[],this.timeSinceUserInteractedWithThePage=(new Date).getTime()}return _createClass(e,[{key:"setup",value:function(){this.addCLSEvents()}},{key:"addCLSEvents",value:function(){top.addEventListener("touchend",this.updateTimeSinceUserInteractedWithThePage.bind(this)),top.addEventListener("keydown",this.updateTimeSinceUserInteractedWithThePage.bind(this)),top.addEventListener("mousedown",this.updateTimeSinceUserInteractedWithThePage.bind(this))}},{key:"updateTimeSinceUserInteractedWithThePage",value:function(){this.timeSinceUserInteractedWithThePage=(new Date).getTime(),this.dispatchEvents()}},{key:"dispatchEvents",value:function(){this.observers.forEach(function(e){return e()}),this.observers=[]}},{key:"addObserver",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;if(t&&(new Date).getTime()-this.timeSinceUserInteractedWithThePage<t)return void e();this.observers.push(e)}}]),e}();exports.Cls=Cls;

},{}],11:[function(require,module,exports){
"use strict";function parseQuery(e,r){for(var t=r||{},i=("?"===e[0]?e.substr(1):e).split("&"),n=0;n<i.length;n++){var s=i[n].split("=");t[decodeURIComponent(s[0])]=decodeURIComponent(s[1]||"")}return t}function parseQueryString(e){var r,t,i,n,s,a;a={};t=(r=e.split("&")).length;for(var u=0;u<t;u++){var p=r[u];p.length&&(n=(i=p.split("=",2))[0],s=i[1],a[n]=s)}return a}function serializeQueryString(e){var r,t,i;for(r in t=[],e)e.hasOwnProperty(r)&&(void 0===(i=e[r])?t.push(r):t.push(r+"="+i));return t.join("&")}function removeDuplicateURLParameters(e){var r=e.split("#",2);if(r[0].indexOf("?")<0)return e;var t=r[0].split("?"),i=parseQueryString(t[1]),n=t[0]+"?"+serializeQueryString(i);return r.length>1&&(n+="#"+r[1]),n}Object.defineProperty(exports,"__esModule",{value:!0}),exports.parseQuery=parseQuery,exports.parseQueryString=parseQueryString,exports.removeDuplicateURLParameters=removeDuplicateURLParameters,exports.serializeQueryString=serializeQueryString;

},{}],12:[function(require,module,exports){
"use strict";function showNonPersonalizedAds(){return!1}Object.defineProperty(exports,"__esModule",{value:!0}),exports.showNonPersonalizedAds=showNonPersonalizedAds;

},{}],13:[function(require,module,exports){
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var i=t[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,_toPropertyKey(i.key),i)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var t=_toPrimitive(e,"string");return"symbol"===_typeof(t)?t:String(t)}function _toPrimitive(e,t){if("object"!==_typeof(e)||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var i=r.call(e,t||"default");if("object"!==_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.IsMobile=void 0;var IsMobile=function(){function e(t,r){_classCallCheck(this,e),this.viewPortWidth=t,this.viewPortHeight=r}return _createClass(e,[{key:"isMobile",value:function(){return this.viewPortWidth<460||this.viewPortHeight<460||this.isIOS()||this.isAndroid()}},{key:"isIOS",value:function(){return/iPhone|iPad|iPod/i.test(navigator.userAgent)}},{key:"isAndroid",value:function(){return/Android/i.test(navigator.userAgent)}},{key:"isSafari",value:function(){return/^((?!chrome|android).)*safari/i.test(navigator.userAgent)}}]),e}();exports.IsMobile=IsMobile;

},{}],14:[function(require,module,exports){
"use strict";function getViewPortSize(){var e=[0,0];try{var t=document.documentElement&&document.documentElement.clientHeight<1.5*window.innerHeight;e[0]=Math.max(t?document.documentElement.clientWidth:0,window.innerWidth||0),e[1]=Math.max(t?document.documentElement.clientHeight:0,window.innerHeight||0)}catch(e){console.log("Unable to grab current viewport dimensions")}return e}function getTopViewPortSize(){var e=[0,0];try{var t=document.documentElement&&document.documentElement.clientHeight<1.5*window.innerHeight;e[0]=Math.max(t?document.documentElement.clientWidth:0,window.innerWidth||0),e[1]=Math.max(t?document.documentElement.clientHeight:0,window.innerHeight||0)}catch(e){console.log("Unable to grab current viewport dimensions")}try{var n=top.document.documentElement&&top.document.documentElement.clientHeight<1.5*top.innerHeight;e[0]=Math.max(n?top.document.documentElement.clientWidth:0,top.innerWidth||0),e[1]=Math.max(n?top.document.documentElement.clientHeight:0,top.innerHeight||0)}catch(e){}return e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.getTopViewPortSize=getTopViewPortSize,exports.getViewPortSize=getViewPortSize;

},{}],15:[function(require,module,exports){
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var o=0;o<t.length;o++){var r=t[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,_toPropertyKey(r.key),r)}}function _createClass(e,t,o){return t&&_defineProperties(e.prototype,t),o&&_defineProperties(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var t=_toPrimitive(e,"string");return"symbol"===_typeof(t)?t:String(t)}function _toPrimitive(e,t){if("object"!==_typeof(e)||null===e)return e;var o=e[Symbol.toPrimitive];if(void 0!==o){var r=o.call(e,t||"default");if("object"!==_typeof(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Close=void 0;var Close=function(){function e(t,o,r){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];_classCallCheck(this,e),this.domElement=t,this.rootElement=o,this.onClose=r,this.disposeOnClose=n}return _createClass(e,[{key:"setup",value:function(){}},{key:"dispose",value:function(){}},{key:"show",value:function(){}},{key:"hide",value:function(){}},{key:"closeClicked",value:function(){this.onClose(),this.disposeOnClose&&this.dispose()}}]),e}();exports.Close=Close;

},{}],16:[function(require,module,exports){
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.CloseCSS=void 0;var _close=require("./close");function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,_toPropertyKey(n.key),n)}}function _createClass(e,t,o){return t&&_defineProperties(e.prototype,t),o&&_defineProperties(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var t=_toPrimitive(e,"string");return"symbol"===_typeof(t)?t:String(t)}function _toPrimitive(e,t){if("object"!==_typeof(e)||null===e)return e;var o=e[Symbol.toPrimitive];if(void 0!==o){var n=o.call(e,t||"default");if("object"!==_typeof(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&_setPrototypeOf(e,t)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e})(e,t)}function _createSuper(e){var t=_isNativeReflectConstruct();return function(){var o,n=_getPrototypeOf(e);if(t){var r=_getPrototypeOf(this).constructor;o=Reflect.construct(n,arguments,r)}else o=n.apply(this,arguments);return _possibleConstructorReturn(this,o)}}function _possibleConstructorReturn(e,t){if(t&&("object"===_typeof(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(e)}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var CloseCSS=function(e){_inherits(o,_close.Close);var t=_createSuper(o);function o(){return _classCallCheck(this,o),t.apply(this,arguments)}return _createClass(o,[{key:"setup",value:function(){this.setupCSS(),this.wantsToBeShown=!0,this.forceHidden=!1}},{key:"show",value:function(){if(!this.domCloseElement)throw"show without an element";this.wantsToBeShown=!0,this.applyShowHide()}},{key:"hide",value:function(){if(!this.domCloseElement)throw"hide without an element";this.wantsToBeShown=!1,this.applyShowHide()}},{key:"applyShowHide",value:function(){this.wantsToBeShown&&!this.forceHidden?this.domCloseElement.style.display="":this.domCloseElement.style.display="none"}},{key:"hideDuringSomeMilliseconds",value:function(e){var t=this;this.forceHidden=!0,this.applyShowHide(),setTimeout(function(){t.forceHidden=!1,t.applyShowHide()},e)}},{key:"setupCSS",value:function(){if(!this.cssElement){var e=this.size?this.size:20,t=this.domElement;if(t){var o=this.setupCSSClassName(),n=this.domCloseElement=t.ownerDocument.createElement("a");n.className=o,n.onclick=this.closeClicked.bind(this),this.domElement.appendChild(n);var r=this.cssElement=t.ownerDocument.createElement("style");r.type="text/css",r.innerHTML="."+o+" {\n  color: white;\n  font: "+.9*e+"px/100% arial, sans-serif;\n  position: absolute;\n  right: 5px;\n  text-decoration: none;\n  text-shadow: 0 1px 0 #fff;\n  top: 5px;\n  z-index: 200000000;\n    width: "+e+"px;\n    height: "+e+"px;\n    background: black;\n    text-align: center;\n    line-height: "+e+"px;\n    cursor: pointer;}."+o+":after { content: 'X'; z-index: 200000000; /* UTF-8 symbol */ }",this.rootElement.querySelector("head").appendChild(r)}}}},{key:"setupCSSClassName",value:function(){return this.cssClassName||(this.cssClassName="closeCSS"+(new Date).getTime()),this.cssClassName}},{key:"dispose",value:function(){this.domCloseElement&&(this.domCloseElement.remove(),this.domCloseElement=void 0),this.cssElement&&(this.cssElement.remove(),this.cssElement=void 0),this.cssClassName&&(this.cssClassName=void 0)}}]),o}();exports.CloseCSS=CloseCSS;

},{"./close":15}],17:[function(require,module,exports){
"use strict";function _typeof(o){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o})(o)}var urlDebugParameter,urlRemoteDebugParameter;Object.defineProperty(exports,"__esModule",{value:!0}),exports.cLog=cLog,exports.imgLog=imgLog,exports.log=log,exports.logLevel=logLevel;try{urlDebugParameter=window.location.search&&window.location.search.match(/[?&]amp_dev=1/),urlRemoteDebugParameter=window.location.search&&window.location.search.match(/[?&]amp_deb=1/)}catch(o){}function logLevel(o){try{for(var e=arguments.length,t=new Array(e>1?e-1:0),r=1;r<e;r++)t[r-1]=arguments[r];top&&"object"===_typeof(top.ampTV)&&"object"===_typeof(top.ampTV.options)&&top.ampTV.options.logLevel&&top.ampTV.options.logLevel>=o?console.log.apply(this,t):urlDebugParameter&&console.log.apply(this,t)}catch(o){}}function log(){logLevel(1,arguments)}function cLog(){logLevel(1,arguments);try{urlRemoteDebugParameter&&navigator.sendBeacon("https://securepubads.g.doubleclick.net/ads?log="+encodeURIComponent(JSON.stringify(arguments)),{})}catch(o){}}function imgLog(o,e,t){var r=new Image;e&&(r.onload=e),t&&(r.onerror=t),r.src=o}

},{}],18:[function(require,module,exports){
"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_unsupportedIterableToArray(e)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(e,r){if(e){if("string"==typeof e)return _arrayLikeToArray(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(e,r):void 0}}function _iterableToArray(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}function _arrayLikeToArray(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,o=new Array(r);t<r;t++)o[t]=e[t];return o}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,r){for(var t=0;t<r.length;t++){var o=r[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,_toPropertyKey(o.key),o)}}function _createClass(e,r,t){return r&&_defineProperties(e.prototype,r),t&&_defineProperties(e,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var r=_toPrimitive(e,"string");return"symbol"===_typeof(r)?r:String(r)}function _toPrimitive(e,r){if("object"!==_typeof(e)||null===e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var o=t.call(e,r||"default");if("object"!==_typeof(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(e)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Intersection=void 0;var Intersection=function(){function e(r){_classCallCheck(this,e),this.statuses=r}return _createClass(e,[{key:"setup",value:function(e){this.observer=new top.IntersectionObserver(this.configuredProcessChanges.bind(this),{threshold:[0].concat(_toConsumableArray(this.statuses.map(function(e){return e.threshold})),[1])}),this.tsSetup=performance.now(),this.observer.observe(e)}},{key:"configuredProcessChanges",value:function(e,r){var t=this;e.forEach(function(e){t.statuses.forEach(function(r){e.intersectionRatio>=r.threshold?r.viewable||(r.viewable=!0,r.tsPreviousTransition=r.tsLastTransition,r.tsLastTransition=e.time,r.observer&&r.observer.forEach(function(e){return e(r)})):e.intersectionRatio<r.threshold&&(r.viewable||void 0===r.viewable)&&(r.viewable=!1,r.tsPreviousTransition=r.tsLastTransition,r.tsLastTransition=e.time,r.observer&&r.observer.forEach(function(e){return e(r)}))})})}},{key:"dispose",value:function(){this.observer.disconnect()}}]),e}();exports.Intersection=Intersection;

},{}],19:[function(require,module,exports){
(function (global){(function (){
"use strict";var _vast=require("./vidCo/vast"),_setup=require("./ava/setup"),_closeCSS=require("./interstitial/closeCSS"),_trackAdRequestDone=require("./player/trackAdRequestDone"),_consent=require("./consent/consent"),_playlistGAM=require("./vidCo/playlistGAM"),_log=require("./log/log"),_isMobile=require("./dom/isMobile"),_viewport=require("./dom/viewport"),_bringGoogleIMAObjectsToThisWindow=require("./player/bringGoogleIMAObjectsToThisWindow");function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _construct(e,o,t){return(_construct=_isNativeReflectConstruct()?Reflect.construct.bind():function(e,o,t){var a=[null];a.push.apply(a,o);var i=new(Function.bind.apply(e,a));return t&&_setPrototypeOf(i,t.prototype),i}).apply(null,arguments)}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}function _setPrototypeOf(e,o){return(_setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,o){return e.__proto__=o,e})(e,o)}function _toConsumableArray(e){return _arrayWithoutHoles(e)||_iterableToArray(e)||_unsupportedIterableToArray(e)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(e,o){if(e){if("string"==typeof e)return _arrayLikeToArray(e,o);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(e,o):void 0}}function _iterableToArray(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}function _arrayLikeToArray(e,o){(null==o||o>e.length)&&(o=e.length);for(var t=0,a=new Array(o);t<o;t++)a[t]=e[t];return a}var playerStorage=top.ampTV,videojs=playerStorage.videojs,oldRequire=global.require;function addIMA3Script(e,o,t,a){var i=arguments.length>4&&void 0!==arguments[4]&&arguments[4],r=document.createElement("script");r.type="text/javascript",r.src=i?"https://imasdk.googleapis.com/js/sdkloader/ima3.js":"https://imasdk.googleapis.com/js/sdkloader/ima3_debug.js",r.onload=t,a(r.src,o,top.document),(e.querySelector("head")||e.head||e).appendChild(r)}global.require=function(e){return"video.js"===e?videojs:oldRequire?oldRequire(e):void 0};var phase3Exec,ima3RequiresAnAccessibleScript=function(e,o,t){if(o){if(!t.querySelector(".ima-needs-this-to-continue")){var a=t.createElement("div");a.style.display="none",t.body.appendChild(a),a.innerHTML='<script src="'+e+'" class="ima-needs-this-to-continue"><\/script>'}}},ampPhase3=function e(o){void 0===top.ampTV.ampPhase3&&(top.ampTV.ampPhase3=e);var t=top.ampTV.getConfigByElement(o).data,a=t.player,i=t.rootDocument.querySelector("#"+a.id());exports["video.js"]=videojs,require("videojs-ima");var r=t.vidCoObj,n=function(e){this.switchPlaylist(e),this.hookPlayer(e)};!r.resolveMissing(t.options.size,n.bind(r,a))&&r.playList.length&&n.bind(r)(a),(0,_playlistGAM.monitorPlaylist)(r,t.options,a,t.options.playListPreloadNum),t.playerState.adManager.getAdTag=t.vidAdQueue.getAdTag.bind(t.vidAdQueue);addIMA3Script(t.rootDocument,t.useShadowRoot,function(){var e;t.options.dev&&t.videojs.log.level("debug");var o=function(){(0,_log.cLog)("AMP: onAdsManagerLoaded"),a.ima.addEventListener(google.ima.AdEvent.Type.LOADED,function(o){(0,_log.cLog)("AMP: LOADED event"),e=a.ima.getAdsManager(),t.adsManagerIMA=e;var i=a.muted()||a.volume()<.001?0:a.volume();e.setVolume(i)}),_construct(_isMobile.IsMobile,_toConsumableArray((0,_viewport.getTopViewPortSize)())).isMobile()||(e=a.ima.getAdsManager()).addEventListener(google.ima.AdEvent.Type.CLICK,function(o){a.muted(!0),e.setVolume(0),setTimeout(a.ima.resumeAd.bind(window),50)});var o,i,r=t.getElementToFloat();setInterval(function(){if(!document.fullscreenElement&&r){var t=!1,n=Math.round(r.clientWidth),s=Math.round(r.clientHeight);if(!n||!s)return;var l=Math.round(a.width()),d=Math.round(a.height());l&&n!==l&&(a.width(r.clientWidth),t=!0),d&&s!==d&&(a.height(r.clientHeight),t=!0),(t||!o||!i||o!==n||i!==s)&&e&&(o=n,i=s,e.resize(n,s,"NORMAL"))}},1e3)};!function(){(0,_log.cLog)("IMA Ready"),(0,_bringGoogleIMAObjectsToThisWindow.bringGoogleIMAObjectsToThisWindow)();var e=window.google&&window.google.ima&&void 0!==window.google.ima.ImaSdkSettings.VpaidMode.INSECURE?window.google.ima.ImaSdkSettings.VpaidMode.INSECURE:2;try{var r=top.document.location.hostname;!_construct(_isMobile.IsMobile,_toConsumableArray((0,_viewport.getTopViewPortSize)())).isMobile()&&r.match(/(\.ahorradororata\.com|\.ascodevida\.com|\.asivaespana\.com|\.coronaviral\.es|\.cuantafauna\.com|\.cuantarazon\.com|\.cuantocabron\.com|\.humorenserie\.com|\.memedeportes\.com|\.notengotele\.com|\.teniaquedecirlo\.com|\.vayagif\.com|\.viralizalo\.com|\.vrutal\.com|\.vistoenlasredes\.com|urbanian\.mundodeportivo\.com)$/)&&(e="SECURE")}catch(e){}var n,s={id:a.id(),autoPlayAdBreaks:!0,adsManagerLoadedCallback:o,adsRenderingSettings:{enablePreloading:!0},adsResponse:'<VAST version="3.0"/>',disableCustomPlaybackForIOS10Plus:!0,timeout:5e3,numRedirects:5,locale:"es",adLabel:"Ad",vpaidMode:e};if(t.options.vidAdOnFirstPreroll)if(t.playerState.viewabilityState.isPrerollMandatory()){t.playerState.adManager.prepareToLaunchFirstPreroll(s);var l=function(e){(0,_log.cLog)(e),t.playerState.adManager.adManagerPrepared=!0},d=t.player.paused()?0:6e3;new _trackAdRequestDone.TrackAdRequestDone(t.player,t.playerState,t.playerState.adManager.showRequestedAd,l.bind(null,"AdStarted"),l.bind(null,"AdError"),d)}else t.options.autoPlay||t.playerState.adManager.prepareToLaunchFirstPreroll(s);a.on(["adserror","adend"],function(){t.rootDocument.querySelectorAll("#"+a.id()).forEach(function(e){return e.classList.remove("vjs-ad-loading")})}),a.one(["adserror","adend"],function(){setTimeout(function(){t.options.autoPlay&&t.options.muted&&t.player.paused()&&((0,_log.cLog)("Autoplay launched"),t.player.play())},500)}),function(){if(t.options.closeVidCo){var e=new _closeCSS.CloseCSS(i.parentElement,t.rootDocument,function(){t.playerState.userClosedVidCo=!0});t.options.closeVidCoSize&&(e.size=t.options.closeVidCoSize),e.setup(),e.hide();var o=function(e,o){e.adManager.tsLastAdLaunched&&e.playingVidCo&&o.show()}.bind(this,t.playerState,e);t.playerState.observe("startVidCo",o),t.player.on(["adserror","aderror"],function(){o(),setTimeout(o,500),setTimeout(o,1100)})}}(),t.options.closeVidCoOnAdEnd&&t.playerState.adManager.observe("endedVidAd",function(){var e=function(){t.playerState.signalObservers("closedVidCo"),t.playerState.signalObservers("closeVidCo")};t.options.closeVidCoDelayedMS>0?setTimeout(e,t.options.closeVidCoDelayedMS):e()}),t.options.closeVidCoIfNoAd&&t.playerState.adManager.observe("errorVidAd",function(){var e=function(){t.playerState.signalObservers("closedVidCo"),t.playerState.signalObservers("closeVidCo")};t.options.closeVidCoDelayedMS>0?setTimeout(e,t.options.closeVidCoDelayedMS):e()}),t.player.one(["click","touchend"],function(){return t.player.ima.initializeAdDisplayContainer()}),(0,_log.cLog)("IMA options:",s,"Player muted",a.muted(),"Player volume:",a.volume()),t.options.ava&&"disabled"!==t.options.ava?n=(0,_setup.install)(i,t.getElementToFloat(),t.rootDocument,t.getParentElementToFloat(),t.options.ava,a,t,t.options.avaSize,t.options.avaCloseSize,t.options.avaCloseDelayOnVidAd,t.options.avaOnlyOnVidAd,t.force_ava,t.options.observers):t.pollIsAvaOn=function(){return!1},t.options.ava&&"disabled"!==t.options.ava&&(s.nonLinearWidth=n.avaSize.getWidth(),s.nonLinearHeight=n.avaSize.getHeight()),t.options.vidAdNonLinearAdMaxWidth&&(s.nonLinearWidth=t.options.vidAdNonLinearAdMaxWidth),t.options.vidAdNonLinearAdMaxHeight&&(s.nonLinearHeight=t.options.vidAdNonLinearAdMaxHeight),"function"==typeof a.ima&&a.ima(s),t.playerState.adManager.updateMuteAutoPlay(),t.playerState.adManagerPluginInstalled=!0,t.options.autoPlay&&t.player.one(["play"],function(){setTimeout(function(){t.statusViewableVidCo.viewable||((0,_log.cLog)("Not viewable yet. We pause until the user reaches that part",t.statusViewableVidCo),a.pause())},3e3)}),t.playerState.adManager.observe("endedVidAd",function(){setTimeout(function(){t.player&&"function"==typeof t.player.paused&&t.player.paused()&&((0,_log.cLog)("After Ad, player should be Playing. Do Play"),t.player.play())},800)})}()},ima3RequiresAnAccessibleScript,"object"===_typeof(t.options)&&t.options.dev)},configID=frameElement&&void 0!==window.configID?window.configID:void 0;try{void 0===top.ampTV.ampPhase3&&(top.ampTV.ampPhase3=ampPhase3),configID&&(top.ampTV.ampPhase3(configID),phase3Exec=!0)}catch(e){}configID&&!phase3Exec&&ampPhase3(configID),0!==configID||phase3Exec||(top.ampTV.ampPhase3=ampPhase3,addIMA3Script(document,!0,function(){var e=this;window.player.ready(function(o){exports["video.js"]=videojs,(0,_log.cLog)("Init ads",e.ads),"function"==typeof e.ads&&e.ads(),require("videojs-ima"),player.ima({})})},ima3RequiresAnAccessibleScript,!1));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ava/setup":8,"./consent/consent":12,"./dom/isMobile":13,"./dom/viewport":14,"./interstitial/closeCSS":16,"./log/log":17,"./player/bringGoogleIMAObjectsToThisWindow":20,"./player/trackAdRequestDone":22,"./vidCo/playlistGAM":23,"./vidCo/vast":24,"videojs-ima":2}],20:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.bringGoogleIMAObjectsToThisWindow=bringGoogleIMAObjectsToThisWindow;var _log=require("../log/log");function bringGoogleIMAObjectsToThisWindow(){try{var o=!1;void 0===window.google&&void 0!==top.google&&(window.google=top.google,o=!0),o||void 0!==window.google&&void 0!==window.google.ima||void 0===top.google||void 0===top.google.ima||(window.google=top.google,o=!0)}catch(o){(0,_log.cLog)("Error in errorVidAd: "+o)}}

},{"../log/log":17}],21:[function(require,module,exports){
"use strict";function isFullyPaused(s){return!!s.paused()&&!isPlayingAnAd(s)}function isPlayingAnAd(s){return s.ads.isInAdMode()&&s.ads.isAdPlaying()&&!s.ads.isWaitingForAdBreak()}Object.defineProperty(exports,"__esModule",{value:!0}),exports.isFullyPaused=isFullyPaused,exports.isPlayingAnAd=isPlayingAnAd;

},{}],22:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.TrackAdRequestDone=void 0,exports.trackAdRequestDoneFactory=trackAdRequestDoneFactory;var _log=require("../log/log"),_bringGoogleIMAObjectsToThisWindow=require("./bringGoogleIMAObjectsToThisWindow");function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,_toPropertyKey(r.key),r)}}function _createClass(e,t,i){return t&&_defineProperties(e.prototype,t),i&&_defineProperties(e,i),Object.defineProperty(e,"prototype",{writable:!1}),e}function _toPropertyKey(e){var t=_toPrimitive(e,"string");return"symbol"===_typeof(t)?t:String(t)}function _toPrimitive(e,t){if("object"!==_typeof(e)||null===e)return e;var i=e[Symbol.toPrimitive];if(void 0!==i){var r=i.call(e,t||"default");if("object"!==_typeof(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}function trackAdRequestDoneFactory(e,t,i,r,o){var n=arguments.length>5&&void 0!==arguments[5]?arguments[5]:6e3,a=arguments.length>6&&void 0!==arguments[6]?arguments[6]:3,s=arguments.length>7&&void 0!==arguments[7]?arguments[7]:1e3;return new TrackAdRequestDone(e,t,i,r,o,n,a,s)}var TrackAdRequestDone=function(){function e(t,i,r,o,n){var a=arguments.length>5&&void 0!==arguments[5]?arguments[5]:6e3,s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:3,d=arguments.length>7&&void 0!==arguments[7]?arguments[7]:1e3;_classCallCheck(this,e),this.player=t,this.playerState=i,this.relaunchAd=r,this.cbAdStarted=o,this.cbAdError=n,this.numTries=0,this.numRetries=s,this.millisecondsBetweenRetries=d,this.waitForFeedBackBinded=this.waitForFeedback.bind(this),this.player.one(["adstart","adserror","playing"],this.waitForFeedBackBinded);a&&(this.timeOutWaiting=setTimeout(function(e){return e.player.off(["adstart","adserror","playing"],e.waitForFeedBackBinded),e.timeOutWaiting=void 0,e.feedback(!1)}.bind(this,this),a))}return _createClass(e,[{key:"feedback",value:function(e){return this.timeOutWaiting&&(clearTimeout(this.timeOutWaiting),this.timeOutWaiting=void 0),e?this.cbAdStarted():this.cbAdError()}},{key:"waitForFeedback",value:function(e){return e?"adstart"===e.type?(this.timeOutRelaunch&&(clearTimeout(this.timeOutRelaunch),this.timeOutRelaunch=void 0),this.feedback(!0)):++this.numTries>this.numRetries?this.feedback(!1):"play"!==e.type&&"playing"!==e.type?((0,_bringGoogleIMAObjectsToThisWindow.bringGoogleIMAObjectsToThisWindow)(),e.data&&e.data.AdError&&e.data.AdError.getErrorCode()===window.google.ima.AdError.ErrorCode.UNKNOWN_AD_RESPONSE?(this.player.one(["adstart","adserror","playing"],this.waitForFeedBackBinded),this.timeOutRelaunch=setTimeout(this.relaunchAd,this.millisecondsBetweenRetries)):this.feedback(!1)):void(0,_log.cLog)("Last try due to content playing"):this.feedback(!1)}}]),e}();exports.TrackAdRequestDone=TrackAdRequestDone;

},{"../log/log":17,"./bringGoogleIMAObjectsToThisWindow":20}],23:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getGAM=getGAM,exports.monitorPlaylist=monitorPlaylist,exports.populatePlaylist=populatePlaylist;var interval,_log=require("../log/log");function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function ownKeys(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),r.push.apply(r,o)}return r}function _objectSpread(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?ownKeys(Object(r),!0).forEach(function(e){_defineProperty(t,e,r[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))})}return t}function _defineProperty(t,e,r){return(e=_toPropertyKey(e))in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t}function _toPropertyKey(t){var e=_toPrimitive(t,"string");return"symbol"===_typeof(e)?e:String(e)}function _toPrimitive(t,e){if("object"!==_typeof(t)||null===t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var o=r.call(t,e||"default");if("object"!==_typeof(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}function getGAM(t){var e=[];return t.forEach(function(t){var r=_objectSpread({},t);r.sources=[{src:r.sources.first15,type:"video/mp4"}],e.push(r)}),e}function populatePlaylist(t,e,r){var o=[];return e.resolveMissing(t,function(t){(o=e.getPlaylistWithPlayableItems(t)).length||(0,_log.cLog)("Missing creatives"),r&&r(e,o)}),o}function monitorPlaylist(t,e,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:3;interval&&clearInterval(interval),interval=setInterval(checkPlaylist.bind(this,t,e,r,o),2e3)}var allowChangeCurrent=!0;function checkPlaylist(t,e,r){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:3;!e.playListKWs||e.playListKWs.length<=0||t.getQueueDepth(r)<o&&(t.addNewItemBasedOnKeywords(e.vidCoAdUnit,e.size,e.playListKWs,function(e){return t.addItemToPlaylist(e,!1)+t.switchPlaylist(r,allowChangeCurrent)}),allowChangeCurrent=!1)}

},{"../log/log":17}],24:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.adTagUrlReplacements=adTagUrlReplacements,exports.replaceSize=replaceSize,exports.resolveVidAdURL=resolveVidAdURL;var _log=require("../log/log"),_queryString=require("../browser/queryString");function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function resolveVidAdURL(e,o,t,n){var i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,r=arguments.length>5&&void 0!==arguments[5]&&arguments[5],d=arguments.length>6?arguments[6]:void 0,a=(!o||"number"==typeof top.origVAST&&top.origVAST||"object"===_typeof(top.location)&&top.location.search&&top.location.search.match&&top.location.search.match(/amp_org=1/))&&"string"==typeof e?e:"https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=";i.description_url=""+top.location;var p=adTagUrlReplacements(a,d,t,n,i,r),c=(0,_queryString.removeDuplicateURLParameters)(p);return(0,_log.cLog)("AMP: VAST URL DupRemov:",p,c),c}function replaceSize(e,o){return o&&o.length&&o[0]&&o[1]?e=e.replace(/#WxH#/g,o[0]+"x"+o[1]):e}var mridx=0;function adTagUrlReplacements(e,o,t,n){var i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,r=arguments.length>5&&void 0!==arguments[5]&&arguments[5],d=arguments.length>6&&void 0!==arguments[6]?arguments[6]:"preroll";(0,_log.cLog)("1",e,t),t?e=e.replace(/__timestamp__/g,""+(new Date).getTime()):(e="CACHEBUSTER%%"!=="%%CACHEBUSTER%%".substring(2)?e.replace(/__timestamp__/g,encodeURIComponent("%%CACHEBUSTER%%")):e.replace(/__timestamp__/g,""+(new Date).getTime()),(0,_log.cLog)("2",e)),(0,_log.cLog)("F",e);var a="";try{a=document.location.toString()}catch(e){}e=replaceSize(e,o),a.length&&(e=e.replace(/__page-url__/g,encodeURIComponent(a))),void 0!==n.evt_label&&n.evt_label.length?e=e.replace(/__item-title__/g,encodeURIComponent(n.evt_label)):i&&void 0!==i.name&&i.name.length&&(e=e.replace(/__item-title__/g,encodeURIComponent(i.name))),void 0!==n.ytVideoId&&(e=e.replace(/__item-file__/g,encodeURIComponent(n.ytVideoId))),i&&void 0!==i.description_url&&i.description_url.length&&(e=e.replace(/description_url%3D__item-description__/g,"description_url%3D"+encodeURIComponent(i.description_url))),i&&void 0!==i.description_url&&i.description_url.length&&(e=e.replace(/description_url=__item-description__/g,"description_url="+encodeURIComponent(i.description_url))),void 0!==n.video_description_url&&n.video_description_url.length&&(e=e.replace(/description_url%3D__item-description__/g,"description_url%3D"+encodeURIComponent(n.video_description_url))),void 0!==n.video_description_url&&n.video_description_url.length&&(e=e.replace(/description_url=__item-description__/g,"description_url="+n.video_description_url)),void 0!==n.video_description&&n.video_description.length?e=e.replace(/__item-description__/g,encodeURIComponent(n.video_description)):i&&void 0!==i.description&&i.description.length&&(e=e.replace(/__item-description__/g,encodeURIComponent(i.description)));var p=[],c=[];return i&&void 0!==i.taxonomyAmpliffy&&i.taxonomyAmpliffy.length&&(p.push(i.taxonomyAmpliffy),c.push("txa="+i.taxonomyAmpliffy)),!n.dev||!i||void 0!==i.taxonomyCreator&&i.taxonomyCreator.length||(i.taxonomyCreator=Math.random()<.5?"AMPP---000050":"AMPP---000051"),i&&void 0!==i.taxonomyCreator&&i.taxonomyCreator.length&&(p.push(i.taxonomyCreator),c.push("txc="+i.taxonomyCreator)),i&&void 0!==i.vidCoHash&&i.vidCoHash.length&&(p.push(i.vidCoHash),c.push("vch="+i.vidCoHash)),(e=e.replace(/__item-category__/g,encodeURIComponent(p.reduce(function(e,o){return(e.length?e+",":"")+o},"")))).match(/cust_params=/)&&!e.match(/cust_params=([^&]*%26|)txa%3[dD]/)&&(e=e.replace(/cust_params=/g,"cust_params="+encodeURIComponent(c.reduce(function(e,o){return(e.length?e+"&":"")+o},"")+"&"))),e=n.continueVideoJSContentWhenAdDone?e.replace(/__fbfan__/g,"%2Cfbfan"):e.replace(/__fbfan__/g,""),void 0!==n.keywordsToAdd&&n.keywordsToAdd.length&&(e.match(/cust_params=/)?e=e.match(/cust_params=[^&]*keyword%3[dD]/)?e.replace(/cust_params=([^&]*)keyword%3[dD]/g,"cust_params=$1keyword%3D"+encodeURIComponent(n.keywordsToAdd.join(",")+",")):e.replace(/cust_params=/g,"cust_params=keyword%3D"+encodeURIComponent(n.keywordsToAdd.join(",")+"%26")):e+="&cust_params=keyword%3D"+encodeURIComponent(n.keywordsToAdd.join(","))),void 0!==r&&(e+=(e.indexOf("?")<0?"?":"&")+"npa="+(r?"1":"0")),e+=(e.indexOf("?")<0?"?":"&")+"vpos="+d,e+=(e.indexOf("?")<0?"?":"&")+"ad_type=audio_video","midroll"===d&&(e+=(e.indexOf("?")<0?"?":"&")+"mridx="+ ++mridx),e+=(e.indexOf("?")<0?"?":"&")+"max_ad_duration=300000",i&&void 0!==i.name&&i.name.length&&(e+=(e.indexOf("?")<0?"?":"&")+"vid_t="+encodeURIComponent(i.name)),i&&"number"==typeof i.duration&&i.duration>0&&(e+=(e.indexOf("?")<0?"?":"&")+"vid_d="+i.duration),i&&void 0!==i.description&&i.description.length&&(e+=(e.indexOf("?")<0?"?":"&")+"vid_kw="+encodeURIComponent(i.description)),e}

},{"../browser/queryString":11,"../log/log":17}]},{},[19]);
