goog.provide('DD.ui.InputEditor');

DD.ui.InputEditor = function(options, opt_domHelper)
{
	goog.ui.Component.call(this, opt_domHelper);

	if (!options)
		options = {};

	this.eh_ = new goog.events.EventHandler(this);
	this.target = 'target' in options ? options.target : null;
};

goog.inherits(DD.ui.InputEditor, goog.ui.Component);


DD.ui.InputEditor.EventType =
{
	STARTEDIT 	: 'onStartEdit',
	ENDEDIT 	: 'onEndEdit'
};
goog.scope(function(){

/** @alias DD.ui.InputEditor.prototype */
var prototype = DD.ui.InputEditor.prototype,
	superClass_ = DD.ui.InputEditor.superClass_;

prototype.enterDocument = function()
{
	superClass_.enterDocument.call(this);

	this.eh_.listen(this.input_, goog.events.EventType.KEYDOWN, this.keyListener, false, this);
	this.makeEditable();
};

prototype.exitDocument = function()
{
	superClass_.exitDocument.call(this);

	this.eh_.removeAll();
};

prototype.createDom = function()
{
	this.currentContent = this.target.textContent;
	this.input_ = goog.dom.createDom(goog.dom.TagName.INPUT, {'id' : 'inputEditor', 'value' : this.currentContent});
	var element = goog.dom.createDom(goog.dom.TagName.DIV, 'DD-inputeditor-wrap', [this.input_]);

	this.setElementInternal(element);
	this.update();	
};

prototype.keyListener = function(event)
{
	if (event.keyCode == 13) // Enter
		this.save();
	else if (event.keyCode == 27) // Esc
		this.makeUneditable();
	else if (event.ctrlKey && event.keyCode == 65) // ctrl + A
		this.selectAllText();
};		

prototype.selectAllText = function()
{
	this.input_.setSelectionRange(0, this.input_.value.length)
};

prototype.makeEditable = function()
{
	this.selectAllText();
	this.input_.focus();
	this.editabled_ = true;

	this.eh_.listen(this.input_, goog.events.EventType.BLUR, this.save, false, this);
	this.eh_.listen(document.body, [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this._saveiOSFix, false, this);
	this.eh_.listen(window, goog.events.EventType.RESIZE, this.update, false, this);

	this.dispatchEvent(DD.ui.InputEditor.EventType.STARTEDIT);
};

/**
 * Метод обновления положения компонента на странице при событиях
 * @param  { goog.events.EventType} event 
 */
prototype.update = function(event)
{
	var fix = 5;
	var bounds = goog.style.getBounds(this.target);

	goog.style.setStyle(this.element_,
	{
		'top' 		: bounds.top + 'px',
		'left'		: bounds.left - fix + 'px',
		'width'		: bounds.width + fix * 2 + 'px',
		'height' 	: bounds.height + fix + 'px'
	});
};

prototype._saveiOSFix = function(event)
{
	if (event.target != this.input_)
		this.save();
};

prototype.save = function()
{
	this.target.textContent = this.input_.value;
	this.makeUneditable();
};

prototype.makeUneditable = function()
{
	goog.events.unlisten(this.input_, goog.events.EventType.BLUR, this.save, false, this);
	goog.events.unlisten(document.body, [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN], this._saveiOSFix, false, this);
	goog.events.unlisten(window, goog.events.EventType.RESIZE, this.update, false, this);

	this.editabled_ = false;
	this.dispatchEvent(
	{
		'type' 		: DD.ui.InputEditor.EventType.ENDEDIT,
		'caption'	: this.input_.value
	});

	this.dispose();
};

prototype.getTextContent = function()
{
	return this.input_.value;
};

prototype.isEditabled = function()
{
	return this.editabled_;
};

prototype.moveCaretToStart = function ()
{
    if (typeof this.input_.selectionStart == "number")
        this.input_.selectionStart = this.input_.selectionEnd = 0;
    else if (typeof this.input_.createTextRange != "undefined")
    {
        this.input_.focus();
        var range = this.input_.createTextRange();
        range.collapse(true);
        range.select();
    }
};
}); // goog.scope
