goog.provide('DD.ui.renderer.SampleRenderer');
goog.require('DD.ui.renderer.Item');

DD.ui.renderer.SampleRenderer = function()
{
	DD.ui.renderer.Item.call(this);
};
goog.inherits(DD.ui.renderer.SampleRenderer, DD.ui.renderer.Item);
goog.addSingletonGetter(DD.ui.renderer.SampleRenderer);

DD.ui.renderer.SampleRenderer.prototype.createDom = function(component)
{
	this.decorateInternal(component.dom_.createElement('div'), component);

	return component.getData().renderer.element;
};

DD.ui.renderer.SampleRenderer.prototype.decorateInternal = function(element, component)
{
	goog.dom.classes.add(element, this.getClassNames(component).join(' '));

	// Создание DOM структуры с соответствующим вложением
	var checkbox 	= goog.dom.createDom('input', 	{'type': 'checkbox'});
	var label 		= goog.dom.createDom('label', 	DD.ui.ListView.classes.CHECKER, [checkbox]);
	var imgWrap		= goog.dom.createDom('div', 	DD.ui.ListView.classes.THUMB, [label]);
	var caption 	= goog.dom.createDom('figcaption');
	var figure 		= goog.dom.createDom('figure', '', [caption, imgWrap]);

	figure.style.background = 'gray';
	
	element.style.width = component.getThumbSize();
	goog.dom.append(element, [figure]);

	/** Сохранение список создаваемых слоев */
	component.setData('renderer',
	{
		label 		: label,
		checkbox 	: checkbox,
		imgWrap 	: imgWrap,
		caption 	: caption,
		element 	: element,
		figure 		: figure
	});

	component.setContentElement(caption);

	this.setCaption(component, component.getCaption());
	this.setTitle(component, component.getData('title'));

};

/**
 * Метод назначения заголовка элемента
 * @param component 	| type : DD.ui.ViewItem
 *						| desc : элемент ListView
 * ---------------------------
 * @param title 		| type : String || undefined
 * 						| desc : Текстовый заголовок элемента
 */
DD.ui.renderer.SampleRenderer.prototype.setTitle = function(component, title)
{
	var element = component.getContentElement();
	if (element)
		element.title = title || '';
};

DD.ui.renderer.SampleRenderer.prototype.startEdit = function(component)
{
	if (component.isReadonly() == true || component.editor && component.editor.isEditabled())
		return false;

	var caption = component.getData().renderer.caption;

	if (!caption)
		return false;

	component.editor = new DD.ui.InputEditor({'target' : caption});
	component.editor.render();
	component.editor.item = component;
};

/**
 * Метод назначения состояния элемента
 * @param component 	| type : DD.ui.ViewItem
 *						| desc : элемент ListView
 * ---------------------------
 * @param state 		| type : Number
 * 						| desc : состояние элемента в двоичном коде
 * ---------------------------
 * @param state 		| type : Boolean
 * 						| desc :
 */
DD.ui.renderer.SampleRenderer.prototype.setState = function(component, state, enable)
{
	switch(state)
	{
		case DD.ui.Component.State.CHECKED:
			this.setChecked(component, enable);
			break;
		case DD.ui.Component.State.SELECTED:
			this.setSelected(component, enable);
			break;
		case DD.ui.Component.State.ACTIVE:
			this.setActive(component, enable);
			break;
	};
};

/**
 * Локальный метод выделения элемента
 * @param event 	| type : goog.events.BrowserEvent
 *					| desc :  goog.events.EventType.MOUSEDOWN
 */
DD.ui.renderer.SampleRenderer.prototype._activeItem = function(event)
{
	// event.preventDefault();
	this.setActive(!this.isActive());
	// this.dispatchEvent({type:DD.ui.ViewItem.EventType.ACTIVE, shift:event.shiftKey, ctrl:event.ctrlKey});
};

/**
 * Метод выделения элемента
 * @param component 	| type : DD.ui.ViewItem
 *						| desc : элемент ListView
 * ---------------------------
 * @param enable 		| type : Boolean
 * 						| desc : состояние элемента в двоичном коде
 */
DD.ui.renderer.SampleRenderer.prototype.setActive = function(component, enable)
{
	goog.dom.classes.enable(component.getData().renderer.element, DD.ui.ListView.classes.ACTIVE, enable);
};

/**
 * Локальный метод выделения элемента
 * @param event 	| type : goog.events.BrowserEvent
 *					| desc :  goog.events.EventType.MOUSEDOWN
 */
DD.ui.renderer.SampleRenderer.prototype._selectedItem = function(event)
{
	// event.preventDefault();
	this.setSelected(!this.isSelected());
	this.dispatchEvent({type:DD.ui.ViewItem.EventType.SELECT, shift:event.shiftKey, ctrl:event.ctrlKey});
};

/**
 * Метод выделения элемента
 * @param component 	| type : DD.ui.ViewItem
 *						| desc : элемент ListView
 * ---------------------------
 * @param enable 		| type : Boolean
 * 						| desc : состояние элемента в двоичном коде
 */
DD.ui.renderer.SampleRenderer.prototype.setSelected = function(component, enable)
{
	goog.dom.classes.enable(component.getElement(), DD.ui.ListView.classes.SELECT, enable);
};

/**
 * Локальный метод выбора элемента
 * @param event 	| type : goog.events.BrowserEvent
 *					| desc : goog.events.EventType.CLICK
 */
DD.ui.renderer.SampleRenderer.prototype._checkedItem = function(event)
{
	// event.preventDefault();
	// event.stopPropagation();
	this.setChecked(!this.isChecked());
	this.dispatchEvent({type:DD.ui.ViewItem.EventType.CHECK, shift: event.shiftKey});
};

/**
 * Метод выбора элемента
 * @param component 	| type : DD.ui.ViewItem
 *						| desc : элемент ListView
 * ---------------------------
 * @param enable 		| type : Boolean
 * 						| desc : состояние элемента в двоичном коде
 */
DD.ui.renderer.SampleRenderer.prototype.setChecked = function(component, enable)
{
	goog.dom.classes.enable(component.getData().renderer.element, DD.ui.ListView.classes.CHECK, enable);
	// component.dispatchEvent({type:DD.ui.ViewItem.EventType.CHECK});
};

DD.ui.renderer.SampleRenderer.prototype._stopEditHandler = function(event)
{
	var element = component.getElement();

	if(!element)
		return;

	var renderer = component.getRenderer();

	var data = component.getData('renderer');
	var caption = data.caption;

	if (!goog.dom.getAncestor(event.target, function(node){return node == caption;}, true, 3))
		renderer._stopEdit(component);

	goog.events.unlisten(document.querySelector('.stretch .application-pattern'), goog.events.EventType.SCROLL, component.editor.save, false, component.editor);
	goog.events.unlisten(component.editor, DD.ui.InputEditor.EventType.ENDEDIT, renderer._stopEditHandler, false, component);
};

/**
 * Завершение редактирование заголовка элемента с последующим сохранением изменений
 * @param  {DD.ui.ViewItem}
  */
DD.ui.renderer.SampleRenderer.prototype.stopEdit = function(component)
{
	component.editor.save();
};

/**
 * Метод удаления событий компонента
 */
DD.ui.renderer.SampleRenderer.prototype.uninitializeDom = function(component)
{
	var data = component.getData().renderer,
		element = data.element;

	// if (FastButton)
	// 	component._fb_element.reset();

	goog.events.unlisten(element, 	goog.events.EventType.MOUSEDOWN, 	this._selectedItem, 	false, component);

	component.setData('renderer', null);
	DD.ui.renderer.SampleRenderer.superClass_.uninitializeDom.call(this, component);
};

DD.ui.renderer.SampleRenderer.prototype._deleteProgressBar = function(component)
{
	if (component.progressElement)
	{
		goog.dom.removeNode(component.progressElement);
		delete component.progressElement;
	};
};
DD.ui.renderer.SampleRenderer.prototype._deleteAbortButton = function(component)
{
	if (component.abortElement)
	{
		goog.dom.removeNode(component.abortElement);
		delete component.abortElement;
	};
};

/**
 * Метод указания значения прогресса загрузки для ее визуализации
 */
DD.ui.renderer.SampleRenderer.prototype.setProgressMax = function(component, value)
{
	var renderer = component.getRenderer();
	var imgWrap = component.getData('renderer').imgWrap;

	if (value > 0)
	{
		component.getData().renderer.label.style.display = 'none';
		component.getData().renderer.filetype.style.display = 'none';
		component.progressElement	= goog.dom.createDom('div', {'class' : 'DD-item-progressbar'});
		imgWrap.appendChild(component.progressElement);
	}
	else
	{
		if (component.progressElement)
		{
			component.getData().renderer.label.style.display = 'block';
			component.getData().renderer.filetype.style.display = 'block';
			goog.dom.removeNode(component.progressElement);
			delete component.progressElement;
			imgWrap.appendChild( component.getData('renderer').filetype);
		};
	};
};

DD.ui.renderer.SampleRenderer.prototype.setAbortable = function(component, enable)
{
	var renderer = component.getRenderer();
	var imgWrap = component.getData('renderer').imgWrap;

	if (enable)
	{
		component.abortElement 	= goog.dom.createDom('div', {'class' : 'DD-item-abort'});
		imgWrap.appendChild(component.abortElement);
	}
	else
		if (component.abortElement)
		{
			goog.dom.removeNode(component.abortElement);
			delete component.abortElement;
			imgWrap.appendChild( component.getData('renderer').label);
		};
};

DD.ui.renderer.SampleRenderer.prototype.setProgress = function(component, value)
{
	var renderer = component.getRenderer();

	if (component.progressElement)
	{
		var progress = Math.floor(value / component.getProgressMax() * 100);
		goog.style.setStyle(component.progressElement, {'width' : progress + '%'});
		component.progressElement.setAttribute('data-percent', progress + '%');
	};
};