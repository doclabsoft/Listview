
goog.require('DD.ui.renderer.Item');
goog.provide('DD.ui.renderer.ItemTextInput');
goog.require('goog.Timer');

/**
 * @constructor
 */
DD.ui.renderer.ItemTextInput = function ()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.ItemTextInput, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.ItemTextInput);

DD.ui.renderer.ItemTextInput.CSS_CLASS = 'DD-item no-button';
DD.ui.renderer.ItemTextInput.CSS_CLASS_CAPTION = 'DD-item-caption';
DD.ui.renderer.ItemTextInput.CSS_CLASS_TEXT = 'DD-item-dotted';
DD.ui.renderer.ItemTextInput.CSS_CLASS_INPUT = 'DD-item-input';
DD.ui.renderer.ItemTextInput.TIMER_INPUT = 300;


DD.ui.renderer.ItemTextInput.prototype.getCssClass = function ()
{
	return DD.ui.renderer.ItemTextInput.CSS_CLASS;
};

DD.ui.renderer.ItemTextInput.prototype.setCaption = function(component, caption)
{
	var content = component.getContentElement();
	if (!content)
		return;
	content.innerHTML = caption;
};

DD.ui.renderer.ItemTextInput.prototype.setValue = function(component, value)
{
	if (!component.DD_input)
		return;
	component.DD_input.value = value || '';
};

DD.ui.renderer.ItemTextInput.prototype.setTitle = function(component, title)
{
	if (!component.DD_input)
		return;
	component.DD_input.title = title;
};


DD.ui.renderer.ItemTextInput.prototype.createDom = function (component)
{
	var dom = component.getDomHelper();
	var element = dom.createDom('div', this.getClassNames(component).join(' '));
	component.setElementInternal(element);
	goog.dom.classes.add(element, component.getParentClass());

	var contentwrap = dom.createDom('span', DD.ui.renderer.ItemTextInput.CSS_CLASS_CAPTION);
	element.appendChild(contentwrap);
	var content = dom.createDom('span', DD.ui.renderer.ItemTextInput.CSS_CLASS_TEXT);
	contentwrap.appendChild(content);

	var input = dom.createDom('input', DD.ui.renderer.ItemTextInput.CSS_CLASS_INPUT);
	element.appendChild(input);

	component.setContentElement(content);
	element.DD_caption = content;
	component.DD_input = input;
	this.setCaption(component, component.getCaption());
	this.setTitle(component, component.getTitle());

	return element;
};

DD.ui.renderer.ItemTextInput.prototype.initializeDom = function(component)
{
	if (!component.DD_input)
		return;
	goog.events.listen(component.DD_input, goog.events.EventType.KEYDOWN, this.keyDownClick, false, component);
	goog.events.listen(component.DD_input, goog.events.EventType.INPUT, this.changeTextInput, false, component);
	goog.events.listen(component.DD_input, goog.events.EventType.KEYUP, this.changeTextInput, false, component);
};

DD.ui.renderer.ItemTextInput.prototype.uninitializeDom = function(component)
{
	if (!component.DD_input)
		return;
	goog.events.unlisten(component.DD_input, goog.events.EventType.KEYDOWN, this.keyDownClick, false, component);
	goog.events.unlisten(component.DD_input, goog.events.EventType.INPUT, this.changeTextInput, false, component);
	goog.events.unlisten(component.DD_input, goog.events.EventType.KEYUP, this.changeTextInput, false, component);
};

DD.ui.renderer.ItemTextInput.prototype.changeTextInput = function(oEvent)
{
	var A = this;
	var textInput = this.getElementByClass(DD.ui.renderer.ItemTextInput.CSS_CLASS_INPUT);
	if (this.value_ != textInput.value);
	{
		this.value_ = textInput.value;
		if (this.inputTimer)
			clearTimeout(this.inputTimer);
		this.inputTimer = setTimeout(function()
		{
			A.clickHandler();
		}, DD.ui.renderer.ItemTextInput.TIMER_INPUT);
	};
};


DD.ui.renderer.ItemTextInput.prototype.keyDownClick = function(oEvent)
{
	if (!this.DD_input)
		return;
	if (oEvent.keyCode == 13 && !oEvent.altKey && !oEvent.ctrlKey && !oEvent.shiftKey)
	{
		this.value_ = this.DD_input.value;
		this.clickHandler();
	};
};

DD.ui.renderer.ItemTextInput.prototype.setState = function(component, state, enable)
{
	if (state == 1)
	{
		var element = component.getElement();
		var content = component.getElementByClass(DD.ui.renderer.ItemTextInput.CSS_CLASS_INPUT);
		var className = this.getClassForState(state);
		if (className)
		{
			goog.dom.classes.enable(element, className, enable);
			if (content)
				content[className] = enable;
		}
	}
	else
		DD.ui.renderer.ItemTextInput.superClass_.setState.call(this, component, state, enable);
};