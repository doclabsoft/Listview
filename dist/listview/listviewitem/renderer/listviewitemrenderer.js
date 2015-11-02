goog.require('DD.ui.renderer.Item');
goog.require('DD.utils.dateFormat');

goog.provide('DD.ui.renderer.ListViewItem');

DD.ui.renderer.ListViewItem = function()
{
	DD.ui.renderer.Item.call(this);
};

goog.inherits(DD.ui.renderer.ListViewItem, DD.ui.renderer.Item);
goog.addSingletonGetter(DD.ui.renderer.ListViewItem);

DD.ui.renderer.ListViewItem.CSS_CLASS = 'DD-listviewitem';
DD.ui.renderer.ListViewItem.PROPERTY_CLASS = 'DD-property';

DD.ui.renderer.ListViewItem.prototype.getCssClass = function()
{
	return DD.ui.renderer.ListViewItem.CSS_CLASS;
};

DD.ui.renderer.ListViewItem.prototype.getPropertyClass = function()
{
	return DD.ui.renderer.ListViewItem.PROPERTY_CLASS;
};

DD.ui.renderer.ListViewItem.prototype.createDom = function(component)
{
	return this.decorateInternal(component.dom_.createElement('div'), component);
};

DD.ui.renderer.ListViewItem.prototype.decorateInternal = function(element, component)
{
	goog.dom.classes.add(element, this.getCssClass(component));

	var options        = component.getOptions(),
		ratio          = 100,
		info           = component.getData('info'),
		isReadonly     = component.isReadonly(),
		filetypeValue  = component.getFileType(),
		properties     = [],
		/** Изображение по умолчанию, применяется в случае, если не загрузилась превьюшка элемента */
		preloadSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABZtJREFUeNrs1TEBAAAIwzDA/zPHeOAlkdCnnaQA+GckADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAJAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAOBmBRgA/7EFswALKa8AAAAASUVORK5CYII=';

    if (options)
    {
        var autoPropWidth  = options && (!options.maxPropLength && !options.maxPropValueLength);
    	autoPropWidth && (ratio = options.propValueRatio * 100 ^ 0);
    	options.minWidth && (element.style.minWidth = options.minWidth);
    }

	filetypeValue = filetypeValue != false ? (filetypeValue || 'default') : false;

	/** Создание DOM структуры с соответствующим вложением */
	var img 		= goog.dom.createDom('img',		{src : component.getIcon() || preloadSrc}),
		filetype 	= goog.dom.createDom('div', 	{class: DD.ui.ListView.classes.FILETYPE + ' DD-type-' + (component.getFileType() || 'default')}),
		checkbox 	= goog.dom.createDom('input', 	{type: 'checkbox'}),
		label 		= goog.dom.createDom('label', 	DD.ui.ListView.classes.CHECKER, [checkbox]),
		thumb 		= goog.dom.createDom('div', 	{class: DD.ui.ListView.classes.THUMB}, [img, filetypeValue ? filetype : null, !isReadonly ? label : null]),
		caption 	= goog.dom.createDom('h2', 		{class: this.getCssClass() + '-caption'});

	if (typeof info === 'object')
		for (var propertyKey in info)
		{
			var propertyValue = info[propertyKey] || '';

			propertyValue.renderer instanceof Function && (propertyValue = propertyValue.renderer(propertyValue.value));
			if (!propertyValue)
				continue;

			var propKeyText = propertyKey;
			var propValueText = propertyValue.toString();

            if (options)
            {
    			if (options.maxPropLength && propKeyText.length > options.maxPropLength)
    				propKeyText = propKeyText.substr(0, options.maxPropLength) + '...';

    			if (options.maxPropValueLength && propValueText.length > options.maxPropValueLength)
    				propValueText = propValueText.substr(0, options.maxPropValueLength) + '...';
            }

			properties.push(goog.dom.createDom('div', {class: this.getPropertyClass(), style: autoPropWidth ? 'max-width: 100%' : ''}, [
				goog.dom.createDom('span', {class: this.getPropertyClass() + '-key', style: autoPropWidth ? 'max-width:' + ratio + '%' : ''}, [propKeyText]),
				goog.dom.createDom('span', {class: this.getPropertyClass() + '-colon'}, ':'),
				goog.dom.createDom('span', {class: this.getPropertyClass() + '-value', style: autoPropWidth ? 'min-width:' + (100-ratio) + '%' : ''}, [propValueText])
			]));
		};

	var propertiesContainer  = goog.dom.createDom('div', {class: 'DD-properties'}, properties);
	var infosection	= goog.dom.createDom('section', '', [caption, propertiesContainer]);

	goog.events.listen(component, 	goog.events.EventType.CHANGE, this.updateAdjustProps_, false, component);
	goog.events.listen(window, 		goog.events.EventType.RESIZE, this.updateAdjustProps_, false, component);

	/** Если во время загрузки картинки произошла ошибка или если картинка не загрузилась, создаем default*/
	goog.events.listenOnce(img, goog.events.EventType.ERROR, function()
	{
		this.src = preloadSrc;
	}, false, img);

	goog.dom.append(element, [thumb, infosection]);
	caption.textContent = component.getCaption();

	/** Сохранение список создаваемых слоев */
	component.$cache('dom',
	{
		label 		: label,
		checkbox 	: checkbox,
		thumb 		: thumb,
		caption 	: caption,
		infosection : infosection,
		filetype 	: filetype,
		properties  : properties
	});

	return element;
};

DD.ui.renderer.ListViewItem.prototype.update = function (component)
{
	this.updateAdjustProps_(component);
};

DD.ui.renderer.ListViewItem.prototype.updateAdjustProps_ = function (component)
{
	component = component instanceof goog.events.BrowserEvent ? this : component || this;

	var rendererDom 	= component.$cache('dom'),
		element 		= component.getElement(),
		thumbWidth 		= rendererDom.thumb.style.width,
		size 			= parseFloat(thumbWidth),
		helper 			= goog.dom.getDomHelper(),
		infoLen 		= rendererDom.infosection.offsetWidth,
		elementWidth 	= element.offsetWidth,
		infoSize,
		unit = '';

	if (!thumbWidth)
		return;

	if (thumbWidth.indexOf('px') !== -1) {
		unit = 'px';
		infoSize = elementWidth - size;
	} else {
		unit = '%';
		if (size === 100) {
			infoSize = 100;
		} else if (! isFinite(size)) {
			unit = '';
		} else {
			infoSize = 100 - size;
		}
	}
	rendererDom.infosection.style.width = infoSize + unit;

	rendererDom.properties.forEach(function (prop) {
		var keyEl = helper.getFirstElementChild(prop),
		ratio = 2.2,
		valEl = helper.getLastElementChild(prop);

		var keyLen = keyEl.offsetWidth,
		valLen = valEl.offsetWidth;

		if (keyEl.style.width === '80%') {
			ratio = 5;
		}
		if (keyLen/ratio > valLen) {
			keyEl.style.maxWidth = '80%';
		} else {
			keyEl.style.maxWidth = '66%';
		}
	});
};

/**
 * Локальный метод выбора элемента
 * @param event 	| type : goog.events.BrowserEvent
 *					| desc : goog.events.EventType.CLICK
 */
DD.ui.renderer.ListViewItem.prototype._checkedItem = function(event)
{
	this.setChecked(!this.isChecked());
	this.dispatchEvent({type:DD.ui.ViewItem.EventType.CHECK, shift: event.shiftKey});
};

/**
 * Локальный метод выделения элемента
 * @param  {goog.events.BrowserEvent} event
 * @private
 */
DD.ui.renderer.ListViewItem.prototype._selectedItem = function(event)
{
  event.preventDefault();
  this.setSelected(!this.isSelected());
  this.dispatchEvent(
  {
    'type'  : DD.ui.ViewItem.EventType.SELECT,
    'shift' : event.shiftKey,
    'ctrl'  : event.ctrlKey
  });
};

/**
 * Изменяет состояние компонента
 * @param {DD.ui.ViewItem}         component Компонент, к которому относится рендерер
 * @param {DD.ui.Component.State}   state     Состояние компонента
 * @param {Boolean}         enable    Флаг, включающий/выключающий состояние
 */
DD.ui.renderer.ListViewItem.prototype.setState = function(component, state, enable)
{
  var element = component.getElement();
  element && goog.dom.classes.toggle(element, this.getClassByState(state));
};

/**
 * Локальный метод выделения элемента
 * @param event 	| type : goog.events.BrowserEvent
 *					| desc :  goog.events.EventType.MOUSEDOWN
 */
DD.ui.renderer.ListViewItem.prototype._activeItem = function(event)
{
	this.setActive(!this.isActive());
};

/**
 * Метод удаления события компонента
 */
DD.ui.renderer.ListViewItem.prototype.uninitializeDom = function(component)
{
	var rendererDom = component.$cache('dom'),
		element = component.getElement();

	goog.events.unlisten(rendererDom.label,	goog.events.EventType.CLICK, 		this._checkedItem, 			false, component);	
	goog.events.unlisten(rendererDom.label, goog.events.EventType.TOUCHSTART, 	this._checkedItem, 			false, component);
	goog.events.unlisten(element,  			goog.events.EventType.MOUSEDOWN, 	this._selectedItem, 		false, component);
	goog.events.unlisten(window, 			goog.events.EventType.RESIZE, 		this.updateAdjustProps_, 	false, component);
	goog.events.unlisten(component, 		goog.events.EventType.CHANGE, 		this.updateAdjustProps_, 	false, component);

	component.clearRendererCache();
	DD.ui.renderer.ListViewItem.superClass_.uninitializeDom.call(this, component);
};