
goog.require('DD.ui.renderer.Item');
goog.provide('DD.ui.renderer.ItemBorder');
goog.provide('DD.ui.renderer.ItemBorderLight');

/**
 * @constructor
 */
DD.ui.renderer.ItemBorder = function () {
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.ItemBorder, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.ItemBorder);


DD.ui.renderer.ItemBorder.CSS_CLASS = 'DD-item DD-item-border';

DD.ui.renderer.ItemBorder.prototype.getCssClass = function () {
	return DD.ui.renderer.ItemBorder.CSS_CLASS;
};


DD.ui.renderer.ItemBorder.prototype.createDom = function (component) {
	var dom = component.getDomHelper();
	var element = dom.createDom('div', this.getClassNames(component).join(' '));
	component.setElementInternal(element);

	return element;
};

///////////////////////////////////////////////////////
DD.ui.renderer.ItemBorderLight = function () {
    DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.ItemBorderLight, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.ItemBorderLight);

DD.ui.renderer.ItemBorderLight.CSS_CLASS = 'DD-item DD-item-border-light';

DD.ui.renderer.ItemBorderLight.prototype.getCssClass = function () {
    return DD.ui.renderer.ItemBorderLight.CSS_CLASS;
};


DD.ui.renderer.ItemBorderLight.prototype.createDom = function (component) {
    var dom = component.getDomHelper();
    var element = dom.createDom('div', this.getClassNames(component).join(' '));
    component.setElementInternal(element);

    return element;
};