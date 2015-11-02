/**
 * Base list item component.
 * Similar to goog.ui.Control. Foundation for controls andlist view items.
 * @project UI.
 * @author Anna Agte
 * @version 1.1
 */

goog.provide('DD.ui.Item');

goog.require('DD.ui.Component');
goog.require('DD.ui.renderer.Item');
goog.require('goog.ui.registry');
goog.require('goog.events.Event');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @param {Object|goog.dom.DomHelper=} arg
 * @constructor
 * @extends DD.ui.Component
 */
DD.ui.Item = function(arg) {
  DD.ui.Component.call(this, arg);
};
goog.inherits(DD.ui.Item, DD.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.Item, DD.ui.renderer.Item);


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.Item.prototype */
var prototype = DD.ui.Item.prototype;
var superClass_ = DD.ui.Item.superClass_;


// ------------------------------
// Properties
// ------------------------------

/**
 * Title or content optionally.
 * @type {string}
 * @private
 */
prototype.caption_ = '';

/**
 * Icon css class or image url or image sprite index.
 * @type {string}
 * @private
 */
prototype.icon_ = '';


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.assign = function(options) {

  if (!goog.isObject(options))
    return;

  superClass_.assign.call(this, options);

  if (goog.isString(options.caption))
    this.setCaption(options.caption);

  if (goog.isString(options.icon))
    this.setIcon(options.icon);
};

/**
 * @inheritdoc
 */
prototype.setDisabled = function(disabled) {

  var success = superClass_.setDisabled.call(this, disabled);

  if (!success)
    return false;

  if (disabled) {
    this.setSupportedState(DD.ui.Component.State.FOCUSED, false);
    this.setSupportedState(DD.ui.Component.State.ACTIVE, false);
    this.setSupportedState(DD.ui.Component.State.CHECKED, false);
    this.setSupportedState(DD.ui.Component.State.SELECTED, false);
  } else {
    this.setSupportedState(DD.ui.Component.State.FOCUSED, true);
    this.setSupportedState(DD.ui.Component.State.ACTIVE, true);
    this.setSupportedState(DD.ui.Component.State.CHECKED, true);
    this.setSupportedState(DD.ui.Component.State.SELECTED, true);
  }
};

/**
 * Sets the caption.
 * @param {string} caption
 * @public
 */
prototype.setCaption = function(caption) {

  if (caption === this.caption_)
    return;

  this.caption_ = caption;

  var renderer = this.getRenderer();
  if (renderer.setCaption)
    renderer.setCaption(this, caption);

  this.changed();
};

/**
 * Returns the caption.
 * @return {string}
 * @public
 */
prototype.getCaption = function() {
  return this.caption_;
};

/**
 * Sets the icon.
 * @param {string|number} image Css class or image url or image sprite index.
 * @public
 */
prototype.setIcon = function(icon) {

  if (icon === this.icon_)
    return;

  this.icon_ = icon;

  var renderer = this.getRenderer();
  if (renderer.setIcon)
    renderer.setIcon(this, icon);

  this.changed();
};

/**
 * Returns the icon.
 * @return {String}
 * @public
 */
prototype.getIcon = function() {
  return this.icon_;
};

/**
 * Triggers on click, keydown or touch. No markup logic. 
 * Property "_target" is an html element which was clicked.
 * @param {goog.events.Event=} opt_originalEvent
 * @return {boolean} FALSE if the action was stopped.
 */
prototype.activate = function(opt_originalEvent) {

  if (this.isDisabled())
    return false;

  var event = new goog.events.Event(DD.ui.EventType.ACTION);

  event.originalEvent = opt_originalEvent;

  /** @todo Удалить это поскорее. */
  if (opt_originalEvent) {
    event._target = opt_originalEvent.target;
    event.shiftKey = opt_originalEvent.shiftKey;
    event.altKey = opt_originalEvent.altKey;
    event.ctrlKey = opt_originalEvent.ctrlKey;
  }

  var res = this.dispatchEvent(event);

  if (res === false && opt_originalEvent) {
    opt_originalEvent.stopPropagation();
    opt_originalEvent.preventDefault();
  }

  return res;
};

}); // goog.scope
