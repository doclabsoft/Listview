/**
 * Item renderer.
 * @project UI.
 * @author Anna Agte
 * @version 1.1
 */

goog.provide('DD.ui.renderer.Item');

goog.require('DD.ui.renderer.Component');
goog.require('goog.events.ActionHandler');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.renderer.Item = function() {
  DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.Item, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.Item);


// ------------------------------
// Constants
// ------------------------------

/**
 * @inheritdoc
 */
DD.ui.renderer.Item.CSS_CLASS = 'DD-item';


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.renderer.Item.prototype */
var prototype = DD.ui.renderer.Item.prototype;
var superClass_ = DD.ui.renderer.Item.superClass_;
var ActionHandler = goog.events.ActionHandler;


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.getCssClass = function() {
  return DD.ui.renderer.Item.CSS_CLASS;
};

/**
 * @inheritdoc
 */
prototype.createDom = function(component) {

  var element = superClass_.createDom.call(this, component);
  var dom = component.getDomHelper();

  this.addIcon(component, element, dom);
  this.setIcon(component, component.getIcon());
  this.addCaption(component, element, dom);
  this.setCaption(component, component.getCaption());

  return element;
};

/**
 * @inheritdoc
 */
prototype.canDecorate = function(element) {
  return false;
};

/**
 * @inheritdoc
 */
prototype.initializeDom = function(component) {
  superClass_.initializeDom.call(this, component);
  this.addActionHandler(component);
};

/**
 * @inheritdoc
 */
prototype.uninitializeDom = function(component) {
  this.removeActionHandler(component);
  superClass_.uninitializeDom.call(this, component);
};

/**
 * @param {DD.ui.Component} component
 * @param {goog.dom.DomHelper} dom
 * @return {HTMLElement}
 * @private
 */
prototype.addCaption = function(component, element, dom) {
  var caption = dom.createDom('span', this.getBEMClass(component, 'caption'));
  component.$cache('caption', caption);
};

/**
 * Sets the caption.
 * @param {DD.ui.Component} component
 * @param {string} captionValue
 */
prototype.setCaption = function(component, captionValue) {

  var element = component.$cache('root');
  var caption = component.$cache('caption');
  if (!element || !caption)
    return;

  caption.innerHTML = captionValue;
  if (captionValue === '')
    goog.dom.removeNode(caption);
  else
    element.appendChild(caption);
};

/**
 * @param {DD.ui.Component} component
 * @param {HTMLElement} element
 * @param {goog.dom.DomHelper} dom
 * @private
 */
prototype.addIcon = function(component, element, dom) {
  var icon = dom.createDom('span', this.getBEMClass(component, 'icon'));
  component.$cache('icon', icon);
};

/**
 * Sets the icon.
 * @param {DD.ui.Component} component
 * @param {string} iconValue Image url or css class.
 * @public
 */
prototype.setIcon = function(component, iconValue) {

  var element = component.$cache('root');
  var icon = component.$cache('icon');
  if (!element || !icon)
    return;

  icon.style.backgroundImage = '';

  if (iconValue) {
    if (iconValue.indexOf('.') > -1) {
      // Image url
      icon.style.backgroundImage = 'url(' + iconValue + ')';
    } else {
      // Css class
      iconValue = iconValue + ' ' + this.getBEMClass(component, 'icon', iconValue);
      var iconClass = component.$cache('iconClass');
      if (iconClass)
        goog.dom.classes.remove(icon, iconClass);
      goog.dom.classes.add(icon, iconValue);
      component.$cache('iconClass', iconValue);
    }
    goog.dom.insertChildAt(element, icon, 0);

  } else {
    goog.dom.removeNode(icon);
  }
};

/**
 * Crossbrowser click/press/touch handler.
 * @param {DD.ui.Component} component
 * @param {HTMLElement} target
 * @protected
 */
prototype.addActionHandler = function(component) {

  var target = this.getActionTarget(component);
  if (!target)
    return;

  if (window.Hammer) {
    var manager = new Hammer.Manager(target);
    manager.add(new Hammer.Tap({'threshold': 50}));
    manager.on('tap', this.onAction.bind(this, component));
    component.$cache('manager', manager);

  } else {
    var actionHandler = new ActionHandler(target);
    actionHandler.listen(ActionHandler.EventType.ACTION,
        this.onAction.bind(this, component));
    component.$cache('actionHandler', actionHandler);
  }
};

/**
 * @param {DD.ui.Component} component
 * @protected
 */
prototype.removeActionHandler = function(component) {

  if (window.Hammer) {
    var manager = component.$cache('manager');
    if (!manager)
      return;
    manager.off('tap');
    manager.remove(manager.get('tap'));
    component.$cache('manager', null);

  } else {
    var actionHandler = component.$cache('actionHandler');
    if (!actionHandler)
      return;
    actionHandler.dispose();
    component.$cache('actionHandler', null);
  }
};

/**
 * Gets action target element.
 * @param {DD.ui.Component} component
 * @protected
 */
prototype.getActionTarget = function(component) {
  return component.getElement();
};

/**
 * Triggers on click or key press or touch.
 * @param {DD.ui.Component} component
 * @param {goog.events.Event|Event} event Browser event.
 * @protected
 */
prototype.onAction = function(component, event) {
  if (!component.isSupportedState(DD.ui.Component.State.ACTIVE)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return component.activate(event);
};

}); // goog.scope
