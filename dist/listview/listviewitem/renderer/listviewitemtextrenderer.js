
goog.require('DD.ui.renderer.Item');
goog.provide('DD.ui.renderer.ItemText');

/**
 * @constructor
 */
DD.ui.renderer.ItemText = function () {
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.ItemText, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.ItemText);


DD.ui.renderer.ItemText.CSS_CLASS = 'DD-item textonly';
DD.ui.renderer.ItemText.CSS_CLASS_CAPTION = 'DD-item-caption';
DD.ui.renderer.ItemText.CSS_CLASS_TEXT = 'DD-item-dotted';


DD.ui.renderer.ItemText.prototype.getCssClass = function () {
	return DD.ui.renderer.ItemText.CSS_CLASS;
};

DD.ui.renderer.ItemText.prototype.createDom = function (component) {
	var dom = component.getDomHelper();
	var element = dom.createDom('div', this.getClassNames(component).join(' '));
	component.setElementInternal(element);

	var contentwrap = dom.createDom('span', DD.ui.renderer.ItemText.CSS_CLASS_CAPTION);
	element.appendChild(contentwrap);
	var content = dom.createDom('span', DD.ui.renderer.ItemText.CSS_CLASS_TEXT);
	contentwrap.appendChild(content);
	component.setContentElement(content);
	element.DD_caption = content;
	this.setCaption(component, component.getCaption());

	return element;
};

DD.ui.renderer.ItemText.prototype.setCaption = function (component, caption) {
	var content = component.getContentElement();
	if (!content)
		return;
	content.innerHTML = caption;
};